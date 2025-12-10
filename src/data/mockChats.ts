export interface Message {
    id: string;
    content: string;
    timestamp: string;
    fromMe: boolean;
    attachment?: {
        type: 'library_document';
        id: string;
        title: string;
        fileType: string; // 'pdf', 'video', etc.
    };
}

export interface Chat {
    id: string;
    studentId: string;
    name: string;
    avatar: string;
    photoUrl?: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    status: 'novos' | 'respondendo' | 'aguardando_pagamento' | 'concluido';
    messages: Message[];
}

export interface Session {
    id: string;
    name: string;
    status: 'disconnected' | 'waiting' | 'connected';
    phone?: string;
}

export const mockSessions: Session[] = [
    { id: '1', name: 'Suporte', status: 'connected', phone: '+55 11 99999-0001' },
    { id: '2', name: 'Vendas', status: 'disconnected' },
    { id: '3', name: 'Cobrança', status: 'disconnected' },
];

export const mockChats: Chat[] = [
    {
        id: '1',
        studentId: '1',
        name: 'João Silva',
        avatar: 'JS',
        photoUrl: 'https://i.pravatar.cc/150?u=1',
        lastMessage: 'E aí, como foi o treino hoje?',
        lastMessageTime: '10:32',
        unreadCount: 2,
        status: 'novos',
        messages: [
            { id: '1', content: 'Opa, tudo bem?', timestamp: '10:30', fromMe: false },
            { id: '2', content: 'Tudo ótimo! E você?', timestamp: '10:31', fromMe: true },
            { id: '3', content: 'E aí, como foi o treino hoje?', timestamp: '10:32', fromMe: false },
        ],
    },
    {
        id: '2',
        studentId: '2',
        name: 'Maria Santos',
        avatar: 'MS',
        photoUrl: 'https://i.pravatar.cc/150?u=2',
        lastMessage: 'Pode me mandar o boleto?',
        lastMessageTime: '09:45',
        unreadCount: 1,
        status: 'aguardando_pagamento',
        messages: [
            { id: '1', content: 'Bom dia! Tudo bem?', timestamp: '09:40', fromMe: false },
            { id: '2', content: 'Bom dia Maria! Tudo sim', timestamp: '09:41', fromMe: true },
            { id: '3', content: 'Pode me mandar o boleto?', timestamp: '09:45', fromMe: false },
        ],
    },
    {
        id: '3',
        studentId: '3',
        name: 'Pedro Oliveira',
        avatar: 'PO',
        photoUrl: 'https://i.pravatar.cc/150?u=3',
        lastMessage: 'Valeu, professor! 💪',
        lastMessageTime: 'Ontem',
        unreadCount: 0,
        status: 'concluido',
        messages: [
            { id: '1', content: 'Prof, terminei todas as séries!', timestamp: '18:30', fromMe: false },
            { id: '2', content: 'Excelente Pedro! Parabéns pelo esforço!', timestamp: '18:32', fromMe: true },
            { id: '3', content: 'Valeu, professor! 💪', timestamp: '18:33', fromMe: false },
        ],
    },
    {
        id: '4',
        studentId: '4',
        name: 'Ana Costa',
        avatar: 'AC',
        photoUrl: 'https://i.pravatar.cc/150?u=4',
        lastMessage: 'Posso remarcar para quinta?',
        lastMessageTime: '08:20',
        unreadCount: 3,
        status: 'respondendo',
        messages: [
            { id: '1', content: 'Oi! Preciso falar sobre o treino de amanhã', timestamp: '08:15', fromMe: false },
            { id: '2', content: 'Oi Ana, pode falar!', timestamp: '08:18', fromMe: true },
            { id: '3', content: 'Posso remarcar para quinta?', timestamp: '08:20', fromMe: false },
        ],
    },
    {
        id: '5',
        studentId: '5',
        name: 'Carlos Mendes',
        avatar: 'CM',
        photoUrl: 'https://i.pravatar.cc/150?u=5',
        lastMessage: 'Obrigado pelo treino!',
        lastMessageTime: 'Seg',
        unreadCount: 0,
        status: 'concluido',
        messages: [
            { id: '1', content: 'Muito bom o treino de hoje!', timestamp: '17:00', fromMe: false },
            { id: '2', content: 'Fico feliz que gostou! Continue assim!', timestamp: '17:05', fromMe: true },
            { id: '3', content: 'Obrigado pelo treino!', timestamp: '17:06', fromMe: false },
        ],
    },
    {
        id: '6',
        studentId: '6',
        name: 'Fernanda Lima',
        avatar: 'FL',
        photoUrl: 'https://i.pravatar.cc/150?u=6',
        lastMessage: 'Qual horário você tem disponível?',
        lastMessageTime: '07:55',
        unreadCount: 1,
        status: 'novos',
        messages: [
            { id: '1', content: 'Oi! Quero começar a treinar', timestamp: '07:50', fromMe: false },
            { id: '2', content: 'Qual horário você tem disponível?', timestamp: '07:55', fromMe: false },
        ],
    },
];

export const kanbanColumns = [
    { id: 'novos', title: 'Novos', color: 'bg-blue-500' },
    { id: 'respondendo', title: 'Respondendo', color: 'bg-yellow-500' },
    { id: 'aguardando_pagamento', title: 'Aguardando Pagamento', color: 'bg-orange-500' },
    { id: 'concluido', title: 'Concluído', color: 'bg-green-500' },
];
