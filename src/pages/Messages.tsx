import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Send,
    Paperclip,
    MoreVertical,
    Phone,
    Video,
    CheckCheck,
    Wifi,
    List,
    Megaphone,
    Plus,
    X,
    Clock,
    CheckCircle,
    Loader2,
    Users,
    User,
    RefreshCw,
    ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConnectionManager from '../components/chat/ConnectionManager';
import { evolutionService, Chat, EvolutionInstance } from '../services/evolutionService';
import { Student } from '../data/mockStudents'; // Type only
import { useStudents } from '../hooks/useStudents';
import ChatWindow from '../components/chat/ChatWindow';

interface Campaign {
    id: string;
    name: string;
    message: string;
    recipients: number;
    sent: number;
    status: 'draft' | 'sending' | 'completed' | 'failed';
    createdAt: string;
}

type MainTab = 'conversas' | 'campanhas';

export default function Messages() {
    const navigate = useNavigate();

    // Use real student data from Supabase
    const { data: supabaseStudents } = useStudents();
    const students = supabaseStudents?.map(s => ({
        id: s.id,
        name: s.name,
        phone: s.phone || '',
        email: s.email,
        avatar: s.name.substring(0, 2).toUpperCase()
    })) || [];

    const [activeInstance, setActiveInstance] = useState<string | null>(null);
    const [chats, setChats] = useState<Chat[]>([]);
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [loadingChats, setLoadingChats] = useState(false);

    const [mainTab, setMainTab] = useState<MainTab>('conversas');
    const [showConnectionManager, setShowConnectionManager] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [campaigns, setCampaigns] = useState<Campaign[]>([
        { id: '1', name: 'Lembrete Renovação', message: 'Seu plano está vencendo...', recipients: 25, sent: 25, status: 'completed', createdAt: '2024-12-01' },
        { id: '2', name: 'Promoção Verão', message: 'Aproveite nossa promoção...', recipients: 50, sent: 35, status: 'sending', createdAt: '2024-12-05' },
    ]);
    const [showNewCampaign, setShowNewCampaign] = useState(false);
    const [newCampaignName, setNewCampaignName] = useState('');
    const [newCampaignMessage, setNewCampaignMessage] = useState('');
    const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
    const [isSendingCampaign, setIsSendingCampaign] = useState(false);

    // Init: Find active instance
    useEffect(() => {
        const init = async () => {
            const saved = evolutionService.getActiveInstance();
            if (saved) {
                // Load cache immediately
                const cachedChats = evolutionService.getCachedChats(saved);
                if (cachedChats.length > 0) setChats(cachedChats);

                setActiveInstance(saved);
                fetchChats(saved);
            } else {
                try {
                    const instances = await evolutionService.fetchAllInstances();
                    const connected = instances.find((i: EvolutionInstance) => i.status === 'open');
                    if (connected) {
                        const name = connected.instanceName;
                        setActiveInstance(name);
                        evolutionService.setInstance(name);
                        fetchChats(name);
                    } else {
                        setShowConnectionManager(true);
                    }
                } catch (e) {
                    console.error("Erro ao iniciar chat", e);
                    setShowConnectionManager(true);
                }
            }
        };
        init();
    }, []);

    // Poll chats every 10s
    useEffect(() => {
        if (!activeInstance) return;
        const interval = setInterval(() => fetchChats(activeInstance, true), 10000);
        return () => clearInterval(interval);
    }, [activeInstance]);

    // Fetch chats function
    const fetchChats = async (instanceName: string, silent = false) => {
        if (!silent) setLoadingChats(true);
        try {
            const data = await evolutionService.fetchChats(instanceName);
            if (data && Array.isArray(data)) {
                setChats(data);
            }
        } catch (error) {
            if (!silent) {
                console.error('Erro ao carregar conversas:', error);
                // Don't show toast to avoid spamming
            }
            // IMPORTANT: Do NOT clear chats here. Keep previous state.
        } finally {
            if (!silent) setLoadingChats(false);
        }
    };

    const handleSelectChat = (chat: Chat) => {
        setSelectedChat(chat);
    };

    const handleInstanceConnect = (instanceName: string) => {
        setActiveInstance(instanceName);
        evolutionService.setInstance(instanceName);
        fetchChats(instanceName);
        setShowConnectionManager(false);
    };

    const handleOpenProtocol = () => {
        if (selectedChat) {
            const phoneNumber = selectedChat.id.split('@')[0];
            const student = students.find(s => s.phone.includes(phoneNumber));
            if (student) navigate(`/admin/student/${student.id}`);
        }
    };

    const handleSendCampaign = async () => {
        if (!newCampaignName || !newCampaignMessage || selectedRecipients.length === 0) return;
        setIsSendingCampaign(true);
        const phoneNumbers = selectedRecipients
            .map(id => students.find(s => s.id === id)?.phone)
            .filter(Boolean) as string[];
        const newCampaign: Campaign = {
            id: `c${Date.now()}`,
            name: newCampaignName,
            message: newCampaignMessage,
            recipients: phoneNumbers.length,
            sent: 0,
            status: 'sending',
            createdAt: new Date().toISOString().split('T')[0],
        };
        setCampaigns(prev => [newCampaign, ...prev]);
        try {
            const result = await evolutionService.sendBulkText(phoneNumbers, newCampaignMessage, 3000);
            setCampaigns(prev => prev.map(c =>
                c.id === newCampaign.id
                    ? { ...c, sent: result.sent, status: result.failed > 0 ? 'failed' : 'completed' }
                    : c
            ));
        } catch (error) {
            setCampaigns(prev => prev.map(c =>
                c.id === newCampaign.id ? { ...c, status: 'failed' } : c
            ));
        } finally {
            setIsSendingCampaign(false);
            setShowNewCampaign(false);
            setNewCampaignName('');
            setNewCampaignMessage('');
            setSelectedRecipients([]);
        }
    };

    const filteredChats = chats.filter(chat =>
        chat.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.id?.includes(searchQuery)
    );

    if (!activeInstance && !showConnectionManager) {
        return (
            <div className="flex items-center justify-center h-full text-slate-500">
                <div className="text-center">
                    <Wifi className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                    <p className="mb-2 text-lg font-medium">Nenhuma conexão ativa detectada.</p>
                    <p className="text-sm mb-4">Conecte seu WhatsApp para começar.</p>
                    <button
                        onClick={() => setShowConnectionManager(true)}
                        className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
                    >
                        Conectar WhatsApp
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-4rem)] lg:h-[calc(100vh-1.5rem)] flex flex-col -m-4 lg:-m-6">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setMainTab('conversas')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${mainTab === 'conversas' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                    >
                        <List className="w-4 h-4" />
                        Conversas
                    </button>
                    <button
                        onClick={() => setMainTab('campanhas')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${mainTab === 'campanhas' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                    >
                        <Megaphone className="w-4 h-4" />
                        Campanhas
                    </button>
                </div>
                <div className="flex items-center gap-3">
                    {mainTab === 'conversas' && (
                        <button
                            onClick={() => setShowConnectionManager(true)}
                            className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                        >
                            <Wifi className={`w-4 h-4 ${activeInstance ? 'text-green-500' : 'text-slate-400'}`} />
                            <span className="text-sm font-medium text-muted-foreground hidden sm:inline">{activeInstance || 'Conexões'}</span>
                        </button>
                    )}
                    {mainTab === 'campanhas' && (
                        <button
                            onClick={() => setShowNewCampaign(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                        >
                            <Plus className="w-5 h-5" />
                            Nova Campanha
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                    {mainTab === 'conversas' ? (
                        <div className="flex h-full overflow-hidden bg-white dark:bg-slate-900 border border-border rounded-lg shadow-sm">
                            {/* Sidebar */}
                            <div className={`w-full sm:w-[320px] lg:w-[320px] border-r border-slate-200 dark:border-slate-800 flex flex-col flex-shrink-0 ${selectedChat ? 'hidden sm:flex' : 'flex'}`}>
                                <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            placeholder="Buscar conversa..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#15b1ca] text-sm"
                                        />
                                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    </div>
                                    <button
                                        onClick={() => activeInstance && fetchChats(activeInstance)}
                                        className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        <RefreshCw className={`h-4 w-4 text-slate-500 ${loadingChats ? 'animate-spin' : ''}`} />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto">
                                    {loadingChats && filteredChats.length === 0 ? (
                                        <div className="p-4 text-center text-sm text-slate-400">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                            Carregando conversas...
                                        </div>
                                    ) : filteredChats.length === 0 ? (
                                        <div className="p-4 text-center text-sm text-slate-400">Nenhuma conversa encontrada.</div>
                                    ) : (
                                        filteredChats.map((chat) => (
                                            <div
                                                key={chat.id}
                                                onClick={() => handleSelectChat(chat)}
                                                className={`p-3 border-b border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex gap-3 ${selectedChat?.id === chat.id ? 'bg-[#15b1ca]/10 dark:bg-[#15b1ca]/20' : ''}`}
                                            >
                                                <div className="h-12 w-12 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden">
                                                    {chat.profilePictureUrl ? (
                                                        <img src={chat.profilePictureUrl} alt={chat.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center bg-[#15b1ca]/10 text-[#15b1ca] font-bold">{chat.name?.charAt(0) || '?'}</div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-baseline mb-1">
                                                        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{chat.name || chat.id.split('@')[0]}</h4>
                                                        <span className="text-xs text-slate-400">{chat.timestamp ? new Date(chat.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{chat.lastMessage || '...'}</p>
                                                </div>
                                                {(chat.unreadCount || 0) > 0 && (
                                                    <div className="flex flex-col justify-center">
                                                        <span className="bg-[#15b1ca] text-white text-[10px] h-5 w-5 flex items-center justify-center rounded-full">{chat.unreadCount}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Chat Window */}
                            {selectedChat ? (
                                <div className={`flex-1 flex flex-col h-full overflow-hidden ${selectedChat ? 'flex' : 'hidden sm:flex'}`}>
                                    <ChatWindow
                                        chat={selectedChat}
                                        onOpenProtocol={handleOpenProtocol}
                                    // onSendMessage handled internally by ChatWindow now
                                    />
                                </div>
                            ) : (
                                <div className="hidden sm:flex flex-1 bg-[#f0f2f5] dark:bg-[#222e35] flex-col items-center justify-center border-b-[6px] border-[#15b1ca]">
                                    <div className="text-center text-slate-500 max-w-md p-6">
                                        <h2 className="text-2xl font-light text-slate-700 dark:text-slate-200 mb-4">FitPro Web</h2>
                                        <p>Envie e receba mensagens sem precisar manter seu celular conectado.</p>
                                        <p className="mt-4 text-sm">Selecione uma conversa para começar.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <motion.div key="campanhas" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-full p-6 overflow-auto">
                            <div className="max-w-4xl mx-auto space-y-4">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-foreground">Campanhas WhatsApp</h2>
                                        <p className="text-sm text-muted-foreground">Envie mensagens em massa via Evolution API</p>
                                    </div>
                                </div>
                                {campaigns.length === 0 ? (
                                    <div className="text-center py-12 bg-muted/30 rounded-xl border-2 border-dashed border-muted">
                                        <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">Nenhuma campanha criada</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {campaigns.map(camp => (
                                            <div key={camp.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${camp.status === 'completed' ? 'bg-green-100 text-green-600' : camp.status === 'sending' ? 'bg-blue-100 text-blue-600' : camp.status === 'failed' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                                                        {camp.status === 'completed' ? <CheckCircle className="w-5 h-5" /> : camp.status === 'sending' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Clock className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-foreground">{camp.name}</h3>
                                                        <p className="text-sm text-muted-foreground truncate max-w-xs">{camp.message}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-foreground">{camp.sent}/{camp.recipients}</p>
                                                    <p className="text-xs text-muted-foreground">{camp.createdAt}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Campaign Modal */}
            <AnimatePresence>
                {showNewCampaign && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => !isSendingCampaign && setShowNewCampaign(false)}>
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between p-4 border-b border-border">
                                <h2 className="text-lg font-bold text-foreground">Nova Campanha</h2>
                                <button onClick={() => !isSendingCampaign && setShowNewCampaign(false)} className="p-2 rounded-lg hover:bg-muted transition-colors">
                                    <X className="w-5 h-5 text-muted-foreground" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-auto p-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Nome da Campanha</label>
                                    <input type="text" value={newCampaignName} onChange={e => setNewCampaignName(e.target.value)} placeholder="Ex: Lembrete de Renovação" className="w-full px-4 py-3 bg-muted rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Mensagem</label>
                                    <textarea value={newCampaignMessage} onChange={e => setNewCampaignMessage(e.target.value)} placeholder="Escreva sua mensagem aqui..." rows={4} className="w-full px-4 py-3 bg-muted rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                                </div>
                                <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-xl border border-primary/20">
                                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                        <Users className="w-4 h-4 text-primary" />
                                        Destinatários ({selectedRecipients.length} selecionados)
                                    </h3>
                                    <div className="max-h-48 overflow-auto border border-border rounded-xl bg-muted/30">
                                        {students.map(student => (
                                            <label key={student.id} className="flex items-center gap-3 p-3 hover:bg-muted cursor-pointer border-b border-border last:border-0">
                                                <input type="checkbox" checked={selectedRecipients.includes(student.id)} onChange={() => setSelectedRecipients(prev => prev.includes(student.id) ? prev.filter(r => r !== student.id) : [...prev, student.id])} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">{student.avatar}</div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-foreground">{student.name}</p>
                                                    <p className="text-xs text-muted-foreground">{student.phone}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-3 p-4 border-t border-border bg-muted/30">
                                <button onClick={() => setShowNewCampaign(false)} disabled={isSendingCampaign} className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors">Cancelar</button>
                                <button onClick={handleSendCampaign} disabled={isSendingCampaign || !newCampaignName || !newCampaignMessage || selectedRecipients.length === 0} className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isSendingCampaign ? <><Loader2 className="w-4 h-4 animate-spin" />Enviando...</> : <><Send className="w-4 h-4" />Enviar Agora</>}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ConnectionManager isOpen={showConnectionManager} onClose={() => setShowConnectionManager(false)} onConnect={handleInstanceConnect} />
        </div>
    );
}
