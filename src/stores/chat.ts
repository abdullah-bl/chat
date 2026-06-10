import { create } from "zustand";
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ChatMessage, Usage, Progress, ToolCall } from "@/components/chat/types";
import { findTool } from "@/lib/tools";

const loadMLCLibraries = async () => {
    const [{ CreateWebWorkerMLCEngine }] = await Promise.all([
        import("@mlc-ai/web-llm")
    ]);
    return { CreateWebWorkerMLCEngine };
};

export interface Conversation {
    id: string;
    title: string;
    messages: ChatMessage[];
    createdAt: number;
    updatedAt: number;
    characterId: string | null;
}

interface ChatStore {
    // Multi-conversation
    conversations: Conversation[];
    activeConversationId: string | null;
    createConversation: () => string;
    deleteConversation: (id: string) => void;
    setActiveConversation: (id: string | null) => void;
    renameConversation: (id: string, title: string) => void;
    getActiveConversation: () => Conversation | undefined;

    // Engine state
    isWebGPU: boolean;
    isReady: boolean;
    isGenerating: boolean;
    engine: any;
    model: string;
    modelList: { name: string; value: string }[];
    progress: Progress;
    usage: Usage | null;
    abortController: AbortController | null;
    gpuVendor: string | null;

    // Settings
    temperature: number;
    maxTokens: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
    stopSequences: string[];
    seed: number;
    systemPrompt: string;
    enableTools: boolean;
    enableThinkingStates: boolean;
    enableVoice: boolean;
    selectedCharacter: string | null;
    customCharacters: Array<{
        id: string;
        icon: string | null;
        name: string;
        description: string;
        system_prompt: string;
    }>;

    // Sidebar
    sidebarOpen: boolean;

    // Actions
    setInput: (input: string) => void;
    input: string;
    setSidebarOpen: (open: boolean) => void;
    setIsWebGPU: (v: boolean) => void;
    setIsReady: (v: boolean) => void;
    setIsGenerating: (v: boolean) => void;
    setEngine: (e: any) => void;
    setProgress: (p: Progress) => void;
    setUsage: (u: Usage | null) => void;
    setAbortController: (c: AbortController | null) => void;
    setModelList: (m: { name: string; value: string }[]) => void;
    setTemperature: (v: number) => void;
    setMaxTokens: (v: number) => void;
    setTopP: (v: number) => void;
    setFrequencyPenalty: (v: number) => void;
    setPresencePenalty: (v: number) => void;
    setStopSequences: (v: string[]) => void;
    setSeed: (v: number) => void;
    setSystemPrompt: (v: string) => void;
    setModel: (m: string) => void;
    setEnableTools: (v: boolean) => void;
    setEnableThinkingStates: (v: boolean) => void;
    setEnableVoice: (v: boolean) => void;
    setSelectedCharacter: (id: string | null) => void;
    addCustomCharacter: (c: any) => void;
    updateCustomCharacter: (id: string, c: any) => void;
    deleteCustomCharacter: (id: string) => void;

    // Complex actions
    handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    handleSubmit: () => Promise<void>;
    handleStop: () => void;
    handleClear: () => void;
    loadEngine: () => Promise<void>;
    executeToolCall: (tc: ToolCall) => Promise<any>;
    processToolCalls: (content: string, convId: string) => Promise<string>;
    getCurrentSystemPrompt: () => string;
}

const DEFAULT_SYSTEM_PROMPT = "You are a helpful AI assistant running locally in the user's browser. Be concise, clear, and helpful. You have access to tools for time, calculations, web search, and weather.";

const processThinkingContent = (content: string) => {
    const thinkMatch = content.match(/<think([\s\S]*?)<\/think>/);
    if (thinkMatch) {
        return {
            hasThinking: true,
            thinkingContent: thinkMatch[1].trim(),
            processedContent: content.replace(/<think[\s\S]*?<\/think>/, '').trim(),
        };
    }
    return { hasThinking: false, thinkingContent: '', processedContent: content };
};

const parseToolCalls = (content: string): ToolCall[] => {
    const toolCalls: ToolCall[] = [];
    const regex = /<function>([^<]+)<\/function>/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
        const name = match[1].trim();
        const after = content.substring(match.index + match[0].length);
        const lines = after.split('\n');
        let args = '{}';
        for (let i = 0; i < Math.min(5, lines.length); i++) {
            const line = lines[i].trim();
            if (line.startsWith('{') && line.includes('}')) {
                args = line;
                break;
            }
        }
        toolCalls.push({
            id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: "function",
            function: { name, arguments: args }
        });
    }
    return toolCalls;
};

const formatToolResult = (name: string, result: any): string => {
    switch (name) {
        case 'get_current_time': return `Current time: ${result.formatted}.`;
        case 'calculate': return result.error ? `Error: ${result.error}` : `${result.expression} = ${result.result}`;
        case 'get_weather': return `Weather in ${result.location}: ${result.temperature}, ${result.condition}, Humidity: ${result.humidity}.`;
        case 'search_web': return result.results?.[0]?.snippet || result.note || 'No results.';
        default: return JSON.stringify(result);
    }
};

export const useChatStore = create<ChatStore>()(persist((set, get) => ({
    conversations: [],
    activeConversationId: null,
    input: "",
    isGenerating: false,
    isReady: false,
    isWebGPU: false,
    engine: null,
    model: "SmolLM2-1.7B-Instruct-q4f16_1-MLC",
    progress: { progress: 0, text: "", timeElapsed: 0 },
    usage: null,
    abortController: null,
    modelList: [],
    temperature: 0.7,
    maxTokens: 2048,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    stopSequences: [],
    seed: 42,
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    gpuVendor: null,
    enableTools: true,
    enableThinkingStates: true,
    enableVoice: false,
    selectedCharacter: null,
    customCharacters: [],
    sidebarOpen: false,

    createConversation: () => {
        const id = Date.now().toString();
        const conv: Conversation = {
            id,
            title: "New Chat",
            messages: [{ role: "system", content: get().getCurrentSystemPrompt() }],
            createdAt: Date.now(),
            updatedAt: Date.now(),
            characterId: get().selectedCharacter,
        };
        set(s => ({
            conversations: [conv, ...s.conversations],
            activeConversationId: id,
        }));
        return id;
    },

    deleteConversation: (id) => set(s => ({
        conversations: s.conversations.filter(c => c.id !== id),
        activeConversationId: s.activeConversationId === id
            ? (s.conversations.find(c => c.id !== id)?.id ?? null)
            : s.activeConversationId,
    })),

    setActiveConversation: (id) => set({ activeConversationId: id }),
    renameConversation: (id, title) => set(s => ({
        conversations: s.conversations.map(c => c.id === id ? { ...c, title, updatedAt: Date.now() } : c),
    })),

    getActiveConversation: () => {
        const { conversations, activeConversationId } = get();
        return conversations.find(c => c.id === activeConversationId);
    },

    // Setters
    setInput: (input) => set({ input }),
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    setIsWebGPU: (v) => set({ isWebGPU: v }),
    setIsReady: (v) => set({ isReady: v }),
    setIsGenerating: (v) => set({ isGenerating: v }),
    setEngine: (e) => set({ engine: e }),
    setProgress: (p) => set({ progress: p }),
    setUsage: (u) => set({ usage: u }),
    setAbortController: (c) => set({ abortController: c }),
    setModelList: (m) => set({ modelList: m }),
    setTemperature: (v) => set({ temperature: v }),
    setMaxTokens: (v) => set({ maxTokens: v }),
    setTopP: (v) => set({ topP: v }),
    setFrequencyPenalty: (v) => set({ frequencyPenalty: v }),
    setPresencePenalty: (v) => set({ presencePenalty: v }),
    setStopSequences: (v) => set({ stopSequences: v }),
    setSeed: (v) => set({ seed: v }),
    setSystemPrompt: (v) => set({ systemPrompt: v }),
    setEnableTools: (v) => set({ enableTools: v }),
    setEnableThinkingStates: (v) => set({ enableThinkingStates: v }),
    setEnableVoice: (v) => set({ enableVoice: v }),
    setSelectedCharacter: (id) => set({ selectedCharacter: id }),
    addCustomCharacter: (c) => set(s => ({
        customCharacters: [...s.customCharacters, { id: Date.now().toString(), ...c }]
    })),
    updateCustomCharacter: (id, c) => set(s => ({
        customCharacters: s.customCharacters.map(ch => ch.id === id ? { ...ch, ...c } : ch)
    })),
    deleteCustomCharacter: (id) => set(s => ({
        customCharacters: s.customCharacters.filter(c => c.id !== id)
    })),

    setModel: (model) => {
        set({ model, isReady: false, engine: null });
        get().loadEngine();
    },

    getCurrentSystemPrompt: () => {
        const { selectedCharacter, customCharacters, systemPrompt } = get();
        if (selectedCharacter) {
            const custom = customCharacters.find(c => c.id === selectedCharacter);
            if (custom) return custom.system_prompt;
            const { llm_system_characters } = require("@/lib/characters");
            const predefined = llm_system_characters.find((c: any) => c.name === selectedCharacter);
            if (predefined) return predefined.system_prompt;
        }
        return systemPrompt;
    },

    handleInputChange: (e) => set({ input: e.target.value }),

    executeToolCall: async (toolCall: ToolCall) => {
        const tool = findTool(toolCall.function.name);
        if (!tool) return { error: `Tool ${toolCall.function.name} not found` };
        let args = {};
        try { args = JSON.parse(toolCall.function.arguments); } catch { /* empty */ }
        return tool.execute(args);
    },

    processToolCalls: async (content: string, convId: string) => {
        const { enableTools } = get();
        if (!enableTools) return content;

        const { processedContent } = processThinkingContent(content);
        const toolCalls = parseToolCalls(processedContent);
        if (toolCalls.length === 0) return content;

        let finalContent = processedContent;
        for (const tc of toolCalls) {
            const result = await get().executeToolCall(tc);
            const formatted = formatToolResult(tc.function.name, result);

            // Add tool messages to conversation
            set(s => ({
                conversations: s.conversations.map(c =>
                    c.id === convId ? {
                        ...c,
                        messages: [...c.messages,
                            { role: "assistant" as const, content: `🔧 ${tc.function.name}(${tc.function.arguments})` },
                            { role: "tool" as const, content: formatted, tool_call_id: tc.id },
                        ],
                        updatedAt: Date.now(),
                    } : c
                ),
            }));

            const callText = `<function>${tc.function.name}</function>\n${tc.function.arguments}`;
            finalContent = finalContent.replace(callText, formatted);
        }
        return finalContent;
    },

    handleSubmit: async () => {
        const { input, isGenerating, engine, activeConversationId, temperature, maxTokens,
            topP, frequencyPenalty, presencePenalty, stopSequences, seed, enableTools } = get();

        if (!input.trim() || isGenerating || !engine) return;

        let convId = activeConversationId;
        if (!convId) {
            convId = get().createConversation();
        }

        const message = input.trim();
        set({ input: "" });

        const conv = get().conversations.find(c => c.id === convId);
        if (!conv) return;

        const systemPrompt = get().getCurrentSystemPrompt();
        const userMsg: ChatMessage = { role: "user", content: message };

        // Auto-title from first message
        const isFirst = conv.messages.filter(m => m.role !== "system").length === 0;
        const title = isFirst ? message.slice(0, 50) + (message.length > 50 ? "..." : "") : conv.title;

        const updatedMsgs = [
            { role: "system" as const, content: systemPrompt },
            ...conv.messages.filter(m => m.role !== "system" && m.role !== "tool"),
            userMsg,
        ];

        set(s => ({
            conversations: s.conversations.map(c => c.id === convId ? {
                ...c,
                title,
                messages: [...c.messages.filter(m => m.role === "system" ? false : true), { role: "system" as const, content: systemPrompt }, ...updatedMsgs.filter(m => m.role !== "system")],
                updatedAt: Date.now(),
            } : c),
            isGenerating: true,
        }));

        // Simpler: rebuild messages from conversation
        const currentConv = get().conversations.find(c => c.id === convId)!;
        const apiMessages = currentConv.messages
            .filter(m => m.role !== "tool")
            .map(m => ({ role: m.role, content: m.content }));

        const abortController = new AbortController();
        set({ abortController });

        try {
            const reply = await engine.chat.completions.create({
                messages: apiMessages,
                stream: true,
                stream_options: { include_usage: true },
                temperature,
                max_tokens: maxTokens,
                top_p: topP,
                frequency_penalty: frequencyPenalty,
                presence_penalty: presencePenalty,
                stop: stopSequences.length > 0 ? stopSequences : undefined,
                seed,
            });

            let assistantContent = "";

            // Add empty assistant message
            set(s => ({
                conversations: s.conversations.map(c => c.id === convId ? {
                    ...c,
                    messages: [...c.messages, { role: "assistant" as const, content: "" }],
                    updatedAt: Date.now(),
                } : c),
            }));

            for await (const chunk of reply) {
                if (abortController.signal.aborted) break;
                const delta = chunk.choices?.[0]?.delta?.content;
                if (delta) {
                    assistantContent += delta;
                    set(s => ({
                        conversations: s.conversations.map(c => c.id === convId ? {
                            ...c,
                            messages: c.messages.map((m, i) =>
                                i === c.messages.length - 1 ? { ...m, content: assistantContent } : m
                            ),
                            updatedAt: Date.now(),
                        } : c),
                    }));
                }
                if (chunk.usage) set({ usage: chunk.usage });
            }

            // Process tool calls
            if (enableTools && assistantContent) {
                const processed = await get().processToolCalls(assistantContent, convId);
                if (processed !== assistantContent) {
                    set(s => ({
                        conversations: s.conversations.map(c => c.id === convId ? {
                            ...c,
                            messages: c.messages.map((m, i) =>
                                i === c.messages.length - 1 ? { ...m, content: processed } : m
                            ),
                        } : c),
                    }));
                }
            }
        } catch (error: any) {
            if (error.name !== 'AbortError') console.error('Generation error:', error);
        } finally {
            set({ isGenerating: false, abortController: null });
        }
    },

    handleStop: () => {
        get().abortController?.abort();
        set({ isGenerating: false, abortController: null });
    },

    handleClear: () => {
        const { activeConversationId } = get();
        if (!activeConversationId) return;
        set(s => ({
            conversations: s.conversations.map(c => c.id === activeConversationId ? {
                ...c,
                messages: [{ role: "system" as const, content: get().getCurrentSystemPrompt() }],
                updatedAt: Date.now(),
            } : c),
            usage: null,
            input: "",
        }));
    },

    loadEngine: async () => {
        try {
            const { CreateWebWorkerMLCEngine } = await loadMLCLibraries();
            const { model } = get();
            const engine = await CreateWebWorkerMLCEngine(
                new Worker(new URL("../lib/workers/mlc.ts", import.meta.url), { type: "module" }),
                model,
                {
                    initProgressCallback: (progress: any) => {
                        set({ progress: { progress: progress.progress, text: progress.text, timeElapsed: progress.timeElapsed } });
                    },
                }
            );
            const gpuVendor = await engine.getGPUVendor();
            set({ engine, isReady: true, gpuVendor });
        } catch (error) {
            console.error("Failed to load engine:", error);
        }
    },
}), {
    name: "chat-v2",
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({
        conversations: state.conversations,
        model: state.model,
        systemPrompt: state.systemPrompt,
        temperature: state.temperature,
        maxTokens: state.maxTokens,
        topP: state.topP,
        frequencyPenalty: state.frequencyPenalty,
        presencePenalty: state.presencePenalty,
        stopSequences: state.stopSequences,
        seed: state.seed,
        enableTools: state.enableTools,
        enableThinkingStates: state.enableThinkingStates,
        enableVoice: state.enableVoice,
        selectedCharacter: state.selectedCharacter,
        customCharacters: state.customCharacters,
        activeConversationId: state.activeConversationId,
    }),
}));
