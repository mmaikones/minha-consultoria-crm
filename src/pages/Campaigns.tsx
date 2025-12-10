import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send,
    Plus,
    Search,
    Filter,
    MoreVertical,
    CheckCircle,
    Clock,
    XCircle,
    Users,
    MessageSquare,
    Calendar,
    TrendingUp,
    Eye,
    Edit,
    Trash2,
    Play,
    Pause,
    BarChart3,
    Loader2
} from 'lucide-react';

// Campaign types
interface Campaign {
    id: string;
    name: string;
    message: string;
    recipients: number;
    sent: number;
    delivered: number;
    read: number;
    status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'paused' | 'failed';
    scheduledAt?: string;
    createdAt: string;
    completedAt?: string;
}

// Mock campaigns data
const MOCK_CAMPAIGNS: Campaign[] = [
    {
        id: '1',
        name: 'Lembrete Renovação - Dezembro',
        message: 'Olá! Seu plano está próximo do vencimento. Renove agora e ganhe 10% de desconto! 💪',
        recipients: 45,
        sent: 45,
        delivered: 42,
        read: 38,
        status: 'completed',
        createdAt: '2024-12-01T10:00:00',
        completedAt: '2024-12-01T10:15:00',
    },
    {
        id: '2',
        name: 'Promoção Verão 2025',
        message: 'Verão chegando! Aproveite nossa promoção especial e comece o ano em forma. Condições especiais até 31/12! 🏖️',
        recipients: 120,
        sent: 85,
        delivered: 82,
        read: 45,
        status: 'sending',
        createdAt: '2024-12-09T14:00:00',
    },
    {
        id: '3',
        name: 'Feedback Treino',
        message: 'Como está sendo sua experiência com o treino atual? Responda com uma nota de 1 a 5.',
        recipients: 30,
        sent: 0,
        delivered: 0,
        read: 0,
        status: 'scheduled',
        scheduledAt: '2024-12-15T09:00:00',
        createdAt: '2024-12-08T16:00:00',
    },
    {
        id: '4',
        name: 'Novos Horários',
        message: 'Informamos que nossos horários foram atualizados. Confira as novas opções disponíveis!',
        recipients: 80,
        sent: 0,
        delivered: 0,
        read: 0,
        status: 'draft',
        createdAt: '2024-12-07T11:00:00',
    },
];

const STATUS_CONFIG = {
    draft: { label: 'Rascunho', color: 'bg-gray-100 text-gray-700', icon: Edit },
    scheduled: { label: 'Agendada', color: 'bg-blue-100 text-blue-700', icon: Clock },
    sending: { label: 'Enviando', color: 'bg-amber-100 text-amber-700', icon: Send },
    completed: { label: 'Concluída', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    paused: { label: 'Pausada', color: 'bg-orange-100 text-orange-700', icon: Pause },
    failed: { label: 'Falhou', color: 'bg-red-100 text-red-700', icon: XCircle },
};

export default function Campaigns() {
    const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [showNewCampaign, setShowNewCampaign] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

    // New campaign form state
    const [newCampaign, setNewCampaign] = useState({
        name: '',
        message: '',
        targetAll: true,
    });

    // Filter campaigns
    const filteredCampaigns = campaigns.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.message.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Stats
    const stats = {
        total: campaigns.length,
        sent: campaigns.reduce((acc, c) => acc + c.sent, 0),
        delivered: campaigns.reduce((acc, c) => acc + c.delivered, 0),
        read: campaigns.reduce((acc, c) => acc + c.read, 0),
    };

    const deliveryRate = stats.sent > 0 ? ((stats.delivered / stats.sent) * 100).toFixed(1) : '0';
    const readRate = stats.delivered > 0 ? ((stats.read / stats.delivered) * 100).toFixed(1) : '0';

    const handleCreateCampaign = () => {
        if (!newCampaign.name || !newCampaign.message) return;

        const campaign: Campaign = {
            id: Date.now().toString(),
            name: newCampaign.name,
            message: newCampaign.message,
            recipients: 50, // Mock
            sent: 0,
            delivered: 0,
            read: 0,
            status: 'draft',
            createdAt: new Date().toISOString(),
        };

        setCampaigns([campaign, ...campaigns]);
        setNewCampaign({ name: '', message: '', targetAll: true });
        setShowNewCampaign(false);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Campanhas WhatsApp</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Gerencie e acompanhe suas campanhas de mensagens
                    </p>
                </div>
                <button
                    onClick={() => setShowNewCampaign(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-xl font-semibold transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Nova Campanha
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card rounded-xl border border-border p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <Send className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{stats.sent}</p>
                            <p className="text-xs text-muted-foreground">Mensagens Enviadas</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card rounded-xl border border-border p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{deliveryRate}%</p>
                            <p className="text-xs text-muted-foreground">Taxa de Entrega</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card rounded-xl border border-border p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                            <Eye className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{readRate}%</p>
                            <p className="text-xs text-muted-foreground">Taxa de Leitura</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card rounded-xl border border-border p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                            <p className="text-xs text-muted-foreground">Total Campanhas</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar campanhas..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="px-4 py-2.5 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[150px]"
                >
                    <option value="all">Todos os Status</option>
                    <option value="draft">Rascunho</option>
                    <option value="scheduled">Agendada</option>
                    <option value="sending">Enviando</option>
                    <option value="completed">Concluída</option>
                    <option value="failed">Falhou</option>
                </select>
            </div>

            {/* Campaigns List */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="divide-y divide-border">
                    {filteredCampaigns.length === 0 ? (
                        <div className="p-12 text-center">
                            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma campanha encontrada</h3>
                            <p className="text-muted-foreground text-sm">Crie sua primeira campanha para começar</p>
                        </div>
                    ) : (
                        filteredCampaigns.map(campaign => {
                            const StatusIcon = STATUS_CONFIG[campaign.status].icon;
                            return (
                                <motion.div
                                    key={campaign.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                                    onClick={() => setSelectedCampaign(campaign)}
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Status Icon */}
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${STATUS_CONFIG[campaign.status].color}`}>
                                            <StatusIcon className="w-5 h-5" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-foreground truncate">{campaign.name}</h3>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[campaign.status].color}`}>
                                                    {STATUS_CONFIG[campaign.status].label}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{campaign.message}</p>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-3.5 h-3.5" />
                                                    {campaign.recipients} destinatários
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Send className="w-3.5 h-3.5" />
                                                    {campaign.sent} enviadas
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {formatDate(campaign.createdAt)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Progress */}
                                        {campaign.status === 'sending' && (
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-amber-500 transition-all"
                                                        style={{ width: `${(campaign.sent / campaign.recipients) * 100}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {Math.round((campaign.sent / campaign.recipients) * 100)}%
                                                </span>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <button
                                            onClick={e => { e.stopPropagation(); }}
                                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                                        >
                                            <MoreVertical className="w-4 h-4 text-muted-foreground" />
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* New Campaign Modal */}
            <AnimatePresence>
                {showNewCampaign && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                        onClick={() => setShowNewCampaign(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-card rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-4 bg-[#25D366] text-white">
                                <h2 className="text-lg font-bold">Nova Campanha</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">
                                        Nome da Campanha
                                    </label>
                                    <input
                                        type="text"
                                        value={newCampaign.name}
                                        onChange={e => setNewCampaign({ ...newCampaign, name: e.target.value })}
                                        placeholder="Ex: Promoção de Verão"
                                        className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">
                                        Mensagem
                                    </label>
                                    <textarea
                                        value={newCampaign.message}
                                        onChange={e => setNewCampaign({ ...newCampaign, message: e.target.value })}
                                        placeholder="Digite a mensagem que será enviada..."
                                        rows={4}
                                        className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {newCampaign.message.length}/1000 caracteres
                                    </p>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setShowNewCampaign(false)}
                                        className="flex-1 px-4 py-3 bg-muted text-foreground rounded-xl font-semibold hover:bg-muted/80 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleCreateCampaign}
                                        disabled={!newCampaign.name || !newCampaign.message}
                                        className="flex-1 px-4 py-3 bg-[#25D366] text-white rounded-xl font-semibold hover:bg-[#20BD5A] transition-colors disabled:opacity-50"
                                    >
                                        Criar Campanha
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Campaign Details Modal */}
            <AnimatePresence>
                {selectedCampaign && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                        onClick={() => setSelectedCampaign(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-card rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-4 bg-[#25D366] text-white flex items-center justify-between">
                                <h2 className="text-lg font-bold">{selectedCampaign.name}</h2>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-white/20`}>
                                    {STATUS_CONFIG[selectedCampaign.status].label}
                                </span>
                            </div>
                            <div className="p-6 space-y-4">
                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-muted/50 rounded-xl p-3 text-center">
                                        <p className="text-2xl font-bold text-foreground">{selectedCampaign.recipients}</p>
                                        <p className="text-xs text-muted-foreground">Destinatários</p>
                                    </div>
                                    <div className="bg-muted/50 rounded-xl p-3 text-center">
                                        <p className="text-2xl font-bold text-foreground">{selectedCampaign.sent}</p>
                                        <p className="text-xs text-muted-foreground">Enviadas</p>
                                    </div>
                                    <div className="bg-muted/50 rounded-xl p-3 text-center">
                                        <p className="text-2xl font-bold text-green-600">{selectedCampaign.delivered}</p>
                                        <p className="text-xs text-muted-foreground">Entregues</p>
                                    </div>
                                    <div className="bg-muted/50 rounded-xl p-3 text-center">
                                        <p className="text-2xl font-bold text-blue-600">{selectedCampaign.read}</p>
                                        <p className="text-xs text-muted-foreground">Lidas</p>
                                    </div>
                                </div>

                                {/* Message Preview */}
                                <div>
                                    <p className="text-sm font-medium text-foreground mb-2">Mensagem</p>
                                    <div className="bg-muted/50 rounded-xl p-4">
                                        <p className="text-sm text-foreground">{selectedCampaign.message}</p>
                                    </div>
                                </div>

                                {/* Dates */}
                                <div className="text-sm text-muted-foreground space-y-1">
                                    <p>Criada em: {formatDate(selectedCampaign.createdAt)}</p>
                                    {selectedCampaign.scheduledAt && (
                                        <p>Agendada para: {formatDate(selectedCampaign.scheduledAt)}</p>
                                    )}
                                    {selectedCampaign.completedAt && (
                                        <p>Concluída em: {formatDate(selectedCampaign.completedAt)}</p>
                                    )}
                                </div>

                                <button
                                    onClick={() => setSelectedCampaign(null)}
                                    className="w-full px-4 py-3 bg-muted text-foreground rounded-xl font-semibold hover:bg-muted/80 transition-colors"
                                >
                                    Fechar
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
