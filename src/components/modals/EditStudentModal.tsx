import { useState, useEffect, useMemo } from 'react';
import { X, User, Phone, MapPin, Heart, FileText, Save, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Student, StudentStatus } from '../../data/mockStudents';

interface EditStudentModalProps {
    isOpen: boolean;
    student: Student | null;
    onClose: () => void;
    onSave: (updatedStudent: Partial<Student>) => void;
}

const statusOptions: { value: StudentStatus; label: string }[] = [
    { value: 'novos_leads', label: 'Novo Lead' },
    { value: 'mensal', label: 'Mensal' },
    { value: 'trimestral', label: 'Trimestral' },
    { value: 'semestral', label: 'Semestral' },
    { value: 'anual', label: 'Anual' },
];

const goalOptions = [
    'Hipertrofia',
    'Emagrecimento',
    'Condicionamento',
    'Definição',
    'Saúde',
    'Força',
    'Powerlifting',
    'Reabilitação',
];

export default function EditStudentModal({ isOpen, student, onClose, onSave }: EditStudentModalProps) {
    const [activeTab, setActiveTab] = useState<'pessoal' | 'contato' | 'saude' | 'notas'>('pessoal');
    const [toast, setToast] = useState<string | null>(null);

    // Initialize form data from student prop
    const initialFormData = useMemo(() => {
        if (!student) return {};
        return {
            name: student.name,
            email: student.email,
            phone: student.phone,
            goal: student.goal,
            status: student.status,
            birthDate: student.birthDate || '',
            height: student.height,
            gender: student.gender,
            cpf: student.cpf || '',
            address: student.address || '',
            city: student.city || '',
            emergencyContact: student.emergencyContact || '',
            emergencyPhone: student.emergencyPhone || '',
            healthConditions: student.healthConditions || [],
            medications: student.medications || [],
            allergies: student.allergies || [],
            injuries: student.injuries || [],
            notes: student.notes || '',
            tags: student.tags || [],
        };
    }, [student]);

    const [formData, setFormData] = useState<Partial<Student>>(initialFormData);

    // Sync form data when student changes (for modal re-opens)
     
    useEffect(() => {
        setFormData(initialFormData);
    }, [initialFormData]);

    const handleChange = (field: keyof Student, value: Student[keyof Student]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleArrayChange = (field: keyof Student, value: string) => {
        const items = value.split(',').map(s => s.trim()).filter(s => s);
        setFormData(prev => ({ ...prev, [field]: items }));
    };

    const handleSubmit = () => {
        onSave(formData);
        setToast('Dados salvos com sucesso!');
        setTimeout(() => {
            setToast(null);
            onClose();
        }, 1500);
    };

    const tabs = [
        { id: 'pessoal' as const, label: 'Dados Pessoais', icon: User },
        { id: 'contato' as const, label: 'Contato', icon: Phone },
        { id: 'saude' as const, label: 'Saúde', icon: Heart },
        { id: 'notas' as const, label: 'Notas', icon: FileText },
    ];

    if (!student) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-4">
                                {/* Avatar with camera */}
                                <div className="relative group">
                                    <div className="w-14 h-14 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                        {student.avatar}
                                    </div>
                                    <button className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="w-5 h-5 text-white" />
                                    </button>
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                        Editar Aluno
                                    </h2>
                                    <p className="text-sm text-slate-500">{student.name}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-slate-200 dark:border-slate-700 px-4 bg-slate-50 dark:bg-slate-800/50">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${activeTab === tab.id
                                        ? 'text-primary-600'
                                        : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    <span className="hidden sm:inline">{tab.label}</span>
                                    {activeTab === tab.id && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-5">
                            {/* Tab: Dados Pessoais */}
                            {activeTab === 'pessoal' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                Nome Completo *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.name || ''}
                                                onChange={e => handleChange('name', e.target.value)}
                                                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                CPF
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.cpf || ''}
                                                onChange={e => handleChange('cpf', e.target.value)}
                                                placeholder="000.000.000-00"
                                                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                Data de Nascimento
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.birthDate || ''}
                                                onChange={e => handleChange('birthDate', e.target.value)}
                                                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                Sexo
                                            </label>
                                            <select
                                                value={formData.gender || ''}
                                                onChange={e => handleChange('gender', e.target.value as 'M' | 'F')}
                                                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                                            >
                                                <option value="">Selecione</option>
                                                <option value="M">Masculino</option>
                                                <option value="F">Feminino</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                Altura (cm)
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.height || ''}
                                                onChange={e => handleChange('height', parseInt(e.target.value))}
                                                placeholder="175"
                                                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                Objetivo
                                            </label>
                                            <select
                                                value={formData.goal || ''}
                                                onChange={e => handleChange('goal', e.target.value)}
                                                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                                            >
                                                {goalOptions.map(goal => (
                                                    <option key={goal} value={goal}>{goal}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                Plano
                                            </label>
                                            <select
                                                value={formData.status || ''}
                                                onChange={e => handleChange('status', e.target.value as StudentStatus)}
                                                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                                            >
                                                {statusOptions.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            Tags (separadas por vírgula)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.tags?.join(', ') || ''}
                                            onChange={e => handleArrayChange('tags', e.target.value)}
                                            placeholder="VIP, Atleta, Nutricionista"
                                            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Tab: Contato */}
                            {activeTab === 'contato' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                Email *
                                            </label>
                                            <input
                                                type="email"
                                                value={formData.email || ''}
                                                onChange={e => handleChange('email', e.target.value)}
                                                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                Telefone *
                                            </label>
                                            <input
                                                type="tel"
                                                value={formData.phone || ''}
                                                onChange={e => handleChange('phone', e.target.value)}
                                                placeholder="+55 11 99999-9999"
                                                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            Endereço
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.address || ''}
                                            onChange={e => handleChange('address', e.target.value)}
                                            placeholder="Rua, número, bairro"
                                            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            Cidade
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.city || ''}
                                            onChange={e => handleChange('city', e.target.value)}
                                            placeholder="São Paulo, SP"
                                            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>

                                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-red-500" />
                                            Contato de Emergência
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                    Nome
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.emergencyContact || ''}
                                                    onChange={e => handleChange('emergencyContact', e.target.value)}
                                                    placeholder="Nome do contato"
                                                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                    Telefone
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={formData.emergencyPhone || ''}
                                                    onChange={e => handleChange('emergencyPhone', e.target.value)}
                                                    placeholder="+55 11 99999-9999"
                                                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab: Saúde */}
                            {activeTab === 'saude' && (
                                <div className="space-y-4">
                                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                                        <p className="text-sm text-amber-800 dark:text-amber-200">
                                            ⚠️ Informações confidenciais. Mantenha atualizadas para segurança do aluno.
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            Condições de Saúde (separadas por vírgula)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.healthConditions?.join(', ') || ''}
                                            onChange={e => handleArrayChange('healthConditions', e.target.value)}
                                            placeholder="Diabetes, Hipertensão, etc."
                                            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            Medicamentos em Uso (separados por vírgula)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.medications?.join(', ') || ''}
                                            onChange={e => handleArrayChange('medications', e.target.value)}
                                            placeholder="Medicamento 1, Medicamento 2"
                                            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            Alergias (separadas por vírgula)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.allergies?.join(', ') || ''}
                                            onChange={e => handleArrayChange('allergies', e.target.value)}
                                            placeholder="Lactose, Glúten, Amendoim"
                                            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            Lesões / Restrições (separadas por vírgula)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.injuries?.join(', ') || ''}
                                            onChange={e => handleArrayChange('injuries', e.target.value)}
                                            placeholder="Hérnia de disco, Lesão no joelho"
                                            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Tab: Notas */}
                            {activeTab === 'notas' && (
                                <div className="space-y-4">
                                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                                        <p className="text-sm text-blue-800 dark:text-blue-200">
                                            📝 Notas privadas visíveis apenas para você. O aluno não tem acesso.
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            Observações sobre o aluno
                                        </label>
                                        <textarea
                                            value={formData.notes || ''}
                                            onChange={e => handleChange('notes', e.target.value)}
                                            rows={8}
                                            placeholder="Adicione observações, preferências, pontos de atenção..."
                                            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 resize-none"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-5 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl font-medium transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
                            >
                                <Save className="w-4 h-4" />
                                Salvar Alterações
                            </button>
                        </div>
                    </motion.div>

                    {/* Toast */}
                    {toast && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 z-[60]"
                        >
                            ✓ {toast}
                        </motion.div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
