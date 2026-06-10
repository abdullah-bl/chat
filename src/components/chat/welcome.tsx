interface WelcomeProps {
    onQuestionClick: (question: string) => void;
}

const questions = [
    "What can you do?",
    "Explain quantum computing simply",
    "Write a haiku about coding",
    "Help me brainstorm startup ideas",
];

export function ChatWelcome({ onQuestionClick }: WelcomeProps) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center space-y-6 max-w-md">
                <div className="space-y-2">
                    <div className="text-4xl mb-4">💬</div>
                    <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                        How can I help?
                    </h2>
                    <p className="text-neutral-500 text-sm">
                        Private AI running in your browser. No data leaves your device.
                    </p>
                </div>
                <div className="grid grid-cols-1 gap-2">
                    {questions.map((q, i) => (
                        <button
                            key={i}
                            onClick={() => onQuestionClick(q)}
                            className="text-left px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                        >
                            {q}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
