import { useState, useRef, useEffect } from 'react';
import { Send, Mic, MoreVertical, User, Phone, Video, Paperclip, FileText } from 'lucide-react';
import { Chat, Message, evolutionService } from '../../services/evolutionService';
import {
    ChatBubble,
    ChatBubbleAvatar,
    ChatBubbleMessage,
} from '../ui/chat-bubble';

interface ChatWindowProps {
    chat: Chat | null;
    onOpenProtocol: (chatId: string) => void;
    onSendMessage?: (text: string) => void;
}

export default function ChatWindow({ chat, onOpenProtocol, onSendMessage }: ChatWindowProps) {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Fetch messages on mount or chat change
    useEffect(() => {
        const fetchMessages = async () => {
            if (!chat) return;
            setLoading(true);
            try {
                const instanceName = evolutionService.getActiveInstance();

                // Try cache first
                // Assuming getCachedMessages takes (remoteJid) based on previous TS error
                // If it needs instance, the key generation inside service likely handles it or uses just jid
                const cached = evolutionService.getCachedMessages(chat.id);
                if (cached && cached.length > 0) {
                    setMessages(cached);
                }

                if (instanceName) {
                    // Correct order: remoteJid, count, instanceName
                    const fresh = await evolutionService.fetchMessages(chat.id, 50, instanceName);
                    if (fresh && fresh.length > 0) {
                        setMessages(fresh);
                    }
                }
            } catch (error) {
                console.error("Error fetching messages:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, [chat]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleSendMessage = async () => {
        if (!message.trim() || !chat) return;

        const textToSend = message;
        // Optimistic Update
        const messageTimestamp = Date.now() / 1000;

        // Construct a temporary message object for UI
        const newMessage: Message = {
            id: `temp-${Date.now()}`,
            timestamp: messageTimestamp,
            fromMe: true,
            message: textToSend,
            type: 'text',
            key: {
                remoteJid: chat.id,
                fromMe: true,
                id: `temp-${Date.now()}`
            }
        };

        setMessages(prev => [...prev, newMessage]);
        setMessage('');

        // Call parent handler (API) via prop or direct service
        if (onSendMessage) {
            onSendMessage(textToSend);
        } else {
            // If prop not provided, try sending directly (fallback)
            const instanceName = evolutionService.getActiveInstance();
            if (instanceName) {
                try {
                    await evolutionService.sendText(chat.id, textToSend, instanceName);
                } catch (err) {
                    console.error("Failed to send text", err);
                    // Could revert optimistic update here
                }
            }
        }
    };

    if (!chat) {
        return (
            <div className="flex-1 flex items-center justify-center bg-[#E0F2F1] dark:bg-[#0b141a]">
                <div className="text-center">
                    <div className="w-24 h-24 bg-[#008069]/10 dark:bg-[#008069]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Send className="w-10 h-10 text-[#008069] dark:text-[#00a884]" />
                    </div>
                    <h3 className="text-lg font-medium text-[#111B21] dark:text-[#e9edef] mb-2">
                        Minha Consultoria
                    </h3>
                    <p className="text-[#54656F] dark:text-[#8696a0]">
                        Selecione uma conversa para começar
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-[#E0F2F1] dark:bg-[#0b141a] relative">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-[#15b1ca] dark:bg-[#1f2c34] h-14 shadow-sm z-10 text-white">
                <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-semibold shadow-sm overflow-hidden shrink-0">
                        {chat.profilePictureUrl ? (
                            <img src={chat.profilePictureUrl} alt={chat.name} className="w-full h-full object-cover" />
                        ) : (
                            chat.name?.charAt(0)
                        )}
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-medium text-sm text-white dark:text-[#e9edef] truncate leading-tight">{chat.name}</h3>
                        <p className="text-[10px] text-white/80 dark:text-[#8696a0] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-[#25D366] rounded-full"></span>
                            Online
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white dark:text-[#aebac1]">
                        <Phone className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white dark:text-[#aebac1]">
                        <Video className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onOpenProtocol(chat.id)}
                        className="flex items-center gap-1.5 px-2 py-1.5 bg-white/10 border border-white/20 text-white rounded-md hover:bg-white/20 transition-colors shadow-sm backdrop-blur-sm"
                    >
                        <User className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">Protocolo</span>
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white dark:text-[#aebac1]">
                        <MoreVertical className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <ChatBubble
                        key={msg.id || index}
                        variant={msg.fromMe ? "sent" : "received"}
                    >
                        <ChatBubbleAvatar
                            fallback={msg.fromMe ? "EU" : chat.name?.charAt(0) || "U"}
                            className={msg.fromMe ? "hidden" : ""}
                        />
                        <div className={`flex flex-col ${msg.fromMe ? "items-end" : "items-start"}`}>
                            <ChatBubbleMessage
                                variant={msg.fromMe ? "sent" : "received"}
                                className={`${msg.fromMe ? "bg-[#15b1ca] text-white" : "bg-white dark:bg-[#1f2c34] text-[#111B21] dark:text-[#e9edef]"} rounded-2xl`}
                            >
                                {msg.type === 'image' || msg.type === 'video' || msg.type === 'audio' || msg.type === 'document' ? (
                                    <div className="flex items-center gap-2 p-1">
                                        <FileText className="w-5 h-5 opacity-70" />
                                        <span className="text-sm italic">
                                            {msg.message || `[${msg.type}]`}
                                        </span>
                                    </div>
                                ) : (
                                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                )}
                            </ChatBubbleMessage>
                            <span className={`text-[10px] mt-1 px-1 ${msg.fromMe ? "text-[#54656F] dark:text-[#8696a0]" : "text-[#54656F] dark:text-[#8696a0]"} font-medium`}>
                                {msg.timestamp ? new Date(msg.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                        </div>
                    </ChatBubble>
                ))}
                {loading && (
                    <div className="flex justify-center p-2">
                        <span className="text-xs text-slate-400">Carregando...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-2 bg-[#F0F2F5] dark:bg-[#1f2c34] border-t border-[#E5DDD5] dark:border-[#2a3942]">
                <div className="flex items-center gap-2">
                    <button
                        className="p-1.5 rounded-full transition-colors hover:bg-[#E5DDD5] dark:hover:bg-[#2a3942] text-[#54656F] dark:text-[#aebac1]"
                        title="Anexar (Em breve)"
                    >
                        <Paperclip className="w-5 h-5" />
                    </button>

                    <input
                        type="text"
                        placeholder="Digite uma mensagem..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        className="flex-1 px-3 py-2 bg-white dark:bg-[#2a3942] border-0 rounded-lg text-sm text-[#111B21] dark:text-[#e9edef] placeholder:text-[#54656F] dark:placeholder:text-[#8696a0] focus:outline-none focus:ring-1 focus:ring-[#008069]"
                    />

                    <button className="p-1.5 rounded-full hover:bg-[#E5DDD5] dark:hover:bg-[#2a3942] transition-colors text-[#54656F] dark:text-[#aebac1]">
                        <Mic className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => handleSendMessage()}
                        disabled={!message.trim()}
                        className={`p-2 rounded-full transition-all shadow-sm ${!message.trim()
                            ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                            : 'bg-[#15b1ca] text-white hover:bg-[#129cb0] active:scale-95'
                            }`}
                    >
                        <Send className="w-4 h-4 ml-0.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
