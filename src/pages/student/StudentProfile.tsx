import { Link } from 'react-router-dom';
import { ChevronRight, Trophy, Calendar, CreditCard, Settings, LogOut } from 'lucide-react';
import { studentProfile } from '../../data/mockStudentData';

export default function StudentProfile() {
    const menuItems = [
        { icon: Trophy, label: 'Minhas Conquistas', to: '#' },
        { icon: Calendar, label: 'Histórico de Treinos', to: '#' },
        { icon: CreditCard, label: 'Meu Plano', to: '#' },
        { icon: Settings, label: 'Configurações', to: '#' },
    ];

    return (
        <div className="space-y-4">
            {/* Profile Card */}
            <div className="bg-card rounded-xl p-5 border border-border text-center">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-2xl mx-auto mb-3">
                    {studentProfile.avatar}
                </div>
                <h2 className="text-lg font-bold text-foreground">
                    João Silva
                </h2>
                <p className="text-sm text-muted-foreground">
                    Aluno desde Out/2024
                </p>

                <div className="flex justify-center gap-6 mt-4">
                    <div className="text-center">
                        <p className="text-xl font-bold text-primary">
                            {studentProfile.points.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Pontos</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xl font-bold text-foreground">
                            {studentProfile.streakDays}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Dias seguidos</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xl font-bold text-foreground">
                            18
                        </p>
                        <p className="text-[10px] text-muted-foreground">Check-ins</p>
                    </div>
                </div>
            </div>

            {/* Menu */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
                {menuItems.map((item, index) => (
                    <Link
                        key={item.label}
                        to={item.to}
                        className={`flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors ${index !== menuItems.length - 1 ? 'border-b border-border' : ''
                            }`}
                    >
                        <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center">
                            <item.icon className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <span className="flex-1 font-medium text-sm text-foreground">
                            {item.label}
                        </span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </Link>
                ))}
            </div>

            {/* Logout */}
            <button className="w-full flex items-center justify-center gap-2 p-3 bg-destructive/10 text-destructive rounded-xl font-medium text-sm hover:bg-destructive/20 transition-colors">
                <LogOut className="w-4 h-4" />
                <span>Sair da Conta</span>
            </button>

            {/* Admin Link */}
            <Link
                to="/"
                className="block text-center text-xs text-muted-foreground hover:text-primary py-3"
            >
                Acessar Painel Administrativo →
            </Link>
        </div>
    );
}

