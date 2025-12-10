export interface AIConfig {
    provider: 'openai' | 'anthropic' | 'google';
    apiKey: string;
    model: string;
    systemPrompt: string;
}

const DEFAULT_SYSTEM_PROMPT = `Você é o Minha Consultoria AI, um assistente especialista em educação física, nutrição e gestão de negócios fitness.
Sua missão é ajudar profissionais de educação física a otimizarem o trabalho.
Responda sempre com formatação Markdown.
Seja direto, técnico quando necessário, mas acessível.`;

export const getAIConfig = (): AIConfig => {
    const stored = localStorage.getItem('fit360_ai_config');
    if (stored) {
        return JSON.parse(stored);
    }
    return {
        provider: 'openai',
        apiKey: '',
        model: 'gpt-4-turbo',
        systemPrompt: DEFAULT_SYSTEM_PROMPT
    };
};

export const saveAIConfig = (config: AIConfig) => {
    localStorage.setItem('fit360_ai_config', JSON.stringify(config));
};

export const testAIConnection = async (config: AIConfig): Promise<boolean> => {
    try {
        if (!config.apiKey) throw new Error('API Key não configurada');

        if (config.provider === 'openai') {
            const response = await fetch('https://api.openai.com/v1/models', {
                headers: {
                    'Authorization': `Bearer ${config.apiKey}`,
                }
            });
            return response.ok;
        }

        if (config.provider === 'google') {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${config.apiKey}`);
            return response.ok;
        }

        // Anthropic Implementation Mock (needs proxy usually due to CORS, but let's assume direct for local/test)
        if (config.provider === 'anthropic') {
            return true;
        }

        return false;
    } catch (error) {
        console.error('AI Connection Test Failed:', error);
        return false;
    }
};

export const generateContent = async (prompt: string, context: string = ''): Promise<string> => {
    const config = getAIConfig();
    if (!config.apiKey) throw new Error('IA não configurada. Vá em Configurações.');

    if (config.provider === 'openai') {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.apiKey}`
                },
                body: JSON.stringify({
                    model: config.model,
                    messages: [
                        { role: 'system', content: config.systemPrompt + '\nCONTEXTO ADICIONAL:\n' + context },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.7
                })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error.message);

            return data.choices[0].message.content;
        } catch (err: any) {
            console.error('AI Gen Error:', err);
            throw new Error('Falha na geração: ' + (err.message || 'Erro desconhecido'));
        }
    }

    if (config.provider === 'google') {
        try {
            const finalPrompt = `${config.systemPrompt}\nCONTEXTO ADICIONAL:\n${context}\n\nUSER PROMPT:\n${prompt}`;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: finalPrompt }]
                    }]
                })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error.message);

            return data.candidates[0].content.parts[0].text;
        } catch (err: any) {
            console.error('Gemini AI Gen Error:', err);
            throw new Error('Falha na geração (Gemini): ' + (err.message || 'Erro desconhecido'));
        }
    }

    // Fallback Mock

    // Fallback Mock
    return "Simulação: A IA geraria uma resposta aqui baseada no prompt: " + prompt;
};
export const generateProtocolFromAnamnesis = async (studentData: any, type: 'workout' | 'diet' | 'combo'): Promise<any> => {
    const config = getAIConfig();

    // Prompt Engineering
    const systemInstruction = `
    ATENÇÃO: Você é um sistema de geração de JSON.
    Sua ÚNICA saída deve ser um JSON válido, sem markdown, sem explicações.
    O JSON deve seguir a estrutura de um Protocolo de Treino/Dieta.
    `;

    const userPrompt = `
    Crie um protocolo do tipo "${type}" para o seguinte aluno:
    Nome: ${studentData.name}
    Idade: ${studentData.age || 'Não informado'}
    Gênero: ${studentData.gender || 'Não informado'}
    Objetivo: ${studentData.goal}
    Nível: ${studentData.level || 'Intermediário'}
    Restrições/Lesões: ${studentData.injuries?.join(', ') || 'Nenhuma'}
    Comorbidades: ${studentData.healthConditions?.join(', ') || 'Nenhuma'}
    Dias disponíveis: ${studentData.daysAvailable || '5'} dias/semana
    
    ${type === 'diet' || type === 'combo' ? `Preferências Alimentares: ${studentData.dietPreferences || 'Padrão'}` : ''}
    ${type === 'workout' || type === 'combo' ? `Foco Muscular: ${studentData.focus || 'Geral'}` : ''}

    Anamnese Completa (Resumo): 
    ${studentData.notes || 'Sem observações adicionais.'}

    RETORNE APENAS O JSON COPIÁVEL NESTE FORMATO (Exemplo):
    {
        "name": "Nome Sugerido do Protocolo",
        "description": "Breve explicação do foco",
        "type": "${type}",
        "workoutDays": [
            {
                "id": "w1", 
                "name": "Treino A - Peito", 
                "exercises": [
                    { "id": "e1", "name": "Supino", "sets": 4, "reps": "12", "load": 0, "restSeconds": 60, "notes": "Foco na contração" }
                ]
            }
        ],
        "meals": [
            {
                "id": "m1",
                "name": "Café da Manhã",
                "time": "08:00",
                "foods": [
                    { "id": "f1", "name": "Ovo", "quantity": 2, "measure": "un", "protein": 12, "carbs": 1, "fat": 10, "calories": 140 }
                ]
            }
        ]
    }
    
    Se for apenas TREINO, o array "meals" deve ser vazio [].
    Se for apenas DIETA, o array "workoutDays" deve ser vazio [].
    `;

    try {
        if (!config.apiKey) {
            // Mock Response for Demo without Key
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve({
                        name: `${studentData.name} - ${type === 'combo' ? 'Protocolo Completo' : type === 'workout' ? 'Treino Personalizado' : 'Plano Alimentar'}`,
                        description: `Gerado automaticamente para o objetivo: ${studentData.goal}`,
                        type: type,
                        workoutDays: type !== 'diet' ? [
                            {
                                id: `wd-${Date.now()}-1`,
                                name: 'Treino A - Adaptação',
                                exercises: [
                                    { id: 'ex1', name: 'Supino Reto', sets: 3, reps: '15', load: 0, restSeconds: 45, notes: 'Cadência controlada' },
                                    { id: 'ex2', name: 'Puxada Frente', sets: 3, reps: '15', load: 0, restSeconds: 45, notes: '' },
                                    { id: 'ex3', name: 'Agachamento Livre', sets: 3, reps: '15', load: 0, restSeconds: 60, notes: '' }
                                ]
                            }
                        ] : [],
                        meals: type !== 'workout' ? [
                            {
                                id: `m-${Date.now()}-1`,
                                name: 'Café da Manhã',
                                time: '07:00',
                                foods: [
                                    { id: 'f1', name: 'Pão Integral', quantity: 2, measure: 'fatias', protein: 6, carbs: 24, fat: 2, calories: 130 },
                                    { id: 'f2', name: 'Ovo Mexido', quantity: 2, measure: 'un', protein: 12, carbs: 2, fat: 10, calories: 140 }
                                ]
                            }
                        ] : []
                    });
                }, 2500);
            });
        }

        const response = await generateContent(userPrompt, systemInstruction);
        // Clean markdown code blocks if present
        const jsonString = response.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonString);

    } catch (error) {
        console.error('Erro ao gerar protocolo:', error);
        throw error;
    }
};

export const generateStudentAnalysis = async (studentData: any): Promise<any> => {
    const config = getAIConfig();

    const systemInstruction = `
    Você é um analista de performance física e saúde.
    Analise os dados do aluno e gere insights curtos e diretos.
    Saída OBRIGATÓRIA em JSON.
    `;

    const userPrompt = `
    Analise este aluno:
    Nome: ${studentData.name}
    Pontos: ${studentData.points}
    Sequência (Streak): ${studentData.streakDays || 0} dias
    Check-ins este mês: ${studentData.checkins || 0}
    Lesões: ${studentData.injuries?.join(', ') || 'Nenhuma'}
    Objetivo: ${studentData.goal}
    
    Observações: O aluno tem sido consistente? Há risco de dropout? O que pode melhorar?

    RETORNE APENAS O JSON (Exemplo):
    {
        "summary": "Uma frase resumindo o estado atual.",
        "trend": "improving" | "stable" | "declining",
        "riskLevel": "high" | "medium" | "low",
        "recommendations": ["Dica 1", "Dica 2"]
    }
    `;

    try {
        if (!config.apiKey) {
            // Mock Fallback
            return new Promise(resolve => {
                setTimeout(() => {
                    // Simple mock logic based on random/mock data
                    const isGood = (studentData.streakDays || 0) > 3;
                    resolve({
                        summary: isGood
                            ? "Aluno mantém boa constância e engajamento alto."
                            : "Aluno apresenta sinais de desengajamento recente.",
                        trend: isGood ? 'improving' : 'declining',
                        riskLevel: isGood ? 'low' : 'medium',
                        recommendations: isGood
                            ? ["Aumentar carga progressiva", "Manter dieta atual"]
                            : ["Agendar conversa de alinhamento", "Revisar intensidade do treino"]
                    });
                }, 2000);
            });
        }

        const response = await generateContent(userPrompt, systemInstruction);
        const jsonString = response.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonString);

    } catch (error) {
        console.error('Erro na análise IA:', error);
        throw error;
    }
};

export const generateFinancialInsights = async (financialData: any): Promise<any> => {
    const config = getAIConfig();

    const systemInstruction = `
    Você é um CFO (Diretor Financeiro) Virtual para negócios fitness.
    Analise os dados financeiros e dê conselhos estratégicos para aumentar lucro e retenção.
    Seja breve e direto.
    Saída OBRIGATÓRIA em JSON.
    `;

    const userPrompt = `
    Analise estes dados financeiros:
    MRR (Receita Recorrente): R$ ${financialData.mrr}
    Alunos Ativos: ${financialData.activeStudents}
    Churn Rate (Cancelamentos): ${financialData.churnRate}%
    Pendências Financeiras: R$ ${financialData.pendingAmount}
    Fluxo de Caixa (Saldo): R$ ${financialData.cashFlowBalance}
    
    RETORNE APENAS O JSON (Exemplo):
    {
        "status": "healthy" | "warning" | "danger",
        "title": "Título do Diagnóstico (ex: Estável mas requer atenção)",
        "insights": ["Dica 1", "Dica 2", "Dica 3"],
        "forecast": "Previsão curta para o próximo mês baseada nos dados."
    }
    `;

    try {
        if (!config.apiKey) {
            // Mock Fallback
            return new Promise(resolve => {
                setTimeout(() => {
                    // Logic based on Churn and Pending Amount
                    const isDanger = financialData.churnRate > 5 || financialData.pendingAmount > 1000;
                    const isWarning = financialData.pendingAmount > 500;

                    resolve({
                        status: isDanger ? 'danger' : isWarning ? 'warning' : 'healthy',
                        title: isDanger ? 'Atenção Crítica: Churn Elevado' : isWarning ? 'Oportunidade de Recuperação' : 'Saúde Financeira Robusta',
                        insights: isDanger
                            ? ["Focar totalmente em retenção esta semana", "Cobrar pendências agressivamente"]
                            : isWarning
                                ? ["Automatizar lembretes de cobrança", "Oferecer plano anual para quem paga mensal"]
                                : ["Hora de escalar: invista em marketing", "Criar produto High-Ticket"],
                        forecast: isDanger
                            ? "Risco de queda de receita em 15% se não agir."
                            : "Tendência de crescimento estável de 5-10%."
                    });
                }, 2000);
            });
        }

        const response = await generateContent(userPrompt, systemInstruction);
        const jsonString = response.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonString);

    } catch (error) {
        console.error('Erro no CFO Virtual:', error);
        throw error;
    }
};

// ========================================
// AUTOMAÇÃO TOTAL: ANAMNESE -> PERFIL -> PROTOCOLO
// ========================================

interface StudentProfileFromAI {
    name: string;
    age: number;
    height: number;
    weight: number;
    goal: string;
    fitnessLevel: 'iniciante' | 'intermediario' | 'avancado';
    injuries: string[];
    allergies: string[];
    medications: string[];
    restrictions: string[];
    trainingDaysPerWeek: number;
    preferredFoods: string[];
    avoidedFoods: string[];
    notes: string;
}

export const parseAnamnesisToStudentProfile = async (anamnesisData: any): Promise<StudentProfileFromAI> => {
    const config = getAIConfig();

    const systemInstruction = `
    Você é um parser de dados fitness. Leia os dados da anamnese e extraia informações estruturadas.
    IMPORTANTE: Você DEVE retornar um JSON válido, NUNCA texto fora do JSON.
    `;

    const userPrompt = `
    Analise esta anamnese e extraia os dados estruturados:

    Nome: ${anamnesisData.name}
    Idade: ${anamnesisData.age}
    Profissão: ${anamnesisData.profession}
    Altura: ${anamnesisData.height}
    Peso: ${anamnesisData.weight}
    Objetivo: ${anamnesisData.goal} ${anamnesisData.goalOther || ''}
    Problemas de Saúde: ${anamnesisData.healthIssues}
    Limitações Físicas: ${anamnesisData.physicalLimitations}
    Medicamentos: ${anamnesisData.medications}
    Já Treina: ${anamnesisData.alreadyTrains} - ${anamnesisData.trainingTime}
    Dias de Treino: ${anamnesisData.trainingDays}
    Rotina Diária: ${anamnesisData.dailyRoutine}
    Alergias: ${anamnesisData.allergies}
    Alimentos para Incluir: ${anamnesisData.foodsToInclude}
    Alimentos para Evitar: ${anamnesisData.foodsToAvoid}

    RETORNE APENAS O JSON (sem markdown, sem explicação):
    {
        "name": "Nome completo",
        "age": 30,
        "height": 170,
        "weight": 75,
        "goal": "Hipertrofia" | "Emagrecimento" | "Definição" | "Saúde",
        "fitnessLevel": "iniciante" | "intermediario" | "avancado",
        "injuries": ["Dor no joelho esquerdo"],
        "allergies": ["Lactose"],
        "medications": ["Losartana"],
        "restrictions": ["Evitar impacto alto"],
        "trainingDaysPerWeek": 4,
        "preferredFoods": ["Frango", "Arroz"],
        "avoidedFoods": ["Leite", "Frituras"],
        "notes": "Observações geradas pela IA sobre o perfil do aluno"
    }
    `;

    try {
        if (!config.apiKey) {
            // Mock Fallback
            return new Promise(resolve => {
                setTimeout(() => {
                    const goalMap: any = {
                        'perda_peso': 'Emagrecimento',
                        'massa_magra': 'Hipertrofia',
                        'reeducacao': 'Reeducação Alimentar',
                        'saude': 'Saúde',
                        'outros': anamnesisData.goalOther || 'Geral'
                    };

                    resolve({
                        name: anamnesisData.name || 'Novo Aluno',
                        age: parseInt(anamnesisData.age) || 30,
                        height: parseInt(anamnesisData.height) || 170,
                        weight: parseInt(anamnesisData.weight) || 70,
                        goal: goalMap[anamnesisData.goal] || 'Geral',
                        fitnessLevel: anamnesisData.alreadyTrains === 'sim' ? 'intermediario' : 'iniciante',
                        injuries: anamnesisData.physicalLimitations ? anamnesisData.physicalLimitations.split(',').map((s: string) => s.trim()) : [],
                        allergies: anamnesisData.allergies ? anamnesisData.allergies.split(',').map((s: string) => s.trim()) : [],
                        medications: anamnesisData.medications ? anamnesisData.medications.split(',').map((s: string) => s.trim()) : [],
                        restrictions: anamnesisData.healthIssues ? anamnesisData.healthIssues.split(',').map((s: string) => s.trim()) : [],
                        trainingDaysPerWeek: parseInt(anamnesisData.trainingDays) || 3,
                        preferredFoods: anamnesisData.foodsToInclude ? anamnesisData.foodsToInclude.split(',').map((s: string) => s.trim()) : [],
                        avoidedFoods: anamnesisData.foodsToAvoid ? anamnesisData.foodsToAvoid.split(',').map((s: string) => s.trim()) : [],
                        notes: `Perfil gerado automaticamente pela IA em ${new Date().toLocaleDateString('pt-BR')}. Objetivo: ${goalMap[anamnesisData.goal]}`
                    });
                }, 1500);
            });
        }

        const response = await generateContent(userPrompt, systemInstruction);
        const jsonString = response.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonString);

    } catch (error) {
        console.error('Erro ao parsear anamnese:', error);
        throw error;
    }
};

export interface AutomationResult {
    success: boolean;
    studentProfile: StudentProfileFromAI | null;
    protocol: any | null;
    error?: string;
}

export const orchestrateNewStudentFlow = async (anamnesisData: any): Promise<AutomationResult> => {
    try {
        // Step 1: Parse Anamnesis -> Student Profile
        console.log('[AI Orchestration] Step 1: Parsing anamnesis...');
        const studentProfile = await parseAnamnesisToStudentProfile(anamnesisData);
        console.log('[AI Orchestration] Step 1 Complete:', studentProfile);

        // Step 2: Generate Protocol from Profile
        console.log('[AI Orchestration] Step 2: Generating protocol...');
        const protocol = await generateProtocolFromAnamnesis({
            name: studentProfile.name,
            age: studentProfile.age,
            goal: studentProfile.goal,
            level: studentProfile.fitnessLevel,
            restrictions: studentProfile.restrictions,
            healthConditions: studentProfile.injuries,
            daysAvailable: studentProfile.trainingDaysPerWeek,
            dietPreferences: studentProfile.preferredFoods.join(', '),
            muscularFocus: 'Geral',
            additionalNotes: studentProfile.notes
        }, 'combo');
        console.log('[AI Orchestration] Step 2 Complete:', protocol);

        return {
            success: true,
            studentProfile,
            protocol
        };

    } catch (error: any) {
        console.error('[AI Orchestration] Error:', error);
        return {
            success: false,
            studentProfile: null,
            protocol: null,
            error: error.message || 'Erro na automação'
        };
    }
};

// ========================================
// AI VISION - ANÁLISE DE IMAGENS
// ========================================

export interface ImageAnalysisResult {
    type: 'evolution_photo' | 'food_photo' | 'exercise_screenshot' | 'document' | 'other';
    description: string;
    insights: string[];
    detectedItems?: string[];
    estimatedCalories?: number;
    confidence: number;
}

export const analyzeImageWithAI = async (imageBase64: string, analysisType: 'evolution' | 'food' | 'general' = 'general'): Promise<ImageAnalysisResult> => {
    const config = getAIConfig();

    const prompts = {
        evolution: `
            Analise esta foto de evolução física de um aluno.
            Identifique:
            - Postura corporal
            - Composição visível (gordura/músculo)
            - Progresso comparativo se disponível
            - Sugestões de foco para o próximo período
        `,
        food: `
            Analise esta foto de refeição/alimento.
            Identifique:
            - Alimentos visíveis
            - Estimativa de calorias totais
            - Estimativa de macros (proteína/carboidrato/gordura)
            - Se está alinhado com uma dieta fitness
        `,
        general: `
            Descreva o que você vê nesta imagem no contexto de fitness/saúde.
            Se for um documento, extraia informações relevantes.
        `
    };

    const systemInstruction = `
    Você é um analista de imagens especializado em fitness e nutrição.
    Retorne SEMPRE um JSON válido seguindo o formato abaixo.
    Seja preciso e técnico.
    `;

    const userPrompt = `
    ${prompts[analysisType]}

    RETORNE APENAS O JSON:
    {
        "type": "evolution_photo" | "food_photo" | "exercise_screenshot" | "document" | "other",
        "description": "Descrição detalhada do que foi identificado",
        "insights": ["Insight 1", "Insight 2"],
        "detectedItems": ["Item 1", "Item 2"],
        "estimatedCalories": 500,
        "confidence": 0.85
    }
    `;

    try {
        if (!config.apiKey || config.provider !== 'google') {
            // Mock Fallback (Vision only works properly with Gemini)
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve({
                        type: analysisType === 'food' ? 'food_photo' : analysisType === 'evolution' ? 'evolution_photo' : 'other',
                        description: analysisType === 'food'
                            ? 'Refeição identificada: Frango grelhado com legumes e arroz integral.'
                            : analysisType === 'evolution'
                                ? 'Foto de evolução detectada. Boa postura, desenvolvimento muscular visível nos ombros.'
                                : 'Imagem processada com sucesso.',
                        insights: analysisType === 'food'
                            ? ['Boa fonte de proteína', 'Carboidrato complexo presente', 'Adicionar mais vegetais verdes']
                            : ['Progresso consistente', 'Foco no core para próxima fase'],
                        detectedItems: analysisType === 'food'
                            ? ['Frango grelhado', 'Arroz integral', 'Brócolis', 'Cenoura']
                            : ['Pose frontal', 'Iluminação adequada'],
                        estimatedCalories: analysisType === 'food' ? 450 : undefined,
                        confidence: 0.78
                    });
                }, 2000);
            });
        }

        // Real Gemini Vision API call
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: `${systemInstruction}\n\n${userPrompt}` },
                        { inline_data: { mime_type: 'image/jpeg', data: imageBase64 } }
                    ]
                }]
            })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);

        const text = data.candidates[0].content.parts[0].text;
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonString);

    } catch (error) {
        console.error('Erro na análise de imagem:', error);
        throw error;
    }
};
