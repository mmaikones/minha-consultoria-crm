import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, X, ArrowLeft, Minimize2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import { evolutionService, Chat, Message } from '../../services/evolutionService';
import { useChat } from '../../contexts/ChatContext';

export default function FloatingWhatsApp() {
    const navigate = useNavigate();
    const { isOpen, activeChat, closeChat, minimizeChat, maximizeChat, openChat: contextOpenChat } = useChat();
    // Local state for view management (synced with context when possible)
    const [currentView, setCurrentView] = useState<'list' | 'chat'>('list');
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeInstance, setActiveInstance] = useState<string | null>(null);

    // Initial Load & Polling
    useEffect(() => {
        const loadChats = async () => {
            const instanceName = evolutionService.getActiveInstance();
            if (instanceName) {
                setActiveInstance(instanceName);

                // Load cached first for speed
                const cached = evolutionService.getCachedChats(instanceName);
                if (cached.length > 0) setChats(cached);

                // Then fetch fresh
                try {
                    const freshChats = await evolutionService.fetchChats(instanceName);
                    if (freshChats && freshChats.length > 0) {
                        setChats(freshChats);
                    }
                } catch (error) {
                    console.error("Error fetching chats for floating widget:", error);
                }
            }
        };

        if (isOpen) {
            loadChats();
            // Optional: Poll every 10s if open
            const interval = setInterval(loadChats, 10000);
            return () => clearInterval(interval);
        }
    }, [isOpen]);

    // Sync with Context Active Chat (from Kanban/Profile)
    useEffect(() => {
        if (activeChat) {
            // Check if we already have this chat in list
            const outputNumber = activeChat.number?.replace(/\D/g, ''); // basic clean

            const existingChat = chats.find(c => c.id.includes(outputNumber));

            if (existingChat) {
                setSelectedChat(existingChat);
                setCurrentView('chat');
            } else {
                // If standard JID format isn't found, maybe search by name or CREATE a temp chat object
                // For now, create a temp object so the window opens
                const tempChat: Chat = {
                    id: `${outputNumber}@s.whatsapp.net`,
                    name: activeChat.name,
                    timestamp: Date.now() / 1000,
                    unreadCount: 0,
                    profilePictureUrl: undefined // connection might fetch it
                };
                setSelectedChat(tempChat);
                setCurrentView('chat');
            }
        }
    }, [activeChat, chats]);

    const handleSelectChat = (chat: Chat) => {
        setSelectedChat(chat);
        setCurrentView('chat');
    };

    const handleBackToList = () => {
        setCurrentView('list');
        setSelectedChat(null);
        // If we were in a context-driven chat, maybe clear context?
        // But for now, just local nav is fine.
    };

    const handleSendMessage = async (text: string) => {
        if (!activeInstance || !selectedChat) return;
        try {
            await evolutionService.sendText(selectedChat.id, text, activeInstance);
            // Optimistic update handled in ChatWindow usually, 
            // but we might want to refresh messages here
        } catch (error) {
            console.error("Failed to send message", error);
        }
    };

    // Calculate unread
    const totalUnread = chats.reduce((acc, chat) => acc + (chat.unreadCount || 0), 0);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">

            {/* Chat Window / Popover */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
                        transition={{ type: "spring", bounce: 0.3, duration: 0.3 }}
                        className="pointer-events-auto bg-card border border-border rounded-3xl shadow-2xl w-[380px] h-[600px] mb-4 overflow-hidden flex flex-col origin-bottom-right"
                    >
                        {/* Header */}
                        <div className="bg-[#15b1ca] px-4 py-3 flex items-center justify-between text-white shrink-0 shadow-sm z-10">
                            <div className="flex items-center gap-3">
                                {currentView === 'chat' && (
                                    <button
                                        onClick={handleBackToList}
                                        className="p-1 hover:bg-white/20 rounded-full transition-colors"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                )}
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-white/20 rounded-full backdrop-blur-sm">
                                        <MessageCircle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm leading-tight">
                                            {currentView === 'chat' && selectedChat ? selectedChat.name : 'WhatsApp'}
                                        </h3>
                                        <p className="text-[10px] opacity-90 font-medium">
                                            {currentView === 'chat' ? 'Online' : 'Consultoria Mensagens'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={closeChat}
                                    className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                                >
                                    <Minimize2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-hidden relative bg-[#E0F2F1] dark:bg-slate-900 icon-pattern">
                            {currentView === 'list' ? (
                                <ChatList
                                    chats={chats}
                                    selectedChat={null}
                                    onSelectChat={handleSelectChat}
                                    searchQuery={searchQuery}
                                    onSearchChange={setSearchQuery}
                                />
                            ) : (
                                selectedChat && (
                                    <div className="h-full flex flex-col">
                                        <ChatWindow
                                            chat={selectedChat}
                                            onOpenProtocol={() => {
                                                closeChat();
                                                if (activeChat?.studentId) {
                                                    navigate(`/students/${activeChat.studentId}`);
                                                } else {
                                                    navigate('/students'); // Fallback
                                                }
                                            }}
                                            onSendMessage={handleSendMessage}
                                        />
                                    </div>
                                )
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Toggle Button */}
            <motion.button
                layout
                onClick={() => isOpen ? closeChat() : contextOpenChat()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`pointer-events-auto h-16 w-16 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 relative
                    ${isOpen
                        ? 'bg-slate-200 text-slate-600 rotate-90 dark:bg-slate-700 dark:text-slate-300'
                        : 'bg-[#15b1ca] text-white hover:bg-[#129cb0]'
                    }`}
            >
                {isOpen ? (
                    <X className="w-8 h-8" />
                ) : (
                    <MessageCircle className="w-8 h-8" />
                )}

                {/* Unread Badge (Only when closed) */}
                {!isOpen && totalUnread > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white dark:border-slate-800 animate-in zoom-in">
                        {totalUnread}
                    </span>
                )}
            </motion.button>
        </div>
    );
}
