import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle, AlertCircle, User, Heart, Target, ChevronRight, ChevronLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';

// Form steps
const STEPS = [
    { id: 'personal', label: 'Dados Pessoais', icon: User },
    { id: 'physical', label: 'Medidas', icon: User },
    { id: 'health', label: 'Saúde', icon: Heart },
    { id: 'goals', label: 'Objetivos', icon: Target },
];

const HEALTH_CONDITIONS = [
    { id: 'diabetes', label: 'Diabetes' },
    { id: 'hipertensao', label: 'Hipertensão' },
    { id: 'cardiaco', label: 'Problemas Cardíacos' },
    { id: 'asma', label: 'Asma' },
    { id: 'colesterol', label: 'Colesterol Alto' },
    { id: 'nenhuma', label: 'Nenhuma' },
];

const ACTIVITY_PREFERENCES = [
    { id: 'musculacao', label: 'Musculação' },
    { id: 'cardio', label: 'Cardio' },
    { id: 'funcional', label: 'Treino Funcional' },
    { id: 'yoga', label: 'Yoga/Pilates' },
    { id: 'crossfit', label: 'CrossFit' },
    { id: 'corrida', label: 'Corrida' },
];

const GOALS = [
    { id: 'emagrecimento', label: 'Emagrecimento' },
    { id: 'hipertrofia', label: 'Hipertrofia' },
    { id: 'condicionamento', label: 'Condicionamento Físico' },
    { id: 'reabilitacao', label: 'Reabilitação' },
    { id: 'saude', label: 'Saúde e Bem-estar' },
];

const FREQUENCIES = [
    { id: '2x', label: '2x por semana' },
    { id: '3x', label: '3x por semana' },
    { id: '4x', label: '4x por semana' },
    { id: '5x+', label: '5x ou mais' },
];

interface FormData {
    name: string;
    email: string;
    phone: string;
    cpf: string;
    birthDate: string;
    gender: string;
    weight: string;
    height: string;
    healthConditions: string[];
    injuries: string;
    medications: string;
    goal: string;
    activityPreferences: string[];
    frequencyPreference: string;
    additionalNotes: string;
}

export default function AnamnesePublicForm() {
    const { formLinkToken } = useParams<{ formLinkToken: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    // Form data with pre-filled phone
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        phone: '',
        cpf: '',
        birthDate: '',
        gender: '',
        weight: '',
        height: '',
        healthConditions: [],
        injuries: '',
        medications: '',
        goal: '',
        activityPreferences: [],
        frequencyPreference: '',
        additionalNotes: '',
    });

    // Validate token on mount
    useEffect(() => {
        validateToken();
    }, [formLinkToken]);

    const validateToken = async () => {
        try {
            setLoading(true);

            // In production, validate against Supabase
            // For demo, we'll accept any token
            if (!formLinkToken) {
                setError('Link inválido.');
                return;
            }

            // Try to fetch form data from Supabase
            // @ts-ignore - Table may not exist yet
            const { data: rawData, error: fetchError } = await supabase
                .from('anamnese_forms')
                .select('*, sales(*)')
                .eq('form_link_token', formLinkToken)
                .single();

            const data = rawData as any;

            if (fetchError || !data) {
                // Demo mode - continue with empty form
                console.log('Using demo mode for anamnese form');
                setFormData(prev => ({ ...prev, phone: '(11) 99999-9999' }));
            } else {
                // Check if expired
                if (new Date(data.expires_at) < new Date()) {
                    setError('Este link expirou. Solicite um novo link via WhatsApp.');
                    return;
                }

                // Check if already completed
                if (data.status === 'completed') {
                    setError('Este formulário já foi preenchido.');
                    return;
                }

                // Pre-fill phone
                const formattedPhone = formatPhoneDisplay(data.phone);
                setFormData(prev => ({ ...prev, phone: formattedPhone, email: data.sales?.email || '' }));
            }
        } catch (err) {
            console.error('Error validating token:', err);
            // Continue in demo mode
            setFormData(prev => ({ ...prev, phone: '(11) 99999-9999' }));
        } finally {
            setLoading(false);
        }
    };

    const formatPhoneDisplay = (phone: string): string => {
        const clean = phone.replace(/\D/g, '');
        if (clean.startsWith('55')) {
            const num = clean.slice(2);
            if (num.length === 11) {
                return `(${num.slice(0, 2)}) ${num.slice(2, 7)}-${num.slice(7)}`;
            }
        }
        return phone;
    };

    const updateField = (field: keyof FormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleArrayField = (field: 'healthConditions' | 'activityPreferences', value: string) => {
        setFormData(prev => {
            const current = prev[field];
            if (current.includes(value)) {
                return { ...prev, [field]: current.filter(v => v !== value) };
            }
            return { ...prev, [field]: [...current, value] };
        });
    };

    const canProceed = (): boolean => {
        switch (currentStep) {
            case 0: // Personal
                return !!(formData.name && formData.email && formData.birthDate && formData.gender);
            case 1: // Physical
                return !!(formData.weight && formData.height);
            case 2: // Health
                return formData.healthConditions.length > 0;
            case 3: // Goals
                return !!(formData.goal && formData.frequencyPreference);
            default:
                return true;
        }
    };

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            // In production, this would:
            // 1. Insert anamnese_response
            // 2. Create student record
            // 3. Update sales status
            // 4. Update anamnese_form status

            // For demo, simulate success
            await new Promise(resolve => setTimeout(resolve, 2000));

            console.log('Anamnese submitted:', formData);
            setSuccess(true);
        } catch (err) {
            console.error('Error submitting form:', err);
            setError('Erro ao enviar formulário. Tente novamente.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Ops!</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors"
                    >
                        Voltar ao Início
                    </button>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center"
                >
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12 text-emerald-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Cadastro Concluído! 🎉
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Seus dados foram enviados com sucesso. Seu personal entrará em contato em breve para iniciar seu acompanhamento.
                    </p>
                    <p className="text-sm text-gray-500">
                        Você pode fechar esta página.
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-40">
                <div className="max-w-2xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-lg">F</span>
                        </div>
                        <div>
                            <h1 className="font-bold text-gray-900">Minha Consultoria</h1>
                            <p className="text-xs text-gray-500">Ficha de Anamnese</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Progress */}
            <div className="bg-white border-b border-gray-100 py-4 px-4">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center justify-between mb-2">
                        {STEPS.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = index === currentStep;
                            const isCompleted = index < currentStep;
                            return (
                                <div key={step.id} className="flex items-center">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isActive
                                            ? 'bg-emerald-500 text-white'
                                            : isCompleted
                                                ? 'bg-emerald-100 text-emerald-600'
                                                : 'bg-gray-100 text-gray-400'
                                            }`}
                                    >
                                        {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                                    </div>
                                    {index < STEPS.length - 1 && (
                                        <div className={`hidden sm:block w-12 h-1 mx-2 rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-gray-200'
                                            }`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <p className="text-center text-sm text-gray-600 font-medium">
                        {STEPS[currentStep].label}
                    </p>
                </div>
            </div>

            {/* Form Content */}
            <main className="max-w-2xl mx-auto px-4 py-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-white rounded-2xl shadow-lg p-6"
                    >
                        {/* Step 1: Personal Data */}
                        {currentStep === 0 && (
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nome Completo *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => updateField('name', e.target.value)}
                                        placeholder="Seu nome completo"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => updateField('email', e.target.value)}
                                        placeholder="seu@email.com"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        WhatsApp
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        readOnly
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        CPF (opcional)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.cpf}
                                        onChange={e => updateField('cpf', e.target.value)}
                                        placeholder="000.000.000-00"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Data de Nascimento *
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.birthDate}
                                            onChange={e => updateField('birthDate', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Gênero *
                                        </label>
                                        <select
                                            value={formData.gender}
                                            onChange={e => updateField('gender', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        >
                                            <option value="">Selecione</option>
                                            <option value="male">Masculino</option>
                                            <option value="female">Feminino</option>
                                            <option value="other">Outro</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Physical Data */}
                        {currentStep === 1 && (
                            <div className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Peso (kg) *
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={formData.weight}
                                            onChange={e => updateField('weight', e.target.value)}
                                            placeholder="75.5"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Altura (cm) *
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.height}
                                            onChange={e => updateField('height', e.target.value)}
                                            placeholder="175"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>
                                </div>
                                <div className="bg-emerald-50 rounded-xl p-4">
                                    <p className="text-sm text-emerald-800">
                                        💡 Essas informações são essenciais para calcular seu IMC e personalizar seu treino/dieta.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Health */}
                        {currentStep === 2 && (
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Condições de Saúde *
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {HEALTH_CONDITIONS.map(condition => (
                                            <label
                                                key={condition.id}
                                                className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition-colors ${formData.healthConditions.includes(condition.id)
                                                    ? 'border-emerald-500 bg-emerald-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.healthConditions.includes(condition.id)}
                                                    onChange={() => toggleArrayField('healthConditions', condition.id)}
                                                    className="hidden"
                                                />
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${formData.healthConditions.includes(condition.id)
                                                    ? 'bg-emerald-500 border-emerald-500'
                                                    : 'border-gray-300'
                                                    }`}>
                                                    {formData.healthConditions.includes(condition.id) && (
                                                        <CheckCircle className="w-3 h-3 text-white" />
                                                    )}
                                                </div>
                                                <span className="text-sm">{condition.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Lesões ou Limitações (opcional)
                                    </label>
                                    <textarea
                                        value={formData.injuries}
                                        onChange={e => updateField('injuries', e.target.value)}
                                        placeholder="Descreva lesões anteriores ou limitações físicas..."
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Medicamentos (opcional)
                                    </label>
                                    <textarea
                                        value={formData.medications}
                                        onChange={e => updateField('medications', e.target.value)}
                                        placeholder="Liste medicamentos de uso contínuo..."
                                        rows={2}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 4: Goals */}
                        {currentStep === 3 && (
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Seu Objetivo Principal *
                                    </label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {GOALS.map(goal => (
                                            <label
                                                key={goal.id}
                                                className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${formData.goal === goal.id
                                                    ? 'border-emerald-500 bg-emerald-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="goal"
                                                    value={goal.id}
                                                    checked={formData.goal === goal.id}
                                                    onChange={() => updateField('goal', goal.id)}
                                                    className="hidden"
                                                />
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.goal === goal.id
                                                    ? 'border-emerald-500'
                                                    : 'border-gray-300'
                                                    }`}>
                                                    {formData.goal === goal.id && (
                                                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                                    )}
                                                </div>
                                                <span className="font-medium">{goal.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Preferência de Atividades
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {ACTIVITY_PREFERENCES.map(pref => (
                                            <label
                                                key={pref.id}
                                                className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition-colors ${formData.activityPreferences.includes(pref.id)
                                                    ? 'border-emerald-500 bg-emerald-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.activityPreferences.includes(pref.id)}
                                                    onChange={() => toggleArrayField('activityPreferences', pref.id)}
                                                    className="hidden"
                                                />
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${formData.activityPreferences.includes(pref.id)
                                                    ? 'bg-emerald-500 border-emerald-500'
                                                    : 'border-gray-300'
                                                    }`}>
                                                    {formData.activityPreferences.includes(pref.id) && (
                                                        <CheckCircle className="w-3 h-3 text-white" />
                                                    )}
                                                </div>
                                                <span className="text-sm">{pref.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Frequência de Treino *
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {FREQUENCIES.map(freq => (
                                            <label
                                                key={freq.id}
                                                className={`flex items-center justify-center p-3 border rounded-xl cursor-pointer transition-colors ${formData.frequencyPreference === freq.id
                                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="frequency"
                                                    value={freq.id}
                                                    checked={formData.frequencyPreference === freq.id}
                                                    onChange={() => updateField('frequencyPreference', freq.id)}
                                                    className="hidden"
                                                />
                                                <span className="text-sm font-medium">{freq.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Observações Adicionais (opcional)
                                    </label>
                                    <textarea
                                        value={formData.additionalNotes}
                                        onChange={e => updateField('additionalNotes', e.target.value)}
                                        placeholder="Algo mais que gostaria de compartilhar?"
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                    />
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex gap-4 mt-6">
                    {currentStep > 0 && (
                        <button
                            onClick={handleBack}
                            className="flex-1 py-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            Voltar
                        </button>
                    )}
                    <button
                        onClick={handleNext}
                        disabled={!canProceed() || submitting}
                        className="flex-1 py-4 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Enviando...
                            </>
                        ) : currentStep === STEPS.length - 1 ? (
                            'Finalizar Cadastro'
                        ) : (
                            <>
                                Continuar
                                <ChevronRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>
            </main>
        </div>
    );
}
