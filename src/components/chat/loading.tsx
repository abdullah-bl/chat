import { Loader2 } from "lucide-react";
import type { Progress } from "./types";

interface LoadingProps {
    progress: Progress;
}

export function ChatLoading({ progress }: LoadingProps) {
    const pct = Math.round((progress.progress || 0) * 100);

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center space-y-4 max-w-sm">
                <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 text-neutral-400 animate-spin" />
                </div>
                <div className="space-y-2">
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">Loading model...</p>
                    <p className="text-xs text-neutral-500">{progress.text || "Initializing..."}</p>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                    <div
                        className="bg-neutral-900 dark:bg-neutral-100 h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                    />
                </div>
                <p className="text-xs text-neutral-400">{pct}%</p>
            </div>
        </div>
    );
}
