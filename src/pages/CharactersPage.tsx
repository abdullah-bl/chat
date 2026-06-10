import { useChatStore } from "@/stores/chat";
import { llm_system_characters } from "@/lib/characters";
import { ArrowLeft, Plus, Trash2, Edit3 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export function CharactersPage() {
    const {
        selectedCharacter, setSelectedCharacter, customCharacters,
        addCustomCharacter, updateCustomCharacter, deleteCustomCharacter, setSystemPrompt,
    } = useChatStore();

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({ icon: "🤖", name: "", description: "", system_prompt: "" });

    const handleSelect = (name: string, prompt: string) => {
        setSelectedCharacter(name);
        setSystemPrompt(prompt);
    };

    const handleSubmit = () => {
        if (editingId) {
            updateCustomCharacter(editingId, form);
            setEditingId(null);
        } else {
            addCustomCharacter(form);
        }
        setForm({ icon: "🤖", name: "", description: "", system_prompt: "" });
        setShowForm(false);
    };

    const handleEdit = (c: any) => {
        setEditingId(c.id);
        setForm({ icon: c.icon || "🤖", name: c.name, description: c.description, system_prompt: c.system_prompt });
        setShowForm(true);
    };

    return (
        <div className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full">
            {/* Back button */}
            <div className="flex items-center justify-between mb-6">
                <Link to="/" className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm">Back to Chat</span>
                </Link>
                <button
                    onClick={() => { setShowForm(true); setEditingId(null); setForm({ icon: "🤖", name: "", description: "", system_prompt: "" }); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black rounded-lg hover:opacity-90"
                >
                    <Plus className="w-4 h-4" /> Custom
                </button>
            </div>

            <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">Characters</h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">Choose a personality for your AI assistant.</p>

            {/* Custom Character Form */}
            {showForm && (
                <div className="mb-6 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
                    <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
                        {editingId ? "Edit Character" : "New Character"}
                    </h3>
                    <div className="grid grid-cols-[60px_1fr] gap-3">
                        <div>
                            <label className="text-xs text-neutral-500">Icon</label>
                            <input
                                value={form.icon}
                                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                                className="w-full p-2 text-center text-2xl rounded-lg border border-neutral-200 dark:border-neutral-800 bg-transparent"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-neutral-500">Name</label>
                            <input
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="Character name"
                                className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-transparent text-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-neutral-500">Description</label>
                        <input
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Brief description"
                            className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-transparent text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-neutral-500">System Prompt</label>
                        <textarea
                            value={form.system_prompt}
                            onChange={(e) => setForm({ ...form, system_prompt: e.target.value })}
                            placeholder="Defines the character's behavior..."
                            rows={4}
                            className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-transparent text-sm resize-none"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleSubmit}
                            disabled={!form.name || !form.system_prompt}
                            className="px-4 py-2 text-sm bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black rounded-lg disabled:opacity-50"
                        >
                            {editingId ? "Update" : "Create"}
                        </button>
                        <button onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 py-2 text-sm border border-neutral-200 dark:border-neutral-800 rounded-lg">
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Default (no character) */}
            <div
                onClick={() => setSelectedCharacter(null)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all mb-3 ${!selectedCharacter ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30" : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"}`}
            >
                <div className="flex items-center gap-3">
                    <span className="text-2xl">⚙️</span>
                    <div>
                        <h3 className="font-medium text-sm text-neutral-900 dark:text-neutral-100">Default</h3>
                        <p className="text-xs text-neutral-500">Use your custom system prompt</p>
                    </div>
                </div>
            </div>

            {/* Predefined Characters */}
            {llm_system_characters.map((char) => (
                <div
                    key={char.name}
                    onClick={() => handleSelect(char.name, char.system_prompt)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all mb-3 ${selectedCharacter === char.name ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30" : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"}`}
                >
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{char.icon}</span>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm text-neutral-900 dark:text-neutral-100">{char.name}</h3>
                            <p className="text-xs text-neutral-500 truncate">{char.description}</p>
                        </div>
                    </div>
                </div>
            ))}

            {/* Custom Characters */}
            {customCharacters.length > 0 && (
                <>
                    <h2 className="text-sm font-semibold text-neutral-500 mt-6 mb-3">Your Characters</h2>
                    {customCharacters.map((char) => (
                        <div
                            key={char.id}
                            className={`p-4 rounded-xl border-2 transition-all mb-3 ${selectedCharacter === char.id ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30" : "border-neutral-200 dark:border-neutral-800"}`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{char.icon || "✨"}</span>
                                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleSelect(char.id, char.system_prompt)}>
                                    <h3 className="font-medium text-sm text-neutral-900 dark:text-neutral-100">{char.name}</h3>
                                    <p className="text-xs text-neutral-500 truncate">{char.description}</p>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => handleEdit(char)} className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500">
                                        <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => deleteCustomCharacter(char.id)} className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-neutral-500 hover:text-red-500">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </>
            )}
        </div>
    );
}
