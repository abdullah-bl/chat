import { useChatStore } from "@/stores/chat";
import { MessageSquarePlus, Trash2, X, MessageCircle } from "lucide-react";

export function Sidebar() {
    const {
        conversations,
        activeConversationId,
        setActiveConversation,
        createConversation,
        deleteConversation,
        sidebarOpen,
        setSidebarOpen,
    } = useChatStore();

    return (
        <>
            {/* Backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed lg:relative top-0 left-0 z-50 h-full w-72 bg-neutral-50 dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b border-neutral-200 dark:border-neutral-800">
                    <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Chats</h2>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => {
                                createConversation();
                                setSidebarOpen(false);
                            }}
                            className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                            title="New Chat"
                        >
                            <MessageSquarePlus className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 lg:hidden"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="p-4 text-center text-neutral-500 dark:text-neutral-400 text-sm">
                            No conversations yet
                        </div>
                    ) : (
                        <div className="p-2 space-y-0.5">
                            {conversations.map((conv) => (
                                <div
                                    key={conv.id}
                                    className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                                        activeConversationId === conv.id
                                            ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                                            : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/50"
                                    }`}
                                    onClick={() => {
                                        setActiveConversation(conv.id);
                                        setSidebarOpen(false);
                                    }}
                                >
                                    <MessageCircle className="w-4 h-4 shrink-0" />
                                    <span className="text-sm truncate flex-1">{conv.title}</span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteConversation(conv.id);
                                        }}
                                        className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-500 hover:text-red-500 transition-opacity"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 dark:text-neutral-400">
                    {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
                </div>
            </div>
        </>
    );
}
