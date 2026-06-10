import { X } from "lucide-react";

export function WebGPUError() {
    return (
        <div className="flex items-center justify-center min-h-screen p-6">
            <div className="text-center space-y-4 max-w-md">
                <div className="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <X className="h-8 w-8 text-red-500" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">WebGPU Not Supported</h2>
                    <p className="text-sm text-neutral-500">
                        This app requires WebGPU. Please use Chrome 113+ or Edge 113+.
                    </p>
                </div>
            </div>
        </div>
    );
}
