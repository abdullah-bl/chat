import Markdown from "react-markdown";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "./types";
import { Wrench, CheckCircle, Copy, Brain } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { Thinking } from "./thinking";
import { useChatStore } from "@/stores/chat";

interface MessageProps {
    message: ChatMessage;
}

export function ChatMessage({ message }: MessageProps) {
    const isToolMessage = message.role === "tool";
    const hasToolCalls = message.tool_calls && message.tool_calls.length > 0;
    const [showThinking, setShowThinking] = useState(false);
    const { enableThinkingStates } = useChatStore();

    // Parse thinking content from <think> tags
    const parseThinkingContent = (content: string) => {
        const thinkMatch = content.match(/<think>([\s\S]*?)<\/think>/);
        if (thinkMatch) {
            const thinkingContent = thinkMatch[1].trim();
            const regularContent = content.replace(/<think>[\s\S]*?<\/think>/, '').trim();

            // Detect thinking type based on content
            let thinkingType = "thinking";
            const lowerContent = thinkingContent.toLowerCase();

            if (lowerContent.includes("analyzing") || lowerContent.includes("examining") || lowerContent.includes("reviewing")) {
                thinkingType = "analyzing";
            } else if (lowerContent.includes("processing") || lowerContent.includes("calculating") || lowerContent.includes("computing")) {
                thinkingType = "processing";
            } else if (lowerContent.includes("generating") || lowerContent.includes("creating") || lowerContent.includes("writing")) {
                thinkingType = "generating";
            }

            return {
                thinkingContent,
                hasThinking: true,
                regularContent,
                thinkingType
            };
        }
        return {
            thinkingContent: '',
            hasThinking: false,
            regularContent: content,
            thinkingType: "thinking"
        };
    };

    const { thinkingContent, hasThinking, regularContent, thinkingType } = parseThinkingContent(message.content);

    const handleCopy = () => {
        navigator.clipboard.writeText(message.content);
        toast.success("Copied to clipboard", {
            description: "You can paste it anywhere",
        });
    };

    return (
        <div
            className={cn(
                "flex",
                message.role === "user" ? "justify-end" : "justify-start"
            )}
        >
            <div
                className={cn(
                    "max-w-[85%] rounded-lg px-4 py-3",
                    message.role === "user"
                        ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                        : message.role === "tool"
                            ? "bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800"
                            : hasToolCalls
                                ? "bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800"
                                : "bg-neutral-100 dark:bg-neutral-800"
                )}
            >
                {/* Tool call indicator */}
                {hasToolCalls && (
                    <div className="flex items-center gap-2 mb-2 text-sm text-yellow-700 dark:text-yellow-300">
                        <Wrench className="h-4 w-4" />
                        <span>Tool call: {message.tool_calls![0].function.name}</span>
                    </div>
                )}

                {/* Tool result indicator */}
                {isToolMessage && (
                    <div className="flex items-center gap-2 mb-2 text-sm text-blue-700 dark:text-blue-300">
                        <CheckCircle className="h-4 w-4" />
                        <span>Tool result</span>
                    </div>
                )}

                {/* Thinking indicator */}
                {hasThinking && enableThinkingStates && (
                    <div className="mb-3 thinking-fade-in">
                        <div className="flex items-center gap-2 mb-2 text-sm">
                            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                                <Brain className="h-4 w-4 thinking-pulse" />
                                <span className="font-medium">{thinkingType.charAt(0).toUpperCase() + thinkingType.slice(1)} process</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs hover:bg-purple-100 dark:hover:bg-purple-900/30"
                                onClick={() => setShowThinking(!showThinking)}
                            >
                                {showThinking ? "Hide" : "Show"}
                            </Button>
                        </div>
                        {showThinking && (
                            <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-md p-3 mb-3 thinking-fade-in">
                                <div className="prose dark:prose-invert max-w-none prose-sm prose-p:leading-relaxed prose-pre:p-0">
                                    <Markdown
                                        components={{
                                            p: ({ children }) => <p className="mb-2 last:mb-0 text-purple-800 dark:text-purple-200">{children}</p>,
                                            pre: ({ children }) => (
                                                <pre className="bg-purple-100 dark:bg-purple-900/50 p-3 rounded-md overflow-x-auto my-2 text-sm border border-purple-200 dark:border-purple-700">
                                                    {children}
                                                </pre>
                                            ),
                                            code: ({ children }) => (
                                                <code className="bg-purple-100 dark:bg-purple-900/50 px-1.5 py-0.5 rounded text-sm border border-purple-200 dark:border-purple-700">
                                                    {children}
                                                </code>
                                            ),
                                        }}
                                    >
                                        {thinkingContent}
                                    </Markdown>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Regular content */}
                {regularContent && (
                    <div className="prose dark:prose-invert max-w-none prose-sm prose-p:leading-relaxed prose-pre:p-0">
                        <Markdown
                            components={{
                                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                pre: ({ children }) => (
                                    <pre className="bg-neutral-200 dark:bg-neutral-700 p-3 rounded-md overflow-x-auto my-2 text-sm">
                                        {children}
                                    </pre>
                                ),
                                code: ({ children }) => (
                                    <code className="bg-neutral-200 dark:bg-neutral-700 px-1.5 py-0.5 rounded text-sm">
                                        {children}
                                    </code>
                                ),
                                ul: ({ children }) => <ul className="list-disc pl-4 my-2">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal pl-4 my-2">{children}</ol>,
                                li: ({ children }) => <li className="my-1">{children}</li>,
                                h1: ({ children }) => <h1 className="text-xl font-bold my-3">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-lg font-bold my-2">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-base font-bold my-2">{children}</h3>,
                                blockquote: ({ children }) => (
                                    <blockquote className="border-l-4 border-neutral-300 dark:border-neutral-600 pl-4 my-2 italic">
                                        {children}
                                    </blockquote>
                                ),
                            }}
                        >
                            {regularContent}
                        </Markdown>
                        {message.role === "assistant" && (
                            <div className="flex items-center gap-2 mt-2">
                                <Button variant="ghost" size="icon" className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400" onClick={handleCopy}>
                                    <Copy className="w-4 h-4" />
                                    <span className="text-xs">Copy</span>
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
} 