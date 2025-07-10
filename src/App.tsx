"use client"

import { useEffect } from "react";
import { useChatStore } from "@/stores/chat";
import { hasWebGPU } from "@/lib/utils";
import { ChatLoading } from "@/components/chat/loading";
import { ChatWelcome } from "@/components/chat/welcome";
import { ChatMessages } from "@/components/chat/messages";
import { ChatInput } from "@/components/chat/input";
import { ChatHeader } from "@/components/chat/header";
import { WebGPUError } from "@/components/chat/webgpu-error";

export default function App() {
  const {
    messages,
    isWebGPU,
    isReady,
    progress,
    usage,
    setInput,
    handleClear,
    loadEngine,
    setIsWebGPU,
  } = useChatStore();

  useEffect(() => {
    if (hasWebGPU()) {
      setIsWebGPU(true);
      loadEngine();
    }
  }, [setIsWebGPU, loadEngine]);

  const handleQuestionClick = (question: string) => {
    setInput(question);
  };

  if (!isWebGPU) {
    return <WebGPUError />
  }

  return (
    <main className="w-screen h-screen mx-auto max-w-2xl">
      {/* Chat Header */}
      <ChatHeader onClear={handleClear} />

      {/* Chat Content */}
      <div className="flex-1 flex flex-col max-w-2xl px-1.5 min-h-[calc(100vh-180px)] overflow-hidden w-full max-h-[calc(100vh-180px)]">
        {!isReady ? (
          <ChatLoading progress={progress} />
        ) : messages.length === 1 ? (
          <ChatWelcome
            suggestedQuestions={[]}
            onQuestionClick={handleQuestionClick}
          />
        ) : (
          <ChatMessages messages={messages} usage={usage} />
        )}
      </div>

      {/* Chat Input */}
      <ChatInput />

      <div className="flex justify-center items-center">
        <a href="https://abdullah.studio" className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
          See more projects
        </a>
      </div>
    </main>
  );
}

