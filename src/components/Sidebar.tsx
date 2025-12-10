import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    LayoutDashboard,
    MessageSquare,
    Dumbbell,
    NotebookPen,
    Users,
    Megaphone,
    DollarSign,
    Settings,
    X,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Dumbbell as LogoIcon,
    BookOpen,
    BarChart3,
    CalendarDays,
    LogOut,
    Briefcase,
    LucideIcon,
    Package,
    FileText,
    Star,
    Send
} from 'lucide-react';

interface SidebarProps {
    onClose?: () => void;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
}

interface MenuItem {
    icon: LucideIcon;
    label: string;
    path?: string;
    children?: { icon: LucideIcon; label: string; path: string }[];
}

const menuItems: MenuItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    {
        icon: MessageSquare,
        label: 'WhatsApp',
        children: [
            { icon: MessageSquare, label: 'Conversas', path: '/admin/mensagens' },
            { icon: Send, label: 'Campanhas', path: '/admin/campanhas' },
        ]
    },
    { icon: Users, label: 'Alunos', path: '/admin/alunos' },
    {
        icon: Dumbbell,
        label: 'Protocolos',
        children: [
            { icon: Dumbbell, label: 'Meus Protocolos', path: '/admin/protocolos' },
            { icon: BookOpen, label: 'Biblioteca', path: '/admin/biblioteca' },
        ]
    },
    {
        icon: Megaphone,
        label: 'Marketing',
        children: [
            { icon: Package, label: 'Planos', path: '/admin/planos' },
            { icon: FileText, label: 'Templates', path: '/admin/templates' },
            { icon: Star, label: 'Pontuação', path: '/admin/gamificacao' },
        ]
    },
    { icon: CalendarDays, label: 'Agenda', path: '/admin/agenda' },
    { icon: NotebookPen, label: 'Anotações', path: '/admin/anotacoes' },
    { icon: BarChart3, label: 'Relatórios', path: '/admin/relatorios' },
    { icon: DollarSign, label: 'Financeiro', path: '/admin/financeiro' },
    { icon: Settings, label: 'Configurações', path: '/admin/configuracoes' },
];

export default function Sidebar({ onClose, isCollapsed = false, onToggleCollapse }: SidebarProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [expandedMenus, setExpandedMenus] = useState<string[]>(['Gestão']);

    const toggleMenu = (label: string) => {
        setExpandedMenus(prev =>
            prev.includes(label)
                ? prev.filter(m => m !== label)
                : [...prev, label]
        );
    };

    const isChildActive = (children?: { path: string }[]) => {
        if (!children) return false;
        return children.some(child => location.pathname === child.path);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="h-full flex flex-col bg-sidebar border-r border-sidebar-border/30 sidebar-shadow transition-all duration-300">
            {/* Header / Logo Area */}
            <div className={`flex flex-col ${isCollapsed ? 'items-center gap-4 py-5' : 'flex-row items-center justify-between p-5'}`}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-sm">
                        <LogoIcon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    {!isCollapsed && (
                        <div>
                            <h1 className="font-bold text-[18px] text-sidebar-foreground leading-none">Minha Consultoria</h1>
                        </div>
                    )}
                </div>

                {onToggleCollapse && !isCollapsed && (
                    <button
                        onClick={onToggleCollapse}
                        className="hidden lg:flex p-1.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-primary transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                )}
                {onToggleCollapse && isCollapsed && (
                    <button
                        onClick={onToggleCollapse}
                        className="hidden lg:flex p-1.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-primary transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                )}

                {/* Mobile close button */}
                {onClose && !isCollapsed && (
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            <div className="h-[1px] bg-sidebar-border opacity-30 mx-4 mb-4" />

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-2 scrollbar-hide">
                {menuItems.map((item) => (
                    <div key={item.label}>
                        {item.children ? (
                            // Parent with children
                            <div>
                                <button
                                    onClick={() => !isCollapsed && toggleMenu(item.label)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                                        ${isChildActive(item.children)
                                            ? 'text-primary bg-sidebar-accent font-semibold'
                                            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-primary'
                                        }
                                        ${isCollapsed ? 'justify-center' : ''}
                                    `}
                                    title={isCollapsed ? item.label : undefined}
                                >
                                    <item.icon className="w-5 h-5 flex-shrink-0 text-slate-900 dark:text-slate-100" />
                                    {!isCollapsed && (
                                        <>
                                            <span className="flex-1 text-left">{item.label}</span>
                                            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedMenus.includes(item.label) ? 'rotate-180' : ''}`} />
                                        </>
                                    )}
                                </button>

                                {/* Children Submenu */}
                                {!isCollapsed && expandedMenus.includes(item.label) && (
                                    <div className="ml-0 mt-1 space-y-1 overflow-hidden transition-all duration-300">
                                        {item.children.map(child => (
                                            <NavLink
                                                key={child.path}
                                                to={child.path}
                                                onClick={onClose}
                                                className={({ isActive }) =>
                                                    `flex items-center gap-2 pl-11 pr-3 py-2 rounded-lg text-[13px] transition-all duration-200 block w-full
                                                    ${isActive
                                                        ? 'text-primary font-semibold bg-sidebar-accent'
                                                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-primary'
                                                    }`
                                                }
                                            >
                                                <span>{child.label}</span>
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Regular item
                            <NavLink
                                to={item.path!}
                                onClick={onClose}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap group
                                    ${isActive
                                        ? 'bg-primary text-primary-foreground shadow-sm font-semibold'
                                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-primary'
                                    }
                                    ${isCollapsed ? 'justify-center' : ''}`
                                }
                                title={isCollapsed ? item.label : undefined}
                            >
                                <div className="relative flex items-center justify-center w-5 h-5 flex-shrink-0">
                                    <item.icon className="w-full h-full stroke-[2] text-slate-900 dark:text-slate-100" />
                                </div>
                                {!isCollapsed && <span>{item.label}</span>}
                            </NavLink>
                        )}
                    </div>
                ))}
            </nav>

            {/* Logout Section */}
            <div>
                <div className="h-[1px] bg-sidebar-border opacity-30 mx-4 my-3" />
                <div className="px-3 pb-4">
                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-primary hover:bg-sidebar-accent hover:text-primary/80 transition-colors group ${isCollapsed ? 'justify-center' : ''}`}
                        title="Sair"
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0 text-slate-900 dark:text-slate-100 group-hover:scale-110 transition-transform" />
                        {!isCollapsed && <span>Sair</span>}
                    </button>
                </div>
            </div>
        </div>
    );
}
