import { useState, useMemo } from 'react';
import { X, Users, MessageSquare, Send, ChevronRight, ChevronLeft, Smartphone, LayoutDashboard, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Student } from '../../data/mockStudents'; // Type only
import { mockTemplates, templateCategories } from '../../data/mockTemplates';

interface NewCampaignModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSend: (students: Student[], message: string, campaignName: string, config: { delay: number, dailyLimit: number, channel: 'whatsapp' | 'system' | 'both' }) => void;
    students?: Student[]; // Real students from parent
}

const audiences = [
    { id: 'all', label: 'Todos os alunos' },
    { id: 'kanban_novos_leads', label: 'Kanban: Novos Leads' },
    { id: 'kanban_mensal', label: 'Kanban: Mensal' },
    { id: 'kanban_trimestral', label: 'Kanban: Trimestral' },
    { id: 'kanban_semestral', label: 'Kanban: Semestral' },
    { id: 'kanban_anual', label: 'Kanban: Anual' },
    { id: 'expiring7', label: 'Vencendo em 7 dias' },
    { id: 'expiring30', label: 'Vencendo este mês' },
];

const variables = [
    { label: 'Nome do Aluno', value: '{{nome}}' },
    { label: 'Link Renovação', value: '{{link_renovacao}}' },
    { label: 'Dias Restantes', value: '{{dias_restantes}}' },
];

export default function NewCampaignModal({ isOpen, onClose, onSend, students = [] }: NewCampaignModalProps) {
    const [step, setStep] = useState(1);
    const [selectedAudience, setSelectedAudience] = useState<string[]>([]);
    const [message, setMessage] = useState('');
    const [campaignName, setCampaignName] = useState('');
    const [channel, setChannel] = useState<'whatsapp' | 'system' | 'both'>('whatsapp');

    // Advanced settings
    const [delay, setDelay] = useState(15); // seconds
    const [dailyLimit, setDailyLimit] = useState(200);

    // Filter students based on selection
    const selectedStudents = useMemo(() => {
        const students: Student[] = [];
        const uniqueIds = new Set<string>();

        if (selectedAudience.includes('all')) {
            return students;
        }

        students.forEach(student => {
            let include = false;

            // Kanban Filters
            if (selectedAudience.includes('kanban_novos_leads') && student.status === 'novos_leads') include = true;
            if (selectedAudience.includes('kanban_mensal') && student.status === 'mensal') include = true;
            if (selectedAudience.includes('kanban_trimestral') && student.status === 'trimestral') include = true;
            if (selectedAudience.includes('kanban_semestral') && student.status === 'semestral') include = true;
            if (selectedAudience.includes('kanban_anual') && student.status === 'anual') include = true;

            // Other Filters
            if (selectedAudience.includes('expiring7') && student.daysRemaining <= 7 && student.daysRemaining > 0) include = true;
            if (selectedAudience.includes('expiring30') && student.daysRemaining <= 30 && student.daysRemaining > 0) include = true;

            if (include && !uniqueIds.has(student.id)) {
                uniqueIds.add(student.id);
                students.push(student);
            }
        });

        return students;
    }, [selectedAudience]);

    const totalCount = selectedStudents.length;

    const handleInsertVariable = (variable: string) => {
        setMessage(prev => prev + variable);
    };

    const handleSend = () => {
        onSend(selectedStudents, message, campaignName, { delay, dailyLimit, channel });
        handleReset();
    };

    const handleReset = () => {
        setStep(1);
        setSelectedAudience([]);
        setMessage('');
        setCampaignName('');
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                onClick={handleClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                        <div>
                            <h2 className="font-semibold text-slate-900 dark:text-white">
                                Nova Campanha
                            </h2>
                            <p className="text-sm text-slate-500">
                                Etapa {step} de 3
                            </p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {/* Step 1: Segmentation */}
                        {step === 1 && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 mb-4">
                                    <Users className="w-5 h-5" />
                                    <span className="font-medium">Selecione o público-alvo</span>
                                </div>

                                <input
                                    type="text"
                                    value={campaignName}
                                    onChange={(e) => setCampaignName(e.target.value)}
                                    placeholder="Nome da campanha"
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
                                />

                                <div className="space-y-2">
                                    {audiences.map(audience => {
                                        // Calculate count for this audience
                                        const count = students.filter(s => {
                                            if (audience.id === 'all') return true;
                                            if (audience.id === 'expiring7') return s.daysRemaining <= 7 && s.daysRemaining > 0;
                                            if (audience.id === 'expiring30') return s.daysRemaining <= 30 && s.daysRemaining > 0;
                                            if (audience.id === 'leads') return s.status === 'novos_leads';
                                            if (audience.id === 'inactive30') return s.checkinsCompleted === 0;
                                            return false;
                                        }).length;

                                        return (
                                            <label
                                                key={audience.id}
                                                className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedAudience.includes(audience.id)}
                                                    onChange={() => {
                                                        setSelectedAudience(prev =>
                                                            prev.includes(audience.id)
                                                                ? prev.filter(id => id !== audience.id)
                                                                : [...prev, audience.id]
                                                        );
                                                    }}
                                                    className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                                                />
                                                <span className="flex-1 text-slate-700 dark:text-slate-200">
                                                    {audience.label}
                                                </span>
                                                <span className="text-sm text-slate-500 dark:text-slate-400">
                                                    {count} alunos
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>

                                {selectedAudience.length > 0 && (
                                    <p className="text-sm text-primary-600 font-medium mt-4">
                                        Total selecionado: {totalCount} alunos (únicos)
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Step 2: Message & Template */}
                        {step === 2 && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 mb-2">
                                    <MessageSquare className="w-5 h-5" />
                                    <span className="font-medium">Escreva ou escolha um modelo</span>
                                </div>

                                {/* Template Selector */}
                                <div className="mb-4">
                                    <label className="text-sm text-slate-500 mb-2 block">Usar Template (Opcional)</label>
                                    <select
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-300"
                                        onChange={(e) => {
                                            const tpl = mockTemplates.find(t => t.id === e.target.value);
                                            if (tpl) setMessage(tpl.content);
                                        }}
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Selecione um template...</option>
                                        {templateCategories.map(cat => (
                                            <optgroup key={cat.id} label={cat.label}>
                                                {mockTemplates.filter(t => t.category === cat.id).map(t => (
                                                    <option key={t.id} value={t.id}>{t.name}</option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-3">
                                    {variables.map(v => (
                                        <button
                                            key={v.value}
                                            onClick={() => handleInsertVariable(v.value)}
                                            className="px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-sm font-medium hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
                                        >
                                            {v.label}
                                        </button>
                                    ))}
                                </div>

                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Digite sua mensagem aqui..."
                                    rows={6}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                                />

                                <p className="text-xs text-slate-500">
                                    {message.length} caracteres
                                </p>
                            </div>
                        )}

                        {/* Step 3: Config & Send */}
                        {step === 3 && (
                            <div className="space-y-6">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Send className="w-8 h-8 text-primary-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                        Configuração de Envio
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400">
                                        Sua campanha será enviada para <strong className="text-primary-600">{totalCount} alunos</strong>.
                                    </p>
                                </div>

                                {/* Channel Selection */}
                                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 mb-4">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 block">Canal de Envio</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <button
                                            onClick={() => setChannel('whatsapp')}
                                            className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${channel === 'whatsapp' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-transparent bg-white dark:bg-slate-800 hover:bg-slate-100'}`}
                                        >
                                            <Smartphone className={`w-6 h-6 ${channel === 'whatsapp' ? 'text-primary-600' : 'text-slate-400'}`} />
                                            <span className="text-xs font-medium">WhatsApp</span>
                                        </button>
                                        <button
                                            onClick={() => setChannel('system')}
                                            className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${channel === 'system' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-transparent bg-white dark:bg-slate-800 hover:bg-slate-100'}`}
                                        >
                                            <LayoutDashboard className={`w-6 h-6 ${channel === 'system' ? 'text-primary-600' : 'text-slate-400'}`} />
                                            <span className="text-xs font-medium">Sistema</span>
                                        </button>
                                        <button
                                            onClick={() => setChannel('both')}
                                            className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${channel === 'both' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-transparent bg-white dark:bg-slate-800 hover:bg-slate-100'}`}
                                        >
                                            <Copy className={`w-6 h-6 ${channel === 'both' ? 'text-primary-600' : 'text-slate-400'}`} />
                                            <span className="text-xs font-medium">Ambos</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Delay entre mensagens (seg)
                                        </label>
                                        <input
                                            type="number"
                                            min="5"
                                            value={delay}
                                            onChange={(e) => setDelay(Number(e.target.value))}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                                        />
                                        <p className="text-xs text-slate-500">Recomendado: 15s para evitar bloqueios</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Limite diário
                                        </label>
                                        <input
                                            type="number"
                                            value={dailyLimit}
                                            onChange={(e) => setDailyLimit(Number(e.target.value))}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                                        />
                                        <p className="text-xs text-slate-500">Limite de segurança do WhatsApp</p>
                                    </div>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 text-left">
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Prévia da mensagem:</p>
                                    <p className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap text-sm max-h-32 overflow-y-auto">
                                        {message || 'Nenhuma mensagem definida'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-between">
                        {step > 1 ? (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                <span>Voltar</span>
                            </button>
                        ) : (
                            <div />
                        )}

                        {step < 3 ? (
                            <button
                                onClick={() => setStep(step + 1)}
                                disabled={step === 1 && (selectedAudience.length === 0 || !campaignName)}
                                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span>Próximo</span>
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSend}
                                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                            >
                                <Send className="w-4 h-4" />
                                <span>Disparar Agora</span>
                            </button>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
