export type StudentStatus = 'novos_leads' | 'mensal' | 'trimestral' | 'semestral' | 'anual';

export interface WeightRecord {
    month: string;
    weight: number;
}

export interface HistoryEvent {
    id: string;
    date: string;
    type: 'payment' | 'checkin' | 'renewal' | 'signup' | 'assessment';
    description: string;
}

export interface BodyMeasurements {
    date: string;
    chest: number;       // Peitoral (cm)
    waist: number;       // Cintura (cm)
    hip: number;         // Quadril (cm)
    leftArm: number;     // Braço esquerdo (cm)
    rightArm: number;    // Braço direito (cm)
    leftThigh: number;   // Coxa esquerda (cm)
    rightThigh: number;  // Coxa direita (cm)
    leftCalf: number;    // Panturrilha esquerda (cm)
    rightCalf: number;   // Panturrilha direita (cm)
}

export interface EvolutionPhoto {
    id: string;
    url: string;
    date: string;
    type: 'front' | 'side' | 'back';
    notes?: string;
}

export interface Student {
    id: string;
    name: string;
    avatar: string;
    email: string;
    phone: string;
    goal: string;
    status: StudentStatus;
    daysRemaining: number;
    isExpiring: boolean;
    startDate: string;
    checkinsCompleted: number;
    adherenceRate: number;
    nextAssessment: string;
    weightHistory: WeightRecord[];
    currentWorkout: string;
    currentDiet: string;
    currentProtocolId?: string;
    history: HistoryEvent[];

    // Novos campos - Dados Pessoais
    birthDate?: string;
    age?: number;
    height?: number;         // cm
    gender?: 'M' | 'F';
    cpf?: string;
    address?: string;
    city?: string;
    emergencyContact?: string;
    emergencyPhone?: string;

    // Novos campos - Saúde
    healthConditions?: string[];
    medications?: string[];
    allergies?: string[];
    injuries?: string[];

    // Novos campos - Extras
    notes?: string;          // Notas privadas do profissional
    tags?: string[];
    photoUrl?: string;       // Foto real do aluno

    // Novos campos - Medidas e Evolução
    measurements?: BodyMeasurements[];
    evolutionPhotos?: EvolutionPhoto[];
}

export const studentColumns = [
    { id: 'novos_leads', title: 'Novos Leads', color: 'bg-slate-500' },
    { id: 'mensal', title: 'Plano Mensal', color: 'bg-blue-500' },
    { id: 'trimestral', title: 'Trimestral', color: 'bg-indigo-500' },
    { id: 'semestral', title: 'Semestral', color: 'bg-purple-500' },
    { id: 'anual', title: 'Anual', color: 'bg-primary-600' },
];

export const mockStudents: Student[] = [
    {
        id: '1',
        name: 'João Silva',
        avatar: 'JS',
        email: 'joao@email.com',
        phone: '+55 11 99999-1001',
        goal: 'Hipertrofia',
        status: 'mensal',
        daysRemaining: 5,
        isExpiring: true,
        startDate: '2024-10-01',
        checkinsCompleted: 18,
        adherenceRate: 85,
        nextAssessment: '2024-12-20',
        photoUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
        weightHistory: [
            { month: 'Jul', weight: 78 },
            { month: 'Ago', weight: 79 },
            { month: 'Set', weight: 80 },
            { month: 'Out', weight: 81 },
            { month: 'Nov', weight: 82 },
            { month: 'Dez', weight: 83 },
        ],
        currentWorkout: 'Treino A: Peito/Tríceps\n- Supino reto 4x10\n- Supino inclinado 3x12\n- Crucifixo 3x15\n- Tríceps corda 4x12\n\nTreino B: Costas/Bíceps\n- Puxada frontal 4x10\n- Remada curvada 4x10\n- Rosca direta 3x12',
        currentDiet: 'Café da manhã: 4 ovos + 2 fatias pão integral\nLanche: Whey + banana\nAlmoço: 200g frango + arroz + salada\nLanche: Castanhas + iogurte\nJantar: 150g carne + legumes',
        history: [
            { id: '1', date: '2024-12-05', type: 'checkin', description: 'Check-in realizado' },
            { id: '2', date: '2024-12-01', type: 'payment', description: 'Pagamento confirmado - R$ 200,00' },
            { id: '3', date: '2024-11-15', type: 'assessment', description: 'Avaliação física realizada' },
        ],
    },
    {
        id: '2',
        name: 'Maria Santos',
        avatar: 'MS',
        email: 'maria@email.com',
        phone: '+55 11 99999-1002',
        goal: 'Emagrecimento',
        status: 'trimestral',
        daysRemaining: 45,
        isExpiring: false,
        startDate: '2024-09-01',
        checkinsCompleted: 28,
        adherenceRate: 92,
        nextAssessment: '2025-01-10',
        photoUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
        weightHistory: [
            { month: 'Jul', weight: 72 },
            { month: 'Ago', weight: 70 },
            { month: 'Set', weight: 68 },
            { month: 'Out', weight: 67 },
            { month: 'Nov', weight: 65 },
            { month: 'Dez', weight: 64 },
        ],
        currentWorkout: 'Treino Full Body 3x/semana\n- Agachamento 4x12\n- Leg Press 3x15\n- Supino 4x10\n- Remada 4x10\n- Cardio 30min',
        currentDiet: 'Dieta low carb - 1400kcal\nCafé: Ovos mexidos + abacate\nAlmoço: Salada + proteína\nJantar: Legumes + peixe',
        history: [
            { id: '1', date: '2024-12-06', type: 'checkin', description: 'Check-in realizado' },
            { id: '2', date: '2024-11-20', type: 'renewal', description: 'Plano renovado por 3 meses' },
        ],
    },
    {
        id: '3',
        name: 'Pedro Oliveira',
        avatar: 'PO',
        email: 'pedro@email.com',
        phone: '+55 11 99999-1003',
        goal: 'Condicionamento',
        status: 'semestral',
        daysRemaining: 120,
        isExpiring: false,
        startDate: '2024-06-01',
        checkinsCompleted: 52,
        adherenceRate: 78,
        nextAssessment: '2025-02-01',
        photoUrl: 'https://randomuser.me/api/portraits/men/45.jpg',
        weightHistory: [
            { month: 'Jul', weight: 85 },
            { month: 'Ago', weight: 84 },
            { month: 'Set', weight: 83 },
            { month: 'Out', weight: 83 },
            { month: 'Nov', weight: 82 },
            { month: 'Dez', weight: 82 },
        ],
        currentWorkout: 'Treino Funcional\n- Burpees 3x15\n- Mountain climbers 3x20\n- Kettlebell swing 4x15\n- Box jump 3x12',
        currentDiet: 'Alimentação equilibrada\nFoco em proteínas e carboidratos complexos',
        history: [
            { id: '1', date: '2024-12-01', type: 'payment', description: 'Pagamento confirmado' },
        ],
    },
    {
        id: '4',
        name: 'Ana Costa',
        avatar: 'AC',
        email: 'ana@email.com',
        phone: '+55 11 99999-1004',
        goal: 'Definição',
        status: 'anual',
        daysRemaining: 280,
        isExpiring: false,
        startDate: '2024-03-01',
        checkinsCompleted: 85,
        adherenceRate: 95,
        nextAssessment: '2024-12-15',
        photoUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
        weightHistory: [
            { month: 'Jul', weight: 58 },
            { month: 'Ago', weight: 57 },
            { month: 'Set', weight: 56 },
            { month: 'Out', weight: 56 },
            { month: 'Nov', weight: 55 },
            { month: 'Dez', weight: 55 },
        ],
        currentWorkout: 'Treino ABC + Cardio HIIT',
        currentDiet: 'Cutting - déficit de 300kcal',
        history: [
            { id: '1', date: '2024-12-05', type: 'checkin', description: 'Check-in realizado' },
            { id: '2', date: '2024-11-01', type: 'assessment', description: 'Avaliação física - BF 18%' },
        ],
    },
    {
        id: '5',
        name: 'Carlos Mendes',
        avatar: 'CM',
        email: 'carlos@email.com',
        phone: '+55 11 99999-1005',
        goal: 'Hipertrofia',
        status: 'mensal',
        daysRemaining: 22,
        isExpiring: false,
        startDate: '2024-11-15',
        checkinsCompleted: 8,
        adherenceRate: 80,
        nextAssessment: '2025-01-15',
        photoUrl: 'https://randomuser.me/api/portraits/men/22.jpg',
        weightHistory: [
            { month: 'Out', weight: 75 },
            { month: 'Nov', weight: 76 },
            { month: 'Dez', weight: 77 },
        ],
        currentWorkout: 'Treino Push/Pull/Legs',
        currentDiet: 'Bulk limpo - superávit de 300kcal',
        history: [
            { id: '1', date: '2024-11-15', type: 'signup', description: 'Cadastro realizado' },
            { id: '2', date: '2024-11-15', type: 'payment', description: 'Primeiro pagamento' },
        ],
    },
    {
        id: '6',
        name: 'Fernanda Lima',
        avatar: 'FL',
        email: 'fernanda@email.com',
        phone: '+55 11 99999-1006',
        goal: 'Saúde',
        status: 'novos_leads',
        daysRemaining: 0,
        isExpiring: false,
        startDate: '',
        checkinsCompleted: 0,
        adherenceRate: 0,
        nextAssessment: '',
        photoUrl: 'https://randomuser.me/api/portraits/women/33.jpg',
        weightHistory: [],
        currentWorkout: '',
        currentDiet: '',
        history: [],
    },
    {
        id: '7',
        name: 'Ricardo Souza',
        avatar: 'RS',
        email: 'ricardo@email.com',
        phone: '+55 11 99999-1007',
        goal: 'Força',
        status: 'novos_leads',
        daysRemaining: 0,
        isExpiring: false,
        startDate: '',
        checkinsCompleted: 0,
        adherenceRate: 0,
        nextAssessment: '',
        weightHistory: [],
        currentWorkout: '',
        currentDiet: '',
        history: [],
    },
    {
        id: '8',
        name: 'Juliana Pereira',
        avatar: 'JP',
        email: 'juliana@email.com',
        phone: '+55 11 99999-1008',
        goal: 'Emagrecimento',
        status: 'trimestral',
        daysRemaining: 8,
        isExpiring: true,
        startDate: '2024-09-15',
        checkinsCompleted: 22,
        adherenceRate: 70,
        nextAssessment: '2024-12-18',
        weightHistory: [
            { month: 'Set', weight: 68 },
            { month: 'Out', weight: 66 },
            { month: 'Nov', weight: 65 },
            { month: 'Dez', weight: 64 },
        ],
        currentWorkout: 'Treino aeróbico + musculação leve',
        currentDiet: 'Reeducação alimentar',
        history: [
            { id: '1', date: '2024-12-02', type: 'checkin', description: 'Check-in realizado' },
        ],
    },
    {
        id: '9',
        name: 'Lucas Ferreira',
        avatar: 'LF',
        email: 'lucas@email.com',
        phone: '+55 11 99999-1009',
        goal: 'Hipertrofia',
        status: 'semestral',
        daysRemaining: 90,
        isExpiring: false,
        startDate: '2024-07-01',
        checkinsCompleted: 42,
        adherenceRate: 88,
        nextAssessment: '2025-01-01',
        weightHistory: [
            { month: 'Jul', weight: 70 },
            { month: 'Ago', weight: 72 },
            { month: 'Set', weight: 74 },
            { month: 'Out', weight: 75 },
            { month: 'Nov', weight: 77 },
            { month: 'Dez', weight: 78 },
        ],
        currentWorkout: 'Treino Heavy Duty',
        currentDiet: 'Alto proteína - 2g/kg',
        history: [
            { id: '1', date: '2024-12-01', type: 'payment', description: 'Pagamento confirmado' },
            { id: '2', date: '2024-11-01', type: 'assessment', description: 'Avaliação física' },
        ],
    },
    {
        id: '10',
        name: 'Beatriz Almeida',
        avatar: 'BA',
        email: 'beatriz@email.com',
        phone: '+55 11 99999-1010',
        goal: 'Condicionamento',
        status: 'anual',
        daysRemaining: 200,
        isExpiring: false,
        startDate: '2024-05-01',
        checkinsCompleted: 65,
        adherenceRate: 90,
        nextAssessment: '2025-02-15',
        weightHistory: [
            { month: 'Jul', weight: 62 },
            { month: 'Ago', weight: 61 },
            { month: 'Set', weight: 60 },
            { month: 'Out', weight: 60 },
            { month: 'Nov', weight: 59 },
            { month: 'Dez', weight: 59 },
        ],
        currentWorkout: 'CrossFit adaptado',
        currentDiet: 'Manutenção calórica',
        history: [
            { id: '1', date: '2024-12-03', type: 'checkin', description: 'Check-in realizado' },
            { id: '2', date: '2024-11-15', type: 'renewal', description: 'Plano renovado' },
        ],
    },
    {
        id: '11',
        name: 'Gabriel Santos',
        avatar: 'GS',
        email: 'gabriel@email.com',
        phone: '+55 11 99999-1011',
        goal: 'Powerlifting',
        status: 'mensal',
        daysRemaining: 3,
        isExpiring: true,
        startDate: '2024-11-10',
        checkinsCompleted: 10,
        adherenceRate: 100,
        nextAssessment: '2024-12-25',
        weightHistory: [
            { month: 'Nov', weight: 90 },
            { month: 'Dez', weight: 91 },
        ],
        currentWorkout: 'Treino de força - 5x5',
        currentDiet: 'Alto carboidrato e proteína',
        history: [
            { id: '1', date: '2024-12-06', type: 'checkin', description: 'Check-in realizado' },
        ],
    },
];
