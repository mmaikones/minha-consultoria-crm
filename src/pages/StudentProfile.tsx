import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    MessageSquare,
    Edit,
    X,
    User,
    FileText,
    Dumbbell,
    Utensils,
    TrendingUp,
    Loader2
} from 'lucide-react';
import { mockStudents, Student } from '../data/mockStudents';
import { mockChats, Chat } from '../data/mockChats';
import StudentOverview from '../components/student/StudentOverview';
import AnamneseTab from '../components/student/AnamneseTab';
import EditStudentModal from '../components/modals/EditStudentModal';
import ChatWindow from '../components/chat/ChatWindow';
import { useStudent } from '../hooks/useStudents';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { evolutionService } from '../services/evolutionService';
import SendWhatsAppModal from '../components/modals/SendWhatsAppModal';

// Tab configuration
const TABS = [
    { id: 'overview', label: 'Visão Geral', icon: User },
    { id: 'anamnese', label: 'Anamnese', icon: FileText },
    { id: 'workout', label: 'Treino', icon: Dumbbell },
    { id: 'diet', label: 'Dieta', icon: Utensils },
    { id: 'evolution', label: 'Evolução', icon: TrendingUp },
];

// Convert Supabase student to local Student format
function convertSupabaseStudent(data: any): Student {
    return {
        id: data.id,
        name: data.name || '',
        avatar: data.name?.substring(0, 2)?.toUpperCase() || 'AL',
        email: data.email || '',
        phone: data.phone || '',
        goal: data.goal || 'Não definido',
        status: data.status || 'active',
        daysRemaining: data.plan_end ? Math.ceil((new Date(data.plan_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 30,
        isExpiring: data.plan_end ? new Date(data.plan_end) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : false,
        startDate: data.plan_start || new Date().toISOString().split('T')[0],
        checkinsCompleted: 0,
        adherenceRate: 80,
        nextAssessment: '',
        weightHistory: [],
        currentWorkout: '',
        currentDiet: '',
        history: [],
        photoUrl: data.avatar_url || `https://i.pravatar.cc/150?u=${data.id}`,
        height: data.height,
        age: data.birth_date ? Math.floor((Date.now() - new Date(data.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : undefined,
        birthDate: data.birth_date,
        gender: data.gender === 'male' ? 'M' : data.gender === 'female' ? 'F' : undefined,
        notes: data.notes,
        healthConditions: data.health_conditions,
        injuries: data.injuries,
        medications: data.medications,
    };
}

export default function StudentProfile() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { professional } = useAuth();

    // Fetch from Supabase if authenticated
    const { data: supabaseStudent, isLoading: isLoadingStudent } = useStudent(id);

    // Find in mock data as fallback
    const mockStudent = mockStudents.find(s => s.id === id);

    // Use Supabase data if available, otherwise mock
    const student: Student | undefined = useMemo(() => {
        if (supabaseStudent) {
            return convertSupabaseStudent(supabaseStudent);
        }
        return mockStudent;
    }, [supabaseStudent, mockStudent]);

    // State
    const [activeTab, setActiveTab] = useState('overview');
    const [showEditModal, setShowEditModal] = useState(false);
    const [showChatModal, setShowChatModal] = useState(false);
    const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
    const [currentStudent, setCurrentStudent] = useState<Student | null>(null);

    // Update currentStudent when student data loads
    useEffect(() => {
        if (student) {
            setCurrentStudent(student);
        }
    }, [student]);

    // Resolve Chat or Create Temp - must be called before any early returns
    const currentChat: Chat | null = useMemo(() => {
        if (!currentStudent) return null;

        const found = mockChats.find(c => c.studentId === currentStudent.id);
        if (found) return found;

        return {
            id: 'temp',
            studentId: currentStudent.id,
            name: currentStudent.name,
            avatar: currentStudent.name.substring(0, 2).toUpperCase(),
            photoUrl: currentStudent.photoUrl,
            lastMessage: '',
            lastMessageTime: '',
            unreadCount: 0,
            status: 'novos',
            messages: []
        };
    }, [currentStudent]);

    const handleSaveStudent = async (updatedData: Partial<Student>) => {
        if (!currentStudent?.id) return;

        // Cast to any to access all possible fields from edit modal
        const data = updatedData as any;

        // Map frontend fields to database fields
        const dbData: any = {};
        if (data.name !== undefined) dbData.name = data.name;
        if (data.email !== undefined) dbData.email = data.email;
        if (data.phone !== undefined) dbData.phone = data.phone;
        if (data.goal !== undefined) dbData.goal = data.goal;
        if (data.height !== undefined) dbData.height = data.height;
        if (data.status !== undefined) dbData.status = data.status;
        if (data.notes !== undefined) dbData.notes = data.notes;
        if (data.birthDate !== undefined) dbData.birth_date = data.birthDate;
        if (data.gender !== undefined) dbData.gender = data.gender === 'M' ? 'male' : data.gender === 'F' ? 'female' : data.gender;

        // Handle arrays
        if (data.healthConditions !== undefined) dbData.health_conditions = data.healthConditions;
        if (data.injuries !== undefined) dbData.injuries = data.injuries;
        if (data.medications !== undefined) dbData.medications = data.medications;

        // Save to Supabase
        const { error } = await supabase
            .from('students')
            // @ts-ignore
            .update(dbData)
            .eq('id', currentStudent.id);

        if (error) {
            console.error('Error saving student:', error);
        } else {
            // Update local state
            setCurrentStudent({ ...currentStudent, ...updatedData });
        }
    };

    const handleGenerateProtocol = () => {
        // Navigate to protocol editor with student pre-selected
        navigate('/admin/protocolos/novo-treino', { state: { studentId: currentStudent?.id } });
    };

    const handleSendMessage = async (text: string) => {
        if (!currentStudent?.phone) {
            alert('Aluno sem telefone cadastrado');
            return;
        }

        try {
            await evolutionService.sendText(currentStudent.phone, text);
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Erro ao enviar mensagem no WhatsApp');
        }
    };

    // Loading state
    if (isLoadingStudent && professional) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!currentStudent || !currentChat) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Aluno não encontrado</p>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {/* Clean Header */}
            <div className="bg-card rounded-2xl border border-border p-5">
                <div className="flex flex-col sm:flex-row items-center gap-5">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/admin/alunos')}
                        className="absolute sm:relative top-4 left-4 sm:top-auto sm:left-auto p-2 hover:bg-muted rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                    </button>

                    {/* Circular Profile Photo */}
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-border flex items-center justify-center bg-muted flex-shrink-0">
                        {currentStudent?.photoUrl ? (
                            <img
                                src={currentStudent?.photoUrl}
                                alt={currentStudent?.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-xl font-bold text-muted-foreground">{currentStudent?.avatar}</span>
                        )}
                    </div>

                    {/* Student Info */}
                    <div className="flex-1 text-center sm:text-left">
                        <h1 className="text-xl font-bold text-foreground">
                            {currentStudent?.name}
                        </h1>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1">
                            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                                {currentStudent?.goal}
                            </span>
                            <span className="text-muted-foreground text-sm">{currentStudent?.email}</span>
                            <span className="text-muted-foreground/50">•</span>
                            <span className="text-muted-foreground text-sm">{currentStudent?.phone}</span>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3">
                            <div className="text-center px-3 py-1.5 bg-muted rounded-lg">
                                <div className="text-sm font-bold text-foreground">{currentStudent?.adherenceRate}%</div>
                                <div className="text-[10px] text-muted-foreground">Aderência</div>
                            </div>
                            <div className="text-center px-3 py-1.5 bg-muted rounded-lg">
                                <div className="text-sm font-bold text-foreground">{currentStudent?.checkinsCompleted}</div>
                                <div className="text-[10px] text-muted-foreground">Check-ins</div>
                            </div>
                            <div className={`text-center px-3 py-1.5 rounded-lg ${currentStudent?.daysRemaining <= 7 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-muted'}`}>
                                <div className={`text-sm font-bold ${currentStudent?.daysRemaining <= 7 ? 'text-amber-600' : 'text-foreground'}`}>
                                    {currentStudent?.daysRemaining}d
                                </div>
                                <div className="text-[10px] text-muted-foreground">Restantes</div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowWhatsAppModal(true)}
                            disabled={!currentStudent?.phone}
                            className="flex items-center gap-2 px-4 py-2.5 bg-[#25D366] text-white rounded-xl hover:bg-[#20BD5A] transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            title={currentStudent?.phone ? 'Enviar mensagem rápida' : 'Aluno sem telefone'}
                        >
                            <MessageSquare className="w-4 h-4" />
                            <span className="hidden sm:inline">WhatsApp</span>
                        </button>
                        <button
                            onClick={() => setShowEditModal(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-muted text-foreground rounded-xl hover:bg-muted/80 transition-colors text-sm font-semibold"
                        >
                            <Edit className="w-4 h-4" />
                            <span className="hidden sm:inline">Editar</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex gap-1 p-1 bg-muted/50 rounded-2xl overflow-x-auto">
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${isActive
                                ? 'bg-white dark:bg-slate-800 text-primary shadow-sm'
                                : 'text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-slate-800/50'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="min-h-[500px]">
                {activeTab === 'overview' && (
                    <StudentOverview
                        student={currentStudent!}
                        onChatOpen={() => setShowChatModal(true)}
                        onTabChange={setActiveTab}
                    />
                )}

                {activeTab === 'anamnese' && (
                    <AnamneseTab
                        studentId={currentStudent?.id}
                        onGenerateProtocol={handleGenerateProtocol}
                    />
                )}

                {activeTab === 'workout' && (
                    <div className="card-base p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                    <Dumbbell className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-foreground">Protocolo de Treino Atual</h3>
                                    <p className="text-muted-foreground text-sm">
                                        {currentStudent?.currentWorkout || 'Nenhum treino atribuído'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors mr-2">
                                    <input type="checkbox" className="rounded border-slate-300 text-primary focus:ring-primary" />
                                    Notificar ao salvar
                                </label>
                                <button
                                    onClick={() => alert('Duplicado com sucesso! (Mock)')}
                                    className="px-4 py-2 border border-border rounded-xl text-sm font-bold hover:bg-muted transition-colors"
                                >
                                    Duplicar
                                </button>
                                <button
                                    onClick={() => navigate('/admin/protocolos/edit/mock-id')}
                                    className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
                                >
                                    Editar
                                </button>
                            </div>
                        </div>

                        {/* Mock Content */}
                        <div className="space-y-4">
                            <div className="p-4 border border-border rounded-xl bg-muted/20">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-bold text-foreground">Treino A - Superiores</h4>
                                    <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded">5 Exercícios</span>
                                </div>
                                <p className="text-sm text-muted-foreground">Supino Reto, Desenvolvimento Halteres, Elevação Lateral...</p>
                            </div>
                            <div className="p-4 border border-border rounded-xl bg-muted/20">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-bold text-foreground">Treino B - Inferiores</h4>
                                    <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded">6 Exercícios</span>
                                </div>
                                <p className="text-sm text-muted-foreground">Agachamento Livre, Leg Press 45, Extensora...</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'diet' && (
                    <div className="card-base p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-secondary/10 rounded-xl text-secondary">
                                    <Utensils className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-foreground">Planejamento Alimentar</h3>
                                    <p className="text-muted-foreground text-sm">
                                        {currentStudent?.currentDiet || 'Nenhuma dieta atribuída'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors mr-2">
                                    <input type="checkbox" className="rounded border-slate-300 text-secondary focus:ring-secondary" />
                                    Notificar ao salvar
                                </label>
                                <button
                                    onClick={() => alert('Duplicado com sucesso! (Mock)')}
                                    className="px-4 py-2 border border-border rounded-xl text-sm font-bold hover:bg-muted transition-colors"
                                >
                                    Duplicar
                                </button>
                                <button
                                    onClick={() => navigate('/admin/protocolos/edit/mock-id')}
                                    className="px-4 py-2 bg-secondary text-white rounded-xl text-sm font-bold hover:bg-secondary/90 transition-colors"
                                >
                                    Editar
                                </button>
                            </div>
                        </div>

                        {/* Mock Content */}
                        <div className="space-y-4">
                            <div className="p-4 border border-border rounded-xl bg-muted/20">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-bold text-foreground">Café da Manhã (07:00)</h4>
                                    <span className="text-xs font-bold bg-secondary/10 text-secondary px-2 py-1 rounded">450 kcal</span>
                                </div>
                                <p className="text-sm text-muted-foreground">Ovos mexidos, pão integral, mamão.</p>
                            </div>
                            <div className="p-4 border border-border rounded-xl bg-muted/20">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-bold text-foreground">Almoço (12:30)</h4>
                                    <span className="text-xs font-bold bg-secondary/10 text-secondary px-2 py-1 rounded">600 kcal</span>
                                </div>
                                <p className="text-sm text-muted-foreground">Arroz, feijão, frango grelhado e salada.</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'evolution' && (
                    <div className="card-base p-8 text-center">
                        <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-foreground mb-2">Evolução</h3>
                        <p className="text-muted-foreground text-sm">
                            Acompanhe o progresso do aluno ao longo do tempo
                        </p>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <EditStudentModal
                    isOpen={true}
                    student={currentStudent as Student}
                    onClose={() => setShowEditModal(false)}
                    onSave={handleSaveStudent}
                />
            )}

            {/* Chat Modal (WhatsApp Internal) */}
            {showChatModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#0b141a] w-full max-w-4xl h-[85vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-200">
                        {/* Close Button Overlay */}
                        <button
                            onClick={() => setShowChatModal(false)}
                            className="absolute top-4 right-4 z-20 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-md"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex-1 flex flex-col min-h-0">
                            <ChatWindow
                                chat={currentChat}
                                onOpenProtocol={() => navigate('/admin/protocolos')}
                                onSendMessage={handleSendMessage}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Send WhatsApp Modal */}
            <SendWhatsAppModal
                isOpen={showWhatsAppModal}
                onClose={() => setShowWhatsAppModal(false)}
                studentName={currentStudent?.name || ''}
                studentPhone={currentStudent?.phone || ''}
                studentId={currentStudent?.id}
            />
        </div>
    );
}
