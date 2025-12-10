import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
    Pin,
    Plus,
    DollarSign,
    MessageSquare,
    FileText,
    TrendingUp,
    UserPlus,
    CreditCard,
    Sparkles,
    Loader2
} from 'lucide-react';
import { Student, studentColumns } from '../data/mockStudents';
import { Note, mockNotes } from '../data/mockNotes';
import { useStudents } from '../hooks/useStudents';
import type { Student as SupabaseStudent } from '../lib/database.types';

// Plan prices for calculations
const PLAN_PRICES: Record<string, number> = {
    'mensal': 150,
    'trimestral': 400,
    'semestral': 750,
    'anual': 1400,
    'novos_leads': 0
};

// Calendar helper functions
const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

// Convert Supabase student to local Student format
const convertSupabaseStudent = (s: SupabaseStudent): Student => ({
    id: s.id,
    name: s.name,
    email: s.email,
    phone: s.phone || '',
    goal: s.goal || '',
    status: (s.plan_type?.toLowerCase() as any) || 'mensal',
    daysRemaining: s.plan_end ? Math.ceil((new Date(s.plan_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 30,
    isExpiring: s.plan_end ? Math.ceil((new Date(s.plan_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) <= 7 : false,
    startDate: s.plan_start || s.created_at.split('T')[0],
    checkinsCompleted: s.streak_days,
    adherenceRate: 100,
    avatar: s.name.substring(0, 2).toUpperCase(),
    nextAssessment: '',
    weightHistory: s.weight ? [{ month: s.created_at.split('T')[0].slice(0, 7), weight: Number(s.weight) }] : [],
    currentWorkout: '',
    currentDiet: '',
    history: [{
        id: '1',
        date: s.created_at.split('T')[0],
        type: 'signup',
        description: 'Aluno cadastrado'
    }]
});

export default function Dashboard() {
    const navigate = useNavigate();

    // Use real data from Supabase
    const { data: supabaseStudents, isLoading } = useStudents();

    const students = useMemo(() => {
        if (supabaseStudents && supabaseStudents.length > 0) {
            return supabaseStudents.map(convertSupabaseStudent);
        }
        return [];
    }, [supabaseStudents]);

    const [notes] = useState<Note[]>(mockNotes); // Keep notes as mock for now

    // Calendar state
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());

    // Computed values
    const activeStudents = students.filter(s => s.status !== 'novos_leads');
    const expiringStudents = students.filter(s => s.isExpiring);

    // Check for AI-processed students (from localStorage demo)
    const [aiProcessedCount] = useState(() => {
        const stored = localStorage.getItem('fit360_latest_automation');
        return stored ? 1 : 0; // Simplified
    });
    const pinnedNotes = notes.filter(n => n.isPinned).slice(0, 2);

    // Dynamic KPI Calculations based on REAL mockStudents data
    const kpiData = useMemo(() => {
        const currentMonthStr = (currentMonth + 1).toString().padStart(2, '0');

        // 1. Calculate Revenue (Sum of 'payment' history in current month OR estimate from active plans)
        // Using history is more accurate for "Cash Flow", but using Active Plans is better for "MRR/Value"
        // Let's use Active Plans value for "Sales Total" to represent Monthly Value
        const activePlanRevenue = students.reduce((acc, student) => {
            if (student.status === 'novos_leads') return acc;
            return acc + (PLAN_PRICES[student.status] || 0);
        }, 0);

        // 2. New Students (started this month)
        const newStudentsCount = students.filter(s => {
            if (!s.startDate) return false;
            const start = new Date(s.startDate);
            return start.getMonth() === currentMonth && start.getFullYear() === currentYear;
        }).length;

        // 3. New Leads (status = 'novos_leads')
        const leadsCount = students.filter(s => s.status === 'novos_leads').length;

        // 4. Pending Protocols (random logic or based on data if available. Using expiring soon as proxy?)
        const pendingProtocolsCount = students.filter(s => s.isExpiring && s.daysRemaining < 7).length;

        return {
            salesTotal: activePlanRevenue,
            salesToday: 0, // Hard to calculate without daily granularity, keeping 0 or strictly 'today' history
            newStudents: newStudentsCount,
            pendingProtocols: pendingProtocolsCount,
            messagesToReply: 5, // Placeholder or fetch from chat service if possible
            billsToPay: 3, // Placeholder
            newLeads: leadsCount
        };
    }, [students, currentMonth, currentYear]);

    // Generate calendar days
    const calendarDays = useMemo(() => {
        const daysInMonth = getDaysInMonth(currentYear, currentMonth);
        const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
        const days: (number | null)[] = [];

        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(i);

        return days;
    }, [currentMonth, currentYear]);

    // Calendar navigation
    const prevMonth = () => {
        if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
        else setCurrentMonth(currentMonth - 1);
    };

    const nextMonth = () => {
        if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
        else setCurrentMonth(currentMonth + 1);
    };

    // Group students by status
    const studentsByStatus = useMemo(() => {
        const grouped: { [key: string]: Student[] } = {};
        studentColumns.forEach(col => {
            grouped[col.id] = students.filter(s => s.status === col.id);
        });
        return grouped;
    }, [students]);

    return (
        <div className="flex flex-col gap-6">
            {/* Header Steps / Page Title */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#050504]">Painel de Controle</h1>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {activeStudents.length} ativos
                        </span>
                        {expiringStudents.length > 0 && (
                            <span className="text-[#CF3F14] flex items-center gap-1 font-semibold">
                                <AlertTriangle className="w-4 h-4" />
                                {expiringStudents.length} vencendo
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* AI Processing Notification */}
            {aiProcessedCount > 0 && (
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 mb-6 text-white shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top duration-500">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-bold">🤖 Novos Alunos Processados pela IA</p>
                            <p className="text-sm text-indigo-100">
                                {aiProcessedCount} aluno(s) com perfil e protocolo gerados automaticamente.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/admin/alunos')}
                        className="px-4 py-2 bg-white text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors"
                    >
                        Revisar Agora
                    </button>
                </div>
            )}

            {/* KPI Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Sales */}
                <div className="card-base p-4 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                            <DollarSign className="w-4 h-4 text-green-600" />
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">Vendas</p>
                    <p className="text-lg font-bold text-[#050504]">R$ {kpiData.salesTotal.toLocaleString()}</p>
                    <span className="text-[10px] text-green-600 flex items-center gap-0.5 mt-1">
                        <TrendingUp className="w-3 h-3" /> +R$ {kpiData.salesToday} hoje
                    </span>
                </div>

                {/* New Students */}
                <div className="card-base p-4 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                            <UserPlus className="w-4 h-4 text-blue-600" />
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">Novos Alunos</p>
                    <p className="text-lg font-bold text-[#050504]">{kpiData.newStudents}</p>
                    <span className="text-[10px] text-blue-600">esta semana</span>
                </div>

                {/* Pending Protocols */}
                <div className="card-base p-4 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-orange-600" />
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">Protocolos</p>
                    <p className="text-lg font-bold text-[#050504]">{kpiData.pendingProtocols}</p>
                    <span className="text-[10px] text-orange-600">para enviar</span>
                </div>

                {/* Messages to Reply */}
                <div className="card-base p-4 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 text-purple-600" />
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">Mensagens</p>
                    <p className="text-lg font-bold text-[#050504]">{kpiData.messagesToReply}</p>
                    <span className="text-[10px] text-purple-600">para responder</span>
                </div>

                {/* Bills to Pay */}
                <div className="card-base p-4 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                            <CreditCard className="w-4 h-4 text-red-600" />
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">Contas</p>
                    <p className="text-lg font-bold text-[#050504]">{kpiData.billsToPay}</p>
                    <span className="text-[10px] text-red-600">a pagar</span>
                </div>

                {/* New Leads */}
                <div className="card-base p-4 flex flex-col sm:col-span-2 lg:col-span-1 xl:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                                <Users className="w-4 h-4 text-yellow-600" />
                            </div>
                        </div>
                        <select className="text-[10px] bg-[#F0F0F0] rounded-lg px-2 py-1 border-0 text-[#050504]">
                            <option>Hoje</option>
                            <option>7 dias</option>
                            <option>30 dias</option>
                        </select>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">Novos Leads</p>
                    <p className="text-lg font-bold text-[#050504]">{kpiData.newLeads}</p>
                    <span className="text-[10px] text-yellow-600">contatos via WhatsApp</span>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="flex flex-col lg:flex-row gap-6">

                {/* Left Column: Kanban Pipeline */}
                <div className="flex-1 card-base p-0 overflow-hidden flex flex-col min-h-[500px]">
                    <div className="px-6 py-4 border-b border-[#F0F0F0] flex items-center justify-between bg-white">
                        <div>
                            <h2 className="font-bold text-lg text-[#050504]">Pipeline de Alunos</h2>
                            <p className="text-xs text-muted-foreground">Visão geral do funil</p>
                        </div>
                        <span className="text-xs font-bold text-[#CF3F14] bg-[#F0F0F0] px-3 py-1 rounded-full">
                            {students.length} Total
                        </span>
                    </div>

                    <div className="flex-1 overflow-x-auto p-4 bg-[#FAFAFA] flex gap-4">
                        {studentColumns.map(column => (
                            <div key={column.id} className="min-w-[280px] w-[280px] flex flex-col h-full bg-[#E5E4E4]/30 rounded-[20px] p-2">
                                <div className={`px-4 py-3 mb-2 rounded-xl text-white text-xs font-bold uppercase tracking-wider flex justify-between items-center shadow-sm ${column.id === 'novos_leads' ? 'bg-[#D0A63E]' :
                                    column.id === 'ativos' ? 'bg-[#CF3F14]' : 'bg-[#050504]'
                                    }`}>
                                    <span>{column.title}</span>
                                    <span className="bg-white/20 px-2 py-0.5 rounded-md">
                                        {studentsByStatus[column.id]?.length || 0}
                                    </span>
                                </div>
                                <div className="flex-1 overflow-y-auto space-y-3 p-1">
                                    {studentsByStatus[column.id]?.slice(0, 8).map(student => (
                                        <div
                                            key={student.id}
                                            onClick={() => navigate(`/admin/student/${student.id}`)}
                                            className={`p-3 bg-white rounded-xl shadow-sm border border-transparent hover:border-[#CF3F14]/30 cursor-pointer transition-all hover:-translate-y-1 group relative overflow-hidden`}
                                        >
                                            <div className="flex items-center gap-3 relative z-10">
                                                <div className="w-8 h-8 rounded-full bg-[#F0F0F0] flex items-center justify-center text-[10px] font-bold text-[#050504] border border-[#E5E4E4] overflow-hidden">
                                                    {student.avatar ? (
                                                        <span className="text-[#CF3F14]">{student.avatar}</span>
                                                    ) : (
                                                        <Users className="w-4 h-4 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-[#050504] truncate group-hover:text-[#CF3F14] transition-colors">
                                                        {student.name}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground truncate">
                                                        {student.goal}
                                                    </p>
                                                </div>
                                            </div>
                                            {student.daysRemaining > 0 && (
                                                <div className="mt-2 flex items-center justify-between">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${student.isExpiring ? 'bg-[#CF3F14]/10 text-[#CF3F14]' : 'bg-[#F0F0F0] text-muted-foreground'}`}>
                                                        {student.daysRemaining} dias
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Widgets */}
                <div className="w-full lg:w-[350px] flex flex-col gap-6">

                    {/* Calendar */}
                    <div className="card-base p-0 overflow-hidden">
                        <div className="px-5 py-4 border-b border-[#F0F0F0] flex items-center justify-between">
                            <h2 className="font-bold text-sm text-[#050504] flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4 text-[#CF3F14]" />
                                Calendário
                            </h2>
                            <div className="flex items-center gap-1">
                                <button onClick={prevMonth} className="p-1 hover:bg-[#F0F0F0] rounded-md text-muted-foreground hover:text-[#CF3F14]">
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="text-xs font-bold text-[#050504] w-16 text-center uppercase">
                                    {monthNames[currentMonth]}
                                </span>
                                <button onClick={nextMonth} className="p-1 hover:bg-[#F0F0F0] rounded-md text-muted-foreground hover:text-[#CF3F14]">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="p-4">
                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                                    <div key={i} className="text-center text-[10px] font-bold text-muted-foreground uppercase">
                                        {day}
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                                {calendarDays.map((day, index) => {
                                    if (day === null) return <div key={`empty-${index}`} />;
                                    const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
                                    return (
                                        <div
                                            key={day}
                                            className={`aspect-square flex items-center justify-center rounded-lg text-xs font-medium cursor-pointer transition-all
                                                ${isToday
                                                    ? 'bg-[#CF3F14] text-white font-bold shadow-md shadow-[#CF3F14]/20'
                                                    : 'text-[#050504] hover:bg-[#F0F0F0] hover:text-[#CF3F14]'
                                                }
                                            `}
                                        >
                                            {day}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Pinned Notes */}
                    <div className="card-base p-0 overflow-hidden flex flex-col flex-1">
                        <div className="px-5 py-4 border-b border-[#F0F0F0] flex items-center justify-between">
                            <h2 className="font-bold text-sm text-[#050504] flex items-center gap-2">
                                <Pin className="w-4 h-4 text-[#D0A63E]" />
                                Notas Rápidas
                            </h2>
                            <button
                                onClick={() => navigate('/anotacoes')}
                                className="p-1 hover:bg-[#F0F0F0] rounded-lg text-[#CF3F14] transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-4 space-y-3 flex-1 bg-[#FAFAFA]">
                            {pinnedNotes.length === 0 ? (
                                <p className="text-xs text-muted-foreground text-center italic py-4">Nenhuma nota fixada</p>
                            ) : (
                                pinnedNotes.map(note => (
                                    <div
                                        key={note.id}
                                        onClick={() => navigate('/anotacoes')}
                                        className="bg-white border border-[#E5E4E4] rounded-xl p-3 cursor-pointer hover:border-[#D0A63E] transition-colors"
                                    >
                                        <h4 className="font-bold text-[#050504] text-xs mb-1">{note.title}</h4>
                                        <p className="text-muted-foreground text-[10px] line-clamp-2">{note.content}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
