import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Sun, Moon, Search, Bell, Link as LinkIcon, ChevronRight } from 'lucide-react';

interface HeaderProps {
    onToggleSidebar: () => void;
    isDarkMode: boolean;
    onToggleTheme: () => void;
    onCopyLink: () => void;
}

export default function Header({
    onToggleSidebar,
    isDarkMode,
    onToggleTheme,
    onCopyLink
}: HeaderProps) {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <header className="h-[60px] bg-card px-4 flex items-center justify-between border-b border-border shadow-sm relative z-30 transition-all duration-300">

            {/* LEFT: Mobile Menu + Breadcrumb/Search */}
            <div className="flex items-center gap-4 flex-1">
                <button
                    onClick={onToggleSidebar}
                    className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors lg:hidden"
                >
                    <Menu className="w-6 h-6 text-foreground" />
                </button>

                {/* Breadcrumb & Search Container */}
                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-2 text-[12px] font-normal text-muted-foreground">
                        <span>Home</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-foreground font-medium capitalize">{location.pathname.split('/').pop() || 'Dashboard'}</span>
                    </div>

                    {/* Global Search */}
                    <div className="relative hidden sm:block group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="w-48 lg:w-64 pl-10 pr-4 py-2 bg-muted/50 border-none rounded-xl text-sm text-foreground focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground h-9"
                        />
                    </div>
                </div>
            </div>

            {/* RIGHT: CTAs & Actions */}
            <div className="flex items-center gap-4 md:gap-6">
                {/* Link Cadastro CTA */}
                <button
                    onClick={onCopyLink}
                    className="hidden md:flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all hover:shadow-md active:scale-95 h-9"
                >
                    <LinkIcon className="w-4 h-4" />
                    Link Cadastro
                </button>

                {/* Icons / Notifications */}
                <div className="flex items-center gap-3 md:gap-4">
                    <button className="relative p-1.5 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-muted/50">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full border border-card" />
                    </button>

                    <button
                        onClick={onToggleTheme}
                        className="p-1.5 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-muted/50"
                    >
                        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>

                    {/* Avatar */}
                    <div
                        onClick={() => navigate('/admin/configuracoes')}
                        className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-secondary p-[2px] cursor-pointer hover:shadow-md transition-shadow"
                    >
                        <div className="w-full h-full rounded-full bg-card overflow-hidden">
                            <img
                                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
                                alt="User"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
