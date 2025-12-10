export interface StudentProfile {
    id: string;
    name: string;
    avatar: string;
    points: number;
    streakDays: number;
    nextRewardPoints: number;
    currentReward: string;
}

export interface TodayExercise {
    id: string;
    name: string;
    sets: number;
    reps: string;
    completed: boolean;
}

export interface TodayWorkout {
    id: string;
    name: string;
    type: string;
    exercises: TodayExercise[];
}

export interface StudentMeal {
    id: string;
    name: string;
    time: string;
    foods: string[];
    calories: number;
    consumed: boolean;
}

export interface MacroSummary {
    protein: { current: number; target: number };
    carbs: { current: number; target: number };
    fat: { current: number; target: number };
}

export const studentProfile: StudentProfile = {
    id: '1',
    name: 'João',
    avatar: 'JS',
    points: 1250,
    streakDays: 5,
    nextRewardPoints: 1500,
    currentReward: 'Camiseta Exclusiva',
};

export const todayWorkout: TodayWorkout = {
    id: 'w1',
    name: 'Treino A - Inferiores',
    type: 'Pernas e Glúteos',
    exercises: [
        { id: 'e1', name: 'Agachamento Livre', sets: 4, reps: '10-12', completed: false },
        { id: 'e2', name: 'Leg Press 45°', sets: 4, reps: '12', completed: false },
        { id: 'e3', name: 'Cadeira Extensora', sets: 3, reps: '15', completed: false },
        { id: 'e4', name: 'Mesa Flexora', sets: 3, reps: '12', completed: false },
        { id: 'e5', name: 'Panturrilha', sets: 4, reps: '20', completed: false },
        { id: 'e6', name: 'Abdominais', sets: 3, reps: '20', completed: false },
    ],
};

export const weekWorkouts: { [key: string]: TodayWorkout } = {
    seg: {
        id: 'w1',
        name: 'Treino A - Inferiores',
        type: 'Pernas',
        exercises: todayWorkout.exercises,
    },
    ter: {
        id: 'w2',
        name: 'Treino B - Superiores',
        type: 'Peito e Tríceps',
        exercises: [
            { id: 'e1', name: 'Supino Reto', sets: 4, reps: '10', completed: false },
            { id: 'e2', name: 'Supino Inclinado', sets: 3, reps: '12', completed: false },
            { id: 'e3', name: 'Crucifixo', sets: 3, reps: '15', completed: false },
            { id: 'e4', name: 'Tríceps Corda', sets: 4, reps: '12', completed: false },
            { id: 'e5', name: 'Tríceps Francês', sets: 3, reps: '12', completed: false },
        ],
    },
    qua: {
        id: 'w3',
        name: 'Descanso',
        type: 'Recuperação',
        exercises: [],
    },
    qui: {
        id: 'w4',
        name: 'Treino C - Costas',
        type: 'Costas e Bíceps',
        exercises: [
            { id: 'e1', name: 'Puxada Frontal', sets: 4, reps: '10', completed: false },
            { id: 'e2', name: 'Remada Curvada', sets: 4, reps: '10', completed: false },
            { id: 'e3', name: 'Pulldown', sets: 3, reps: '12', completed: false },
            { id: 'e4', name: 'Rosca Direta', sets: 3, reps: '12', completed: false },
            { id: 'e5', name: 'Rosca Martelo', sets: 3, reps: '12', completed: false },
        ],
    },
    sex: {
        id: 'w5',
        name: 'Treino D - Ombros',
        type: 'Ombros e Abdômen',
        exercises: [
            { id: 'e1', name: 'Desenvolvimento', sets: 4, reps: '10', completed: false },
            { id: 'e2', name: 'Elevação Lateral', sets: 4, reps: '15', completed: false },
            { id: 'e3', name: 'Elevação Frontal', sets: 3, reps: '12', completed: false },
            { id: 'e4', name: 'Encolhimento', sets: 4, reps: '12', completed: false },
        ],
    },
    sab: {
        id: 'w6',
        name: 'Descanso',
        type: 'Recuperação',
        exercises: [],
    },
    dom: {
        id: 'w7',
        name: 'Descanso',
        type: 'Recuperação',
        exercises: [],
    },
};

export const todayMeals: StudentMeal[] = [
    {
        id: 'm1',
        name: 'Café da Manhã',
        time: '07:00',
        foods: ['4 ovos mexidos', '2 fatias pão integral', '1 banana', 'Café sem açúcar'],
        calories: 520,
        consumed: true,
    },
    {
        id: 'm2',
        name: 'Lanche da Manhã',
        time: '10:00',
        foods: ['Whey protein', '1 maçã'],
        calories: 250,
        consumed: true,
    },
    {
        id: 'm3',
        name: 'Almoço',
        time: '12:30',
        foods: ['200g frango grelhado', '150g arroz integral', 'Salada verde', 'Azeite'],
        calories: 650,
        consumed: false,
    },
    {
        id: 'm4',
        name: 'Lanche da Tarde',
        time: '16:00',
        foods: ['Castanhas (30g)', 'Iogurte natural'],
        calories: 280,
        consumed: false,
    },
    {
        id: 'm5',
        name: 'Jantar',
        time: '19:30',
        foods: ['150g carne vermelha', 'Legumes refogados', 'Batata doce'],
        calories: 550,
        consumed: false,
    },
];

export const macroSummary: MacroSummary = {
    protein: { current: 95, target: 180 },
    carbs: { current: 120, target: 250 },
    fat: { current: 45, target: 70 },
};
