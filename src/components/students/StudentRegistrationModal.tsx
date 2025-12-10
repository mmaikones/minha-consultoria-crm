import { useState, useEffect } from 'react';
import { X, Upload, User, Mail, Phone, Calendar, Target, CreditCard } from 'lucide-react';

interface StudentRegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    initialData?: any;
}

export default function StudentRegistrationModal({ isOpen, onClose, onSubmit, initialData }: StudentRegistrationModalProps) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        email: initialData?.email || '',
        phone: initialData?.phone || '',
        goal: initialData?.goal || '',
        plan: initialData?.plan || 'mensal',
        startDate: initialData?.startDate || '',
        birthDate: initialData?.birthDate || '',
        height: initialData?.height || '',
        weight: initialData?.weight || '',
        gender: initialData?.gender || 'male'
    });

    // Reset form when initialData changes or modal opens
    useEffect(() => {
        if (isOpen && initialData) {
            setFormData({
                name: initialData.name,
                email: initialData.email,
                phone: initialData.phone,
                goal: initialData.goal,
                plan: initialData.plan || 'mensal',
                startDate: initialData.startDate || '',
                birthDate: initialData.birthDate || '',
                height: initialData.height || '',
                weight: initialData.weight || '',
                gender: initialData.gender || 'male'
            });
        } else if (isOpen && !initialData) {
            setFormData({
                name: '',
                email: '',
                phone: '',
                goal: '',
                plan: 'mensal',
                startDate: '',
                birthDate: '',
                height: '',
                weight: '',
                gender: 'male'
            });
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Novo Aluno</h2>
                        <p className="text-sm text-slate-500">Preencha os dados para cadastrar</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Steps Indicator */}
                <div className="px-6 py-4 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                        {[1, 2, 3].map((s) => (
                            <button
                                key={s}
                                onClick={() => setStep(s)}
                                className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                            >
                                <div
                                    className={`h-full bg-primary-600 transition-all duration-300 ${s <= step ? 'w-full' : 'w-0'}`}
                                />
                            </button>
                        ))}
                    </div>
                    <div className="flex justify-between mt-2 text-xs font-medium uppercase tracking-wider">
                        <button
                            onClick={() => setStep(1)}
                            className={`${step >= 1 ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'} hover:text-primary-700 transition-colors`}
                        >
                            Dados Pessoais
                        </button>
                        <button
                            onClick={() => setStep(2)}
                            className={`${step >= 2 ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'} hover:text-primary-700 transition-colors`}
                        >
                            Plano & Meta
                        </button>
                        <button
                            onClick={() => setStep(3)}
                            className={`${step >= 3 ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'} hover:text-primary-700 transition-colors`}
                        >
                            Anamnese
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {step === 1 && (
                            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                                <div className="flex items-center justify-center mb-6">
                                    <div className="w-24 h-24 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 cursor-pointer hover:border-primary-500 transition-colors group relative">
                                        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Upload className="w-6 h-6 text-primary-600" />
                                            <span className="text-[10px] text-primary-600 font-medium">Foto</span>
                                        </div>
                                        <User className="w-10 h-10 text-slate-400 group-hover:opacity-0 transition-opacity" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nome Completo</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500"
                                                placeholder="Ex: João da Silva"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="email"
                                                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500"
                                                placeholder="joao@email.com"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Telefone / WhatsApp</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500"
                                                placeholder="(11) 99999-9999"
                                                value={formData.phone}
                                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Data de Nascimento</label>
                                        <input
                                            type="date"
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500"
                                            value={formData.birthDate}
                                            onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                <div className="space-y-4">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Plano Contratado</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {['Mensal', 'Trimestral', 'Semestral', 'Anual'].map((plan) => (
                                            <div
                                                key={plan}
                                                onClick={() => setFormData({ ...formData, plan: plan.toLowerCase() })}
                                                className={`cursor-pointer p-4 rounded-xl border-2 transition-all text-center ${formData.plan === plan.toLowerCase()
                                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                                                    : 'border-slate-200 dark:border-slate-700 hover:border-primary-200 dark:hover:border-primary-800'
                                                    }`}
                                            >
                                                <div className="font-semibold text-sm">{plan}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Início do Plano</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="date"
                                                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500"
                                                value={formData.startDate}
                                                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Objetivo Principal</label>
                                        <div className="relative">
                                            <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <select
                                                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 appearance-none"
                                                value={formData.goal}
                                                onChange={e => setFormData({ ...formData, goal: e.target.value })}
                                            >
                                                <option value="">Selecione...</option>
                                                <option value="emagrecimento">Emagrecimento</option>
                                                <option value="hipertrofia">Hipertrofia</option>
                                                <option value="definicao">Definição Muscular</option>
                                                <option value="condicionamento">Condicionamento Físico</option>
                                                <option value="saude">Saúde e Bem-estar</option>
                                                <option value="forca">Ganho de Força</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                <div className="text-center py-6">
                                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CreditCard className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">Detalhes Finais</h3>
                                    <p className="text-sm text-slate-500 max-w-xs mx-auto mt-2">
                                        Revise as informações. O link de pagamento/acesso será enviado para o WhatsApp do aluno.
                                    </p>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Nome</span>
                                        <span className="font-medium text-slate-900 dark:text-white">{formData.name || '-'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Plano</span>
                                        <span className="font-medium text-slate-900 dark:text-white uppercase">{formData.plan}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Objetivo</span>
                                        <span className="font-medium text-slate-900 dark:text-white capitalize">{formData.goal || '-'}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-between">
                    {step > 1 ? (
                        <button
                            onClick={prevStep}
                            className="px-4 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-medium"
                        >
                            Voltar
                        </button>
                    ) : (
                        <div></div>
                    )}

                    {step < 3 ? (
                        <button
                            onClick={nextStep}
                            className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors font-medium shadow-sm shadow-slate-200 dark:shadow-none"
                        >
                            Próximo
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-md shadow-primary-500/20"
                        >
                            Finalizar Cadastro
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
