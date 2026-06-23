import { create } from "zustand";

export interface AgentMessage {
    role: "user" | "assistant" | "system";
    content: string;
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

    setInput: (v: string) => void;
    sendMessage: () => Promise<void>;
    clearChat: () => void;
    initModel: () => Promise<void>;
}

const SYSTEM_PROMPT = `You are a helpful AI agent running entirely in the user's browser using Transformers.js + Gemma.
You can answer questions, write code, help with tasks, and have conversations.
Be concise, accurate, and friendly. Respond in the user's language.`;

const DEFAULT_MODEL = "HuggingFaceTB/SmolLM2-360M-Instruct";

// Lazy-loaded pipeline — stored outside the store
let _pipeline: any = null;

async function loadPipeline(modelId: string, onProgress: (p: { text: string; percent: number }) => void) {
    const { pipeline, env } = await import("@huggingface/transformers");

    // Use remote models from HF Hub
    env.allowLocalModels = false;
    env.useBrowserCache = true;

    onProgress({ text: "Loading model...", percent: 0 });

    const generator = await pipeline(
        "text-generation",
        modelId,
        {
            dtype: "q4" as any,
            device: "wasm" as any,
            progress_callback: (data: any) => {
                if (data.status === "progress") {
                    const pct = data.progress ? Math.round(data.progress * 100) : 0;
                    onProgress({
                        text: `Downloading ${data.file || "model"}...`,
                        percent: pct,
                    });
                } else if (data.status === "ready") {
                    onProgress({ text: "Model ready!", percent: 100 });
                } else if (data.status === "loading") {
                    onProgress({ text: `Loading ${data.file || "..."} `, percent: 10 });
                }
            },
        }
    );

    return generator;
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

    setInput: (v) => set({ input: v }),

    initModel: async () => {
        if (_pipeline || get().isLoading) return;

        set({ isLoading: true, error: null });
        try {
            _pipeline = await loadPipeline(get().modelId, (p) => set({ progress: p }));
            set({ isReady: true, isLoading: false });
        } catch (err: any) {
            set({ isLoading: false, error: err.message || "Failed to load model" });
        }
    },

    sendMessage: async () => {
        const { input, isGenerating, isReady, messages } = get();
        if (!input.trim() || isGenerating) return;

        if (!isReady || !_pipeline) {
            set({ error: "Model not loaded yet. Click Initialize first." });
            return;
        }

        const userMsg: AgentMessage = { role: "user", content: input.trim() };
        const newMessages = [...messages, userMsg];
        set({ input: "", messages: newMessages, isGenerating: true, error: null });

        try {
            const convo = [
                { role: "system", content: SYSTEM_PROMPT },
                ...newMessages.map(m => ({ role: m.role, content: m.content })),
            ];

            const output = await _pipeline(convo, {
                max_new_tokens: 512,
                temperature: 0.7,
                top_p: 0.9,
                do_sample: true,
            });

            // Extract generated text
            let result = "";
            if (Array.isArray(output) && output[0]) {
                const generated = output[0].generated_text;
                if (Array.isArray(generated)) {
                    // Chat format — get last assistant message
                    const last = generated[generated.length - 1];
                    result = last?.content || "";
                } else {
                    result = typeof generated === "string" ? generated : "";
                }
            }

            // Strip the prompt if model echoed it
            const lastUser = newMessages[newMessages.length - 1].content;
            if (result.includes(lastUser)) {
                const idx = result.indexOf(lastUser) + lastUser.length;
                result = result.slice(idx).trim();
            }

            const assistantMsg: AgentMessage = {
                role: "assistant",
                content: result || "(empty response)",
            };

            set((s) => ({
                messages: [...s.messages, assistantMsg],
                isGenerating: false,
            }));
        } catch (err: any) {
            set({ isGenerating: false, error: err.message || "Generation failed" });
        }
    },

    clearChat: () => set({ messages: [], error: null }),
}));
