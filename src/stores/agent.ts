import { create } from "zustand";

export interface AgentMessage {
    role: "user" | "assistant";
    content: string;
    steps?: ThinkingStep[];
}

export interface ThinkingStep {
    id: string;
    type: "thinking" | "code" | "result" | "answer";
    content: string;
    language?: string;
    error?: boolean;
}

interface AgentStore {
    messages: AgentMessage[];
    input: string;
    isGenerating: boolean;
    isReady: boolean;
    isLoading: boolean;
    progress: { text: string; percent: number };
    error: string | null;
    modelId: string;
    device: "webgpu" | "wasm";
    pyodideReady: boolean;
    steps: ThinkingStep[];

    setInput: (v: string) => void;
    sendMessage: () => Promise<void>;
    clearChat: () => void;
    initModel: () => Promise<void>;
}

const SYSTEM_PROMPT = `You are an AI agent running entirely in the user's browser via WebAssembly.

You have a Python runtime (Pyodide). To calculate, analyze data, or solve problems, write Python code:

\`\`\`python
import math
print(math.factorial(20))
\`\`\`

Code runs instantly. Results are fed back to you. Use code for:
- Math and calculations
- String/text processing
- Data analysis with lists/dicts
- Algorithms and logic

For simple questions, answer directly without code.
Be concise. Use the user's language.`;

const DEFAULT_MODEL = "Qwen/Qwen2.5-1.5B-Instruct";

// Lazy-loaded singletons
let _pipeline: any = null;
let _pyodide: any = null;

function detectDevice(): "webgpu" | "wasm" {
    if (typeof navigator !== "undefined" && "gpu" in navigator) return "webgpu";
    return "wasm";
}

function uid() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

async function loadPipeline(
    modelId: string,
    device: "webgpu" | "wasm",
    onProgress: (p: { text: string; percent: number }) => void
) {
    const { pipeline, env } = await import("@huggingface/transformers");

    env.allowLocalModels = false;
    env.useBrowserCache = true;

    onProgress({ text: `Loading ${modelId.split("/").pop()}...`, percent: 2 });

    const dtype = device === "webgpu" ? ("q4f16" as any) : ("q4" as any);

    return await pipeline("text-generation", modelId, {
        dtype,
        device: device as any,
        progress_callback: (data: any) => {
            if (data.status === "progress") {
                const pct = data.progress ? Math.round(data.progress * 100) : 0;
                onProgress({ text: `Downloading ${data.file || "model"}...`, percent: pct });
            } else if (data.status === "ready") {
                onProgress({ text: "Initializing engine...", percent: 100 });
            } else if (data.status === "loading") {
                onProgress({ text: `Loading ${data.file || "..."} `, percent: 5 });
            }
        },
    });
}

async function ensurePyodide(): Promise<any> {
    if (_pyodide) return _pyodide;

    if (!(window as any).loadPyodide) {
        await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js";
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Failed to load Pyodide"));
            document.head.appendChild(script);
        });
    }

    _pyodide = await (window as any).loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/",
    });

    return _pyodide;
}

async function executePython(code: string): Promise<{ output: string; error: boolean }> {
    try {
        const py = await ensurePyodide();

        // Redirect stdout
        py.runPython(`import sys, io; _buf = io.StringIO(); sys.stdout = _buf`);

        let error = false;
        let output = "";

        try {
            await py.runPythonAsync(code);
            output = py.runPython("_buf.getvalue()");
        } catch (e: any) {
            output = String(e?.message || e);
            error = true;
        }

        // Restore stdout
        py.runPython(`sys.stdout = sys.__stdout__`);

        return { output: (output || "(no output)").trim(), error };
    } catch (e: any) {
        return { output: `Pyodide error: ${e.message}`, error: true };
    }
}

function extractCodeBlocks(text: string): { language: string; code: string }[] {
    const blocks: { language: string; code: string }[] = [];
    const regex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
        const language = match[1] || "text";
        if (language === "python" || language === "py") {
            blocks.push({ language: "python", code: match[2].trim() });
        }
    }
    return blocks;
}

function extractResponse(output: any, lastUserContent: string): string {
    let result = "";
    if (Array.isArray(output) && output[0]) {
        const gen = output[0].generated_text;
        if (Array.isArray(gen)) {
            const last = gen[gen.length - 1];
            result = last?.content || "";
        } else if (typeof gen === "string") {
            result = gen;
        }
    }
    // Strip echoed prompt
    if (lastUserContent && result.includes(lastUserContent)) {
        const idx = result.indexOf(lastUserContent) + lastUserContent.length;
        result = result.slice(idx).trim();
    }
    return result.trim();
}

export const useAgentStore = create<AgentStore>((set, get) => ({
    messages: [],
    input: "",
    isGenerating: false,
    isReady: false,
    isLoading: false,
    progress: { text: "", percent: 0 },
    error: null,
    modelId: DEFAULT_MODEL,
    device: detectDevice() as "webgpu" | "wasm",
    pyodideReady: false,
    steps: [],

    setInput: (v) => set({ input: v }),

    initModel: async () => {
        if (_pipeline || get().isLoading) return;

        set({ isLoading: true, error: null });
        try {
            const device = get().device;
            _pipeline = await loadPipeline(get().modelId, device, (p) => set({ progress: p }));
            set({ isReady: true, isLoading: false });
        } catch (err: any) {
            // WebGPU failed → try WASM
            if (get().device === "webgpu") {
                console.warn("WebGPU failed, falling back to WASM");
                set({ device: "wasm", progress: { text: "Falling back to WASM...", percent: 0 } });
                try {
                    _pipeline = await loadPipeline(get().modelId, "wasm", (p) => set({ progress: p }));
                    set({ isReady: true, isLoading: false });
                    return;
                } catch (err2: any) {
                    set({ isLoading: false, error: err2.message });
                    return;
                }
            }
            set({ isLoading: false, error: err.message || "Failed to load model" });
        }
    },

    sendMessage: async () => {
        const { input, isGenerating, isReady, messages } = get();
        if (!input.trim() || isGenerating) return;

        if (!isReady || !_pipeline) {
            set({ error: "Model not loaded. Click Initialize first." });
            return;
        }

        const userContent = input.trim();
        const visibleMessages = [...messages, { role: "user" as const, content: userContent }];
        set({ input: "", messages: visibleMessages, isGenerating: true, error: null, steps: [] });

        // Internal conversation (includes code results, not shown directly)
        let internalConvo: { role: string; content: string }[] = [
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: userContent },
        ];

        const MAX_ITERATIONS = 5;
        const collectedSteps: ThinkingStep[] = [];

        try {
            for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
                const modelMessages = [
                    { role: "system", content: SYSTEM_PROMPT },
                    ...internalConvo,
                ];

                const output = await _pipeline(modelMessages, {
                    max_new_tokens: 768,
                    temperature: 0.7,
                    top_p: 0.9,
                    do_sample: true,
                });

                const result = extractResponse(output, internalConvo[internalConvo.length - 1].content);
                const codeBlocks = extractCodeBlocks(result);

                // No code → final answer
                if (codeBlocks.length === 0 || iter === MAX_ITERATIONS - 1) {
                    const finalContent = result || "(no response)";
                    set((s) => ({
                        messages: [
                            ...s.messages.slice(0, -1),
                            { role: "user", content: userContent },
                            { role: "assistant", content: finalContent, steps: collectedSteps.length > 0 ? [...collectedSteps] : undefined },
                        ],
                        isGenerating: false,
                        steps: [],
                    }));
                    return;
                }

                // Has code → execute
                const thinkingText = result.replace(/```[\s\S]*?```/g, "").trim();
                if (thinkingText) {
                    const step: ThinkingStep = { id: uid(), type: "thinking", content: thinkingText };
                    collectedSteps.push(step);
                    set((s) => ({ steps: [...s.steps, step] }));
                }

                let codeOutput = "";
                for (const block of codeBlocks) {
                    const codeStep: ThinkingStep = { id: uid(), type: "code", content: block.code, language: block.language };
                    collectedSteps.push(codeStep);
                    set((s) => ({ steps: [...s.steps, codeStep] }));

                    const { output: out, error } = await executePython(block.code);

                    const resultStep: ThinkingStep = { id: uid(), type: "result", content: out, error };
                    collectedSteps.push(resultStep);
                    set((s) => ({ steps: [...s.steps, resultStep] }));

                    codeOutput += out + "\n";
                }

                // Feed results back to model internally
                internalConvo.push({ role: "assistant", content: result });
                internalConvo.push({
                    role: "user",
                    content: `[Execution Output]\n${codeOutput}\n\nBased on these results, give your final answer. Do not write more code.`,
                });
            }
        } catch (err: any) {
            set({ isGenerating: false, error: err.message || "Generation failed" });
        }
    },

    clearChat: () => set({ messages: [], error: null, steps: [] }),
}));
