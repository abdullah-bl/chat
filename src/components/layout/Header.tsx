import { useChatStore } from "@/stores/chat";
import { Menu, Moon, Sun, Settings, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export function Header() {
    const { setSidebarOpen, selectedCharacter } = useChatStore();
    const location = useLocation();
    const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

    const toggleTheme = () => {
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    };

    return (
        <header className="flex items-center justify-between px-3 py-2 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 lg:hidden"
                >
                    <Menu className="w-5 h-5" />
                </button>
                <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">AI Chat</span>
                {selectedCharacter && (
                    <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                        {selectedCharacter}
                    </span>
                )}
            </div>

            <div className="flex items-center gap-1">
                <Link
                    to="/"
                    className={`p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 ${location.pathname === '/' ? 'bg-neutral-200 dark:bg-neutral-800' : ''}`}
                    title="Chat"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </Link>
                <Link
                    to="/characters"
                    className={`p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 ${location.pathname === '/characters' ? 'bg-neutral-200 dark:bg-neutral-800' : ''}`}
                    title="Characters"
                >
                    <Users className="w-4 h-4" />
                </Link>
                <Link
                    to="/settings"
                    className={`p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 ${location.pathname === '/settings' ? 'bg-neutral-200 dark:bg-neutral-800' : ''}`}
                    title="Settings"
                >
                    <Settings className="w-4 h-4" />
                </Link>
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800"
                    title="Toggle theme"
                >
                    {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
            </div>
        </header>
    );
}
