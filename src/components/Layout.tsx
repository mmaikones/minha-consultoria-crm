import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Sun, Moon, Search, Bell, Link as LinkIcon, ChevronRight, Check } from 'lucide-react';
import FloatingWhatsApp from './chat/FloatingWhatsApp';
import Sidebar from './Sidebar';
import Header from './Header'; // Import Header
import { ChatProvider } from '../contexts/ChatContext';
import { SidebarContext } from '../contexts/SidebarContext';
export { useSidebar } from '../contexts/SidebarContext';

export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('fitpro_dark_mode');
        if (saved !== null) return saved === 'true';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });
    const [toast, setToast] = useState<string | null>(null);

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('fitpro_dark_mode', String(isDarkMode));
    }, [isDarkMode]);

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
    };

    const handleCopyLink = () => {
        const link = `${window.location.origin}/anamnese`;
        navigator.clipboard.writeText(link);
        setToast('Link da anamnese copiado!');
        setTimeout(() => setToast(null), 3000);
    };

    return (
        <ChatProvider>
            <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
                <div className="min-h-screen flex bg-background">
                    {/* Sidebar */}
                    <aside
                        className={`
                        fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out
                        lg:translate-x-0 lg:static lg:z-auto
                        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                        ${isCollapsed ? 'w-20' : 'w-[240px]'}
                    `}
                    >
                        <Sidebar
                            onClose={() => setSidebarOpen(false)}
                            isCollapsed={isCollapsed}
                            onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
                        />
                    </aside>

                    {/* Main Content Wrapper */}
                    <div className="flex-1 flex flex-col min-h-screen transition-all duration-300 overflow-hidden">

                        {/* HEADER / TOPBAR */}
                        <Header
                            onToggleSidebar={() => setSidebarOpen(true)}
                            isDarkMode={isDarkMode}
                            onToggleTheme={toggleDarkMode}
                            onCopyLink={handleCopyLink}
                        />

                        {/* MAIN CONTENT AREA */}
                        <main className="flex-1 overflow-auto relative bg-background">
                            <div className="container-responsive">
                                <Outlet />
                            </div>

                            {/* Global Toast */}
                            {toast && (
                                <div className="fixed bottom-6 right-6 bg-green-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 z-[60] animate-in slide-in-from-bottom-4 duration-300">
                                    <Check className="w-5 h-5" />
                                    <span>{toast}</span>
                                </div>
                            )}
                        </main>
                    </div>
                    {/* Global Floating Chat - Only show if NOT on Messages page */}
                    {!location.pathname.includes('/mensagens') && (
                        <FloatingWhatsApp />
                    )}
                </div>
            </SidebarContext.Provider>
        </ChatProvider>
    );
}
