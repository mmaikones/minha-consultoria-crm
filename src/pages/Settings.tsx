import { useState } from 'react';
import { Brain, Trophy, MessageSquare, Palette, Save, Plus, Trash2, Check, CreditCard, ArrowRight } from 'lucide-react';
import { getAIConfig, saveAIConfig, testAIConnection, AIConfig } from '../services/aiService';

type Tab = 'general' | 'ai' | 'gamification' | 'whatsapp' | 'integrations';

interface GamificationRule {
    id: string;
    action: string;
    points: number;
}

interface Reward {
    id: string;
    name: string;
    points: number;
}

const defaultRules: GamificationRule[] = [
    { id: '1', action: 'Check-in de Treino', points: 10 },
    { id: '2', action: 'Enviar Foto de Progresso', points: 25 },
    { id: '3', action: 'Completar Semana', points: 50 },
    { id: '4', action: 'Renovar Plano', points: 100 },
];

const defaultRewards: Reward[] = [
    { id: '1', name: 'Camiseta Exclusiva', points: 500 },
    { id: '2', name: 'Consultoria Grátis', points: 1000 },
    { id: '3', name: '1 Mês Grátis', points: 2000 },
];

export default function Settings() {
    const [activeTab, setActiveTab] = useState<Tab>('general');
    const [toast, setToast] = useState<string | null>(null);

    // General Settings
    const [consultancyName, setConsultancyName] = useState(() =>
        localStorage.getItem('fitpro_consultancy_name') || 'Minha Consultoria'
    );
    const [primaryColor, setPrimaryColor] = useState(
        localStorage.getItem('fitpro_primary_color') || '#00FFEF'
    );

    // AI Settings
    const [aiConfig, setAiConfig] = useState<AIConfig>(getAIConfig());
    const [isTestingAI, setIsTestingAI] = useState(false);

    const handleSaveAI = () => {
        saveAIConfig(aiConfig);
        showToast('Configurações de IA salvas com sucesso!');
    };

    const handleTestAI = async () => {
        setIsTestingAI(true);
        const success = await testAIConnection(aiConfig);
        setIsTestingAI(false);
        if (success) {
            showToast('Conexão com a IA verificada com sucesso!');
        } else {
            showToast('Falha na conexão. Verifique sua chave API.');
        }
    };

    // Integrations Settings (Stripe)
    const [stripePublicKey, setStripePublicKey] = useState(() =>
        localStorage.getItem('fitpro_stripe_public_key') || ''
    );
    const [stripeSecretKey, setStripeSecretKey] = useState(() =>
        localStorage.getItem('fitpro_stripe_secret_key') || ''
    );

    // Stripe Connect State
    const [stripeConnected, setStripeConnected] = useState(() =>
        localStorage.getItem('fitpro_stripe_connected') === 'true'
    );
    const [stripeAccountId, setStripeAccountId] = useState(() =>
        localStorage.getItem('fitpro_stripe_account_id') || ''
    );
    const [isConnectingStripe, setIsConnectingStripe] = useState(false);
    const [showManualKeys, setShowManualKeys] = useState(false);

    const handleConnectStripe = () => {
        setIsConnectingStripe(true);
        // Simulate OAuth delay
        setTimeout(() => {
            const mockAccountId = `acct_${Math.random().toString(36).substr(2, 9)}`;
            setStripeConnected(true);
            setStripeAccountId(mockAccountId);
            localStorage.setItem('fitpro_stripe_connected', 'true');
            localStorage.setItem('fitpro_stripe_account_id', mockAccountId);
            setIsConnectingStripe(false);
            showToast('Conta Stripe conectada com sucesso!');
        }, 2000);
    };

    const handleDisconnectStripe = () => {
        if (confirm('Tem certeza que deseja desconectar sua conta Stripe? Você não poderá mais receber pagamentos até reconectar.')) {
            setStripeConnected(false);
            setStripeAccountId('');
            localStorage.removeItem('fitpro_stripe_connected');
            localStorage.removeItem('fitpro_stripe_account_id');
            showToast('Conta Stripe desconectada.');
        }
    };

    // Gamification Settings
    const [rules, setRules] = useState<GamificationRule[]>(() => {
        const saved = localStorage.getItem('fitpro_gamification_rules');
        return saved ? JSON.parse(saved) : defaultRules;
    });
    const [rewards, setRewards] = useState<Reward[]>(() => {
        const saved = localStorage.getItem('fitpro_gamification_rewards');
        return saved ? JSON.parse(saved) : defaultRewards;
    });
    const [newRewardName, setNewRewardName] = useState('');
    const [newRewardPoints, setNewRewardPoints] = useState('');

    const showToast = (message: string) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const handleSaveGeneral = () => {
        localStorage.setItem('fitpro_consultancy_name', consultancyName);
        localStorage.setItem('fitpro_primary_color', primaryColor);
        showToast('Configurações gerais salvas!');
    };



    const handleSaveIntegrations = () => {
        localStorage.setItem('fitpro_stripe_public_key', stripePublicKey);
        localStorage.setItem('fitpro_stripe_secret_key', stripeSecretKey);
        showToast('Configurações de integração salvas!');
    };

    const handleUpdateRule = (id: string, points: number) => {
        const updated = rules.map(r => r.id === id ? { ...r, points } : r);
        setRules(updated);
        localStorage.setItem('fitpro_gamification_rules', JSON.stringify(updated));
    };

    const handleAddReward = () => {
        if (!newRewardName || !newRewardPoints) return;
        const newReward: Reward = {
            id: `r${Date.now()}`,
            name: newRewardName,
            points: parseInt(newRewardPoints),
        };
        const updated = [...rewards, newReward];
        setRewards(updated);
        localStorage.setItem('fitpro_gamification_rewards', JSON.stringify(updated));
        setNewRewardName('');
        setNewRewardPoints('');
        showToast('Recompensa adicionada!');
    };

    const handleRemoveReward = (id: string) => {
        const updated = rewards.filter(r => r.id !== id);
        setRewards(updated);
        localStorage.setItem('fitpro_gamification_rewards', JSON.stringify(updated));
        showToast('Recompensa removida!');
    };

    const tabs = [
        { id: 'general' as Tab, label: 'Geral', icon: Palette },
        { id: 'integrations' as Tab, label: 'Integrações', icon: CreditCard },
        { id: 'ai' as Tab, label: 'Inteligência Artificial', icon: Brain },
        { id: 'gamification' as Tab, label: 'Gamificação', icon: Trophy },
        { id: 'whatsapp' as Tab, label: 'WhatsApp', icon: MessageSquare },
    ];

    const colors = [
        { name: 'Emerald', value: '#059669' },
        { name: 'Blue', value: '#2563eb' },
        { name: 'Purple', value: '#7c3aed' },
        { name: 'Rose', value: '#e11d48' },
        { name: 'Orange', value: '#ea580c' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Configurações</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Personalize o sistema de acordo com suas necessidades
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar Tabs */}
                <div className="lg:w-64 flex-shrink-0">
                    <nav className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-2 space-y-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === tab.id
                                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                    }`}
                            >
                                <tab.icon className="w-5 h-5" />
                                <span className="font-medium">{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    {/* General */}
                    {activeTab === 'general' && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                    Branding
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Nome da Consultoria
                                        </label>
                                        <input
                                            type="text"
                                            value={consultancyName}
                                            onChange={(e) => setConsultancyName(e.target.value)}
                                            className="w-full max-w-md px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Cor Principal
                                        </label>
                                        <div className="flex gap-3">
                                            {colors.map(color => (
                                                <button
                                                    key={color.value}
                                                    onClick={() => setPrimaryColor(color.value)}
                                                    className={`w-10 h-10 rounded-full border-2 transition-transform ${primaryColor === color.value
                                                        ? 'border-slate-900 dark:border-white scale-110'
                                                        : 'border-transparent'
                                                        }`}
                                                    style={{ backgroundColor: color.value }}
                                                    title={color.name}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleSaveGeneral}
                                className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                            >
                                <Save className="w-5 h-5" />
                                <span>Salvar Alterações</span>
                            </button>
                        </div>
                    )}

                    {/* Integrations (Stripe) */}
                    {activeTab === 'integrations' && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                    Pagamentos (Stripe)
                                </h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                                    Conecte sua conta Stripe para receber pagamentos dos alunos automaticamente e com segurança.
                                </p>

                                {!stripeConnected ? (
                                    <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-6 border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center">
                                        <div className="w-16 h-16 bg-[#635BFF] rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-[#635BFF]/20">
                                            <CreditCard className="w-8 h-8 text-white" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                                            Aceite pagamentos com Stripe
                                        </h3>
                                        <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6 text-sm">
                                            A maneira mais rápida de começar a receber. Conecte sua conta existente ou crie uma nova em segundos.
                                        </p>

                                        <button
                                            onClick={handleConnectStripe}
                                            disabled={isConnectingStripe}
                                            className="bg-[#635BFF] hover:bg-[#5851df] text-white px-6 py-3 rounded-full font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-70 disabled:cursor-wait"
                                        >
                                            {isConnectingStripe ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Conectando...
                                                </>
                                            ) : (
                                                <>
                                                    Conectar com Stripe
                                                    <ArrowRight className="w-4 h-4" />
                                                </>
                                            )}
                                        </button>

                                        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 w-full max-w-md">
                                            <button
                                                onClick={() => setShowManualKeys(!showManualKeys)}
                                                className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 underline"
                                            >
                                                {showManualKeys ? 'Ocultar configuração manual' : 'Tenho chaves de API (Configuração Manual)'}
                                            </button>

                                            {showManualKeys && (
                                                <div className="mt-4 text-left space-y-4 animate-in slide-in-from-top-2">
                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                                            Public Key
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={stripePublicKey}
                                                            onChange={(e) => setStripePublicKey(e.target.value)}
                                                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                                                            placeholder="pk_live_..."
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                                            Secret Key
                                                        </label>
                                                        <input
                                                            type="password"
                                                            value={stripeSecretKey}
                                                            onChange={(e) => setStripeSecretKey(e.target.value)}
                                                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                                                            placeholder="sk_live_..."
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={handleSaveIntegrations}
                                                        className="w-full py-2 bg-slate-900 dark:bg-slate-600 text-white rounded-lg text-xs font-bold"
                                                    >
                                                        Salvar Chaves
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-[#D0D5DD] dark:border-slate-700 p-6 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <CreditCard className="w-24 h-24 text-[#635BFF]" />
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-[#635BFF]/10 text-[#635BFF] rounded-full flex items-center justify-center">
                                                    <Check className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                        Conta Stripe Conectada
                                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] uppercase font-bold rounded-full">Ativo</span>
                                                    </h3>
                                                    <p className="text-sm text-slate-500 font-mono mt-1">
                                                        {stripeAccountId}
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={handleDisconnectStripe}
                                                className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-900/10 rounded-lg text-sm font-medium transition-colors"
                                            >
                                                Desconectar
                                            </button>
                                        </div>

                                        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700 grid grid-cols-3 gap-4">
                                            <div>
                                                <p className="text-xs text-slate-500 mb-1">Status</p>
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">Verificado</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 mb-1">Pagamentos</p>
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">Habilitados</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 mb-1">Moeda</p>
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">BRL (R$)</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* AI */}
                    {activeTab === 'ai' && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                    Inteligência Artificial (AI Core)
                                </h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                                    Configure o "cérebro" do sistema. Sua chave API permite gerar treinos, analisar perfis e otimizar resultados.
                                </p>

                                <div className="grid gap-6 max-w-2xl">
                                    {/* Provider */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div
                                            onClick={() => setAiConfig({ ...aiConfig, provider: 'openai' })}
                                            className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${aiConfig.provider === 'openai'
                                                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                                : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                                }`}
                                        >
                                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-700 font-bold">OA</div>
                                            <span className="font-medium text-sm">OpenAI</span>
                                        </div>
                                        <div
                                            onClick={() => setAiConfig({ ...aiConfig, provider: 'anthropic' })}
                                            className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${aiConfig.provider === 'anthropic'
                                                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                                : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                                }`}
                                        >
                                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-700 font-bold">AN</div>
                                            <span className="font-medium text-sm">Anthropic</span>
                                        </div>
                                        <div
                                            onClick={() => setAiConfig({ ...aiConfig, provider: 'google' })}
                                            className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${aiConfig.provider === 'google'
                                                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                                : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                                }`}
                                        >
                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 font-bold">GM</div>
                                            <span className="font-medium text-sm">Gemini</span>
                                        </div>
                                    </div>

                                    {/* API Key */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            {aiConfig.provider === 'openai' ? 'OpenAI API Key' : aiConfig.provider === 'anthropic' ? 'Anthropic API Key' : 'Google AI Studio Key'}
                                        </label>
                                        <input
                                            type="password"
                                            value={aiConfig.apiKey}
                                            onChange={(e) => setAiConfig({ ...aiConfig, apiKey: e.target.value })}
                                            placeholder={aiConfig.provider === 'openai' ? "sk-..." : aiConfig.provider === 'anthropic' ? "sk-ant-..." : "AIda..."}
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white font-mono text-sm"
                                        />
                                    </div>

                                    {/* Model */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Modelo
                                        </label>
                                        <select
                                            value={aiConfig.model}
                                            onChange={(e) => setAiConfig({ ...aiConfig, model: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"
                                        >
                                            {aiConfig.provider === 'openai' && (
                                                <>
                                                    <option value="gpt-4-turbo">GPT-4 Turbo (Mais poderoso)</option>
                                                    <option value="gpt-4o">GPT-4o (Melhor custo-benefício)</option>
                                                    <option value="gpt-4o-mini">GPT-4o Mini (Rápido e econômico)</option>
                                                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Mais barato)</option>
                                                </>
                                            )}
                                            {aiConfig.provider === 'anthropic' && (
                                                <>
                                                    <option value="claude-4-sonnet-20250514">Claude 4 Sonnet (Mais recente)</option>
                                                    <option value="claude-3-opus-20250219">Claude 3 Opus (Versão anterior)</option>
                                                    <option value="claude-3-sonnet-20240229">Claude 3 Sonnet (Balanceado)</option>
                                                    <option value="claude-3-haiku-20240307">Claude 3 Haiku (Mais rápido)</option>
                                                </>
                                            )}
                                            {aiConfig.provider === 'google' && (
                                                <>
                                                    <option value="gemini-2.0-flash">Gemini 2.0 Flash (Mais rápido/Recomendado)</option>
                                                    <option value="gemini-2.0-flash-lite">Gemini 2.0 Flash Lite (Econômico)</option>
                                                    <option value="gemini-2.0-pro-experimental">Gemini 2.0 Pro Exp (Complexo)</option>
                                                    <option value="gemini-1.5-pro-002">Gemini 1.5 Pro (Estável)</option>
                                                    <option value="gemini-1.5-flash-002">Gemini 1.5 Flash (Estável)</option>
                                                </>
                                            )}
                                        </select>
                                    </div>

                                    {/* Persona */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Persona / Instruções do Sistema
                                        </label>
                                        <textarea
                                            value={aiConfig.systemPrompt}
                                            onChange={(e) => setAiConfig({ ...aiConfig, systemPrompt: e.target.value })}
                                            rows={4}
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"
                                            placeholder="Ex: Você é um treinador rigoroso focado em hipertrofia..."
                                        />
                                        <p className="text-xs text-slate-500 mt-2">Defina como a IA deve se comportar ao gerar conteúdos.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                                <button
                                    onClick={handleSaveAI}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                                >
                                    <Save className="w-5 h-5" />
                                    <span>Salvar Configuração</span>
                                </button>

                                <button
                                    onClick={handleTestAI}
                                    disabled={isTestingAI}
                                    className="flex items-center gap-2 px-6 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    {isTestingAI ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-900 rounded-full animate-spin" />
                                            Testando...
                                        </>
                                    ) : (
                                        <>
                                            <Brain className="w-5 h-5" />
                                            <span>Testar Conexão</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Gamification */}
                    {activeTab === 'gamification' && (
                        <div className="space-y-8">
                            {/* Rules */}
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                    Regras de Pontuação
                                </h2>
                                <div className="space-y-3">
                                    {rules.map(rule => (
                                        <div key={rule.id} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                            <span className="flex-1 text-slate-700 dark:text-slate-200">
                                                {rule.action}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    value={rule.points}
                                                    onChange={(e) => handleUpdateRule(rule.id, parseInt(e.target.value) || 0)}
                                                    className="w-20 px-3 py-1.5 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg text-center text-sm"
                                                />
                                                <span className="text-sm text-slate-500">pts</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Rewards */}
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                    Loja de Recompensas
                                </h2>

                                <div className="space-y-3 mb-4">
                                    {rewards.map(reward => (
                                        <div key={reward.id} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                            <Trophy className="w-5 h-5 text-amber-500" />
                                            <span className="flex-1 text-slate-700 dark:text-slate-200">
                                                {reward.name}
                                            </span>
                                            <span className="text-sm font-medium text-primary-600">
                                                {reward.points} pts
                                            </span>
                                            <button
                                                onClick={() => handleRemoveReward(reward.id)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Add Reward */}
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={newRewardName}
                                        onChange={(e) => setNewRewardName(e.target.value)}
                                        placeholder="Nome da recompensa"
                                        className="flex-1 px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                                    />
                                    <input
                                        type="number"
                                        value={newRewardPoints}
                                        onChange={(e) => setNewRewardPoints(e.target.value)}
                                        placeholder="Pontos"
                                        className="w-24 px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                                    />
                                    <button
                                        onClick={handleAddReward}
                                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* WhatsApp */}
                    {activeTab === 'whatsapp' && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                    Configurações do WhatsApp
                                </h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Gerencie suas conexões na página de Mensagens.
                                </p>
                            </div>

                            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                <p className="text-slate-600 dark:text-slate-300">
                                    Para adicionar ou gerenciar conexões WhatsApp, acesse o módulo de{' '}
                                    <a href="/mensagens" className="text-primary-600 hover:underline font-medium">
                                        Mensagens
                                    </a>
                                    {' '}e clique no botão "Conexões".
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
                    <Check className="w-5 h-5" />
                    <span>{toast}</span>
                </div>
            )}
        </div>
    );
}
