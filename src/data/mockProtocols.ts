export type ProtocolType = 'workout' | 'diet' | 'combo';
export type ProtocolStatus = 'draft' | 'pending_review' | 'active';

export interface Exercise {
    id: string;
    name: string;
    sets: number;
    reps: string;
    load?: number;
    restSeconds: number;
    notes?: string;
}

export interface WorkoutDay {
    id: string;
    name: string;
    exercises: Exercise[];
}

export interface Food {
    id: string;
    name: string;
    quantity: number;
    measure: string;
    protein: number;
    carbs: number;
    fat: number;
    calories: number;
}

export interface Meal {
    id: string;
    name: string;
    time: string;
    foods: Food[];
}

export interface Protocol {
    id: string;
    name: string;
    type: ProtocolType;
    status: ProtocolStatus;
    aiGenerated?: boolean;
    description: string;
    workoutDays?: WorkoutDay[];
    meals?: Meal[];
    studentsUsing: string[];
    createdAt: string;
    updatedAt: string;
    content?: any;
    is_template?: boolean;
}

export const mockProtocols: Protocol[] = [
    {
        id: 'p1',
        status: 'active',
        name: 'Hipertrofia Iniciante',
        type: 'workout',
        description: 'Treino focado em ganho de massa muscular para iniciantes',
        workoutDays: [
            {
                id: 'd1',
                name: 'Treino A - Peito/Tríceps',
                exercises: [
                    { id: 'e1', name: 'Supino Reto', sets: 4, reps: '10-12', load: 40, restSeconds: 90, notes: 'Foco na execução' },
                    { id: 'e2', name: 'Supino Inclinado', sets: 3, reps: '12', load: 30, restSeconds: 60 },
                    { id: 'e3', name: 'Crucifixo', sets: 3, reps: '15', load: 12, restSeconds: 60 },
                    { id: 'e4', name: 'Tríceps Corda', sets: 4, reps: '12', load: 20, restSeconds: 45 },
                    { id: 'e5', name: 'Tríceps Testa', sets: 3, reps: '12', load: 15, restSeconds: 45 },
                ],
            },
            {
                id: 'd2',
                name: 'Treino B - Costas/Bíceps',
                exercises: [
                    { id: 'e6', name: 'Puxada Frontal', sets: 4, reps: '10-12', load: 50, restSeconds: 90 },
                    { id: 'e7', name: 'Remada Curvada', sets: 4, reps: '10', load: 40, restSeconds: 90 },
                    { id: 'e8', name: 'Remada Unilateral', sets: 3, reps: '12', load: 20, restSeconds: 60 },
                    { id: 'e9', name: 'Rosca Direta', sets: 4, reps: '12', load: 12, restSeconds: 45 },
                    { id: 'e10', name: 'Rosca Martelo', sets: 3, reps: '12', load: 10, restSeconds: 45 },
                ],
            },
            {
                id: 'd3',
                name: 'Treino C - Pernas',
                exercises: [
                    { id: 'e11', name: 'Agachamento', sets: 4, reps: '12', load: 60, restSeconds: 120 },
                    { id: 'e12', name: 'Leg Press', sets: 4, reps: '15', load: 150, restSeconds: 90 },
                    { id: 'e13', name: 'Cadeira Extensora', sets: 3, reps: '15', load: 40, restSeconds: 60 },
                    { id: 'e14', name: 'Mesa Flexora', sets: 3, reps: '15', load: 35, restSeconds: 60 },
                    { id: 'e15', name: 'Panturrilha', sets: 4, reps: '20', load: 80, restSeconds: 45 },
                ],
            },
        ],
        studentsUsing: ['1', '5', '11'],
        createdAt: '2024-10-01',
        updatedAt: '2024-11-15',
    },
    {
        id: 'p2',
        status: 'active',
        name: 'Treino Full Body',
        type: 'workout',
        description: 'Treino completo para todo o corpo em uma sessão',
        workoutDays: [
            {
                id: 'd1',
                name: 'Full Body',
                exercises: [
                    { id: 'e1', name: 'Agachamento', sets: 4, reps: '12', load: 50, restSeconds: 90 },
                    { id: 'e2', name: 'Supino', sets: 4, reps: '10', load: 40, restSeconds: 90 },
                    { id: 'e3', name: 'Remada', sets: 4, reps: '10', load: 35, restSeconds: 90 },
                    { id: 'e4', name: 'Desenvolvimento', sets: 3, reps: '12', load: 20, restSeconds: 60 },
                    { id: 'e5', name: 'Leg Press', sets: 3, reps: '15', load: 100, restSeconds: 60 },
                ],
            },
        ],
        studentsUsing: ['2'],
        createdAt: '2024-09-15',
        updatedAt: '2024-11-20',
    },
    {
        id: 'p3',
        status: 'active',
        name: 'Dieta Low Carb',
        type: 'diet',
        description: 'Plano alimentar com baixo carboidrato para emagrecimento',
        meals: [
            {
                id: 'm1',
                name: 'Café da Manhã',
                time: '07:00',
                foods: [
                    { id: 'f1', name: 'Ovos Mexidos', quantity: 3, measure: 'un', protein: 18, carbs: 1, fat: 15, calories: 210 },
                    { id: 'f2', name: 'Abacate', quantity: 50, measure: 'g', protein: 1, carbs: 4, fat: 8, calories: 80 },
                    { id: 'f3', name: 'Café sem açúcar', quantity: 200, measure: 'ml', protein: 0, carbs: 0, fat: 0, calories: 5 },
                ],
            },
            {
                id: 'm2',
                name: 'Lanche Manhã',
                time: '10:00',
                foods: [
                    { id: 'f4', name: 'Castanhas', quantity: 30, measure: 'g', protein: 4, carbs: 4, fat: 18, calories: 180 },
                    { id: 'f5', name: 'Queijo cottage', quantity: 50, measure: 'g', protein: 6, carbs: 1, fat: 2, calories: 50 },
                ],
            },
            {
                id: 'm3',
                name: 'Almoço',
                time: '12:30',
                foods: [
                    { id: 'f6', name: 'Frango Grelhado', quantity: 150, measure: 'g', protein: 45, carbs: 0, fat: 5, calories: 230 },
                    { id: 'f7', name: 'Salada Verde', quantity: 200, measure: 'g', protein: 2, carbs: 5, fat: 0, calories: 30 },
                    { id: 'f8', name: 'Azeite', quantity: 15, measure: 'ml', protein: 0, carbs: 0, fat: 15, calories: 135 },
                ],
            },
            {
                id: 'm4',
                name: 'Lanche Tarde',
                time: '16:00',
                foods: [
                    { id: 'f9', name: 'Iogurte Natural', quantity: 100, measure: 'g', protein: 5, carbs: 4, fat: 3, calories: 60 },
                    { id: 'f10', name: 'Chia', quantity: 15, measure: 'g', protein: 2, carbs: 5, fat: 5, calories: 70 },
                ],
            },
            {
                id: 'm5',
                name: 'Jantar',
                time: '19:30',
                foods: [
                    { id: 'f11', name: 'Peixe Grelhado', quantity: 150, measure: 'g', protein: 40, carbs: 0, fat: 8, calories: 230 },
                    { id: 'f12', name: 'Legumes Refogados', quantity: 150, measure: 'g', protein: 3, carbs: 10, fat: 3, calories: 80 },
                ],
            },
        ],
        studentsUsing: ['2', '8'],
        createdAt: '2024-09-01',
        updatedAt: '2024-11-01',
    },
    {
        id: 'p4',
        status: 'active',
        name: 'Dieta Bulk Limpo',
        type: 'diet',
        description: 'Dieta hipercalórica para ganho de massa magra',
        meals: [
            {
                id: 'm1',
                name: 'Café da Manhã',
                time: '06:30',
                foods: [
                    { id: 'f1', name: 'Ovos', quantity: 4, measure: 'un', protein: 24, carbs: 1, fat: 20, calories: 280 },
                    { id: 'f2', name: 'Pão Integral', quantity: 2, measure: 'fatias', protein: 6, carbs: 24, fat: 2, calories: 140 },
                    { id: 'f3', name: 'Banana', quantity: 1, measure: 'un', protein: 1, carbs: 27, fat: 0, calories: 105 },
                    { id: 'f4', name: 'Whey Protein', quantity: 30, measure: 'g', protein: 24, carbs: 3, fat: 1, calories: 120 },
                ],
            },
            {
                id: 'm2',
                name: 'Lanche Manhã',
                time: '09:30',
                foods: [
                    { id: 'f5', name: 'Batata Doce', quantity: 150, measure: 'g', protein: 2, carbs: 30, fat: 0, calories: 130 },
                    { id: 'f6', name: 'Frango Desfiado', quantity: 100, measure: 'g', protein: 30, carbs: 0, fat: 3, calories: 150 },
                ],
            },
            {
                id: 'm3',
                name: 'Almoço',
                time: '12:00',
                foods: [
                    { id: 'f7', name: 'Carne Vermelha', quantity: 200, measure: 'g', protein: 50, carbs: 0, fat: 15, calories: 340 },
                    { id: 'f8', name: 'Arroz', quantity: 150, measure: 'g', protein: 4, carbs: 40, fat: 0, calories: 180 },
                    { id: 'f9', name: 'Feijão', quantity: 100, measure: 'g', protein: 8, carbs: 20, fat: 1, calories: 120 },
                ],
            },
        ],
        studentsUsing: ['1', '5', '9', '11'],
        createdAt: '2024-10-15',
        updatedAt: '2024-11-28',
    },
    {
        id: 'p5',
        status: 'active',
        name: 'Protocolo Emagrecimento Acelerado',
        type: 'combo',
        description: 'Combo completo: treino HIIT + dieta low carb para máxima queima de gordura',
        workoutDays: [
            {
                id: 'd1',
                name: 'HIIT - Segunda/Quarta/Sexta',
                exercises: [
                    { id: 'e1', name: 'Sprint', sets: 8, reps: '30s', restSeconds: 30, notes: 'Máxima intensidade' },
                    { id: 'e2', name: 'Burpees', sets: 4, reps: '15', restSeconds: 20 },
                    { id: 'e3', name: 'Mountain Climbers', sets: 4, reps: '30s', restSeconds: 15 },
                    { id: 'e4', name: 'Jumping Jacks', sets: 4, reps: '45s', restSeconds: 15 },
                ],
            },
            {
                id: 'd2',
                name: 'Força - Terça/Quinta',
                exercises: [
                    { id: 'e5', name: 'Agachamento', sets: 4, reps: '15', load: 40, restSeconds: 60 },
                    { id: 'e6', name: 'Supino', sets: 4, reps: '12', load: 30, restSeconds: 60 },
                    { id: 'e7', name: 'Remada', sets: 4, reps: '12', load: 30, restSeconds: 60 },
                    { id: 'e8', name: 'Desenvolvimento', sets: 3, reps: '15', load: 15, restSeconds: 45 },
                ],
            },
        ],
        meals: [
            {
                id: 'm1',
                name: 'Café da Manhã',
                time: '07:00',
                foods: [
                    { id: 'f1', name: 'Ovos Mexidos', quantity: 3, measure: 'un', protein: 18, carbs: 1, fat: 15, calories: 210 },
                    { id: 'f2', name: 'Abacate', quantity: 50, measure: 'g', protein: 1, carbs: 4, fat: 8, calories: 80 },
                ],
            },
            {
                id: 'm2',
                name: 'Almoço',
                time: '12:00',
                foods: [
                    { id: 'f3', name: 'Frango Grelhado', quantity: 150, measure: 'g', protein: 45, carbs: 0, fat: 5, calories: 230 },
                    { id: 'f4', name: 'Salada', quantity: 200, measure: 'g', protein: 2, carbs: 5, fat: 0, calories: 30 },
                ],
            },
            {
                id: 'm3',
                name: 'Jantar',
                time: '19:00',
                foods: [
                    { id: 'f5', name: 'Peixe', quantity: 150, measure: 'g', protein: 40, carbs: 0, fat: 8, calories: 230 },
                    { id: 'f6', name: 'Legumes', quantity: 150, measure: 'g', protein: 3, carbs: 10, fat: 3, calories: 80 },
                ],
            },
        ],
        studentsUsing: ['3', '6'],
        createdAt: '2024-11-01',
        updatedAt: '2024-12-01',
    },
    {
        id: 'p6',
        status: 'active',
        name: 'Protocolo Ganho de Massa',
        type: 'combo',
        description: 'Combo hipertrofia + dieta hipercalórica para máximo ganho muscular',
        workoutDays: [
            {
                id: 'd1',
                name: 'Treino A - Peito/Ombro/Tríceps',
                exercises: [
                    { id: 'e1', name: 'Supino Reto', sets: 4, reps: '8-10', load: 50, restSeconds: 120 },
                    { id: 'e2', name: 'Supino Inclinado', sets: 4, reps: '10', load: 40, restSeconds: 90 },
                    { id: 'e3', name: 'Desenvolvimento', sets: 4, reps: '10', load: 25, restSeconds: 90 },
                    { id: 'e4', name: 'Elevação Lateral', sets: 3, reps: '15', load: 8, restSeconds: 45 },
                    { id: 'e5', name: 'Tríceps Corda', sets: 4, reps: '12', load: 25, restSeconds: 45 },
                ],
            },
            {
                id: 'd2',
                name: 'Treino B - Costas/Bíceps',
                exercises: [
                    { id: 'e6', name: 'Barra Fixa', sets: 4, reps: '8', restSeconds: 120 },
                    { id: 'e7', name: 'Remada Cavalinho', sets: 4, reps: '10', load: 60, restSeconds: 90 },
                    { id: 'e8', name: 'Puxada', sets: 4, reps: '10', load: 55, restSeconds: 90 },
                    { id: 'e9', name: 'Rosca Direta', sets: 4, reps: '10', load: 15, restSeconds: 60 },
                ],
            },
            {
                id: 'd3',
                name: 'Treino C - Pernas',
                exercises: [
                    { id: 'e10', name: 'Agachamento Livre', sets: 5, reps: '5', load: 80, restSeconds: 180, notes: 'Progressão de carga' },
                    { id: 'e11', name: 'Leg Press', sets: 4, reps: '12', load: 200, restSeconds: 90 },
                    { id: 'e12', name: 'Stiff', sets: 4, reps: '10', load: 50, restSeconds: 90 },
                    { id: 'e13', name: 'Panturrilha', sets: 5, reps: '15', load: 100, restSeconds: 45 },
                ],
            },
        ],
        meals: [
            {
                id: 'm1',
                name: 'Café da Manhã',
                time: '07:00',
                foods: [
                    { id: 'f1', name: 'Ovos', quantity: 4, measure: 'un', protein: 24, carbs: 1, fat: 20, calories: 280 },
                    { id: 'f2', name: 'Aveia', quantity: 60, measure: 'g', protein: 8, carbs: 40, fat: 5, calories: 230 },
                    { id: 'f3', name: 'Banana', quantity: 1, measure: 'un', protein: 1, carbs: 27, fat: 0, calories: 105 },
                ],
            },
            {
                id: 'm2',
                name: 'Pré-Treino',
                time: '15:00',
                foods: [
                    { id: 'f4', name: 'Batata Doce', quantity: 200, measure: 'g', protein: 3, carbs: 40, fat: 0, calories: 175 },
                    { id: 'f5', name: 'Frango', quantity: 150, measure: 'g', protein: 45, carbs: 0, fat: 5, calories: 230 },
                ],
            },
            {
                id: 'm3',
                name: 'Pós-Treino',
                time: '18:00',
                foods: [
                    { id: 'f6', name: 'Whey Protein', quantity: 40, measure: 'g', protein: 32, carbs: 4, fat: 1, calories: 160 },
                    { id: 'f7', name: 'Maltodextrina', quantity: 40, measure: 'g', protein: 0, carbs: 38, fat: 0, calories: 150 },
                ],
            },
        ],
        studentsUsing: ['7', '10'],
        createdAt: '2024-11-15',
        updatedAt: '2024-12-05',
    },
    {
        id: 'p7',
        status: 'active',
        name: 'Push Pull Legs',
        type: 'workout',
        description: 'Divisão clássica de treino para intermediários',
        workoutDays: [
            {
                id: 'd1',
                name: 'Push (Empurrar)',
                exercises: [
                    { id: 'e1', name: 'Supino Reto', sets: 4, reps: '8-10', load: 45, restSeconds: 120 },
                    { id: 'e2', name: 'Desenvolvimento', sets: 4, reps: '10', load: 22, restSeconds: 90 },
                    { id: 'e3', name: 'Tríceps Pulley', sets: 4, reps: '12', load: 20, restSeconds: 60 },
                ],
            },
            {
                id: 'd2',
                name: 'Pull (Puxar)',
                exercises: [
                    { id: 'e4', name: 'Barra Fixa', sets: 4, reps: '8', restSeconds: 120 },
                    { id: 'e5', name: 'Remada', sets: 4, reps: '10', load: 40, restSeconds: 90 },
                    { id: 'e6', name: 'Rosca Direta', sets: 4, reps: '12', load: 12, restSeconds: 60 },
                ],
            },
            {
                id: 'd3',
                name: 'Legs (Pernas)',
                exercises: [
                    { id: 'e7', name: 'Agachamento', sets: 4, reps: '10', load: 60, restSeconds: 120 },
                    { id: 'e8', name: 'Leg Press', sets: 4, reps: '12', load: 150, restSeconds: 90 },
                    { id: 'e9', name: 'Stiff', sets: 4, reps: '10', load: 40, restSeconds: 90 },
                ],
            },
        ],
        studentsUsing: ['9'],
        createdAt: '2024-08-01',
        updatedAt: '2024-10-10',
    },
    {
        id: 'p8',
        status: 'active',
        name: 'Dieta Manutenção',
        type: 'diet',
        description: 'Plano equilibrado para manter peso e composição corporal',
        meals: [
            {
                id: 'm1',
                name: 'Café da Manhã',
                time: '07:00',
                foods: [
                    { id: 'f1', name: 'Pão Integral', quantity: 2, measure: 'fatias', protein: 6, carbs: 24, fat: 2, calories: 140 },
                    { id: 'f2', name: 'Ovos', quantity: 2, measure: 'un', protein: 12, carbs: 0, fat: 10, calories: 140 },
                    { id: 'f3', name: 'Fruta', quantity: 1, measure: 'un', protein: 0, carbs: 20, fat: 0, calories: 80 },
                ],
            },
            {
                id: 'm2',
                name: 'Almoço',
                time: '12:00',
                foods: [
                    { id: 'f4', name: 'Proteína', quantity: 150, measure: 'g', protein: 40, carbs: 0, fat: 8, calories: 230 },
                    { id: 'f5', name: 'Arroz', quantity: 100, measure: 'g', protein: 3, carbs: 28, fat: 0, calories: 130 },
                    { id: 'f6', name: 'Salada', quantity: 150, measure: 'g', protein: 2, carbs: 5, fat: 0, calories: 30 },
                ],
            },
        ],
        studentsUsing: ['4', '10'],
        createdAt: '2024-08-10',
        updatedAt: '2024-10-20',
    },
    {
        id: 'p9',
        status: 'pending_review',
        aiGenerated: true,
        name: 'Hipertrofia Bulking - Homens 25-35',
        type: 'combo',
        description: 'Protocolo completo para ganho máximo de massa muscular. 5 dias de treino Push/Pull/Legs/Upper/Lower + dieta hipercalórica 3200kcal.',
        workoutDays: [
            {
                id: 'd1',
                name: 'Dia 1 - Push (Peito/Ombro/Tríceps)',
                exercises: [
                    { id: 'e1', name: 'Supino Reto com Barra', sets: 4, reps: '6-8', load: 70, restSeconds: 180, notes: 'Progressão semanal' },
                    { id: 'e2', name: 'Supino Inclinado Halteres', sets: 4, reps: '8-10', load: 28, restSeconds: 120 },
                    { id: 'e3', name: 'Desenvolvimento Militar', sets: 4, reps: '8-10', load: 40, restSeconds: 120 },
                    { id: 'e4', name: 'Elevação Lateral', sets: 4, reps: '12-15', load: 10, restSeconds: 60 },
                    { id: 'e5', name: 'Tríceps Francês', sets: 3, reps: '10-12', load: 25, restSeconds: 60 },
                    { id: 'e6', name: 'Tríceps Corda', sets: 3, reps: '12-15', load: 20, restSeconds: 45 },
                ],
            },
            {
                id: 'd2',
                name: 'Dia 2 - Pull (Costas/Bíceps)',
                exercises: [
                    { id: 'e7', name: 'Barra Fixa', sets: 4, reps: '6-8', restSeconds: 180, notes: 'Adicionar peso se fizer +8' },
                    { id: 'e8', name: 'Remada Curvada', sets: 4, reps: '8-10', load: 60, restSeconds: 120 },
                    { id: 'e9', name: 'Puxada Frontal', sets: 4, reps: '10-12', load: 55, restSeconds: 90 },
                    { id: 'e10', name: 'Remada Sentado Cabo', sets: 3, reps: '12', load: 50, restSeconds: 60 },
                    { id: 'e11', name: 'Rosca Direta', sets: 4, reps: '10-12', load: 18, restSeconds: 60 },
                    { id: 'e12', name: 'Rosca Martelo', sets: 3, reps: '12', load: 14, restSeconds: 45 },
                ],
            },
            {
                id: 'd3',
                name: 'Dia 3 - Legs (Quadríceps Focus)',
                exercises: [
                    { id: 'e13', name: 'Agachamento Livre', sets: 5, reps: '5-6', load: 100, restSeconds: 240, notes: 'Principal do dia' },
                    { id: 'e14', name: 'Leg Press 45°', sets: 4, reps: '10-12', load: 250, restSeconds: 120 },
                    { id: 'e15', name: 'Cadeira Extensora', sets: 4, reps: '12-15', load: 50, restSeconds: 60 },
                    { id: 'e16', name: 'Afundo Búlgaro', sets: 3, reps: '10 cada', load: 16, restSeconds: 90 },
                    { id: 'e17', name: 'Panturrilha em Pé', sets: 5, reps: '15-20', load: 100, restSeconds: 45 },
                ],
            },
            {
                id: 'd4',
                name: 'Dia 4 - Upper (Superior Geral)',
                exercises: [
                    { id: 'e18', name: 'Supino Inclinado Barra', sets: 4, reps: '8-10', load: 55, restSeconds: 120 },
                    { id: 'e19', name: 'Remada Cavalinho', sets: 4, reps: '8-10', load: 70, restSeconds: 120 },
                    { id: 'e20', name: 'Desenvolvimento Arnold', sets: 3, reps: '10-12', load: 18, restSeconds: 90 },
                    { id: 'e21', name: 'Puxada Supinada', sets: 3, reps: '10-12', load: 50, restSeconds: 90 },
                    { id: 'e22', name: 'Face Pull', sets: 4, reps: '15', load: 25, restSeconds: 45 },
                ],
            },
            {
                id: 'd5',
                name: 'Dia 5 - Lower (Posterior Focus)',
                exercises: [
                    { id: 'e23', name: 'Levantamento Terra', sets: 4, reps: '5-6', load: 120, restSeconds: 240, notes: 'Foco em forma' },
                    { id: 'e24', name: 'Stiff', sets: 4, reps: '8-10', load: 60, restSeconds: 120 },
                    { id: 'e25', name: 'Mesa Flexora', sets: 4, reps: '10-12', load: 45, restSeconds: 60 },
                    { id: 'e26', name: 'Glúteo na Máquina', sets: 3, reps: '12-15', load: 40, restSeconds: 60 },
                    { id: 'e27', name: 'Panturrilha Sentado', sets: 4, reps: '15-20', load: 50, restSeconds: 45 },
                ],
            },
        ],
        meals: [
            {
                id: 'm1',
                name: 'Café da Manhã (7h)',
                time: '07:00',
                foods: [
                    { id: 'f1', name: 'Ovos Inteiros', quantity: 4, measure: 'un', protein: 24, carbs: 2, fat: 20, calories: 280 },
                    { id: 'f2', name: 'Aveia em Flocos', quantity: 80, measure: 'g', protein: 10, carbs: 52, fat: 6, calories: 300 },
                    { id: 'f3', name: 'Banana', quantity: 2, measure: 'un', protein: 2, carbs: 54, fat: 0, calories: 210 },
                    { id: 'f4', name: 'Pasta de Amendoim', quantity: 30, measure: 'g', protein: 8, carbs: 6, fat: 15, calories: 185 },
                ],
            },
            {
                id: 'm2',
                name: 'Lanche Manhã (10h)',
                time: '10:00',
                foods: [
                    { id: 'f5', name: 'Whey Protein', quantity: 30, measure: 'g', protein: 24, carbs: 3, fat: 1, calories: 120 },
                    { id: 'f6', name: 'Batata Doce', quantity: 200, measure: 'g', protein: 3, carbs: 40, fat: 0, calories: 175 },
                ],
            },
            {
                id: 'm3',
                name: 'Almoço (13h)',
                time: '13:00',
                foods: [
                    { id: 'f7', name: 'Frango Grelhado', quantity: 200, measure: 'g', protein: 60, carbs: 0, fat: 6, calories: 300 },
                    { id: 'f8', name: 'Arroz Branco', quantity: 200, measure: 'g', protein: 5, carbs: 56, fat: 0, calories: 250 },
                    { id: 'f9', name: 'Feijão', quantity: 100, measure: 'g', protein: 8, carbs: 20, fat: 1, calories: 120 },
                    { id: 'f10', name: 'Salada Verde', quantity: 100, measure: 'g', protein: 2, carbs: 4, fat: 0, calories: 25 },
                    { id: 'f11', name: 'Azeite Extra Virgem', quantity: 15, measure: 'ml', protein: 0, carbs: 0, fat: 15, calories: 135 },
                ],
            },
            {
                id: 'm4',
                name: 'Pré-Treino (16h)',
                time: '16:00',
                foods: [
                    { id: 'f12', name: 'Pão Integral', quantity: 4, measure: 'fatias', protein: 12, carbs: 48, fat: 4, calories: 280 },
                    { id: 'f13', name: 'Peito de Peru', quantity: 100, measure: 'g', protein: 20, carbs: 2, fat: 2, calories: 105 },
                    { id: 'f14', name: 'Mel', quantity: 20, measure: 'g', protein: 0, carbs: 17, fat: 0, calories: 65 },
                ],
            },
            {
                id: 'm5',
                name: 'Pós-Treino (19h)',
                time: '19:00',
                foods: [
                    { id: 'f15', name: 'Whey Protein', quantity: 40, measure: 'g', protein: 32, carbs: 4, fat: 1, calories: 160 },
                    { id: 'f16', name: 'Dextrose', quantity: 50, measure: 'g', protein: 0, carbs: 50, fat: 0, calories: 200 },
                    { id: 'f17', name: 'Creatina', quantity: 5, measure: 'g', protein: 0, carbs: 0, fat: 0, calories: 0 },
                ],
            },
            {
                id: 'm6',
                name: 'Jantar (21h)',
                time: '21:00',
                foods: [
                    { id: 'f18', name: 'Carne Vermelha Magra', quantity: 200, measure: 'g', protein: 50, carbs: 0, fat: 12, calories: 310 },
                    { id: 'f19', name: 'Macarrão Integral', quantity: 100, measure: 'g', protein: 5, carbs: 35, fat: 1, calories: 170 },
                    { id: 'f20', name: 'Brócolis', quantity: 150, measure: 'g', protein: 4, carbs: 10, fat: 0, calories: 50 },
                ],
            },
        ],
        studentsUsing: [],
        createdAt: '2024-12-01',
        updatedAt: '2024-12-08',
    },
    {
        id: 'p10',
        status: 'pending_review',
        aiGenerated: true,
        name: 'Definição Cutting - Homens 25-35',
        type: 'combo',
        description: 'Protocolo para definição muscular. 5 dias de treino intenso + dieta moderada 2200kcal com alto proteína.',
        workoutDays: [
            {
                id: 'd1',
                name: 'Dia 1 - Peito + Cardio',
                exercises: [
                    { id: 'e1', name: 'Supino Inclinado', sets: 4, reps: '8-10', load: 50, restSeconds: 90 },
                    { id: 'e2', name: 'Cross Over', sets: 4, reps: '12-15', load: 20, restSeconds: 60 },
                    { id: 'e3', name: 'Flexão de Braços', sets: 3, reps: 'até falha', restSeconds: 60 },
                    { id: 'e4', name: 'HIIT Bike', sets: 8, reps: '30s sprint / 30s leve', restSeconds: 0, notes: 'Pós musculação' },
                ],
            },
            {
                id: 'd2',
                name: 'Dia 2 - Costas + Cardio',
                exercises: [
                    { id: 'e5', name: 'Puxada Frontal', sets: 4, reps: '10-12', load: 50, restSeconds: 90 },
                    { id: 'e6', name: 'Remada Unilateral', sets: 4, reps: '10-12', load: 22, restSeconds: 60 },
                    { id: 'e7', name: 'Pulldown Corda', sets: 3, reps: '15', load: 30, restSeconds: 45 },
                    { id: 'e8', name: 'Esteira Inclinada', sets: 1, reps: '20 min', restSeconds: 0, notes: 'Inclinação 10-12%' },
                ],
            },
            {
                id: 'd3',
                name: 'Dia 3 - Pernas A (Quadríceps)',
                exercises: [
                    { id: 'e9', name: 'Agachamento Frontal', sets: 4, reps: '8-10', load: 60, restSeconds: 120 },
                    { id: 'e10', name: 'Leg Press', sets: 4, reps: '12-15', load: 180, restSeconds: 90 },
                    { id: 'e11', name: 'Cadeira Extensora Drop Set', sets: 3, reps: '12+10+8', load: 45, restSeconds: 60, notes: 'Diminuir peso' },
                    { id: 'e12', name: 'Panturrilha', sets: 4, reps: '20', load: 80, restSeconds: 30 },
                ],
            },
            {
                id: 'd4',
                name: 'Dia 4 - Ombros + Braços',
                exercises: [
                    { id: 'e13', name: 'Desenvolvimento', sets: 4, reps: '10-12', load: 35, restSeconds: 90 },
                    { id: 'e14', name: 'Elevação Lateral', sets: 4, reps: '15', load: 8, restSeconds: 45 },
                    { id: 'e15', name: 'Rosca Alternada', sets: 3, reps: '12', load: 12, restSeconds: 45 },
                    { id: 'e16', name: 'Tríceps Pulley', sets: 3, reps: '15', load: 25, restSeconds: 45 },
                    { id: 'e17', name: 'Abs Crunch Máquina', sets: 4, reps: '20', load: 30, restSeconds: 30 },
                ],
            },
            {
                id: 'd5',
                name: 'Dia 5 - Pernas B (Posterior) + Cardio',
                exercises: [
                    { id: 'e18', name: 'Stiff', sets: 4, reps: '10-12', load: 50, restSeconds: 90 },
                    { id: 'e19', name: 'Mesa Flexora', sets: 4, reps: '12-15', load: 40, restSeconds: 60 },
                    { id: 'e20', name: 'Cadeira Abdutora', sets: 3, reps: '15', load: 40, restSeconds: 45 },
                    { id: 'e21', name: 'HIIT Escada', sets: 6, reps: '1 min intenso / 1 min leve', restSeconds: 0 },
                ],
            },
        ],
        meals: [
            {
                id: 'm1',
                name: 'Café da Manhã (7h)',
                time: '07:00',
                foods: [
                    { id: 'f1', name: 'Claras de Ovo', quantity: 6, measure: 'un', protein: 21, carbs: 0, fat: 0, calories: 100 },
                    { id: 'f2', name: 'Ovo Inteiro', quantity: 2, measure: 'un', protein: 12, carbs: 1, fat: 10, calories: 140 },
                    { id: 'f3', name: 'Aveia', quantity: 40, measure: 'g', protein: 5, carbs: 26, fat: 3, calories: 150 },
                    { id: 'f4', name: 'Café Preto', quantity: 200, measure: 'ml', protein: 0, carbs: 0, fat: 0, calories: 5 },
                ],
            },
            {
                id: 'm2',
                name: 'Lanche Manhã (10h)',
                time: '10:00',
                foods: [
                    { id: 'f5', name: 'Whey Isolado', quantity: 30, measure: 'g', protein: 27, carbs: 1, fat: 0, calories: 115 },
                    { id: 'f6', name: 'Maçã', quantity: 1, measure: 'un', protein: 0, carbs: 20, fat: 0, calories: 80 },
                ],
            },
            {
                id: 'm3',
                name: 'Almoço (13h)',
                time: '13:00',
                foods: [
                    { id: 'f7', name: 'Tilápia Grelhada', quantity: 200, measure: 'g', protein: 52, carbs: 0, fat: 4, calories: 250 },
                    { id: 'f8', name: 'Batata Doce', quantity: 150, measure: 'g', protein: 2, carbs: 30, fat: 0, calories: 130 },
                    { id: 'f9', name: 'Brócolis + Aspargos', quantity: 200, measure: 'g', protein: 6, carbs: 12, fat: 0, calories: 70 },
                ],
            },
            {
                id: 'm4',
                name: 'Pré-Treino (16h)',
                time: '16:00',
                foods: [
                    { id: 'f10', name: 'Frango Desfiado', quantity: 100, measure: 'g', protein: 30, carbs: 0, fat: 3, calories: 150 },
                    { id: 'f11', name: 'Arroz Integral', quantity: 80, measure: 'g', protein: 2, carbs: 22, fat: 1, calories: 100 },
                ],
            },
            {
                id: 'm5',
                name: 'Jantar (20h)',
                time: '20:00',
                foods: [
                    { id: 'f12', name: 'Carne Magra', quantity: 180, measure: 'g', protein: 45, carbs: 0, fat: 8, calories: 250 },
                    { id: 'f13', name: 'Salada Verde Grande', quantity: 250, measure: 'g', protein: 3, carbs: 8, fat: 0, calories: 45 },
                    { id: 'f14', name: 'Azeite', quantity: 10, measure: 'ml', protein: 0, carbs: 0, fat: 10, calories: 90 },
                ],
            },
        ],
        studentsUsing: [],
        createdAt: '2024-12-01',
        updatedAt: '2024-12-08',
    },
    {
        id: 'p11',
        status: 'pending_review',
        aiGenerated: true,
        name: 'Emagrecimento Intensivo - Homens 25-35',
        type: 'combo',
        description: 'Protocolo para perda de gordura agressiva. 4 dias musculação + 2 cardio + dieta déficit 1800kcal.',
        workoutDays: [
            {
                id: 'd1',
                name: 'Segunda - Full Body A',
                exercises: [
                    { id: 'e1', name: 'Agachamento', sets: 4, reps: '12-15', load: 50, restSeconds: 60 },
                    { id: 'e2', name: 'Supino Máquina', sets: 4, reps: '12-15', load: 40, restSeconds: 60 },
                    { id: 'e3', name: 'Puxada Frontal', sets: 4, reps: '12-15', load: 45, restSeconds: 60 },
                    { id: 'e4', name: 'Desenvolvimento', sets: 3, reps: '15', load: 20, restSeconds: 45 },
                    { id: 'e5', name: 'Abdominal Prancha', sets: 3, reps: '45s', restSeconds: 30 },
                ],
            },
            {
                id: 'd2',
                name: 'Terça - HIIT Cardio',
                exercises: [
                    { id: 'e6', name: 'Aquecimento Bike', sets: 1, reps: '5 min', restSeconds: 0 },
                    { id: 'e7', name: 'Sprint Esteira', sets: 10, reps: '30s máximo', restSeconds: 30, notes: 'Vel 14-16km/h' },
                    { id: 'e8', name: 'Burpees', sets: 4, reps: '15', restSeconds: 30 },
                    { id: 'e9', name: 'Mountain Climbers', sets: 4, reps: '40s', restSeconds: 20 },
                    { id: 'e10', name: 'Cooldown', sets: 1, reps: '5 min', restSeconds: 0 },
                ],
            },
            {
                id: 'd3',
                name: 'Quarta - Full Body B',
                exercises: [
                    { id: 'e11', name: 'Leg Press', sets: 4, reps: '15', load: 120, restSeconds: 60 },
                    { id: 'e12', name: 'Remada Sentada', sets: 4, reps: '15', load: 40, restSeconds: 60 },
                    { id: 'e13', name: 'Supino Inclinado', sets: 4, reps: '12', load: 35, restSeconds: 60 },
                    { id: 'e14', name: 'Elevação Lateral', sets: 3, reps: '15', load: 6, restSeconds: 45 },
                    { id: 'e15', name: 'Abdominal Infra', sets: 3, reps: '20', restSeconds: 30 },
                ],
            },
            {
                id: 'd4',
                name: 'Quinta - LISS Cardio',
                exercises: [
                    { id: 'e16', name: 'Caminhada Inclinada', sets: 1, reps: '45 min', restSeconds: 0, notes: 'Inclinação 10-12%, Vel 5-6km/h' },
                ],
            },
            {
                id: 'd5',
                name: 'Sexta - Full Body C (Circuito)',
                exercises: [
                    { id: 'e17', name: 'Kettlebell Swing', sets: 4, reps: '20', load: 16, restSeconds: 20 },
                    { id: 'e18', name: 'Flexão de Braços', sets: 4, reps: '15', restSeconds: 20 },
                    { id: 'e19', name: 'Afundo Alternado', sets: 4, reps: '20 total', load: 10, restSeconds: 20 },
                    { id: 'e20', name: 'Remada Curvada', sets: 4, reps: '12', load: 30, restSeconds: 20 },
                    { id: 'e21', name: 'Jump Squat', sets: 4, reps: '15', restSeconds: 30, notes: '2 rounds do circuito' },
                ],
            },
            {
                id: 'd6',
                name: 'Sábado - Cardio Opcional',
                exercises: [
                    { id: 'e22', name: 'Atividade ao Ar Livre', sets: 1, reps: '30-45 min', restSeconds: 0, notes: 'Bike, corrida leve, natação' },
                ],
            },
        ],
        meals: [
            {
                id: 'm1',
                name: 'Café da Manhã (7h)',
                time: '07:00',
                foods: [
                    { id: 'f1', name: 'Omelete (3 ovos)', quantity: 3, measure: 'un', protein: 18, carbs: 1, fat: 15, calories: 210 },
                    { id: 'f2', name: 'Tomate + Espinafre', quantity: 80, measure: 'g', protein: 2, carbs: 4, fat: 0, calories: 25 },
                    { id: 'f3', name: 'Café sem açúcar', quantity: 200, measure: 'ml', protein: 0, carbs: 0, fat: 0, calories: 5 },
                ],
            },
            {
                id: 'm2',
                name: 'Lanche Manhã (10h)',
                time: '10:00',
                foods: [
                    { id: 'f4', name: 'Iogurte Grego 0%', quantity: 170, measure: 'g', protein: 17, carbs: 6, fat: 0, calories: 100 },
                    { id: 'f5', name: 'Morango', quantity: 100, measure: 'g', protein: 1, carbs: 8, fat: 0, calories: 35 },
                ],
            },
            {
                id: 'm3',
                name: 'Almoço (13h)',
                time: '13:00',
                foods: [
                    { id: 'f6', name: 'Peito de Frango', quantity: 180, measure: 'g', protein: 54, carbs: 0, fat: 5, calories: 265 },
                    { id: 'f7', name: 'Salada Mista Grande', quantity: 250, measure: 'g', protein: 4, carbs: 10, fat: 0, calories: 55 },
                    { id: 'f8', name: 'Azeite + Limão', quantity: 10, measure: 'ml', protein: 0, carbs: 0, fat: 10, calories: 90 },
                ],
            },
            {
                id: 'm4',
                name: 'Lanche Tarde (16h)',
                time: '16:00',
                foods: [
                    { id: 'f9', name: 'Whey Protein', quantity: 30, measure: 'g', protein: 24, carbs: 3, fat: 1, calories: 120 },
                    { id: 'f10', name: 'Castanhas', quantity: 15, measure: 'g', protein: 2, carbs: 2, fat: 9, calories: 90 },
                ],
            },
            {
                id: 'm5',
                name: 'Jantar (19h)',
                time: '19:00',
                foods: [
                    { id: 'f11', name: 'Peixe Branco', quantity: 200, measure: 'g', protein: 44, carbs: 0, fat: 2, calories: 200 },
                    { id: 'f12', name: 'Legumes no Vapor', quantity: 200, measure: 'g', protein: 4, carbs: 14, fat: 0, calories: 70 },
                ],
            },
        ],
        studentsUsing: [],
        createdAt: '2024-12-01',
        updatedAt: '2024-12-08',
    },
];

