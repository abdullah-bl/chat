import { useEffect } from "react";
import { useChatStore } from "@/stores/chat";
import { hasWebGPU } from "@/lib/utils";
import { ChatLoading } from "@/components/chat/loading";
import { ChatWelcome } from "@/components/chat/welcome";
import { ChatMessages } from "@/components/chat/messages";
import { ChatInput } from "@/components/chat/input";
import { WebGPUError } from "@/components/chat/webgpu-error";

export function ChatPage() {
    const {
        isWebGPU, isReady, progress, loadEngine, setIsWebGPU,
        createConversation, activeConversationId, conversations, getActiveConversation,
    } = useChatStore();

    useEffect(() => {
        if (hasWebGPU()) {
            setIsWebGPU(true);
            loadEngine();
        }
    }, []);

    // Auto-create first conversation
    useEffect(() => {
        if (conversations.length === 0 && !activeConversationId) {
            createConversation();
        }
    }, []);

    if (!isWebGPU) return <WebGPUError />;

    const conv = getActiveConversation();
    const messages = conv?.messages || [];
    const hasUserMessages = messages.some(m => m.role === "user");

    return (
        <div className="flex-1 flex flex-col min-h-0">
            {!isReady ? (
                <ChatLoading progress={progress} />
            ) : !hasUserMessages ? (
                <ChatWelcome onQuestionClick={(q) => {
                    useChatStore.setState({ input: q });
                    useChatStore.getState().handleSubmit();
                }} />
            ) : (
                <ChatMessages messages={messages} />
            )}
            <ChatInput />
        </div>
    );
}
