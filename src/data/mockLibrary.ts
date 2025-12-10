// Exercise and Food Library Data

export interface LibraryExercise {
    id: string;
    name: string;
    muscleGroup: string;
    equipment: string;
    instructions?: string;
    videoUrl?: string;
}

export interface LibraryFood {
    id: string;
    name: string;
    category: string;
    portion: number;
    measure: string;
    protein: number;
    carbs: number;
    fat: number;
    calories: number;
}

export interface LibraryDocument {
    id: string;
    title: string;
    type: 'pdf' | 'image' | 'video' | 'link';
    url: string;
    size?: string; // e.g., "2.4 MB"
    category: string;
    description?: string;
    createdAt: string;
}

export const muscleGroups = [
    'Peito', 'Costas', 'Ombros', 'Pernas', 'Bíceps', 'Tríceps', 'Abdômen', 'Cardio', 'Outros'
];

export const equipmentTypes = [
    'Halteres', 'Barra', 'Máquina', 'Polia', 'Peso Corporal', 'Elástico', 'Bola', 'Outros'
];

export const foodCategories = [
    'Proteínas', 'Carboidratos', 'Gorduras', 'Vegetais', 'Frutas', 'Bebidas', 'Suplementos', 'Outros'
];

export const documentCategories = [
    'E-books', 'Receitas', 'Tutoriais', 'Avaliações', 'Outros'
];

export const mockExercises: LibraryExercise[] = [
    { id: 'ex-17', name: 'Rosca Martelo', muscleGroup: 'Bíceps', equipment: 'Halteres' },
    { id: 'ex-18', name: 'Rosca Scott', muscleGroup: 'Bíceps', equipment: 'Barra' },

    // Tríceps
    { id: 'ex-19', name: 'Tríceps Corda', muscleGroup: 'Tríceps', equipment: 'Cabo' },
    { id: 'ex-20', name: 'Tríceps Testa', muscleGroup: 'Tríceps', equipment: 'Barra' },
    { id: 'ex-21', name: 'Tríceps Francês', muscleGroup: 'Tríceps', equipment: 'Halteres' },
    { id: 'ex-22', name: 'Mergulho', muscleGroup: 'Tríceps', equipment: 'Peso Corporal' },

    // Pernas
    { id: 'ex-23', name: 'Agachamento Livre', muscleGroup: 'Quadríceps', equipment: 'Barra', instructions: 'Desça até 90° ou mais, mantenha coluna neutra.' },
    { id: 'ex-24', name: 'Leg Press 45°', muscleGroup: 'Quadríceps', equipment: 'Máquina' },
    { id: 'ex-25', name: 'Cadeira Extensora', muscleGroup: 'Quadríceps', equipment: 'Máquina' },
    { id: 'ex-26', name: 'Afundo', muscleGroup: 'Quadríceps', equipment: 'Halteres' },
    { id: 'ex-27', name: 'Stiff', muscleGroup: 'Posterior', equipment: 'Barra' },
    { id: 'ex-28', name: 'Mesa Flexora', muscleGroup: 'Posterior', equipment: 'Máquina' },
    { id: 'ex-29', name: 'Levantamento Terra', muscleGroup: 'Posterior', equipment: 'Barra' },
    { id: 'ex-30', name: 'Panturrilha em Pé', muscleGroup: 'Panturrilha', equipment: 'Máquina' },

    // Abdômen
    { id: 'ex-31', name: 'Abdominal Crunch', muscleGroup: 'Abdômen', equipment: 'Peso Corporal' },
    { id: 'ex-32', name: 'Prancha', muscleGroup: 'Abdômen', equipment: 'Peso Corporal' },
    { id: 'ex-33', name: 'Elevação de Pernas', muscleGroup: 'Abdômen', equipment: 'Peso Corporal' },

    // Cardio
    { id: 'ex-34', name: 'Corrida Esteira', muscleGroup: 'Cardio', equipment: 'Esteira' },
    { id: 'ex-35', name: 'HIIT Bike', muscleGroup: 'Cardio', equipment: 'Bike' },
    { id: 'ex-36', name: 'Burpees', muscleGroup: 'Corpo Inteiro', equipment: 'Peso Corporal' },
];

export const mockFoods: LibraryFood[] = [
    // Proteínas
    { id: 'fd-1', name: 'Frango (Peito)', category: 'Proteínas', portion: 100, measure: 'g', protein: 31, carbs: 0, fat: 3.6, calories: 165 },
    { id: 'fd-2', name: 'Carne Bovina Magra', category: 'Proteínas', portion: 100, measure: 'g', protein: 26, carbs: 0, fat: 10, calories: 200 },
    { id: 'fd-3', name: 'Tilápia', category: 'Proteínas', portion: 100, measure: 'g', protein: 26, carbs: 0, fat: 2, calories: 128 },
    { id: 'fd-4', name: 'Salmão', category: 'Proteínas', portion: 100, measure: 'g', protein: 25, carbs: 0, fat: 13, calories: 208 },
    { id: 'fd-5', name: 'Ovo Inteiro', category: 'Proteínas', portion: 1, measure: 'un', protein: 6, carbs: 0.5, fat: 5, calories: 70 },
    { id: 'fd-6', name: 'Clara de Ovo', category: 'Proteínas', portion: 1, measure: 'un', protein: 3.5, carbs: 0, fat: 0, calories: 17 },
    { id: 'fd-7', name: 'Atum (Lata)', category: 'Proteínas', portion: 100, measure: 'g', protein: 25, carbs: 0, fat: 1, calories: 116 },

    // Carboidratos
    { id: 'fd-10', name: 'Arroz Branco', category: 'Carboidratos', portion: 100, measure: 'g', protein: 2.7, carbs: 28, fat: 0.3, calories: 130 },
    { id: 'fd-11', name: 'Arroz Integral', category: 'Carboidratos', portion: 100, measure: 'g', protein: 2.6, carbs: 23, fat: 0.9, calories: 111 },
    { id: 'fd-12', name: 'Batata Doce', category: 'Carboidratos', portion: 100, measure: 'g', protein: 1.6, carbs: 20, fat: 0, calories: 86 },
    { id: 'fd-13', name: 'Aveia', category: 'Carboidratos', portion: 100, measure: 'g', protein: 13, carbs: 66, fat: 7, calories: 389 },
    { id: 'fd-14', name: 'Pão Integral', category: 'Carboidratos', portion: 1, measure: 'fatia', protein: 4, carbs: 12, fat: 1, calories: 70 },
    { id: 'fd-15', name: 'Macarrão Integral', category: 'Carboidratos', portion: 100, measure: 'g', protein: 5, carbs: 26, fat: 1, calories: 131 },
    { id: 'fd-16', name: 'Feijão', category: 'Carboidratos', portion: 100, measure: 'g', protein: 9, carbs: 21, fat: 0.5, calories: 127 },

    // Gorduras
    { id: 'fd-20', name: 'Azeite Extra Virgem', category: 'Gorduras', portion: 15, measure: 'ml', protein: 0, carbs: 0, fat: 14, calories: 126 },
    { id: 'fd-21', name: 'Abacate', category: 'Gorduras', portion: 100, measure: 'g', protein: 2, carbs: 9, fat: 15, calories: 160 },
    { id: 'fd-22', name: 'Castanha de Caju', category: 'Gorduras', portion: 30, measure: 'g', protein: 5, carbs: 8, fat: 13, calories: 170 },
    { id: 'fd-23', name: 'Amendoim', category: 'Gorduras', portion: 30, measure: 'g', protein: 7, carbs: 5, fat: 14, calories: 170 },
    { id: 'fd-24', name: 'Pasta de Amendoim', category: 'Gorduras', portion: 30, measure: 'g', protein: 8, carbs: 6, fat: 15, calories: 188 },

    // Vegetais
    { id: 'fd-30', name: 'Brócolis', category: 'Vegetais', portion: 100, measure: 'g', protein: 2.8, carbs: 7, fat: 0.4, calories: 34 },
    { id: 'fd-31', name: 'Espinafre', category: 'Vegetais', portion: 100, measure: 'g', protein: 2.9, carbs: 3.6, fat: 0.4, calories: 23 },
    { id: 'fd-32', name: 'Alface', category: 'Vegetais', portion: 100, measure: 'g', protein: 1.4, carbs: 2.9, fat: 0.2, calories: 15 },
    { id: 'fd-33', name: 'Tomate', category: 'Vegetais', portion: 100, measure: 'g', protein: 0.9, carbs: 3.9, fat: 0.2, calories: 18 },

    // Frutas
    { id: 'fd-40', name: 'Banana', category: 'Frutas', portion: 1, measure: 'un', protein: 1.1, carbs: 27, fat: 0.3, calories: 105 },
    { id: 'fd-41', name: 'Maçã', category: 'Frutas', portion: 1, measure: 'un', protein: 0.5, carbs: 25, fat: 0.3, calories: 95 },
    { id: 'fd-42', name: 'Morango', category: 'Frutas', portion: 100, measure: 'g', protein: 0.7, carbs: 8, fat: 0.3, calories: 32 },

    // Laticínios
    { id: 'fd-50', name: 'Iogurte Grego Natural', category: 'Laticínios', portion: 170, measure: 'g', protein: 17, carbs: 6, fat: 0, calories: 100 },
    { id: 'fd-51', name: 'Queijo Cottage', category: 'Laticínios', portion: 100, measure: 'g', protein: 11, carbs: 3.4, fat: 4.3, calories: 98 },
    { id: 'fd-52', name: 'Leite Desnatado', category: 'Laticínios', portion: 200, measure: 'ml', protein: 7, carbs: 10, fat: 0.4, calories: 68 },

    // Suplementos
    { id: 'fd-60', name: 'Whey Protein', category: 'Suplementos', portion: 30, measure: 'g', protein: 24, carbs: 3, fat: 1, calories: 120 },
    { id: 'fd-61', name: 'Whey Isolado', category: 'Suplementos', portion: 30, measure: 'g', protein: 27, carbs: 1, fat: 0, calories: 115 },
    { id: 'fd-62', name: 'Caseína', category: 'Suplementos', portion: 30, measure: 'g', protein: 24, carbs: 3, fat: 1, calories: 120 },
    { id: 'fd-63', name: 'Maltodextrina', category: 'Suplementos', portion: 40, measure: 'g', protein: 0, carbs: 38, fat: 0, calories: 152 },
    { id: 'fd-64', name: 'Creatina', category: 'Suplementos', portion: 5, measure: 'g', protein: 0, carbs: 0, fat: 0, calories: 0 },
];

export const mockDocuments: LibraryDocument[] = [
    {
        id: 'doc1',
        title: 'Guia de Jejum Intermitente',
        type: 'pdf',
        url: '#',
        size: '2.4 MB',
        category: 'E-books',
        description: 'Um guia completo para iniciantes.',
        createdAt: '2024-03-10'
    },
    {
        id: 'doc2',
        title: 'Receitas Low Carb',
        type: 'pdf',
        url: '#',
        size: '5.1 MB',
        category: 'Receitas',
        description: '10 receitas fáceis para o jantar.',
        createdAt: '2024-03-12'
    },
    {
        id: 'doc3',
        title: 'Técnica de Agachamento',
        type: 'video',
        url: '#',
        size: '120 MB',
        category: 'Tutoriais',
        description: 'Vídeo explicativo sobre a postura correta.',
        createdAt: '2024-03-15'
    }
];
