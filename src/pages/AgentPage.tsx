import { useEffect, useRef, useState } from "react";
import { useAgentStore, type ThinkingStep } from "@/stores/agent";
import { Send, Sparkles, Loader2, Bot, User, Zap, Trash2, AlertCircle, Terminal, ChevronDown, ChevronRight, CheckCircle, Brain, Code2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

export function AgentPage() {
    const {
        messages, input, isGenerating, isReady, isLoading, progress, error,
        modelId, device, steps,
        setInput, sendMessage, clearChat, initModel,
    } = useAgentStore();

    const scrollRef = useRef<HTMLDivElement>(null);
    const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, [messages, isGenerating, steps]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage();
    };

    const toggleStep = (id: string) => {
        setExpandedSteps((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const modelName = modelId.split("/").pop();

    return (
        <div className="flex-1 flex flex-col min-h-0">
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium">AI Agent</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        device === "webgpu"
                            ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300"
                            : "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
                    }`}>
                        {device === "webgpu" ? "⚡ WebGPU" : "🧩 WASM"}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 rounded-full font-medium hidden sm:inline">
                        {modelName}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full font-medium hidden sm:inline">
                        🐍 Pyodide
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {messages.length > 0 && (
                        <button
                            onClick={clearChat}
                            className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500"
                            title="Clear"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Messages or Welcome */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center px-6 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/20">
                            <Bot className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                            Browser AI Agent
                        </h2>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1 max-w-sm">
                            {modelName} + Pyodide Python runtime
                        </p>
                        <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-6 max-w-sm">
                            100% browser-based. Model runs via {device === "webgpu" ? "WebGPU" : "WebAssembly"}.
                            Python code executes in Pyodide sandbox. No server, no API key.
                        </p>

                        {!isReady && !isLoading && (
                            <button
                                onClick={initModel}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium text-sm transition-colors shadow-lg shadow-amber-500/20"
                            >
                                <Zap className="w-4 h-4" />
                                Initialize Model
                            </button>
                        )}

                        {isLoading && (
                            <div className="flex flex-col items-center gap-3">
                                <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {progress.text || "Loading..."}
                                </div>
                                <div className="w-64 h-2 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-300"
                                        style={{ width: `${progress.percent}%` }}
                                    />
                                </div>
                                <span className="text-xs text-neutral-400">{progress.percent}%</span>
                            </div>
                        )}

                        {isReady && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    Agent ready
                                </div>
                                <div className="flex flex-wrap gap-2 justify-center max-w-md">
                                    {[
                                        "What is the factorial of 20?",
                                        "Sort [5, 2, 8, 1, 9, 3] and find the median",
                                        "Write a Python function to check if a number is prime",
                                        "Calculate the Fibonacci sequence up to 100",
                                    ].map((q) => (
                                        <button
                                            key={q}
                                            onClick={() => {
                                                setInput(q);
                                                setTimeout(() => sendMessage(), 50);
                                            }}
                                            className="px-3 py-1.5 rounded-full text-xs border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
                        {messages.map((msg, i) => (
                            <div key={i}>
                                {/* Message bubble */}
                                <div className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                                    {msg.role === "assistant" && (
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
                                            <Bot className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                                        msg.role === "user"
                                            ? "bg-blue-500 text-white"
                                            : "bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                                    }`}>
                                        {msg.role === "assistant" ? (
                                            <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                                            </div>
                                        ) : (
                                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                        )}
                                    </div>
                                    {msg.role === "user" && (
                                        <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shrink-0">
                                            <User className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                </div>

                                {/* Collapsible work steps for assistant messages */}
                                {msg.role === "assistant" && msg.steps && msg.steps.length > 0 && (
                                    <div className="ml-11 mt-1">
                                        <button
                                            onClick={() => toggleStep(`msg-${i}`)}
                                            className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                                        >
                                            {expandedSteps.has(`msg-${i}`) ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                            <Terminal className="w-3 h-3" />
                                            {msg.steps.length} steps
                                        </button>
                                        {expandedSteps.has(`msg-${i}`) && (
                                            <div className="space-y-2 mt-2">
                                                {msg.steps.map((step) => (
                                                    <StepCard key={step.id} step={step} />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Live thinking steps during generation */}
                        {isGenerating && steps.length > 0 && (
                            <div className="ml-11 space-y-2">
                                {steps.map((step) => (
                                    <StepCard key={step.id} step={step} />
                                ))}
                                <div className="flex items-center gap-2 text-xs text-amber-500 animate-pulse">
                                    <Brain className="w-3 h-3" />
                                    Agent is working...
                                </div>
                            </div>
                        )}

                        {/* Generating dots (no steps yet) */}
                        {isGenerating && steps.length === 0 && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                                <div className="bg-neutral-100 dark:bg-neutral-900 rounded-2xl px-4 py-3 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex items-end gap-2 p-3 border-t border-neutral-200 dark:border-neutral-800">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                        }
                    }}
                    placeholder={isReady ? "Ask the agent anything..." : "Initialize model first..."}
                    disabled={isGenerating || !isReady}
                    rows={1}
                    className="flex-1 resize-none bg-neutral-100 dark:bg-neutral-900 border-0 rounded-xl px-4 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-amber-400/40 focus:outline-none disabled:opacity-50"
                    style={{ maxHeight: "120px" }}
                />
                <button
                    type="submit"
                    disabled={!input.trim() || isGenerating || !isReady}
                    className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors"
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
}

/** Renders a single thinking/execution step */
function StepCard({ step }: { step: ThinkingStep }) {
    const icons = {
        thinking: <Brain className="w-3.5 h-3.5 text-purple-400" />,
        code: <Code2 className="w-3.5 h-3.5 text-blue-400" />,
        result: step.error
            ? <AlertCircle className="w-3.5 h-3.5 text-red-400" />
            : <CheckCircle className="w-3.5 h-3.5 text-green-400" />,
        answer: <Bot className="w-3.5 h-3.5 text-amber-400" />,
    };

    const labels = {
        thinking: "Thinking",
        code: "Python Code",
        result: step.error ? "Error" : "Output",
        answer: "Answer",
    };

    return (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-neutral-50 dark:bg-neutral-950/50">
            {/* Header */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-900/70">
                {icons[step.type]}
                <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                    {labels[step.type]}
                </span>
            </div>
            {/* Content */}
            <div className="px-3 py-2">
                {step.type === "code" ? (
                    <pre className="text-xs font-mono text-neutral-800 dark:text-neutral-200 overflow-x-auto"><code>{step.content}</code></pre>
                ) : (
                    <p className={`text-xs font-mono whitespace-pre-wrap ${
                        step.error
                            ? "text-red-500 dark:text-red-400"
                            : step.type === "thinking"
                                ? "text-neutral-600 dark:text-neutral-400 font-sans"
                                : "text-green-600 dark:text-green-400"
                    }`}>
                        {step.content}
                    </p>
                )}
            </div>
        </div>
    );
}
