// Message Templates Data

export interface MessageTemplate {
    id: string;
    name: string;
    category: 'lembrete' | 'motivacao' | 'cobranca' | 'boas_vindas' | 'feedback' | 'renovacao';
    content: string;
    variables: string[];
}

export const templateCategories = [
    { id: 'lembrete', label: 'Lembretes', icon: '⏰', color: 'bg-blue-500' },
    { id: 'motivacao', label: 'Motivação', icon: '💪', color: 'bg-green-500' },
    { id: 'cobranca', label: 'Cobrança', icon: '💰', color: 'bg-red-500' },
    { id: 'boas_vindas', label: 'Boas-vindas', icon: '👋', color: 'bg-purple-500' },
    { id: 'feedback', label: 'Feedback', icon: '📊', color: 'bg-amber-500' },
    { id: 'renovacao', label: 'Renovação', icon: '🔄', color: 'bg-teal-500' },
];

export const mockTemplates: MessageTemplate[] = [
    // Lembretes
    {
        id: 'tpl-1',
        name: 'Lembrete de Treino',
        category: 'lembrete',
        content: 'Oi {{nome}}! 👋 Só passando pra lembrar do seu treino de hoje. Bora manter a consistência! 💪',
        variables: ['nome']
    },
    {
        id: 'tpl-2',
        name: 'Lembrete de Check-in',
        category: 'lembrete',
        content: 'E aí {{nome}}, tudo bem? Não esquece de mandar seu check-in semanal! Quero saber como foi a semana. 📊',
        variables: ['nome']
    },
    {
        id: 'tpl-3',
        name: 'Lembrete de Dieta',
        category: 'lembrete',
        content: 'Fala {{nome}}! Como está a alimentação? Lembra de seguir o plano alimentar, ele é essencial pro seu resultado. 🥗',
        variables: ['nome']
    },

    // Motivação
    {
        id: 'tpl-10',
        name: 'Motivação Geral',
        category: 'motivacao',
        content: '{{nome}}, cada treino te aproxima do seu objetivo! Não desanima, você está no caminho certo. 🔥💪',
        variables: ['nome']
    },
    {
        id: 'tpl-11',
        name: 'Parabéns pelo Progresso',
        category: 'motivacao',
        content: '{{nome}}, parabéns pelo progresso! Você perdeu {{peso_perdido}}kg desde que começou. Continue assim! 🎉📈',
        variables: ['nome', 'peso_perdido']
    },
    {
        id: 'tpl-12',
        name: 'Volta aos Treinos',
        category: 'motivacao',
        content: 'Oi {{nome}}! Senti sua falta nos treinos. Que tal retomar? Estou aqui pra te ajudar! 😊',
        variables: ['nome']
    },

    // Cobrança
    {
        id: 'tpl-20',
        name: 'Lembrete de Pagamento',
        category: 'cobranca',
        content: 'Olá {{nome}}! Seu plano vence dia {{data_vencimento}}. Pode realizar o pagamento para manter o acompanhamento sem interrupção. 💳',
        variables: ['nome', 'data_vencimento']
    },
    {
        id: 'tpl-21',
        name: 'Pagamento em Atraso',
        category: 'cobranca',
        content: '{{nome}}, notei que seu pagamento está pendente. Está tudo bem? Posso ajudar com alguma dúvida sobre o valor ou forma de pagamento?',
        variables: ['nome']
    },
    {
        id: 'tpl-22',
        name: 'Segunda Cobrança',
        category: 'cobranca',
        content: 'Oi {{nome}}, tudo bem? Só passando novamente sobre o pagamento. Quando conseguir regularizar, me avisa! 🙏',
        variables: ['nome']
    },

    // Boas-vindas
    {
        id: 'tpl-30',
        name: 'Boas-vindas Novo Aluno',
        category: 'boas_vindas',
        content: 'Seja muito bem-vindo(a), {{nome}}! 🎉 Estou muito feliz em te ter como aluno(a). Vamos juntos conquistar seu objetivo de {{objetivo}}! 💪',
        variables: ['nome', 'objetivo']
    },
    {
        id: 'tpl-31',
        name: 'Envio do Protocolo',
        category: 'boas_vindas',
        content: '{{nome}}, seu protocolo está pronto! 📋 Segue seu treino e dieta em anexo. Qualquer dúvida estou à disposição!',
        variables: ['nome']
    },

    // Feedback
    {
        id: 'tpl-40',
        name: 'Pedido de Feedback',
        category: 'feedback',
        content: '{{nome}}, como está se sentindo com os treinos? Quero saber se precisa de ajustes no protocolo. Me conta! 📝',
        variables: ['nome']
    },
    {
        id: 'tpl-41',
        name: 'Avaliação do Atendimento',
        category: 'feedback',
        content: 'Oi {{nome}}! Gostaria de saber sua opinião sobre o acompanhamento. Seu feedback é muito importante pra mim! ⭐',
        variables: ['nome']
    },

    // Renovação
    {
        id: 'tpl-50',
        name: 'Plano Vencendo',
        category: 'renovacao',
        content: '{{nome}}, seu plano vence em {{dias}} dias! Que tal renovar e continuar evoluindo? Tenho condições especiais pra você! 🎁',
        variables: ['nome', 'dias']
    },
    {
        id: 'tpl-51',
        name: 'Oferta de Renovação',
        category: 'renovacao',
        content: 'Fala {{nome}}! Como você é um aluno(a) especial, tenho uma oferta exclusiva: {{valor_desconto}}% de desconto na renovação! Bora continuar? 💚',
        variables: ['nome', 'valor_desconto']
    },
];
