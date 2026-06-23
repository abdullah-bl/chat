import { HashRouter, Routes, Route } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ChatPage } from "@/pages/ChatPage";
import { CharactersPage } from "@/pages/CharactersPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { AgentPage } from "@/pages/AgentPage";
import { Toaster } from "sonner";

export default function App() {
    return (
        <HashRouter>
            <div className="flex h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
                <Sidebar />
                <div className="flex-1 flex flex-col min-w-0">
                    <Header />
                    <Routes>
                        <Route path="/" element={<ChatPage />} />
                        <Route path="/characters" element={<CharactersPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                        <Route path="/agent" element={<AgentPage />} />
                    </Routes>
                </div>
            </div>
            <Toaster position="bottom-center" />
        </HashRouter>
    );
}
