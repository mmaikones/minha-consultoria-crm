import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, ArrowLeft, User, Target, Heart, Calendar, Utensils } from 'lucide-react';

// Anamnese form data interface - all 17 fields
export interface AnamneseFormData {
    // Dados Pessoais (Step 1)
    name: string;
    age: string;
    profession: string;
    height: string;
    weight: string;
    email: string;
    phone: string;

    // Objetivo (Step 2)
    goal: string;
    goalOther: string;

    // Saúde (Step 3)
    healthIssues: string;
    physicalLimitations: string;
    medications: string;

    // Treino e Rotina (Step 4)
    alreadyTrains: string;
    trainingTime: string;
    trainingDays: string;
    dailyRoutine: string;

    // Preferências e Origem (Step 5)
    allergies: string;
    foodsToInclude: string;
    foodsToAvoid: string;
    gymName: string;
    referralSource: string;
    referralOther: string;
}

const initialFormData: AnamneseFormData = {
    name: '',
    age: '',
    profession: '',
    height: '',
    weight: '',
    email: '',
    phone: '',
    goal: '',
    goalOther: '',
    healthIssues: '',
    physicalLimitations: '',
    medications: '',
    alreadyTrains: '',
    trainingTime: '',
    trainingDays: '',
    dailyRoutine: '',
    allergies: '',
    foodsToInclude: '',
    foodsToAvoid: '',
    gymName: '',
    referralSource: '',
    referralOther: '',
};

const goalOptions = [
    { value: 'reeducacao', label: 'Reeducação alimentar' },
    { value: 'perda_peso', label: 'Perda de peso' },
    { value: 'massa_magra', label: 'Ganho de massa magra' },
    { value: 'saude', label: 'Saúde' },
    { value: 'outros', label: 'Outros' },
];

const referralOptions = [
    { value: 'indicacao', label: 'Indicação' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'outros', label: 'Outros' },
];

const TOTAL_STEPS = 5;

export default function AnamnesePublic() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<AnamneseFormData>(() => {
        // Pre-fill from URL params (from Stripe checkout)
        const name = searchParams.get('name') || '';
        const email = searchParams.get('email') || '';
        const phone = searchParams.get('phone') || '';
        return { ...initialFormData, name, email, phone };
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRadioChange = (name: string, value: string) => {
        setFormData({ ...formData, [name]: value });
    };

    const [aiProcessingStep, setAiProcessingStep] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setAiProcessingStep('Enviando dados...');

        try {
            // Import dynamically to avoid circular dependency at build
            const { orchestrateNewStudentFlow } = await import('../services/aiService');

            setAiProcessingStep('🧠 IA analisando sua anamnese...');

            // Run the full AI orchestration flow
            const result = await orchestrateNewStudentFlow(formData);

            if (result.success) {
                setAiProcessingStep('✅ Perfil e Protocolo criados!');
                // In a real app, we would save this to backend here
                // For now, store in localStorage for demo purposes
                localStorage.setItem('fit360_latest_automation', JSON.stringify({
                    ...result,
                    timestamp: new Date().toISOString(),
                    formData
                }));
            } else {
                setAiProcessingStep('Dados recebidos (modo básico).');
            }

            setTimeout(() => {
                setIsSubmitting(false);
                setAiProcessingStep(null);
                setStep(TOTAL_STEPS + 1); // Success step
            }, 1000);

        } catch (error) {
            console.error('Erro no processo:', error);
            setAiProcessingStep(null);
            setIsSubmitting(false);
            setStep(TOTAL_STEPS + 1); // Still show success (graceful degradation)
        }
    };

    const nextStep = () => setStep(prev => Math.min(prev + 1, TOTAL_STEPS));
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    const inputClass = "w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white transition-all";
    const labelClass = "text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block";

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 flex flex-col items-center justify-center p-4 font-sans">
            {/* Header */}
            <div className="mb-8 text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg mx-auto mb-4">
                    MC
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Ficha de Anamnese</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Preencha para montarmos seu protocolo personalizado</p>
            </div>

            <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700">
                {/* Progress Bar */}
                {step <= TOTAL_STEPS && (
                    <div className="px-6 pt-6">
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                            <span>Etapa {step} de {TOTAL_STEPS}</span>
                            <span>{Math.round((step / TOTAL_STEPS) * 100)}% completo</span>
                        </div>
                        <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500 ease-out rounded-full"
                                style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                            />
                        </div>
                    </div>
                )}

                <div className="p-6 md:p-8">
                    {/* Success Step */}
                    {step > TOTAL_STEPS ? (
                        <div className="text-center py-12 animate-in fade-in zoom-in duration-500">
                            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6">
                                <CheckCircle className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                Anamnese Recebida! 🎉
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
                                Nossa inteligência artificial já está analisando seus dados para montar uma sugestão de protocolo.
                                Em breve seu treinador entrará em contato pelo WhatsApp.
                            </p>
                            <button
                                onClick={() => navigate('/login')}
                                className="px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                            >
                                Acessar Portal do Aluno
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Step 1: Dados Pessoais */}
                            {step === 1 && (
                                <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2.5 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-primary-600">
                                            <User className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Dados Pessoais</h2>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Informações básicas sobre você</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className={labelClass}>1. Nome Completo *</label>
                                            <input
                                                required
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className={inputClass}
                                                placeholder="Seu nome completo"
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass}>2. Idade *</label>
                                            <input
                                                required
                                                type="number"
                                                name="age"
                                                value={formData.age}
                                                onChange={handleChange}
                                                className={inputClass}
                                                placeholder="Ex: 28"
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass}>3. Profissão *</label>
                                            <input
                                                required
                                                name="profession"
                                                value={formData.profession}
                                                onChange={handleChange}
                                                className={inputClass}
                                                placeholder="Ex: Designer"
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass}>4. Altura (cm) *</label>
                                            <input
                                                required
                                                type="number"
                                                name="height"
                                                value={formData.height}
                                                onChange={handleChange}
                                                className={inputClass}
                                                placeholder="Ex: 175"
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass}>5. Peso (kg) *</label>
                                            <input
                                                required
                                                type="number"
                                                step="0.1"
                                                name="weight"
                                                value={formData.weight}
                                                onChange={handleChange}
                                                className={inputClass}
                                                placeholder="Ex: 70.5"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Objetivo */}
                            {step === 2 && (
                                <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2.5 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-orange-600">
                                            <Target className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Objetivo</h2>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">O que você espera desta consultoria?</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className={labelClass}>6. Qual seu objetivo com esta consultoria? *</label>
                                        <div className="space-y-2">
                                            {goalOptions.map(option => (
                                                <label
                                                    key={option.value}
                                                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.goal === option.value
                                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                                        : 'border-slate-200 dark:border-slate-700 hover:border-primary-300'
                                                        }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="goal"
                                                        value={option.value}
                                                        checked={formData.goal === option.value}
                                                        onChange={(e) => handleRadioChange('goal', e.target.value)}
                                                        className="sr-only"
                                                    />
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.goal === option.value
                                                        ? 'border-primary-500 bg-primary-500'
                                                        : 'border-slate-300 dark:border-slate-600'
                                                        }`}>
                                                        {formData.goal === option.value && (
                                                            <div className="w-2 h-2 rounded-full bg-white" />
                                                        )}
                                                    </div>
                                                    <span className="text-slate-900 dark:text-white font-medium">{option.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                        {formData.goal === 'outros' && (
                                            <div className="mt-3">
                                                <input
                                                    name="goalOther"
                                                    value={formData.goalOther}
                                                    onChange={handleChange}
                                                    className={inputClass}
                                                    placeholder="Descreva seu objetivo..."
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Saúde */}
                            {step === 3 && (
                                <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2.5 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600">
                                            <Heart className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Saúde</h2>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Precisamos conhecer seu histórico</p>
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        <div>
                                            <label className={labelClass}>7. Apresenta algum problema de saúde ou restrição médica?</label>
                                            <textarea
                                                name="healthIssues"
                                                value={formData.healthIssues}
                                                onChange={handleChange}
                                                className={`${inputClass} min-h-[80px]`}
                                                placeholder="Se sim, quais? Se não, escreva 'Não'"
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass}>8. Você tem alguma limitação física ou sente dores?</label>
                                            <textarea
                                                name="physicalLimitations"
                                                value={formData.physicalLimitations}
                                                onChange={handleChange}
                                                className={`${inputClass} min-h-[80px]`}
                                                placeholder="Descreva se houver..."
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass}>9. Toma algum medicamento?</label>
                                            <textarea
                                                name="medications"
                                                value={formData.medications}
                                                onChange={handleChange}
                                                className={`${inputClass} min-h-[80px]`}
                                                placeholder="Se sim, quais? Se não, escreva 'Não'"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Treino e Rotina */}
                            {step === 4 && (
                                <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600">
                                            <Calendar className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Treino e Rotina</h2>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Sua rotina de exercícios e alimentação</p>
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        <div>
                                            <label className={labelClass}>10. Você já treina? Há quanto tempo?</label>
                                            <input
                                                name="alreadyTrains"
                                                value={formData.alreadyTrains}
                                                onChange={handleChange}
                                                className={inputClass}
                                                placeholder="Ex: Sim, há 2 anos / Não"
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass}>11. Atualmente quais os dias e horários da semana você treina?</label>
                                            <input
                                                name="trainingDays"
                                                value={formData.trainingDays}
                                                onChange={handleChange}
                                                className={inputClass}
                                                placeholder="Ex: Seg, Qua, Sex às 18h"
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass}>12. Descreva sua rotina completa (da hora que acorda até dormir, incluindo alimentação)</label>
                                            <textarea
                                                name="dailyRoutine"
                                                value={formData.dailyRoutine}
                                                onChange={handleChange}
                                                className={`${inputClass} min-h-[120px]`}
                                                placeholder="Ex: Acordo às 6h, tomo café às 7h com pão e café... (seja o mais detalhado possível)"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 5: Preferências e Origem */}
                            {step === 5 && (
                                <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2.5 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-600">
                                            <Utensils className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Preferências Alimentares</h2>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Para personalizarmos sua dieta</p>
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        <div>
                                            <label className={labelClass}>13. Você tem alergia a alguma substância?</label>
                                            <input
                                                name="allergies"
                                                value={formData.allergies}
                                                onChange={handleChange}
                                                className={inputClass}
                                                placeholder="Ex: Lactose, Glúten, Frutos do mar..."
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass}>14. Qual alimento você gostaria de incluir na sua dieta?</label>
                                            <input
                                                name="foodsToInclude"
                                                value={formData.foodsToInclude}
                                                onChange={handleChange}
                                                className={inputClass}
                                                placeholder="Ex: Frango, Arroz, Batata doce..."
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass}>15. Tem algum alimento que você NÃO consome de forma alguma?</label>
                                            <input
                                                name="foodsToAvoid"
                                                value={formData.foodsToAvoid}
                                                onChange={handleChange}
                                                className={inputClass}
                                                placeholder="Ex: Fígado, Beterraba..."
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass}>16. Em qual academia você treina?</label>
                                            <input
                                                name="gymName"
                                                value={formData.gymName}
                                                onChange={handleChange}
                                                className={inputClass}
                                                placeholder="Nome da academia (se aplicável)"
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass}>17. Por onde conheceu meu trabalho?</label>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                                                {referralOptions.map(option => (
                                                    <label
                                                        key={option.value}
                                                        className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all text-sm ${formData.referralSource === option.value
                                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                                            : 'border-slate-200 dark:border-slate-700 hover:border-primary-300'
                                                            }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="referralSource"
                                                            value={option.value}
                                                            checked={formData.referralSource === option.value}
                                                            onChange={(e) => handleRadioChange('referralSource', e.target.value)}
                                                            className="sr-only"
                                                        />
                                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.referralSource === option.value
                                                            ? 'border-primary-500 bg-primary-500'
                                                            : 'border-slate-300 dark:border-slate-600'
                                                            }`}>
                                                            {formData.referralSource === option.value && (
                                                                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                                            )}
                                                        </div>
                                                        <span className="text-slate-900 dark:text-white">{option.label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                            {formData.referralSource === 'outros' && (
                                                <input
                                                    name="referralOther"
                                                    value={formData.referralOther}
                                                    onChange={handleChange}
                                                    className={`${inputClass} mt-3`}
                                                    placeholder="Especifique..."
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex gap-4 pt-6 border-t border-slate-100 dark:border-slate-700">
                                {step > 1 && (
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        className="px-5 py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-2"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Voltar
                                    </button>
                                )}
                                {step < TOTAL_STEPS ? (
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary-600/25"
                                    >
                                        Próximo
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-600/25"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                {aiProcessingStep || 'Processando...'}
                                            </>
                                        ) : (
                                            <>
                                                Finalizar e Enviar
                                                <CheckCircle className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* Footer */}
            <p className="mt-6 text-xs text-slate-400 dark:text-slate-500 text-center">
                Suas informações são confidenciais e protegidas.
            </p>
        </div>
    );
}
