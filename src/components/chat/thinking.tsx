import { cn } from "@/lib/utils";
import { Brain, Sparkles, Zap, Lightbulb } from "lucide-react";

interface ThinkingProps {
    className?: string;
    message?: string;
    type?: "thinking" | "analyzing" | "processing" | "generating";
}

export function Thinking({ className, message, type = "thinking" }: ThinkingProps) {
    const getThinkingConfig = () => {
        switch (type) {
            case "analyzing":
                return {
                    icon: Sparkles,
                    message: message || "Analyzing your request...",
                    bgClass: "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20",
                    borderClass: "border-blue-200 dark:border-blue-800",
                    textClass: "text-blue-700 dark:text-blue-300",
                    dotColor: "bg-blue-500"
                };
            case "processing":
                return {
                    icon: Zap,
                    message: message || "Processing information...",
                    bgClass: "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20",
                    borderClass: "border-green-200 dark:border-green-800",
                    textClass: "text-green-700 dark:text-green-300",
                    dotColor: "bg-green-500"
                };
            case "generating":
                return {
                    icon: Lightbulb,
                    message: message || "Generating response...",
                    bgClass: "bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20",
                    borderClass: "border-yellow-200 dark:border-yellow-800",
                    textClass: "text-yellow-700 dark:text-yellow-300",
                    dotColor: "bg-yellow-500"
                };
            default:
                return {
                    icon: Brain,
                    message: message || "Thinking...",
                    bgClass: "bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20",
                    borderClass: "border-purple-200 dark:border-purple-800",
                    textClass: "text-purple-700 dark:text-purple-300",
                    dotColor: "bg-purple-500"
                };
        }
    };

    const config = getThinkingConfig();
    const IconComponent = config.icon;

    return (
        <div className={cn("flex justify-start thinking-fade-in", className)}>
            <div className={cn("max-w-[85%] rounded-lg px-4 py-3 shadow-sm", config.bgClass, config.borderClass)}>
                <div className="flex items-center gap-3">
                    <div className={cn("flex items-center gap-2", config.textClass)}>
                        <IconComponent className="h-4 w-4 thinking-pulse" />
                        <span className="text-sm font-medium">{config.message}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className={cn("w-2 h-2 rounded-full thinking-bounce", config.dotColor)} style={{ animationDelay: '0ms' }}></div>
                        <div className={cn("w-2 h-2 rounded-full thinking-bounce", config.dotColor)} style={{ animationDelay: '150ms' }}></div>
                        <div className={cn("w-2 h-2 rounded-full thinking-bounce", config.dotColor)} style={{ animationDelay: '300ms' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
} 