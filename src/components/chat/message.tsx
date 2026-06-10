import Markdown from "react-markdown";
import type { ChatMessage } from "./types";
import { Wrench, Copy, Bot } from "lucide-react";
import { useState } from "react";
import { useChatStore } from "@/stores/chat";

interface MessageProps {
    message: ChatMessage;
}

export function ChatMessage({ message }: MessageProps) {
    const isToolMessage = message.role === "tool";
    const [showThinking, setShowThinking] = useState(false);
    const { enableThinkingStates } = useChatStore();

    // Parse thinking blocks
    const thinkMatch = message.content.match(/<think([\s\S]*?)<\/think>/);
    const hasThinking = !!thinkMatch && enableThinkingStates;
    const displayContent = hasThinking
        ? message.content.replace(/<think[\s\S]*?<\/think>/, '').trim()
        : message.content;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(displayContent);
    };

    if (isToolMessage) {
        return (
            <div className="flex justify-center">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-500 max-w-md">
                    <Wrench className="w-3 h-3" />
                    <span className="truncate">{message.content}</span>
                </div>
            </div>
        );
    }

    if (message.role === "user") {
        return (
            <div className="flex justify-end">
                <div className="max-w-[80%] bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black px-4 py-2.5 rounded-2xl rounded-br-sm text-sm">
                    {message.content}
                </div>
            </div>
        );
    }

    // Assistant message
    return (
        <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0 space-y-2">
                {hasThinking && (
                    <div
                        className="cursor-pointer text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                        onClick={() => setShowThinking(!showThinking)}
                    >
                        {showThinking ? thinkMatch![1].trim() : "💭 Click to see reasoning"}
                    </div>
                )}
                {displayContent && (
                    <div className="prose prose-sm dark:prose-invert max-w-none text-sm text-neutral-800 dark:text-neutral-200 [&_pre]:bg-neutral-100 [&_pre]:dark:bg-neutral-800 [&_pre]:rounded-lg [&_pre]:p-3 [&_code]:text-xs">
                        <Markdown>{displayContent}</Markdown>
                    </div>
                )}
                <div className="flex items-center gap-1">
                    <button
                        onClick={copyToClipboard}
                        className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600"
                        title="Copy"
                    >
                        <Copy className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    );
}
