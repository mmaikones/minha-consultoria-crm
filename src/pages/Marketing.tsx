import { useState, useMemo } from 'react';
import { Megaphone, Send, Users, RefreshCw, Calendar, CheckCircle, Clock, Loader2, AlertCircle, Smartphone, LayoutDashboard, FileText, Trophy, Package } from 'lucide-react';
import NewCampaignModal from '../components/marketing/NewCampaignModal';
import PlansManager from '../components/marketing/PlansManager';
import Templates from './Templates';
import Gamification from './Gamification';
import { Campaign, mockCampaigns as initialCampaigns, marketingStats } from '../data/mockCampaigns';
import { evolutionService } from '../services/evolutionService';
import { Student } from '../data/mockStudents';
import { useStudents } from '../hooks/useStudents';

// Convert Supabase student to local Student format for campaigns
const convertToStudent = (s: any): Student => ({
    id: s.id,
    name: s.name,
    email: s.email,
    phone: s.phone || '',
    goal: s.goal || '',
    status: (s.plan_type?.toLowerCase() as any) || 'mensal',
    daysRemaining: s.plan_end ? Math.ceil((new Date(s.plan_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 30,
    isExpiring: s.plan_end ? Math.ceil((new Date(s.plan_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) <= 7 : false,
    startDate: s.plan_start || s.created_at?.split('T')[0] || '',
    checkinsCompleted: s.streak_days || 0,
    adherenceRate: 100,
    avatar: s.name?.substring(0, 2).toUpperCase() || '',
    nextAssessment: '',
    weightHistory: [],
    currentWorkout: '',
    currentDiet: '',
    history: []
});

type Tab = 'campaigns' | 'plans' | 'templates' | 'gamification';

export default function Marketing() {
    const [activeTab, setActiveTab] = useState<Tab>('campaigns');

    // Use real students from Supabase
    const { data: supabaseStudents } = useStudents();
    const students = useMemo(() => {
        return supabaseStudents?.map(convertToStudent) || [];
    }, [supabaseStudents]);

    // Campaign Logic
    const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
    const [showModal, setShowModal] = useState(false);
    const [toast, setToast] = useState<string | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [sendProgress, setSendProgress] = useState({ current: 0, total: 0, success: 0, failed: 0 });

    const handleSendCampaign = async (students: Student[], messageTemplate: string, campaignName: string, config: { delay: number, dailyLimit: number, channel: 'whatsapp' | 'system' | 'both' }) => {
        setIsSending(true);

        // Apply daily limit
        const limit = config.dailyLimit || students.length;
        const studentsToSend = students.slice(0, limit);

        setSendProgress({ current: 0, total: studentsToSend.length, success: 0, failed: 0 });
        setShowModal(false);

        const newCampaign: Campaign = {
            id: `c${Date.now()}`,
            name: campaignName || 'Nova Campanha',
            date: new Date().toISOString().split('T')[0],
            targetAudience: 'Personalizado',
            targetCount: studentsToSend.length,
            status: 'enviando',
            channel: config.channel,
            message: messageTemplate,
        };

        setCampaigns(prev => [newCampaign, ...prev]);

        let successCount = 0;
        let failedCount = 0;

        for (let i = 0; i < studentsToSend.length; i++) {
            const student = studentsToSend[i];

            // Personalize message
            const personalizedMessage = messageTemplate
                .replace('{{nome}}', student.name.split(' ')[0])
                .replace('{{link_renovacao}}', `https://minhaconsultoria.com/pay/${student.id}`)
                .replace('{{dias_restantes}}', String(student.daysRemaining));

            try {
                // Send logic based on channel
                if (config.channel === 'whatsapp' || config.channel === 'both') {
                    await evolutionService.sendText(student.phone, personalizedMessage);
                }

                if (config.channel === 'system' || config.channel === 'both') {
                    // Mock system send
                    await new Promise(r => setTimeout(r, 100));
                    // Mock system notification - in production would use notification service
                }

                successCount++;
            } catch (error) {
                console.error(`Failed to send to ${student.name}:`, error);
                failedCount++;
            }

            setSendProgress(prev => ({
                ...prev,
                current: i + 1,
                success: successCount,
                failed: failedCount
            }));

            // Delay from config (converted to ms)
            if (i < studentsToSend.length - 1) {
                await new Promise(r => setTimeout(r, config.delay * 1000));
            }
        }

        setIsSending(false);
        setToast(`Envio concluído: ${successCount} enviados, ${failedCount} falhas.`);

        // Update campaign status
        setCampaigns(prev => prev.map(c =>
            c.id === newCampaign.id
                ? { ...c, status: 'enviado' }
                : c
        ));

        setTimeout(() => setToast(null), 5000);
    };

    const getStatusBadge = (status: Campaign['status']) => {
        switch (status) {
            case 'enviado':
                return (
                    <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium">
                        <CheckCircle className="w-3 h-3" />
                        Enviado
                    </span>
                );
            case 'agendado':
                return (
                    <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs font-medium">
                        <Clock className="w-3 h-3" />
                        Agendado
                    </span>
                );
            case 'enviando':
                return (
                    <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full text-xs font-medium">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Enviando...
                    </span>
                );
            case 'erro':
                return (
                    <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs font-medium">
                        <AlertCircle className="w-3 h-3" />
                        Erro
                    </span>
                );
            default:
                return (
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 rounded-full text-xs font-medium">
                        Rascunho
                    </span>
                );
        }
    };

    const getChannelIcon = (channel: Campaign['channel']) => {
        switch (channel) {
            case 'whatsapp':
                return <span title="WhatsApp"><Smartphone className="w-4 h-4 text-green-600" /></span>;
            case 'system':
                return <span title="Sistema"><LayoutDashboard className="w-4 h-4 text-blue-600" /></span>;
            case 'both':
                return (
                    <div className="flex gap-1" title="Ambos">
                        <Smartphone className="w-4 h-4 text-green-600" />
                        <LayoutDashboard className="w-4 h-4 text-blue-600" />
                    </div>
                );
            default:
                return <Smartphone className="w-4 h-4 text-slate-400" />;
        }
    };

    const tabs = [
        { id: 'campaigns', label: 'Campanhas', icon: Megaphone },
        { id: 'plans', label: 'Planos & Pacotes', icon: Package },
        { id: 'templates', label: 'Templates', icon: FileText },
        { id: 'gamification', label: 'Gamificação', icon: Trophy },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Marketing & Gestão</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Central de crescimento e retenção de alunos
                </p>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-1 flex overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as Tab)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-1 justify-center
                            ${activeTab === tab.id
                                ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 shadow-sm'
                                : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {activeTab === 'plans' && <PlansManager />}
                {activeTab === 'templates' && <Templates showHeader={false} />}
                {activeTab === 'gamification' && <Gamification showHeader={false} />}

                {/* CAMPAIGNS TAB CONTENT */}
                <div className={activeTab === 'campaigns' ? 'block space-y-6' : 'hidden'}>
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Visão Geral de Disparos</h2>
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-medium shadow-lg shadow-primary/20"
                        >
                            <Megaphone className="w-4 h-4" />
                            <span>Nova Campanha</span>
                        </button>
                    </div>

                    {/* SENDING PROGRESS BAR */}
                    {isSending && (
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-slate-900 dark:text-white">Enviando campanha...</span>
                                <span className="text-sm text-slate-500 dark:text-slate-400">
                                    {sendProgress.current} de {sendProgress.total}
                                </span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 mb-1">
                                <div
                                    className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
                                    style={{ width: `${(sendProgress.current / sendProgress.total) * 100}%` }}
                                ></div>
                            </div>
                            <div className="flex gap-4 text-xs">
                                <span className="text-green-600 font-medium">Sucesso: {sendProgress.success}</span>
                                <span className="text-red-500 font-medium">Falhas: {sendProgress.failed}</span>
                            </div>
                        </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                    <Send className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {marketingStats.messagesSentThisMonth}
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Mensagens enviadas (mês)
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                                    <Users className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {marketingStats.openRate}%
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Taxa de abertura
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                                    <RefreshCw className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {marketingStats.renewalsGenerated}
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Renovações geradas
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Campaign History */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                            <h2 className="font-semibold text-slate-900 dark:text-white">
                                Histórico de Campanhas
                            </h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px]">
                                <thead className="bg-slate-50 dark:bg-slate-700/50">
                                    <tr>
                                        <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Campanha
                                        </th>
                                        <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Data
                                        </th>
                                        <th className="text-center px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Canal
                                        </th>
                                        <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Público-alvo
                                        </th>
                                        <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Alcance
                                        </th>
                                        <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {campaigns.map(campaign => (
                                        <tr key={campaign.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                            <td className="px-4 py-4">
                                                <span className="font-medium text-slate-900 dark:text-white">
                                                    {campaign.name}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(campaign.date).toLocaleDateString('pt-BR')}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex justify-center">
                                                    {getChannelIcon(campaign.channel)}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">
                                                {campaign.targetAudience}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">
                                                {campaign.targetCount} alunos
                                            </td>
                                            <td className="px-4 py-4">
                                                {getStatusBadge(campaign.status)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal - Only show if activeTab is campaigns to avoid z-index issues or confusion, though state handles it */}
            <NewCampaignModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSend={handleSendCampaign}
                students={students}
            />

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
                    <Send className="w-5 h-5" />
                    <span>{toast}</span>
                </div>
            )}
        </div>
    );
}
