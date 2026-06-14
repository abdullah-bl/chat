import { useState, useCallback, useRef, useEffect } from "react";
import { Mic, MicOff, Send, Square } from "lucide-react";
import { useChatStore } from "@/stores/chat";

export function ChatInput() {
    const { input, isGenerating, handleInputChange, handleSubmit, handleStop, enableVoice } = useChatStore();
    const [isComposing, setIsComposing] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeechSupported] = useState(() => 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
    const recognitionRef = useRef<any>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isComposing) return;
        await handleSubmit();
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!isComposing) handleSubmit();
        }
    };

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
        }
    }, [input]);

    // Voice input
    const toggleVoice = useCallback(() => {
        if (!isSpeechSupported || !enableVoice) return;

        if (isListening && recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = navigator.language || 'en-US';

        recognition.onresult = (event: any) => {
            let transcript = '';
            for (let i = 0; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            handleInputChange({ target: { value: transcript } } as any);
        };

        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);

        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
    }, [isListening, isSpeechSupported, enableVoice]);

    return (
        <div className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-3">
            <form onSubmit={onSubmit} className="flex items-end gap-2 max-w-3xl mx-auto">
                <div className="flex-1 relative">
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={handleInputChange}
                        onCompositionStart={() => setIsComposing(true)}
                        onCompositionEnd={() => setIsComposing(false)}
                        onKeyDown={onKeyDown}
                        placeholder="Type a message..."
                        rows={1}
                        className="w-full resize-none rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-700 pr-10"
                    />
                </div>

                {/* Voice button */}
                {enableVoice && isSpeechSupported && (
                    <button
                        type="button"
                        onClick={toggleVoice}
                        className={`p-3 rounded-xl transition-colors ${isListening ? "bg-red-500 text-white animate-pulse" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"}`}
                        title={isListening ? "Stop listening" : "Start voice input"}
                    >
                        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                )}

                {/* Submit/Stop button */}
                {isGenerating ? (
                    <button
                        type="button"
                        onClick={handleStop}
                        className="p-3 rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black hover:opacity-90"
                        title="Stop"
                    >
                        <Square className="w-4 h-4" />
                    </button>
                ) : (
                    <button
                        type="submit"
                        disabled={!input.trim()}
                        className="p-3 rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Send"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                )}
            </form>
        </div>
    );
}
