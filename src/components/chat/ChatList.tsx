import { Search } from 'lucide-react';
import { Chat } from '../../services/evolutionService';

interface ChatListProps {
    chats: Chat[];
    selectedChat: Chat | null;
    onSelectChat: (chat: Chat) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

export default function ChatList({
    chats,
    selectedChat,
    onSelectChat,
    searchQuery,
    onSearchChange
}: ChatListProps) {
    const filteredChats = chats.filter(chat =>
        chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (chat.lastMessage || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-full flex flex-col bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
            {/* Search */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-700">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar conversa..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-700 border-0 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
                {filteredChats.length === 0 ? (
                    <div className="p-4 text-center text-slate-500 dark:text-slate-400">
                        Nenhuma conversa encontrada
                    </div>
                ) : (
                    filteredChats.map(chat => (
                        <button
                            key={chat.id}
                            onClick={() => onSelectChat(chat)}
                            className={`w-full flex items-start gap-3 p-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left ${selectedChat?.id === chat.id ? 'bg-[#15b1ca]/10 dark:bg-[#15b1ca]/20' : ''
                                }`}
                        >
                            {/* Avatar */}
                            <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center">
                                {chat.profilePictureUrl ? (
                                    <img src={chat.profilePictureUrl} alt={chat.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-[#15b1ca] to-[#129cb0] flex items-center justify-center text-white font-semibold">
                                        {chat.name?.charAt(0)}
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-slate-900 dark:text-white truncate">
                                        {chat.name}
                                    </span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0 ml-2">
                                        {chat.timestamp ? new Date(chat.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                                        {chat.lastMessage}
                                    </p>
                                    {(chat.unreadCount || 0) > 0 && (
                                        <span className="flex-shrink-0 ml-2 min-w-[18px] h-[18px] px-1 bg-[#15b1ca] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                            {chat.unreadCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}
