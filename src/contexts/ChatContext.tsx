import { createContext, useContext, useState, ReactNode } from 'react';

interface ChatContextType {
    isOpen: boolean;
    isMinimized: boolean;
    activeChat: { number: string; name: string; studentId?: string } | null;
    openChat: (number?: string, name?: string, studentId?: string) => void;
    closeChat: () => void;
    minimizeChat: () => void;
    maximizeChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [activeChat, setActiveChat] = useState<{ number: string; name: string; studentId?: string } | null>(null);

    const openChat = (number?: string, name?: string, studentId?: string) => {
        if (number && name) {
            setActiveChat({ number, name, studentId });
        }
        setIsOpen(true);
        setIsMinimized(false);
    };

    const closeChat = () => {
        setIsOpen(false);
        setActiveChat(null);
    };

    const minimizeChat = () => setIsMinimized(true);
    const maximizeChat = () => setIsMinimized(false);

    return (
        <ChatContext.Provider value={{
            isOpen,
            isMinimized,
            activeChat,
            openChat,
            closeChat,
            minimizeChat,
            maximizeChat
        }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
}
