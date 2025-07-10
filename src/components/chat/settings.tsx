"use client"

import { prebuiltAppConfig } from "@mlc-ai/web-llm";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "../ui/select";
import { useChatStore } from "@/stores/chat";
import React from "react";
import ChatCharacters from "./ChatCharacters";
import { Sheet, SheetContent, SheetTitle, SheetHeader, SheetTrigger } from "../ui/sheet";
import { Settings } from "lucide-react";
import { Button } from "../ui/button";


// system prompt characters 

export function ChatSettings() {
    const {
        model,
        setModel,
        systemPrompt,
        setSystemPrompt,
        temperature,
        setTemperature,
        maxTokens,
        setMaxTokens,
        topP,
        setTopP,
        frequencyPenalty,
        setFrequencyPenalty,
        presencePenalty,
        setPresencePenalty,
        stopSequences,
        setStopSequences,
        seed,
        setSeed,
        logprobs,
        setLogprobs,
        modelList,
        setModelList,
        gpuVendor,
        enableTools,
        setEnableTools,
        enableThinkingStates,
        setEnableThinkingStates
    } = useChatStore();

    // Initialize model list if empty
    React.useEffect(() => {
        if (modelList.length === 0) {
            const models = prebuiltAppConfig.model_list.map((model) => ({
                name: model.model_id,
                value: model.model_id,
            }));
            setModelList(models);
        }
    }, [modelList.length, setModelList]);

    const modelOptions = modelList.map(model => ({
        value: model.value,
        label: model.name
    }));

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Settings className="w-4 h-4" />
                </Button>
            </SheetTrigger>
            <SheetContent className=" overflow-x-hidden overflow-y-scroll p-4 w-[1400px] sm:w-[540px]">
                <SheetHeader>
                    <SheetTitle>Chat Settings</SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-2">
                    {/* Chat Characters */}
                    <ChatCharacters />

                    {/* Model Selection */}
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="model">Model</Label>
                        <Select
                            value={model}
                            onValueChange={(value) => setModel(value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {modelOptions.map((option) => (
                                    <SelectItem className="text-sm" key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground">
                            Choose the language model to use for the chat.
                        </p>
                    </div>

                    {/* Tools Toggle */}
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="enable-tools">Enable Tools</Label>
                        <div className="flex items-center space-x-2">
                            <input
                                id="enable-tools"
                                type="checkbox"
                                checked={enableTools}
                                onChange={(e) => setEnableTools(e.target.checked)}
                                className="rounded border-gray-300"
                            />
                            <span className="text-sm text-muted-foreground">
                                Allow the AI to use tools for calculations, time, weather, and web search
                            </span>
                        </div>
                    </div>

                    {/* Thinking States Toggle */}
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="enable-thinking">Enable Thinking States</Label>
                        <div className="flex items-center space-x-2">
                            <input
                                id="enable-thinking"
                                type="checkbox"
                                checked={enableThinkingStates}
                                onChange={(e) => setEnableThinkingStates(e.target.checked)}
                                className="rounded border-gray-300"
                            />
                            <span className="text-sm text-muted-foreground">
                                Show AI thinking process with collapsible thinking indicators
                            </span>
                        </div>
                    </div>

                    {/* System Prompt */}
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="system-prompt">System Prompt</Label>
                        <Textarea
                            id="system-prompt"
                            value={systemPrompt}
                            onChange={(e) => setSystemPrompt(e.target.value)}
                            placeholder="Enter the system prompt that defines the assistant's behavior..."
                            rows={4}
                        />
                        <p className="text-sm text-muted-foreground">
                            This prompt defines the assistant's personality and behavior.
                        </p>
                    </div>

                    {/* Generation Parameters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Temperature */}
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="temperature">Temperature</Label>
                            <Input
                                id="temperature"
                                type="number"
                                min="0"
                                max="2"
                                step="0.1"
                                value={temperature}
                                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                            />
                            <p className="text-sm text-muted-foreground">
                                Controls randomness (0 = deterministic, 2 = very random)
                            </p>
                        </div>

                        {/* Max Tokens */}
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="max-tokens">Max Tokens</Label>
                            <Input
                                id="max-tokens"
                                type="number"
                                min="1"
                                max="4000"
                                value={maxTokens}
                                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                            />
                            <p className="text-sm text-muted-foreground">
                                Maximum number of tokens to generate
                            </p>
                        </div>

                        {/* Top P */}
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="top-p">Top P</Label>
                            <Input
                                id="top-p"
                                type="number"
                                min="0"
                                max="1"
                                step="0.1"
                                value={topP}
                                onChange={(e) => setTopP(parseFloat(e.target.value))}
                            />
                            <p className="text-sm text-muted-foreground">
                                Nucleus sampling parameter (0-1)
                            </p>
                        </div>

                        {/* Seed */}
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="seed">Seed</Label>
                            <Input
                                id="seed"
                                type="number"
                                value={seed}
                                onChange={(e) => setSeed(parseInt(e.target.value))}
                            />
                            <p className="text-sm text-muted-foreground">
                                Random seed for reproducible results
                            </p>
                        </div>

                        {/* Frequency Penalty */}
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="frequency-penalty">Frequency Penalty</Label>
                            <Input
                                id="frequency-penalty"
                                type="number"
                                min="-2"
                                max="2"
                                step="0.1"
                                value={frequencyPenalty}
                                onChange={(e) => setFrequencyPenalty(parseFloat(e.target.value))}
                            />
                            <p className="text-sm text-muted-foreground">
                                Reduces repetition of frequent tokens
                            </p>
                        </div>

                        {/* Presence Penalty */}
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="presence-penalty">Presence Penalty</Label>
                            <Input
                                id="presence-penalty"
                                type="number"
                                min="-2"
                                max="2"
                                step="0.1"
                                value={presencePenalty}
                                onChange={(e) => setPresencePenalty(parseFloat(e.target.value))}
                            />
                            <p className="text-sm text-muted-foreground">
                                Reduces repetition of any token
                            </p>
                        </div>

                        {/* Logprobs */}
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="logprobs">Logprobs</Label>
                            <Input
                                id="logprobs"
                                type="number"
                                min="0"
                                max="5"
                                value={logprobs}
                                onChange={(e) => setLogprobs(parseInt(e.target.value))}
                            />
                            <p className="text-sm text-muted-foreground">
                                Number of logprobs to return (0-5)
                            </p>
                        </div>
                    </div>

                    {/* Stop Sequences */}
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="stop-sequences">Stop Sequences</Label>
                        <Textarea
                            id="stop-sequences"
                            value={stopSequences.join('\n')}
                            onChange={(e) => setStopSequences(e.target.value.split('\n').filter(s => s.trim()))}
                            placeholder="Enter stop sequences, one per line..."
                            rows={3}
                        />
                        <p className="text-sm text-muted-foreground">
                            Sequences that will stop generation when encountered (one per line)
                        </p>
                    </div>

                    {/* GPU Vendor */}
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="gpu-vendor">GPU Vendor</Label>
                        <p className="text-sm text-muted-foreground">
                            {gpuVendor}
                        </p>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}