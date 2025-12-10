/**
 * AI Diagnostic Service
 * 
 * Provides AI-powered analysis of student anamnese data and
 * protocol generation based on goals, health conditions, and preferences.
 */

import { AnamneseFormData } from '../pages/AnamnesePublic';

// Types for AI analysis results
export interface AIDiagnostic {
    summary: string;
    keyFactors: KeyFactor[];
    recommendations: string[];
    trainingFocus: string;
    dietFocus: string;
    riskAlerts: RiskAlert[];
    suggestedCalories: number;
    macros: {
        protein: number;  // g/kg
        carbs: number;    // g/kg
        fat: number;      // g/kg
    };
}

export interface KeyFactor {
    icon: 'alert' | 'info' | 'success' | 'warning';
    text: string;
    severity: 'low' | 'medium' | 'high';
}

export interface RiskAlert {
    type: 'health' | 'limitation' | 'medication';
    message: string;
    recommendation: string;
}

export interface GeneratedProtocol {
    workout: WorkoutProtocol;
    diet: DietProtocol;
}

export interface WorkoutProtocol {
    name: string;
    description: string;
    frequency: string;
    duration: string;
    days: WorkoutDay[];
}

export interface WorkoutDay {
    name: string;
    focus: string;
    exercises: Exercise[];
}

export interface Exercise {
    name: string;
    sets: number;
    reps: string;
    rest: string;
    notes?: string;
}

export interface DietProtocol {
    name: string;
    description: string;
    totalCalories: number;
    macros: {
        protein: number;
        carbs: number;
        fat: number;
    };
    meals: Meal[];
}

export interface Meal {
    name: string;
    time: string;
    foods: Food[];
    calories: number;
}

export interface Food {
    name: string;
    quantity: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

// Goal-based configuration
const goalConfigs: Record<string, {
    trainingType: string;
    calorieModifier: number;  // 1 = maintenance, >1 = surplus, <1 = deficit
    proteinPerKg: number;
    carbsPerKg: number;
    fatPerKg: number;
    focus: string;
}> = {
    'reeducacao': {
        trainingType: 'Moderado',
        calorieModifier: 0.9,
        proteinPerKg: 1.6,
        carbsPerKg: 3,
        fatPerKg: 0.8,
        focus: 'Equilíbrio e hábitos saudáveis'
    },
    'perda_peso': {
        trainingType: 'HIIT + Força',
        calorieModifier: 0.8,
        proteinPerKg: 2.0,
        carbsPerKg: 2.5,
        fatPerKg: 0.7,
        focus: 'Déficit calórico com preservação muscular'
    },
    'massa_magra': {
        trainingType: 'Hipertrofia',
        calorieModifier: 1.15,
        proteinPerKg: 2.2,
        carbsPerKg: 4,
        fatPerKg: 0.9,
        focus: 'Superávit calórico para ganho de massa'
    },
    'saude': {
        trainingType: 'Funcional',
        calorieModifier: 1.0,
        proteinPerKg: 1.4,
        carbsPerKg: 3.5,
        fatPerKg: 0.9,
        focus: 'Saúde geral e qualidade de vida'
    },
    'outros': {
        trainingType: 'Personalizado',
        calorieModifier: 1.0,
        proteinPerKg: 1.6,
        carbsPerKg: 3,
        fatPerKg: 0.8,
        focus: 'Avaliação individual necessária'
    }
};

/**
 * Analyze anamnese data and generate AI diagnostic
 */
export async function analyzeAnamnese(anamnese: AnamneseFormData): Promise<AIDiagnostic> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const weight = parseFloat(anamnese.weight) || 70;
    const height = parseFloat(anamnese.height) || 170;
    const age = parseInt(anamnese.age) || 30;
    const goal = anamnese.goal || 'saude';

    const config = goalConfigs[goal] || goalConfigs['saude'];

    // Calculate BMR (Mifflin-St Jeor)
    const bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    const tdee = bmr * 1.55; // Moderate activity
    const targetCalories = Math.round(tdee * config.calorieModifier);

    // Build key factors
    const keyFactors: KeyFactor[] = [];
    const riskAlerts: RiskAlert[] = [];
    const recommendations: string[] = [];

    // Analyze goal
    keyFactors.push({
        icon: 'info',
        text: `Objetivo: ${getGoalLabel(goal)}`,
        severity: 'low'
    });

    // Analyze health issues
    if (anamnese.healthIssues && anamnese.healthIssues.toLowerCase() !== 'não' && anamnese.healthIssues.toLowerCase() !== 'nenhum') {
        keyFactors.push({
            icon: 'alert',
            text: `Condição de saúde: ${anamnese.healthIssues.substring(0, 50)}...`,
            severity: 'high'
        });
        riskAlerts.push({
            type: 'health',
            message: anamnese.healthIssues,
            recommendation: 'Considerar avaliação médica antes de iniciar protocolo intenso'
        });
    }

    // Analyze physical limitations
    if (anamnese.physicalLimitations && anamnese.physicalLimitations.toLowerCase() !== 'não' && anamnese.physicalLimitations.toLowerCase() !== 'nenhum') {
        keyFactors.push({
            icon: 'warning',
            text: `Limitação física: ${anamnese.physicalLimitations.substring(0, 50)}...`,
            severity: 'medium'
        });
        recommendations.push('Adaptar exercícios considerando as limitações físicas');
        riskAlerts.push({
            type: 'limitation',
            message: anamnese.physicalLimitations,
            recommendation: 'Evitar movimentos que agravem a condição'
        });
    }

    // Analyze medications
    if (anamnese.medications && anamnese.medications.toLowerCase() !== 'não' && anamnese.medications.toLowerCase() !== 'nenhum') {
        keyFactors.push({
            icon: 'info',
            text: `Usa medicamentos: ${anamnese.medications.substring(0, 30)}`,
            severity: 'medium'
        });
        riskAlerts.push({
            type: 'medication',
            message: anamnese.medications,
            recommendation: 'Verificar interações com suplementos'
        });
    }

    // Analyze training experience
    if (anamnese.alreadyTrains && anamnese.alreadyTrains.toLowerCase().includes('sim')) {
        keyFactors.push({
            icon: 'success',
            text: 'Já possui experiência com treino',
            severity: 'low'
        });
    } else {
        keyFactors.push({
            icon: 'info',
            text: 'Iniciante - adaptação necessária',
            severity: 'low'
        });
        recommendations.push('Começar com volume e intensidade reduzidos nas primeiras semanas');
    }

    // Analyze allergies
    if (anamnese.allergies && anamnese.allergies.toLowerCase() !== 'não' && anamnese.allergies.toLowerCase() !== 'nenhum') {
        keyFactors.push({
            icon: 'alert',
            text: `Alergias: ${anamnese.allergies}`,
            severity: 'high'
        });
        recommendations.push(`Evitar alimentos contendo ${anamnese.allergies}`);
    }

    // Add standard recommendations based on goal
    recommendations.push(`Priorizar ${config.proteinPerKg}g de proteína por kg de peso corporal`);
    recommendations.push(`Manter hidratação adequada (mínimo 35ml/kg)`);

    if (goal === 'perda_peso') {
        recommendations.push('Incluir cardio HIIT 2-3x por semana');
        recommendations.push('Manter déficit calórico moderado sem extremos');
    } else if (goal === 'massa_magra') {
        recommendations.push('Priorizar treino de força com progressão de carga');
        recommendations.push('Consumir carboidratos pré e pós-treino');
    }

    // Build summary
    const summary = buildSummary(anamnese, goal, config);

    return {
        summary,
        keyFactors,
        recommendations,
        trainingFocus: `Treino ${config.trainingType} com foco em ${config.focus}. ${anamnese.trainingDays || '3x por semana'}.`,
        dietFocus: `${targetCalories}kcal diárias. Distribuição: ${Math.round(config.proteinPerKg * weight)}g proteína, ${Math.round(config.carbsPerKg * weight)}g carboidratos, ${Math.round(config.fatPerKg * weight)}g gorduras.`,
        riskAlerts,
        suggestedCalories: targetCalories,
        macros: {
            protein: config.proteinPerKg,
            carbs: config.carbsPerKg,
            fat: config.fatPerKg
        }
    };
}

/**
 * Generate complete protocol based on anamnese and diagnostic
 */
export async function generateProtocol(
    anamnese: AnamneseFormData,
    diagnostic: AIDiagnostic
): Promise<GeneratedProtocol> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const weight = parseFloat(anamnese.weight) || 70;
    const goal = anamnese.goal || 'saude';
    const config = goalConfigs[goal] || goalConfigs['saude'];

    // Generate workout based on goal
    const workout = generateWorkout(goal, anamnese);

    // Generate diet based on goal and macros
    const diet = generateDiet(anamnese, diagnostic);

    return { workout, diet };
}

function generateWorkout(goal: string, anamnese: AnamneseFormData): WorkoutProtocol {
    const hasLimitations = anamnese.physicalLimitations &&
        anamnese.physicalLimitations.toLowerCase() !== 'não';

    if (goal === 'massa_magra') {
        return {
            name: 'Hipertrofia - Treino ABC',
            description: 'Treino focado em ganho de massa muscular com progressão de carga',
            frequency: '3-4x por semana',
            duration: '60-75 minutos',
            days: [
                {
                    name: 'Treino A - Peito e Tríceps',
                    focus: 'Push',
                    exercises: [
                        { name: 'Supino Reto', sets: 4, reps: '8-12', rest: '90s' },
                        { name: 'Supino Inclinado', sets: 3, reps: '10-12', rest: '75s' },
                        { name: 'Crucifixo', sets: 3, reps: '12-15', rest: '60s' },
                        { name: 'Tríceps Corda', sets: 3, reps: '12-15', rest: '60s' },
                        { name: 'Tríceps Francês', sets: 3, reps: '10-12', rest: '60s' }
                    ]
                },
                {
                    name: 'Treino B - Costas e Bíceps',
                    focus: 'Pull',
                    exercises: [
                        { name: 'Puxada Frontal', sets: 4, reps: '8-12', rest: '90s' },
                        { name: 'Remada Baixa', sets: 3, reps: '10-12', rest: '75s' },
                        { name: 'Remada Curvada', sets: 3, reps: '10-12', rest: '75s' },
                        { name: 'Rosca Direta', sets: 3, reps: '10-12', rest: '60s' },
                        { name: 'Rosca Martelo', sets: 3, reps: '12-15', rest: '60s' }
                    ]
                },
                {
                    name: 'Treino C - Pernas e Ombros',
                    focus: 'Legs & Shoulders',
                    exercises: hasLimitations ? [
                        { name: 'Leg Press', sets: 4, reps: '10-12', rest: '90s', notes: 'Alternativa ao agachamento' },
                        { name: 'Cadeira Extensora', sets: 3, reps: '12-15', rest: '60s' },
                        { name: 'Mesa Flexora', sets: 3, reps: '12-15', rest: '60s' },
                        { name: 'Desenvolvimento', sets: 4, reps: '10-12', rest: '75s' },
                        { name: 'Elevação Lateral', sets: 3, reps: '12-15', rest: '60s' }
                    ] : [
                        { name: 'Agachamento Livre', sets: 4, reps: '8-12', rest: '120s' },
                        { name: 'Leg Press', sets: 3, reps: '10-12', rest: '90s' },
                        { name: 'Stiff', sets: 3, reps: '10-12', rest: '75s' },
                        { name: 'Desenvolvimento', sets: 4, reps: '10-12', rest: '75s' },
                        { name: 'Elevação Lateral', sets: 3, reps: '12-15', rest: '60s' }
                    ]
                }
            ]
        };
    }

    // Default: balanced workout
    return {
        name: 'Treino Equilibrado - Full Body',
        description: 'Treino balanceado para saúde e condicionamento geral',
        frequency: '3x por semana',
        duration: '45-60 minutos',
        days: [
            {
                name: 'Treino A - Full Body',
                focus: 'Corpo Completo',
                exercises: [
                    { name: 'Agachamento', sets: 3, reps: '12-15', rest: '60s' },
                    { name: 'Supino', sets: 3, reps: '12-15', rest: '60s' },
                    { name: 'Remada', sets: 3, reps: '12-15', rest: '60s' },
                    { name: 'Desenvolvimento', sets: 3, reps: '12-15', rest: '60s' },
                    { name: 'Prancha', sets: 3, reps: '30s', rest: '30s' }
                ]
            }
        ]
    };
}

function generateDiet(anamnese: AnamneseFormData, diagnostic: AIDiagnostic): DietProtocol {
    const weight = parseFloat(anamnese.weight) || 70;
    const totalCalories = diagnostic.suggestedCalories;
    const { protein, carbs, fat } = diagnostic.macros;

    const proteinGrams = Math.round(protein * weight);
    const carbsGrams = Math.round(carbs * weight);
    const fatGrams = Math.round(fat * weight);

    return {
        name: 'Plano Alimentar Personalizado',
        description: `Dieta adaptada ao objetivo: ${getGoalLabel(anamnese.goal)}`,
        totalCalories,
        macros: { protein: proteinGrams, carbs: carbsGrams, fat: fatGrams },
        meals: [
            {
                name: 'Café da Manhã',
                time: '07:00',
                calories: Math.round(totalCalories * 0.25),
                foods: [
                    { name: 'Ovos', quantity: '3 unidades', calories: 210, protein: 18, carbs: 2, fat: 15 },
                    { name: 'Pão Integral', quantity: '2 fatias', calories: 140, protein: 6, carbs: 24, fat: 2 },
                    { name: 'Fruta', quantity: '1 porção', calories: 60, protein: 1, carbs: 15, fat: 0 }
                ]
            },
            {
                name: 'Lanche Manhã',
                time: '10:00',
                calories: Math.round(totalCalories * 0.1),
                foods: [
                    { name: 'Iogurte Natural', quantity: '200ml', calories: 120, protein: 8, carbs: 10, fat: 5 },
                    { name: 'Granola', quantity: '30g', calories: 120, protein: 3, carbs: 20, fat: 4 }
                ]
            },
            {
                name: 'Almoço',
                time: '12:30',
                calories: Math.round(totalCalories * 0.3),
                foods: [
                    { name: 'Frango Grelhado', quantity: '150g', calories: 240, protein: 45, carbs: 0, fat: 5 },
                    { name: 'Arroz Integral', quantity: '150g', calories: 170, protein: 4, carbs: 36, fat: 1 },
                    { name: 'Feijão', quantity: '100g', calories: 100, protein: 7, carbs: 18, fat: 1 },
                    { name: 'Salada', quantity: 'à vontade', calories: 30, protein: 2, carbs: 5, fat: 0 }
                ]
            },
            {
                name: 'Pré-Treino',
                time: '17:00',
                calories: Math.round(totalCalories * 0.1),
                foods: [
                    { name: 'Banana', quantity: '1 unidade', calories: 100, protein: 1, carbs: 25, fat: 0 },
                    { name: 'Whey Protein', quantity: '1 scoop', calories: 120, protein: 24, carbs: 3, fat: 1 }
                ]
            },
            {
                name: 'Jantar',
                time: '20:00',
                calories: Math.round(totalCalories * 0.25),
                foods: [
                    { name: 'Peixe', quantity: '150g', calories: 180, protein: 35, carbs: 0, fat: 4 },
                    { name: 'Batata Doce', quantity: '150g', calories: 130, protein: 2, carbs: 30, fat: 0 },
                    { name: 'Legumes', quantity: '150g', calories: 50, protein: 3, carbs: 10, fat: 0 }
                ]
            }
        ]
    };
}

function getGoalLabel(goal: string): string {
    const labels: Record<string, string> = {
        'reeducacao': 'Reeducação alimentar',
        'perda_peso': 'Perda de peso',
        'massa_magra': 'Ganho de massa magra',
        'saude': 'Saúde',
        'outros': 'Objetivo personalizado'
    };
    return labels[goal] || 'Objetivo não definido';
}

function buildSummary(anamnese: AnamneseFormData, goal: string, config: typeof goalConfigs[string]): string {
    const age = parseInt(anamnese.age) || 30;
    const weight = parseFloat(anamnese.weight) || 70;
    const hasExperience = anamnese.alreadyTrains && anamnese.alreadyTrains.toLowerCase().includes('sim');

    let summary = `Baseado na anamnese, ${hasExperience ? 'o aluno possui experiência prévia com treino' : 'o aluno é iniciante'} `;
    summary += `e tem como objetivo ${getGoalLabel(goal).toLowerCase()}. `;

    if (goal === 'massa_magra') {
        summary += `Recomendamos um protocolo de hipertrofia com progressão de carga e superávit calórico moderado.`;
    } else if (goal === 'perda_peso') {
        summary += `Recomendamos treino misto (força + HIIT) com déficit calórico controlado para preservar massa muscular.`;
    } else {
        summary += `Recomendamos uma abordagem equilibrada focando em saúde e bem-estar geral.`;
    }

    return summary;
}
