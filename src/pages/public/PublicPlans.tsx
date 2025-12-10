import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, User, Phone, Mail, X, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import PlanCard from '../../components/plans/PlanCard';
import type { Plan, Professional } from '../../lib/database.types';

// Mock plans for demo (will be replaced with Supabase data when tables exist)
const MOCK_PLANS: Partial<Plan>[] = [
    {
        id: 'plan-1',
        professional_id: 'demo',
        name: 'Plano Básico',
        description: 'Treino personalizado para iniciantes',
        price: 149.00,
        duration_days: 30,
        type: 'mensal',
        features: ['Treino personalizado', 'Suporte via WhatsApp', 'Ficha de exercícios'],
        icon: '🏋️',
        status: true,
        sort_order: 1,
        stripe_product_id: null,
        stripe_price_id: null,
    },
    {
        id: 'plan-2',
        professional_id: 'demo',
        name: 'Plano Pro',
        description: 'Treino + Dieta para resultados rápidos',
        price: 297.00,
        duration_days: 30,
        type: 'mensal',
        features: ['Treino personalizado', 'Dieta personalizada', 'Suporte prioritário', 'Ajustes semanais', 'Acesso ao app'],
        icon: '💪',
        status: true,
        sort_order: 2,
        stripe_product_id: null,
        stripe_price_id: null,
    },
    {
        id: 'plan-3',
        professional_id: 'demo',
        name: 'Plano Premium',
        description: 'Acompanhamento completo + Consultoria',
        price: 497.00,
        duration_days: 30,
        type: 'mensal',
        features: ['Tudo do Plano Pro', 'Videochamadas mensais', 'Acompanhamento diário', 'Biomarcadores', 'Suplementação'],
        icon: '🏆',
        status: true,
        sort_order: 3,
        stripe_product_id: null,
        stripe_price_id: null,
    },
];

export default function PublicPlans() {
    const { professionalId } = useParams<{ professionalId: string }>();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [professional, setProfessional] = useState<Professional | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Checkout state
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [checkoutSuccess, setCheckoutSuccess] = useState(false);

    useEffect(() => {
        fetchData();
    }, [professionalId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Try to fetch professional
            if (professionalId && professionalId !== 'demo') {
                const { data: profData, error: profError } = await supabase
                    .from('professionals')
                    .select('*')
                    .eq('id', professionalId)
                    .single();

                if (!profError && profData) {
                    setProfessional(profData);
                }

                // Try to fetch plans from Supabase
                // @ts-ignore - Table may not exist yet
                const { data: plansData } = await supabase
                    .from('plans')
                    .select('*')
                    .eq('professional_id', professionalId)
                    .eq('status', true)
                    .order('sort_order', { ascending: true });

                if (plansData && plansData.length > 0) {
                    setPlans(plansData);
                } else {
                    // Use mock plans if no real data
                    setPlans(MOCK_PLANS as Plan[]);
                }
            } else {
                // Demo mode - use mock data
                setPlans(MOCK_PLANS as Plan[]);
                setProfessional({
                    id: 'demo',
                    name: 'Personal Trainer Demo',
                    email: 'demo@minhaconsultoria.com',
                    specialty: 'Personal Trainer',
                } as Professional);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setPlans(MOCK_PLANS as Plan[]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPlan = (planId: string) => {
        const plan = plans.find(p => p.id === planId);
        if (plan) {
            setSelectedPlan(plan);
            setCheckoutOpen(true);
        }
    };

    const formatPhone = (value: string) => {
        // Remove non-digits
        const clean = value.replace(/\D/g, '');

        // Format as (XX) XXXXX-XXXX
        if (clean.length <= 2) return clean;
        if (clean.length <= 7) return `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
        if (clean.length <= 11) return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
        return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhone(formatPhone(e.target.value));
    };

    const handleCheckout = async () => {
        if (!selectedPlan || !email || !phone || !termsAccepted) return;

        setSubmitting(true);
        try {
            // Clean phone number for storage
            const cleanPhone = phone.replace(/\D/g, '');
            const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

            // In a real implementation, this would:
            // 1. Create a sale record in Supabase
            // 2. Create a Stripe Checkout session
            // 3. Redirect to Stripe

            // For now, simulate success
            await new Promise(resolve => setTimeout(resolve, 1500));

            console.log('Checkout submitted:', {
                planId: selectedPlan.id,
                email,
                phone: formattedPhone,
                professionalId,
            });

            setCheckoutSuccess(true);
        } catch (err) {
            console.error('Checkout error:', err);
            setError('Erro ao processar. Tente novamente.');
        } finally {
            setSubmitting(false);
        }
    };

    const closeCheckout = () => {
        setCheckoutOpen(false);
        setSelectedPlan(null);
        setEmail('');
        setPhone('');
        setTermsAccepted(false);
        setCheckoutSuccess(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-lg">F</span>
                        </div>
                        <div>
                            <h1 className="font-bold text-gray-900">Minha Consultoria</h1>
                            {professional && (
                                <p className="text-xs text-gray-500">{professional.name}</p>
                            )}
                        </div>
                    </div>
                    {professional?.phone && (
                        <a
                            href={`https://wa.me/55${professional.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
                        >
                            <Phone className="w-4 h-4" />
                            WhatsApp
                        </a>
                    )}
                </div>
            </header>

            {/* Hero */}
            <section className="py-12 px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl mx-auto"
                >
                    {professional && (
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                                {professional.avatar_url ? (
                                    <img
                                        src={professional.avatar_url}
                                        alt={professional.name}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <User className="w-10 h-10 text-emerald-600" />
                                )}
                            </div>
                        </div>
                    )}
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
                        Escolha seu plano
                    </h2>
                    <p className="text-gray-600 text-lg">
                        Transforme seu corpo e sua saúde com acompanhamento profissional
                    </p>
                </motion.div>
            </section>

            {/* Plans Grid */}
            <section className="pb-20 px-4">
                <div className="max-w-5xl mx-auto">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-center">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {plans.map((plan, index) => (
                            <PlanCard
                                key={plan.id}
                                id={plan.id}
                                name={plan.name}
                                description={plan.description}
                                price={plan.price}
                                durationDays={plan.duration_days}
                                type={plan.type}
                                features={(plan.features as string[]) || []}
                                icon={plan.icon}
                                isPopular={index === 1}
                                onSelect={handleSelectPlan}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-8 px-4">
                <div className="max-w-5xl mx-auto text-center text-sm text-gray-500">
                    <p>© 2024 Minha Consultoria. Todos os direitos reservados.</p>
                    <div className="mt-2 space-x-4">
                        <a href="#" className="hover:text-gray-700">Termos</a>
                        <a href="#" className="hover:text-gray-700">Privacidade</a>
                    </div>
                </div>
            </footer>

            {/* Checkout Modal */}
            <AnimatePresence>
                {checkoutOpen && selectedPlan && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                        onClick={closeCheckout}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            {checkoutSuccess ? (
                                // Success State
                                <div className="p-8 text-center">
                                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-4xl">🎉</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                        Compra realizada!
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        Você receberá um formulário via WhatsApp em alguns instantes para finalizar seu cadastro.
                                    </p>
                                    <button
                                        onClick={closeCheckout}
                                        className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors"
                                    >
                                        Entendido!
                                    </button>
                                </div>
                            ) : (
                                // Checkout Form
                                <>
                                    <div className="p-4 bg-emerald-500 text-white flex items-center justify-between">
                                        <h3 className="font-bold text-lg">Finalizar Compra</h3>
                                        <button onClick={closeCheckout} className="p-1 hover:bg-white/20 rounded-lg">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="p-6 space-y-5">
                                        {/* Plan Summary */}
                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <div className="flex items-center gap-3">
                                                {selectedPlan.icon && <span className="text-2xl">{selectedPlan.icon}</span>}
                                                <div>
                                                    <p className="font-bold text-gray-900">{selectedPlan.name}</p>
                                                    <p className="text-emerald-600 font-semibold">
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedPlan.price)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                <Mail className="w-4 h-4 inline mr-1" />
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                                placeholder="seu@email.com"
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            />
                                        </div>

                                        {/* Phone */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                <Phone className="w-4 h-4 inline mr-1" />
                                                WhatsApp
                                            </label>
                                            <input
                                                type="tel"
                                                value={phone}
                                                onChange={handlePhoneChange}
                                                placeholder="(11) 99999-9999"
                                                maxLength={15}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            />
                                        </div>

                                        {/* Terms */}
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={termsAccepted}
                                                onChange={e => setTermsAccepted(e.target.checked)}
                                                className="mt-1 w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500"
                                            />
                                            <span className="text-sm text-gray-600">
                                                Li e aceito os <a href="#" className="text-emerald-600 underline">Termos de Serviço</a> e a <a href="#" className="text-emerald-600 underline">Política de Privacidade</a>
                                            </span>
                                        </label>

                                        {/* Submit */}
                                        <button
                                            onClick={handleCheckout}
                                            disabled={!email || !phone || !termsAccepted || submitting}
                                            className="w-full py-4 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {submitting ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Processando...
                                                </>
                                            ) : (
                                                <>
                                                    Confirmar Compra
                                                    <ArrowRight className="w-5 h-5" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
