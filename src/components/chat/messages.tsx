import { useEffect, useRef, useCallback } from "react";
import { ChatMessage as ChatMessageComponent } from "./message";
import type { ChatMessage } from "./types";
import { useChatStore } from "@/stores/chat";

interface MessagesProps {
    messages: ChatMessage[];
}

export function ChatMessages({ messages }: MessagesProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { isGenerating } = useChatStore();

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

    const visibleMessages = messages.filter(m => m.role !== "system");

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
                {visibleMessages.map((message, index) => (
                    <ChatMessageComponent key={index} message={message} />
                ))}
                {isGenerating && !visibleMessages[visibleMessages.length - 1]?.content && (
                    <div className="flex items-center gap-2 text-neutral-500 text-sm">
                        <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                        <span>Thinking...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
}
