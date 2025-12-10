import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    CheckCircle,
    Shield,
    CreditCard,
    Lock,
    Loader2,
    ArrowLeft,
    MessageSquare
} from 'lucide-react';
import { getPlanById, Plan, formatPrice, durationConfigs, createCheckoutSession } from '../services/stripeService';
// Note: createStudent removed - student is created via Edge Function after payment confirmation

export default function Checkout() {
    const { planId } = useParams<{ planId: string }>();
    const navigate = useNavigate();
    const [plan, setPlan] = useState<Plan | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        acceptTerms: false
    });

    useEffect(() => {
        const loadPlan = async () => {
            if (!planId) return;
            setIsLoading(true);
            const foundPlan = await getPlanById(planId);
            setPlan(foundPlan);
            setIsLoading(false);
        };
        loadPlan();
    }, [planId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!plan || !formData.acceptTerms) return;

        setIsProcessing(true);

        try {
            // Create checkout session
            const session = await createCheckoutSession({
                planId: plan.id,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                professionalId: plan.professional_id // Required by the API
            });

            // In production: redirect to Stripe Checkout
            // For now: simulate successful payment
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Create student account automatically
            // Student creation is now handled server-side via Edge Function after payment confirmation
            // createStudent call removed

            setIsProcessing(false);
            setIsComplete(true);
        } catch (error) {
            setIsProcessing(false);
            alert('Erro ao processar pagamento. Tente novamente.');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    if (!plan) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Plano não encontrado</h1>
                    <p className="text-slate-500 dark:text-slate-400 mb-4">Este link pode estar expirado ou inválido.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-5 py-2.5 bg-primary text-white rounded-xl font-medium"
                    >
                        Voltar ao início
                    </button>
                </div>
            </div>
        );
    }

    // Success state
    if (isComplete) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-green-900/20 dark:to-slate-900 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-md text-center">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6 animate-in zoom-in duration-500">
                        <CheckCircle className="w-10 h-10" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        Pagamento Confirmado! 🎉
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">
                        Bem-vindo(a) à consultoria! Sua conta de aluno foi criada com sucesso.
                        Você receberá uma mensagem no WhatsApp com o link para a anamnese.
                    </p>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-6 border border-blue-100 dark:border-blue-800">
                        <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                            🔑 Suas credenciais de acesso:
                        </p>
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                            Login: <strong>{formData.phone.replace(/\D/g, '')}</strong> (Seu WhatsApp)<br />
                            Senha: <strong>{formData.phone.replace(/\D/g, '')}</strong> (Seu WhatsApp)
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 mb-6">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Próximos passos:</h3>
                        <ol className="text-left space-y-3 text-sm text-slate-600 dark:text-slate-400">
                            <li className="flex items-start gap-3">
                                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">1</span>
                                Preencha a ficha de anamnese (link enviado via WhatsApp)
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">2</span>
                                Aguarde a análise personalizada do seu treinador
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">3</span>
                                Receba seu protocolo de treino e dieta personalizados
                            </li>
                        </ol>
                    </div>

                    <div className="flex gap-3">
                        <a
                            href={`https://wa.me/5511999999999?text=Oi! Acabei de assinar o plano ${plan.name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-[#25D366] text-white rounded-xl font-medium hover:bg-[#128C7E] transition-colors"
                        >
                            <MessageSquare className="w-5 h-5" />
                            WhatsApp
                        </a>
                        <button
                            onClick={() => navigate(`/anamnese?email=${formData.email}&name=${formData.name}&phone=${formData.phone}`)}
                            className="flex-1 px-5 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
                        >
                            Preencher Anamnese
                        </button>
                    </div>

                    <div className="mt-4">
                        <button
                            onClick={() => navigate('/login/aluno')}
                            className="text-primary hover:underline text-sm font-medium"
                        >
                            Acessar Área do Aluno
                        </button>
                    </div>
                </div>
            </div >
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg mx-auto mb-4">
                        FIT
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Finalizar Compra</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Order Summary */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 h-fit">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Resumo do Pedido</h2>

                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl mb-4">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${plan.type === 'anual' ? 'bg-green-100 text-green-700' :
                                plan.type === 'semestral' ? 'bg-purple-100 text-purple-700' :
                                    plan.type === 'trimestral' ? 'bg-blue-100 text-blue-700' :
                                        'bg-slate-100 text-slate-700'
                                }`}>
                                {durationConfigs[plan.type].label}
                            </span>
                            <h3 className="font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{plan.description}</p>
                        </div>

                        <ul className="space-y-2 mb-6">
                            {plan.features.map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                                <span className="font-medium text-slate-900 dark:text-white">{formatPrice(plan.price)}</span>
                            </div>
                            <div className="flex items-center justify-between text-lg font-bold">
                                <span className="text-slate-900 dark:text-white">Total</span>
                                <span className="text-primary">{formatPrice(plan.price)}</span>
                            </div>
                        </div>

                        {/* Trust badges */}
                        <div className="flex items-center gap-4 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Shield className="w-4 h-4 text-green-500" />
                                Compra segura
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Lock className="w-4 h-4 text-green-500" />
                                Dados protegidos
                            </div>
                        </div>
                    </div>

                    {/* Checkout Form */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Seus Dados</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Nome Completo *
                                </label>
                                <input
                                    required
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 dark:text-white"
                                    placeholder="Seu nome completo"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    E-mail *
                                </label>
                                <input
                                    required
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 dark:text-white"
                                    placeholder="seu@email.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    WhatsApp *
                                </label>
                                <input
                                    required
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 dark:text-white"
                                    placeholder="(00) 00000-0000"
                                />
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Enviaremos o link da anamnese e atualizações por aqui
                                </p>
                            </div>

                            <div className="pt-4">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                    <CreditCard className="w-4 h-4" />
                                    Pagamento
                                </h3>
                                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 text-center">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Você será redirecionado para o ambiente seguro do Stripe para finalizar o pagamento.
                                    </p>
                                </div>
                            </div>

                            <label className="flex items-start gap-3 pt-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="acceptTerms"
                                    checked={formData.acceptTerms}
                                    onChange={handleChange}
                                    className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary mt-0.5"
                                />
                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                    Li e aceito os <a href="#" className="text-primary hover:underline">termos de uso</a> e
                                    a <a href="#" className="text-primary hover:underline">política de privacidade</a>.
                                </span>
                            </label>

                            <button
                                type="submit"
                                disabled={!formData.acceptTerms || isProcessing}
                                className="w-full py-3.5 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Processando...
                                    </>
                                ) : (
                                    <>
                                        <Lock className="w-5 h-5" />
                                        Pagar {formatPrice(plan.price)}
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
