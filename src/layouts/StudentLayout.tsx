import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Home, Dumbbell, Utensils, User, Bell, LogOut, Trophy } from 'lucide-react';
import { studentProfile } from '../data/mockStudentData';
import { useAuth } from '../contexts/AuthContext';

export default function StudentLayout() {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

    const navItems = [
        { to: '/app', icon: Home, label: 'Hoje' },
        { to: '/app/treino', icon: Dumbbell, label: 'Treino' },
        { to: '/app/dieta', icon: Utensils, label: 'Dieta' },
        { to: '/app/perfil', icon: User, label: 'Perfil' },
    ];

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Top Bar */}
            <header className="bg-card border-b border-border sticky top-0 z-40">
                <div className="flex items-center justify-between px-4 py-3">
                    {/* Greeting */}
                    <div>
                        <p className="text-xs text-muted-foreground">
                            {greeting},
                        </p>
                        <h1 className="text-base font-bold text-foreground">
                            {studentProfile.name.split(' ')[0]}!
                        </h1>
                    </div>

                    {/* Points & Actions */}
                    <div className="flex items-center gap-2">
                        {/* Points */}
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-primary/10 rounded-lg">
                            <Trophy className="w-4 h-4 text-primary" />
                            <span className="text-sm font-bold text-primary">
                                {studentProfile.points > 1000 ? `${(studentProfile.points / 1000).toFixed(1)}k` : studentProfile.points}
                            </span>
                        </div>

                        {/* Notifications */}
                        <button
                            onClick={() => navigate('/app/notificacoes')}
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                        >
                            <Bell className="w-5 h-5 text-muted-foreground" />
                        </button>

                        {/* Logout */}
                        <button
                            onClick={() => { logout(); navigate('/login/aluno'); }}
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                        >
                            <LogOut className="w-5 h-5 text-muted-foreground" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 overflow-y-auto pb-20 px-4 pt-4">
                <Outlet />
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 px-4 pb-safe pt-2">
                <div className="flex items-center justify-around max-w-md mx-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.to === '/app'}
                                className={({ isActive }) =>
                                    `flex flex-col items-center gap-0.5 py-2 px-4 rounded-lg transition-all ${isActive
                                        ? 'text-primary'
                                        : 'text-muted-foreground hover:text-foreground'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                                        <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>
                                            {item.label}
                                        </span>
                                    </>
                                )}
                            </NavLink>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}

