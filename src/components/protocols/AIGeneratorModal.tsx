import { useState } from 'react';
import { Sparkles, X, Brain, CheckCircle2, ArrowRight, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockStudents } from '../../data/mockStudents';
import { generateProtocolFromAnamnesis } from '../../services/aiService';

interface AIGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (data: GeneratedProtocol) => void;
}

export interface GeneratedProtocol {
    name: string;
    description: string;
    type: string;
    workoutDays: Array<{
        id: string;
        name: string;
        exercises: Array<{ id: string; name: string; sets: number; reps: string; load: number; restSeconds: number; notes: string }>;
    }>;
    meals: Array<{
        id: string;
        name: string;
        time: string;
        foods: Array<{ id: string; name: string; quantity: number; measure: string; protein: number; carbs: number; fat: number; calories: number }>;
    }>;
}

export default function AIGeneratorModal({ isOpen, onClose, onGenerate }: AIGeneratorModalProps) {
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [additionalNotes, setAdditionalNotes] = useState('');
    const [step, setStep] = useState<'input' | 'generating' | 'success'>('input');
    const [generatedProtocol, setGeneratedProtocol] = useState<GeneratedProtocol | null>(null);

    const handleGenerate = async () => {
        const student = mockStudents.find(s => s.id === selectedStudentId);
        if (!student) return;

        setStep('generating');

        try {
            // Combine student data with manual notes
            const studentContext = {
                ...student,
                notes: `${student.notes || ''}\nObservações Extras do Treinador: ${additionalNotes}`
            };

            const result = await generateProtocolFromAnamnesis(studentContext, 'combo');
            setGeneratedProtocol(result);
            setStep('success');
        } catch (error) {
            console.error(error);
            setStep('input');
            alert('Erro ao gerar protocolo. Tente novamente.');
        }
    };

    const handleApply = () => {
        if (generatedProtocol) {
            onGenerate(generatedProtocol);
        }
        handleClose();
    };

    const handleClose = () => {
        onClose();
        setTimeout(() => {
            setStep('input');
            setSelectedStudentId('');
            setAdditionalNotes('');
            setGeneratedProtocol(null);
        }, 300);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-700 relative"
                >
                    {/* Decorative Gradient Background */}
                    <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-10"></div>

                    <div className="relative p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Minha Consultoria AI</h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">ASSISTENTE INTELIGENTE</p>
                                </div>
                            </div>
                            <button onClick={handleClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="min-h-[350px] flex flex-col">
                            {step === 'input' && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex-1 flex flex-col"
                                >
                                    {/* Student Selector */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Selecionar Aluno (Base da Anamnese)
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={selectedStudentId}
                                                onChange={(e) => setSelectedStudentId(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white appearance-none"
                                            >
                                                <option value="">Selecione um aluno...</option>
                                                {mockStudents.map(student => (
                                                    <option key={student.id} value={student.id}>
                                                        {student.name} - {student.goal}
                                                    </option>
                                                ))}
                                            </select>
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Instruções Adicionais (Opcional)
                                        </label>
                                        <div className="relative">
                                            <textarea
                                                value={additionalNotes}
                                                onChange={(e) => setAdditionalNotes(e.target.value)}
                                                placeholder="Ex: Focar em exercícios livres, evitar carga na lombar..."
                                                className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-700 dark:text-slate-200"
                                            />
                                            <Brain className="absolute bottom-4 right-4 w-5 h-5 text-purple-400 opacity-50" />
                                        </div>
                                        <p className="text-xs text-slate-500 mt-2">
                                            A IA usará os dados da anamnese do aluno selecionado + suas instruções.
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleGenerate}
                                        disabled={!selectedStudentId}
                                        className="mt-auto w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group"
                                    >
                                        <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                                        Gerar Protocolo com IA
                                    </button>
                                </motion.div>
                            )}

                            {step === 'generating' && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex-1 flex flex-col items-center justify-center text-center py-8"
                                >
                                    <div className="relative w-20 h-20 mb-6">
                                        <div className="absolute inset-0 border-4 border-purple-100 dark:border-purple-900/30 rounded-full"></div>
                                        <div className="absolute inset-0 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
                                        <Brain className="absolute inset-0 m-auto w-8 h-8 text-purple-600 animate-pulse" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                        Criando Protocolo Personalizado...
                                    </h3>
                                    <p className="text-slate-500 max-w-xs mx-auto text-sm">
                                        Analisando anamnese de {mockStudents.find(s => s.id === selectedStudentId)?.name}...
                                        <br />
                                        Estruturando treino e dieta...
                                    </p>

                                    <div className="mt-8 space-y-2 w-full max-w-xs">
                                        <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-purple-500"
                                                initial={{ width: "0%" }}
                                                animate={{ width: "100%" }}
                                                transition={{ duration: 3, ease: "easeInOut" }}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 'success' && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex-1 flex flex-col items-center justify-center text-center"
                                >
                                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                                        <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                        Protocolo Criado!
                                    </h3>
                                    <p className="text-slate-500 mb-2 max-w-xs mx-auto">
                                        "{generatedProtocol?.name}"
                                    </p>
                                    <p className="text-xs text-slate-400 mb-8 max-w-xs mx-auto">
                                        Revise e faça os ajustes necessários no editor.
                                    </p>
                                    <button
                                        onClick={handleApply}
                                        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium shadow-lg shadow-green-500/25 transition-all flex items-center justify-center gap-2"
                                    >
                                        <span>Visualizar e Aplicar</span>
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
