import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Plus, ClipboardList, FileSpreadsheet, Loader2 } from 'lucide-react';
import { Student, StudentStatus } from '../data/mockStudents'; // Keep type imports only
import { useNavigate } from 'react-router-dom';
import StudentKanbanCard from '../components/students/StudentKanbanCard';
import StudentRegistrationModal from '../components/students/StudentRegistrationModal';
import ExcelImportModal from '../components/students/ExcelImportModal';
import { useStudents, useCreateStudent, useDeleteStudent } from '../hooks/useStudents';
import { useAuth } from '../contexts/AuthContext';
import type { Student as SupabaseStudent } from '../lib/database.types';

const KANBAN_COLUMNS = [
    { id: 'mensal', title: 'Mensal', color: 'bg-[#D0A63E]', bg: 'bg-[#E5E4E4]/30', border: 'border-transparent' },
    { id: 'trimestral', title: 'Trimestral', color: 'bg-[#CF3F14]', bg: 'bg-[#E5E4E4]/30', border: 'border-transparent' },
    { id: 'semestral', title: 'Semestral', color: 'bg-[#050504]', bg: 'bg-[#E5E4E4]/30', border: 'border-transparent' },
    { id: 'anual', title: 'Anual', color: 'bg-[#2ECC71]', bg: 'bg-[#E5E4E4]/30', border: 'border-transparent' },
];

// Convert Supabase student to local Student format
const convertSupabaseStudent = (s: SupabaseStudent): Student => ({
    id: s.id,
    name: s.name,
    email: s.email,
    phone: s.phone || '',
    goal: s.goal || '',
    status: (s.plan_type?.toLowerCase() as StudentStatus) || 'mensal',
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

export default function Students() {
    const navigate = useNavigate();
    const { professional, role } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);

    // Use Supabase if logged in with real account, otherwise mock
    const { data: supabaseStudents, isLoading, refetch } = useStudents();
    const createStudent = useCreateStudent();
    const deleteStudent = useDeleteStudent();

    // Handle student deletion
    const handleDeleteStudent = async (studentId: string) => {
        try {
            await deleteStudent.mutateAsync(studentId);
            refetch();
        } catch (error) {
            console.error('Error deleting student:', error);
            alert('Erro ao excluir aluno');
        }
    };

    // Use real data from Supabase
    const students = useMemo(() => {
        if (supabaseStudents && supabaseStudents.length > 0) {
            return supabaseStudents.map(convertSupabaseStudent);
        }
        // Return empty array - no fallback to mock data
        return [];
    }, [supabaseStudents]);

    const filteredStudents = useMemo(() => {
        return students.filter(student =>
            student.status !== 'novos_leads' &&
            (student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.email.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [students, searchTerm]);

    const getStudentsByStatus = (status: string) => {
        return filteredStudents.filter(student => student.status === status);
    };

    interface NewStudentData {
        name: string;
        email: string;
        phone: string;
        goal: string;
        plan: StudentStatus;
        startDate: string;
    }

    const handleNewStudent = async (data: NewStudentData) => {
        if (professional?.id) {
            // Use Supabase
            try {
                await createStudent.mutateAsync({
                    name: data.name,
                    email: data.email,
                    phone: data.phone || null,
                    goal: data.goal || null,
                    plan_type: data.plan,
                    plan_start: data.startDate || null,
                    status: 'active',
                    points: 0,
                    streak_days: 0,
                });
            } catch (error) {
                console.error('Error creating student:', error);
            }
        }
        // Note: Local state is now derived from useStudents hook
    };

    const [selectedStudentForDuplicate, setSelectedStudentForDuplicate] = useState<Student | null>(null);

    const handleDuplicateStudent = (student: Student) => {
        setSelectedStudentForDuplicate(student);
        setIsRegistrationOpen(true);
    };

    const handleCloseModal = () => {
        setIsRegistrationOpen(false);
        setSelectedStudentForDuplicate(null);
    };

    return (
        <div className="space-y-6 h-[calc(100vh-6rem)] flex flex-col">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-none">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Alunos</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Gerencie seus alunos ativos por plano
                    </p>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors shadow-sm">
                        <Filter className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setIsImportOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm font-medium"
                    >
                        <FileSpreadsheet className="w-5 h-5" />
                        <span className="hidden sm:inline">Importar</span>
                    </button>
                    <button
                        onClick={() => {
                            setSelectedStudentForDuplicate(null);
                            setIsRegistrationOpen(true);
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-primary-600 text-white rounded-xl hover:bg-slate-800 dark:hover:bg-primary-700 transition-all shadow-lg shadow-slate-900/20 dark:shadow-primary-600/20 font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Novo Aluno</span>
                    </button>
                </div>
            </div>

            {/* Search Bar & Filters */}
            <div className="relative flex-none">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Buscar aluno..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm transition-shadow"
                />
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-y-auto lg:overflow-y-hidden lg:overflow-x-auto pb-4 -mx-4 px-4 lg:-mx-6 lg:px-6 sm:mx-0 sm:px-0 custom-scrollbar">
                <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-full w-full lg:min-w-[1000px]">
                    {KANBAN_COLUMNS.map(column => {
                        const columnStudents = getStudentsByStatus(column.id);

                        return (
                            <div key={column.id} className="flex-none lg:flex-1 w-full lg:min-w-[260px] flex flex-col h-[500px] lg:h-full group">
                                <div className="flex items-center justify-between mb-4 px-1">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${column.color} shadow-sm`}></div>
                                        <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wide">
                                            {column.title}
                                        </h3>
                                    </div>
                                    <span className="bg-white dark:bg-slate-800 text-slate-500 text-xs px-2.5 py-1 rounded-lg font-semibold shadow-sm border border-slate-100 dark:border-slate-700">
                                        {columnStudents.length}
                                    </span>
                                </div>

                                <div className={`flex-1 overflow-y-auto rounded-2xl p-3 border ${column.bg} ${column.border} transition-colors custom-scrollbar`}>
                                    <div className="space-y-3">
                                        {columnStudents.map(student => (
                                            <StudentKanbanCard
                                                key={student.id}
                                                student={student}
                                                onClick={() => navigate(`/admin/student/${student.id}`)}
                                                onDuplicate={handleDuplicateStudent}
                                                onDelete={handleDeleteStudent}
                                            />
                                        ))}

                                        {columnStudents.length === 0 && (
                                            <div className="flex flex-col items-center justify-center h-40 text-slate-400/50">
                                                <div className="p-4 rounded-full bg-white/50 dark:bg-slate-800/30 mb-2">
                                                    <ClipboardList className="w-6 h-6" />
                                                </div>
                                                <p className="text-xs font-medium">Nenhum aluno</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <StudentRegistrationModal
                isOpen={isRegistrationOpen}
                onClose={handleCloseModal}
                onSubmit={handleNewStudent}
                initialData={selectedStudentForDuplicate}
            />

            <ExcelImportModal
                isOpen={isImportOpen}
                onClose={() => setIsImportOpen(false)}
                onSuccess={() => {
                    refetch();
                    setIsImportOpen(false);
                }}
            />
        </div>
    );
}
