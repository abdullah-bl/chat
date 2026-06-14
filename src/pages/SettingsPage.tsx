import { useChatStore } from "@/stores/chat";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export function SettingsPage() {
    const {
        model, setModel, temperature, setTemperature, maxTokens, setMaxTokens,
        topP, setTopP, frequencyPenalty, setFrequencyPenalty, presencePenalty, setPresencePenalty,
        seed, setSeed, stopSequences, setStopSequences, enableTools, setEnableTools,
        enableThinkingStates, setEnableThinkingStates, enableVoice, setEnableVoice,
        systemPrompt, setSystemPrompt, isReady, gpuVendor: gpu,
    } = useChatStore();

    const models = [
        { name: "SmolLM2 1.7B (Recommended)", value: "SmolLM2-1.7B-Instruct-q4f16_1-MLC" },
        { name: "SmolLM2 360M (Fastest)", value: "SmolLM2-360M-Instruct-q0f32-MLC" },
        { name: "Llama 3.2 1B", value: "Llama-3.2-1B-Instruct-q4f16_1-MLC" },
        { name: "Llama 3.2 3B", value: "Llama-3.2-3B-Instruct-q4f16_1-MLC" },
        { name: "Phi 3.5 Mini", value: "Phi-3.5-mini-instruct-q4f16_1-MLC" },
        { name: "Qwen 2.5 1.5B", value: "Qwen2.5-1.5B-Instruct-q4f16_1-MLC" },
        { name: "Gemma 2 2B", value: "gemma-2-2b-it-q4f16_1-MLC" },
    ];

    return (
        <div className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full">
            <Link to="/" className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 mb-6">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back to Chat</span>
            </Link>

            <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">Settings</h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">Configure model and generation parameters.</p>

            <div className="space-y-6">
                {/* Model */}
                <Section title="Model">
                    <SelectField label="Model" value={model} onChange={setModel} options={models} />
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <span className={`w-2 h-2 rounded-full ${isReady ? "bg-green-500" : "bg-yellow-500"}`} />
                        {isReady ? "Model loaded" : "Loading..."} • GPU: {gpu || "N/A"}
                    </div>
                </Section>

                {/* Generation */}
                <Section title="Generation">
                    <div className="grid grid-cols-2 gap-4">
                        <NumberField label="Temperature" value={temperature} onChange={setTemperature} min={0} max={2} step={0.1} hint="Randomness" />
                        <NumberField label="Max Tokens" value={maxTokens} onChange={setMaxTokens} min={64} max={8192} step={64} hint="Response length" />
                        <NumberField label="Top P" value={topP} onChange={setTopP} min={0} max={1} step={0.1} hint="Nucleus sampling" />
                        <NumberField label="Seed" value={seed} onChange={setSeed} min={0} max={999999} step={1} hint="Reproducibility" />
                        <NumberField label="Freq Penalty" value={frequencyPenalty} onChange={setFrequencyPenalty} min={-2} max={2} step={0.1} hint="Reduce repetition" />
                        <NumberField label="Pres Penalty" value={presencePenalty} onChange={setPresencePenalty} min={-2} max={2} step={0.1} hint="Encourage diversity" />
                    </div>
                </Section>

                {/* System Prompt */}
                <Section title="System Prompt">
                    <textarea
                        value={systemPrompt}
                        onChange={(e) => setSystemPrompt(e.target.value)}
                        rows={4}
                        className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent text-sm resize-none focus:outline-none focus:ring-1 focus:ring-neutral-400"
                        placeholder="Define the AI's behavior..."
                    />
                </Section>

                {/* Features */}
                <Section title="Features">
                    <Toggle label="Tool Calling" description="Enable time, math, weather, search tools" value={enableTools} onChange={setEnableTools} />
                    <Toggle label="Thinking States" description="Show AI reasoning process" value={enableThinkingStates} onChange={setEnableThinkingStates} />
                    <Toggle label="Voice Input" description="Speech-to-text for input" value={enableVoice} onChange={setEnableVoice} />
                </Section>

                {/* Stop Sequences */}
                <Section title="Stop Sequences">
                    <textarea
                        value={stopSequences.join('\n')}
                        onChange={(e) => setStopSequences(e.target.value.split('\n').filter(s => s.trim()))}
                        rows={2}
                        className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent text-sm resize-none focus:outline-none focus:ring-1 focus:ring-neutral-400"
                        placeholder="One per line..."
                    />
                </Section>
            </div>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-3">
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{title}</h2>
            {children}
        </div>
    );
}

function NumberField({ label, value, onChange, min, max, step, hint }: {
    label: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number; hint?: string;
}) {
    return (
        <div>
            <label className="text-xs text-neutral-500">{label}</label>
            <input
                type="number" min={min} max={max} step={step} value={value}
                onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-transparent text-sm"
            />
            {hint && <span className="text-[10px] text-neutral-400">{hint}</span>}
        </div>
    );
}

function SelectField({ label, value, onChange, options }: {
    label: string; value: string; onChange: (v: string) => void; options: { name: string; value: string }[];
}) {
    return (
        <div>
            <label className="text-xs text-neutral-500">{label}</label>
            <select
                value={value} onChange={(e) => onChange(e.target.value)}
                className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-transparent text-sm"
            >
                {options.map((o) => <option key={o.value} value={o.value}>{o.name}</option>)}
            </select>
        </div>
    );
}

function Toggle({ label, description, value, onChange }: {
    label: string; description: string; value: boolean; onChange: (v: boolean) => void;
}) {
    return (
        <div className="flex items-center justify-between py-2">
            <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{label}</p>
                <p className="text-xs text-neutral-500">{description}</p>
            </div>
            <button
                onClick={() => onChange(!value)}
                className={`w-10 h-6 rounded-full transition-colors relative ${value ? "bg-blue-500" : "bg-neutral-300 dark:bg-neutral-700"}`}
            >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${value ? "translate-x-4" : ""}`} />
            </button>
        </div>
    );
}
