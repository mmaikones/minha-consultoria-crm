import { useState } from 'react';
import {
    User,
    Target,
    Heart,
    Calendar,
    Utensils,
    Sparkles,
    Loader2,
    FileText,
    AlertTriangle,
    CheckCircle,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { AnamneseFormData } from '../../pages/AnamnesePublic';

// Mock anamnese data for demonstration
export const mockAnamneseData: AnamneseFormData = {
    name: 'Maria Silva',
    age: '28',
    profession: 'Designer',
    height: '165',
    weight: '68',
    email: 'maria@email.com',
    phone: '11999887766',
    goal: 'massa_magra',
    goalOther: '',
    healthIssues: 'Nenhum problema de saúde conhecido.',
    physicalLimitations: 'Leve desconforto no joelho esquerdo após corrida prolongada.',
    medications: 'Não tomo medicamentos.',
    alreadyTrains: 'Sim, há 1 ano',
    trainingTime: '1 ano',
    trainingDays: 'Segunda, Quarta e Sexta às 18h',
    dailyRoutine: 'Acordo às 6h, café da manhã às 7h com pão e café. Trabalho das 9h às 18h. Almoço às 12h geralmente marmita ou restaurante. Treino às 18h30. Janta às 20h30. Durmo por volta das 23h.',
    allergies: 'Nenhuma alergia conhecida',
    foodsToInclude: 'Frango, Batata doce, Arroz integral, Ovo',
    foodsToAvoid: 'Fígado, Beterraba',
    gymName: 'Academia SmartFit - Unidade Centro',
    referralSource: 'instagram',
    referralOther: '',
};

// AI Diagnostic result interface
interface AIDiagnostic {
    summary: string;
    keyFactors: { icon: 'alert' | 'info' | 'success'; text: string }[];
    recommendations: string[];
    trainingFocus: string;
    dietFocus: string;
}

const mockAIDiagnostic: AIDiagnostic = {
    summary: 'Baseado na anamnese, a aluna apresenta bom potencial para ganho de massa magra. Histórico de treino de 1 ano indica adaptação neuromuscular adequada.',
    keyFactors: [
        { icon: 'alert', text: 'Desconforto no joelho esquerdo - evitar exercícios de alto impacto' },
        { icon: 'info', text: 'Objetivo: Ganho de massa magra' },
        { icon: 'success', text: 'Sem restrições alimentares significativas' },
        { icon: 'info', text: 'Rotina permite 3x semana de treino' },
    ],
    recommendations: [
        'Priorizar exercícios de baixo impacto para membros inferiores',
        'Aumentar ingestão proteica para 1.8g/kg de peso corporal',
        'Incluir aquecimento articular específico para joelhos',
        'Considerar suplementação de creatina e whey protein',
    ],
    trainingFocus: 'Treino ABC com foco em hipertrofia, 3x por semana. Evitar agachamento profundo e exercícios pliométricos devido ao desconforto no joelho.',
    dietFocus: 'Superávit calórico moderado de 300kcal. Distribuição: 2g proteína/kg, 4g carboidrato/kg, 1g gordura/kg. Priorizar carboidratos complexos pré e pós-treino.',
};

interface AnamneseTabProps {
    studentId: string;
    anamnese?: AnamneseFormData;
    onGenerateProtocol?: () => void;
}

// Section component for organized display
interface SectionProps {
    title: string;
    icon: React.ReactNode;
    iconBg: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

function Section({ title, icon, iconBg, children, defaultOpen = true }: SectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${iconBg}`}>
                        {icon}
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
                </div>
                {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
            </button>
            {isOpen && (
                <div className="p-4 bg-white dark:bg-slate-800">
                    {children}
                </div>
            )}
        </div>
    );
}

// Field display component
interface FieldProps {
    label: string;
    value: string | undefined;
    number?: number;
}

function Field({ label, value, number }: FieldProps) {
    return (
        <div className="py-2">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                {number && <span className="text-primary-600">#{number}</span>} {label}
            </p>
            <p className="text-sm text-slate-900 dark:text-white">
                {value || <span className="text-slate-400 italic">Não informado</span>}
            </p>
        </div>
    );
}

export default function AnamneseTab({ studentId, anamnese, onGenerateProtocol }: AnamneseTabProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [showDiagnostic, setShowDiagnostic] = useState(true);

    // Use mock data if no anamnese provided
    const data = anamnese || mockAnamneseData;
    const diagnostic = mockAIDiagnostic;

    const handleGenerateProtocol = async () => {
        setIsGenerating(true);
        // Simulate AI generation
        setTimeout(() => {
            setIsGenerating(false);
            onGenerateProtocol?.();
        }, 2000);
    };

    const goalLabels: Record<string, string> = {
        'reeducacao': 'Reeducação alimentar',
        'perda_peso': 'Perda de peso',
        'massa_magra': 'Ganho de massa magra',
        'saude': 'Saúde',
        'outros': 'Outros',
    };

    const referralLabels: Record<string, string> = {
        'indicacao': 'Indicação',
        'facebook': 'Facebook',
        'instagram': 'Instagram',
        'youtube': 'YouTube',
        'tiktok': 'TikTok',
        'outros': 'Outros',
    };

    return (
        <div className="space-y-6">
            {/* AI Diagnostic Section */}
            {showDiagnostic && (
                <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-900/10 rounded-2xl p-6 border border-primary-200 dark:border-primary-800">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-primary-500/10 rounded-xl">
                                <Sparkles className="w-6 h-6 text-primary-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">Diagnóstico IA</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Análise baseada na anamnese</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowDiagnostic(false)}
                            className="text-slate-400 hover:text-slate-600 text-sm"
                        >
                            Minimizar
                        </button>
                    </div>

                    {/* Summary */}
                    <p className="text-sm text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
                        {diagnostic.summary}
                    </p>

                    {/* Key Factors */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                        {diagnostic.keyFactors.map((factor, idx) => (
                            <div key={idx} className="flex items-start gap-2 p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl">
                                {factor.icon === 'alert' && <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />}
                                {factor.icon === 'info' && <FileText className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />}
                                {factor.icon === 'success' && <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />}
                                <span className="text-xs text-slate-700 dark:text-slate-300">{factor.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Recommendations */}
                    <div className="mb-4">
                        <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-2">Recomendações</h4>
                        <ul className="space-y-1">
                            {diagnostic.recommendations.map((rec, idx) => (
                                <li key={idx} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                                    <span className="text-primary-500">•</span>
                                    {rec}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Focus Areas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                            <h4 className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-1">Foco do Treino</h4>
                            <p className="text-xs text-blue-600 dark:text-blue-300">{diagnostic.trainingFocus}</p>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                            <h4 className="text-xs font-bold text-green-700 dark:text-green-400 mb-1">Foco da Dieta</h4>
                            <p className="text-xs text-green-600 dark:text-green-300">{diagnostic.dietFocus}</p>
                        </div>
                    </div>

                    {/* Generate Protocol Button */}
                    <button
                        onClick={handleGenerateProtocol}
                        disabled={isGenerating}
                        className="w-full py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-primary-600/25"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Gerando Protocolo...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                Gerar Protocolo Completo com IA
                            </>
                        )}
                    </button>
                </div>
            )}

            {!showDiagnostic && (
                <button
                    onClick={() => setShowDiagnostic(true)}
                    className="w-full py-3 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-xl font-medium hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors flex items-center justify-center gap-2"
                >
                    <Sparkles className="w-4 h-4" />
                    Mostrar Diagnóstico IA
                </button>
            )}

            {/* Anamnese Data Sections */}
            <Section
                title="Dados Pessoais"
                icon={<User className="w-5 h-5 text-primary-600" />}
                iconBg="bg-primary-100 dark:bg-primary-900/30"
            >
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Field number={1} label="Nome" value={data.name} />
                    <Field number={2} label="Idade" value={data.age ? `${data.age} anos` : undefined} />
                    <Field number={3} label="Profissão" value={data.profession} />
                    <Field number={4} label="Altura" value={data.height ? `${data.height} cm` : undefined} />
                    <Field number={5} label="Peso" value={data.weight ? `${data.weight} kg` : undefined} />
                </div>
            </Section>

            <Section
                title="Objetivo"
                icon={<Target className="w-5 h-5 text-orange-600" />}
                iconBg="bg-orange-100 dark:bg-orange-900/30"
            >
                <Field
                    number={6}
                    label="Objetivo com a consultoria"
                    value={data.goal === 'outros' ? data.goalOther : goalLabels[data.goal] || data.goal}
                />
            </Section>

            <Section
                title="Saúde"
                icon={<Heart className="w-5 h-5 text-red-600" />}
                iconBg="bg-red-100 dark:bg-red-900/30"
            >
                <div className="space-y-3">
                    <Field number={7} label="Problemas de saúde ou restrições médicas" value={data.healthIssues} />
                    <Field number={8} label="Limitações físicas ou dores" value={data.physicalLimitations} />
                    <Field number={9} label="Medicamentos" value={data.medications} />
                </div>
            </Section>

            <Section
                title="Treino e Rotina"
                icon={<Calendar className="w-5 h-5 text-blue-600" />}
                iconBg="bg-blue-100 dark:bg-blue-900/30"
            >
                <div className="space-y-3">
                    <Field number={10} label="Já treina? Há quanto tempo?" value={data.alreadyTrains} />
                    <Field number={11} label="Dias e horários de treino" value={data.trainingDays} />
                    <Field number={12} label="Rotina diária (acordar até dormir + alimentação)" value={data.dailyRoutine} />
                </div>
            </Section>

            <Section
                title="Preferências Alimentares"
                icon={<Utensils className="w-5 h-5 text-green-600" />}
                iconBg="bg-green-100 dark:bg-green-900/30"
            >
                <div className="space-y-3">
                    <Field number={13} label="Alergias" value={data.allergies} />
                    <Field number={14} label="Alimentos para incluir" value={data.foodsToInclude} />
                    <Field number={15} label="Alimentos que não consome" value={data.foodsToAvoid} />
                    <Field number={16} label="Academia" value={data.gymName} />
                    <Field
                        number={17}
                        label="Como conheceu o trabalho"
                        value={data.referralSource === 'outros' ? data.referralOther : referralLabels[data.referralSource] || data.referralSource}
                    />
                </div>
            </Section>
        </div>
    );
}
