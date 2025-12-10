import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Activity,
    Heart,
    Zap,
    TrendingUp,
    FileText,
    Brain,
    Stethoscope,
    MessageSquare,
    Smartphone,
    Dumbbell,
    Utensils,
    History,
    X,
    MoreHorizontal,
    Target,
    Calendar,
    Award,
    Scale
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Student } from '../../data/mockStudents';
import EvolutionGallery, { mockEvolutionPhotos } from './EvolutionGallery';
import HealthScoreDashboard from './HealthScoreDashboard';
import StudentNotifications from './StudentNotifications';
import StudentAIAnalysis from './StudentAIAnalysis';

interface StudentOverviewProps {
    student: Student;
    onChatOpen?: () => void;
    onTabChange: (tab: string) => void;
}

// Mock Data for the chart
const healthData = [
    { name: 'Seg', rate: 72 },
    { name: 'Ter', rate: 75 },
    { name: 'Qua', rate: 70 },
    { name: 'Qui', rate: 76 },
    { name: 'Sex', rate: 71 },
    { name: 'Sab', rate: 74 },
    { name: 'Dom', rate: 73 },
];

export default function StudentOverview({ student, onChatOpen, onTabChange }: StudentOverviewProps) {
    const navigate = useNavigate();
    const [showProtocolHistory, setShowProtocolHistory] = useState(false);

    const handleWhatsApp = () => {
        if (onChatOpen) {
            onChatOpen();
        } else {
            const phone = student.phone.replace(/\D/g, '');
            const message = `Olá ${student.name}, tudo bem?`;
            window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
        }
    };

    return (
        <div className="flex flex-col xl:flex-row gap-5">
            {/* LEFT COLUMN: Quick Info & Actions */}
            <div className="w-full xl:w-72 flex flex-col gap-3">

                {/* Quick Stats Cards */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-card py-3 px-3 rounded-xl border border-border">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Target className="w-4 h-4 text-primary" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium">Objetivo</p>
                        <p className="text-sm font-bold text-foreground truncate">{student.goal}</p>
                    </div>

                    <div className="bg-card py-3 px-3 rounded-xl border border-border">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-4 h-4 text-green-600" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium">Aderência</p>
                        <p className="text-sm font-bold text-foreground">{student.adherenceRate}%</p>
                    </div>

                    <div className="bg-card py-3 px-3 rounded-xl border border-border">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                <Calendar className="w-4 h-4 text-blue-600" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium">Check-ins</p>
                        <p className="text-sm font-bold text-foreground">{student.checkinsCompleted}</p>
                    </div>

                    <div className={`bg-card p-4 rounded-2xl border ${student.daysRemaining <= 7 ? 'border-amber-300 dark:border-amber-700' : 'border-border'}`}>
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${student.daysRemaining <= 7 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-muted'}`}>
                                <Award className={`w-4 h-4 ${student.daysRemaining <= 7 ? 'text-amber-600' : 'text-muted-foreground'}`} />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium">Dias Restantes</p>
                        <p className={`text-sm font-bold ${student.daysRemaining <= 7 ? 'text-amber-600' : 'text-foreground'}`}>
                            {student.daysRemaining}d
                        </p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-card py-3 px-3 rounded-xl border border-border">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Ações Rápidas</h4>
                    <div className="flex flex-col gap-1.5">
                        <button
                            onClick={handleWhatsApp}
                            className="w-full py-2.5 bg-[#25D366] text-white rounded-xl text-sm font-semibold hover:bg-[#20BD5A] transition-colors flex items-center justify-center gap-2"
                        >
                            <Smartphone className="w-4 h-4" />
                            WhatsApp
                        </button>
                        <div className="grid grid-cols-2 gap-1.5">
                            <button
                                onClick={() => onTabChange('workout')}
                                className="py-2.5 bg-muted hover:bg-muted/80 text-foreground rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                            >
                                <Dumbbell className="w-3.5 h-3.5" />
                                Treino
                            </button>
                            <button
                                onClick={() => onTabChange('diet')}
                                className="py-2.5 bg-muted hover:bg-muted/80 text-foreground rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                            >
                                <Utensils className="w-3.5 h-3.5" />
                                Dieta
                            </button>
                        </div>
                    </div>
                </div>

                {/* Weight Progress */}
                {student.weightHistory && student.weightHistory.length > 0 && (
                    <div className="bg-card py-3 px-3 rounded-xl border border-border">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Peso</h4>
                            <Scale className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-bold text-foreground">
                                {student.weightHistory[student.weightHistory.length - 1]?.weight}
                            </span>
                            <span className="text-sm text-muted-foreground mb-1">kg</span>
                        </div>
                        <div className="mt-2 flex gap-1">
                            {student.weightHistory.slice(-6).map((w, i) => (
                                <div
                                    key={i}
                                    className="flex-1 bg-primary/20 rounded-sm"
                                    style={{ height: `${Math.max(20, (w.weight / 100) * 40)}px` }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Focus & Discipline */}
                <div className="bg-card py-3 px-3 rounded-xl border border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
                            <Brain className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium">Foco & Disciplina</p>
                            <div className="h-1.5 w-20 bg-muted rounded-full overflow-hidden mt-1">
                                <div className="h-full w-[85%] bg-primary rounded-full" />
                            </div>
                        </div>
                    </div>
                    <span className="text-lg font-bold text-foreground">85%</span>
                </div>
            </div>


            {/* RIGHT COLUMN: Charts & Stats */}
            <div className="flex-1 flex flex-col gap-4">

                {/* AI Analysis - High Priority */}
                <StudentAIAnalysis student={student} />

                {/* Student Notifications - Compact Inline */}
                <div className="card-base p-4">
                    <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        Notificações do Aluno
                    </h3>
                    <StudentNotifications studentId={student.id} studentName={student.name} />
                </div>


                {/* Protocol Card */}
                <div
                    onClick={() => onTabChange('workout')}
                    className="card-base p-4 cursor-pointer hover:shadow-md transition-all group relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <FileText className="w-24 h-24 text-primary" />
                    </div>

                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center text-primary">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground">Protocolo Atual</h3>
                                <p className="text-xs text-muted-foreground">Toque para ver detalhes</p>
                            </div>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onTabChange('workout');
                            }}
                            className="text-xs font-bold text-primary bg-muted px-3 py-1.5 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors"
                        >
                            Ver Detalhes
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10">
                        <div className="p-3 bg-muted/30 rounded-lg border border-border">
                            <div className="flex items-center gap-2 mb-2">
                                <Dumbbell className="w-4 h-4 text-primary" />
                                <span className="text-sm font-bold text-foreground">Treino A/B/C</span>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                                {student.currentWorkout || 'Hipertrofia com foco em membros inferiores e core.'}
                            </p>
                        </div>
                        <div className="p-3 bg-muted/30 rounded-lg border border-border">
                            <div className="flex items-center gap-2 mb-2">
                                <Utensils className="w-4 h-4 text-secondary" />
                                <span className="text-sm font-bold text-foreground">Dieta Cutting</span>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                                {student.currentDiet || 'Deficit calórico moderado, 2g/kg proteína.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Health Score */}
                <div className="card-base">
                    <HealthScoreDashboard studentId={student.id} studentName={student.name} />
                </div>


                {/* Health Overview Chart */}
                <div className="card-base p-6">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-foreground">Visão Geral de Saúde</h3>
                            <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                    <span className="w-2 h-2 rounded-full bg-primary" />
                                    Frequência
                                </div>
                                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                    <span className="w-2 h-2 rounded-full bg-muted" />
                                    Meta
                                </div>
                            </div>
                        </div>
                        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                            <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                        </button>
                    </div>

                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={healthData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                                <XAxis
                                    dataKey="name"
                                    tickLine={false}
                                    axisLine={false}
                                    stroke="#A3A3A3"
                                    fontSize={12}
                                    dy={10}
                                />
                                <Tooltip
                                    cursor={{ fill: 'var(--muted)' }}
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                        fontFamily: 'inherit',
                                        backgroundColor: 'var(--card)',
                                        color: 'var(--foreground)'
                                    }}
                                />
                                <Bar
                                    dataKey="rate"
                                    fill="var(--primary)"
                                    radius={[6, 6, 6, 6]}
                                    barSize={12}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                        <button className="flex-1 py-2.5 bg-muted text-primary rounded-xl text-sm font-bold hover:bg-muted/80 transition-colors">
                            Ver Histórico
                        </button>
                        <div className="flex-1 flex items-center justify-between px-4">
                            <span className="text-xs text-muted-foreground font-medium">Média Semanal</span>
                            <span className="text-sm font-bold text-foreground flex items-center gap-1">
                                <TrendingUp className="w-3 h-3 text-[#2ECC71]" />
                                +12%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Secondary Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Recent Tests */}
                    <div className="card-base p-0 overflow-hidden">
                        <div className="p-4 border-b border-border flex items-center justify-between">
                            <h3 className="font-bold text-foreground text-sm">Avaliações Recentes</h3>
                            <button className="text-xs font-bold text-primary hover:text-primary/80">Ver todas</button>
                        </div>
                        <div className="p-2">
                            {[
                                { name: 'Bioimpedância', date: 'Amanhã, 10:00', status: 'scheduled', icon: Activity },
                                { name: 'Anamnese', date: '15 Jan, 2024', status: 'completed', icon: FileText },
                            ].map((test, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 hover:bg-muted/30 rounded-xl transition-colors cursor-pointer group">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${test.status === 'scheduled'
                                        ? 'bg-muted text-foreground'
                                        : 'bg-[#2ECC71]/10 text-[#2ECC71]'
                                        }`}>
                                        <test.icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{test.name}</p>
                                        <p className="text-xs text-muted-foreground">{test.date}</p>
                                    </div>
                                    {test.status === 'scheduled' && (
                                        <span className="px-2 py-1 bg-muted text-foreground text-[10px] font-bold rounded-full">
                                            Agendado
                                        </span>
                                    )}
                                    {test.status === 'completed' && (
                                        <span className="px-2 py-1 bg-[#2ECC71]/10 text-[#2ECC71] text-[10px] font-bold rounded-full">
                                            Concluído
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="card-base p-4 flex flex-col justify-between hover:scale-[1.02] transition-transform">
                            <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center mb-3">
                                <Heart className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium">Batimentos</p>
                                <p className="text-lg font-bold text-foreground">72 <span className="text-xs font-normal text-muted-foreground">bpm</span></p>
                            </div>
                        </div>

                        <div className="card-base p-4 flex flex-col justify-between hover:scale-[1.02] transition-transform">
                            <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center mb-3">
                                <Zap className="w-4 h-4 text-secondary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium">Energia</p>
                                <p className="text-lg font-bold text-foreground">High</p>
                            </div>
                        </div>

                        <div className="card-base p-4 flex flex-col justify-between col-span-2">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                                        <Activity className="w-4 h-4 text-foreground" />
                                    </div>
                                    <p className="text-xs text-muted-foreground font-medium">Nível de Atividade</p>
                                </div>
                                <span className="text-xs font-bold text-foreground bg-muted px-2 py-1 rounded-md">
                                    Nível 2
                                </span>
                            </div>
                            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className="w-[60%] h-full bg-primary rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Evolution Gallery */}
                <div className="card-base p-5">
                    <EvolutionGallery photos={mockEvolutionPhotos} />
                </div>

                {/* My Instructor / Doctor Card */}
                <div className="card-base p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-muted shadow-sm">
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                            <Stethoscope className="w-5 h-5 text-muted-foreground" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-foreground text-sm">Dr. Sarah Wilson</h4>
                        <p className="text-xs text-muted-foreground">Cardiologista • Acompanhamento</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors">
                            Ver Perfil
                        </button>
                        <button className="p-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors">
                            <MessageSquare className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Protocol History Modal */}
            {showProtocolHistory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-card text-card-foreground rounded-[20px] max-w-2xl w-full p-6 shadow-xl animate-in fade-in zoom-in duration-200 max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-muted rounded-lg text-primary">
                                    <History className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-foreground">Histórico de Protocolos</h3>
                                    <p className="text-sm text-muted-foreground">Evolução de treino e dieta</p>
                                </div>
                            </div>
                            <button onClick={() => setShowProtocolHistory(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Current */}
                            <div className="relative pl-6 border-l-2 border-primary">
                                <span className="absolute -left-[9px] top-0 w-4 h-4 bg-primary rounded-full ring-4 ring-card" />
                                <div className="mb-1 flex items-center gap-2">
                                    <span className="px-2 py-0.5 bg-[#2ECC71]/10 text-[#2ECC71] text-xs font-bold rounded-full">Atual</span>
                                    <span className="text-sm text-muted-foreground">Iniciado em 15 Dez 2024</span>
                                </div>
                                <h4 className="font-bold text-lg text-foreground mb-2">Fase de Hipertrofia II</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                                    <div className="p-3 bg-muted/30 rounded-lg border border-border">
                                        <p className="text-xs font-bold text-foreground mb-1">Treino</p>
                                        <p className="text-sm text-muted-foreground">ABCDE - Foco em deltoides.</p>
                                    </div>
                                    <div className="p-3 bg-muted/30 rounded-lg border border-border">
                                        <p className="text-xs font-bold text-secondary mb-1">Dieta</p>
                                        <p className="text-sm text-muted-foreground">3000kcal (Carb Cycling).</p>
                                    </div>
                                </div>
                            </div>

                            {/* History Item 1 */}
                            <div className="relative pl-6 border-l-2 border-muted">
                                <span className="absolute -left-[9px] top-0 w-4 h-4 bg-muted-foreground/30 rounded-full ring-4 ring-card" />
                                <div className="mb-1 flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">10 Nov 2024 - 14 Dez 2024</span>
                                </div>
                                <h4 className="font-medium text-base text-muted-foreground mb-2">Fase de Hipertrofia I</h4>
                                <p className="text-sm text-muted-foreground mb-2">Adaptação de carga e volume moderado.</p>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-border flex justify-end">
                            <button
                                onClick={() => navigate('/admin/protocolos')}
                                className="text-primary font-bold text-sm hover:underline"
                            >
                                Ver histórico completo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
