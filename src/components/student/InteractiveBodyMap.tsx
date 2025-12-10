import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingDown,
    X,
    Ruler
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import bodyFront from '../../assets/human_body_3d_front.png';
import bodyBack from '../../assets/human_body_3d_back.png';

// Types
interface MeasurementHistory {
    date: string;
    value: number;
}

interface MeasurementData {
    value: number;
    unit: string;
    history: MeasurementHistory[];
}

interface BodyMeasurements {
    chest: MeasurementData;
    waist: MeasurementData;
    hip: MeasurementData;
    thigh: MeasurementData;
    arm: MeasurementData;
    calf: MeasurementData;
}

interface BodyFatData {
    percentage: number;
    trend: 'increasing' | 'stable' | 'decreasing';
    history: MeasurementHistory[];
}

interface BodyMapData {
    measurements: BodyMeasurements;
    bodyFat: BodyFatData;
    goals: Partial<Record<keyof BodyMeasurements, number>>;
}

interface InteractiveBodyMapProps {
    studentId: string;
    data?: BodyMapData;
    onMeasurementClick?: (type: keyof BodyMeasurements) => void;
}

// Mock data generator
const generateMockBodyMapData = (): BodyMapData => {
    const generateHistory = (baseValue: number, variance: number = 5): MeasurementHistory[] => {
        const now = new Date();
        return Array.from({ length: 6 }, (_, i) => {
            const date = new Date(now);
            date.setMonth(date.getMonth() - (5 - i));
            return {
                date: date.toISOString().split('T')[0],
                value: Math.round(baseValue + (Math.random() - 0.5) * variance * 2 - (i * variance / 10)),
            };
        });
    };

    return {
        measurements: {
            chest: { value: 102, unit: 'cm', history: generateHistory(100, 3) },
            waist: { value: 82, unit: 'cm', history: generateHistory(88, 4) },
            hip: { value: 98, unit: 'cm', history: generateHistory(100, 3) },
            thigh: { value: 58, unit: 'cm', history: generateHistory(56, 2) },
            arm: { value: 36, unit: 'cm', history: generateHistory(34, 2) },
            calf: { value: 38, unit: 'cm', history: generateHistory(37, 1) },
        },
        bodyFat: {
            percentage: 18,
            trend: 'decreasing',
            history: generateHistory(22, 2),
        },
        goals: {
            chest: 105,
            waist: 78,
            hip: 95,
            thigh: 62,
            arm: 40,
            calf: 40,
        },
    };
};

// Dynamic Measurement Labels
const getMeasurementLabel = (type: keyof BodyMeasurements, view: 'front' | 'back' = 'front'): string => {
    switch (type) {
        case 'chest':
            return view === 'back' ? 'Costas' : 'Peitoral';
        case 'waist':
            return 'Cintura';
        case 'hip':
            return 'Quadril';
        case 'thigh':
            return 'Coxa';
        case 'arm':
            return 'Braço';
        case 'calf':
            return 'Panturrilha';
        default:
            return type;
    }
};

// Get progress color based on goal achievement
const getProgressColor = (current: number, goal: number, isReduction: boolean = false): string => {
    const ratio = isReduction
        ? goal / current
        : current / goal;

    if (ratio >= 1) return '#22c55e'; // Green
    if (ratio >= 0.75) return '#D0A63E'; // Gold
    if (ratio >= 0.5) return '#f97316'; // Orange
    return '#EF4444'; // Red
};

// ============================================
// BodyMapVisual Component
// ============================================
interface BodyMapVisualProps {
    measurements: BodyMeasurements;
    goals: Partial<Record<keyof BodyMeasurements, number>>;
    view: 'front' | 'back';
    onHover: (type: keyof BodyMeasurements | null) => void;
    onClick: (type: keyof BodyMeasurements) => void;
    hoveredArea: keyof BodyMeasurements | null;
}

// Refined Hotspot Positions for 300x400 image
const hotspotPositions: Record<string, Record<keyof BodyMeasurements, { x: number; y: number }>> = {
    front: {
        chest: { x: 150, y: 110 },  // Center Sternum
        waist: { x: 150, y: 175 },  // Navel
        hip: { x: 150, y: 210 },    // Pelvis
        thigh: { x: 125, y: 270 },  // Mid Thigh (Right Leg from viewer)
        arm: { x: 95, y: 135 },     // Mid Bicep (Right Arm from viewer)
        calf: { x: 125, y: 350 },   // Mid Calf
    },
    back: {
        chest: { x: 150, y: 110 },  // Upper Back / Spine
        waist: { x: 150, y: 175 },  // Lumbar
        hip: { x: 150, y: 220 },    // Glutes
        thigh: { x: 175, y: 270 },  // Hamstring (Right Leg from viewer perspective - actually Figure's Left) - keeping consistent side?
        // Visual consistency: If user clicks Right side on front, they click Right side on back?
        // Front X=125 is Viewer Left (Figure Right).
        // Back X=175 is Viewer Right (Figure Right).
        // So we track the SAME limb.
        arm: { x: 205, y: 135 },    // Tricep (Figure Right Arm)
        calf: { x: 175, y: 350 },
    },
};

function BodyMapVisual({ measurements, goals, view, onHover, onClick, hoveredArea }: BodyMapVisualProps) {
    const positions = hotspotPositions[view];
    const imageSrc = view === 'front' ? bodyFront : bodyBack;

    return (
        <div className="relative w-full max-w-[320px] aspect-[3/4] mx-auto select-none group">
            {/* 3D Body Image - Added fade transition */}
            <motion.img
                key={view} // Trigger animation on view change
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                src={imageSrc}
                alt={`Body ${view}`}
                className="absolute inset-0 w-full h-full object-contain pointer-events-none drop-shadow-2xl"
            />

            {/* Interactive SVG Overlay */}
            <svg viewBox="0 0 300 400" className="absolute inset-0 w-full h-full z-10">
                {(Object.keys(measurements) as (keyof BodyMeasurements)[]).map((type) => {
                    const pos = positions[type];
                    const measurement = measurements[type];
                    const goal = goals[type];
                    const isReduction = type === 'waist';
                    const color = goal ? getProgressColor(measurement.value, goal, isReduction) : '#00FFEF';
                    const isHovered = hoveredArea === type;

                    return (
                        <g
                            key={type}
                            onMouseEnter={() => onHover(type)}
                            onMouseLeave={() => onHover(null)}
                            onClick={() => onClick(type)}
                            className="cursor-pointer"
                        >
                            {/* Pulse Effect */}
                            <motion.circle
                                cx={pos.x}
                                cy={pos.y}
                                r={isHovered ? 25 : 0}
                                fill={color}
                                opacity={0.4}
                                initial={{ scale: 0 }}
                                animate={{ scale: isHovered ? 1.4 : 0, opacity: isHovered ? 0 : 0.4 }}
                                transition={{ duration: 1.2, repeat: Infinity }}
                            />

                            {/* Connecting Line (connector to label) - Optional, kept simple for now */}

                            {/* Main Interactive Dot */}
                            <circle
                                cx={pos.x}
                                cy={pos.y}
                                r={6}
                                fill={color}
                                stroke="white"
                                strokeWidth={2}
                                className="transition-all duration-300 shadow-md"
                                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
                            />

                            {/* Floating Label on Hover */}
                            <AnimatePresence>
                                {isHovered && (
                                    <motion.g
                                        initial={{ opacity: 0, scale: 0.8, y: 5 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                    >
                                        <rect
                                            x={pos.x < 150 ? pos.x + 12 : pos.x - 92}
                                            y={pos.y - 14}
                                            width={80}
                                            height={28}
                                            rx={6}
                                            fill="white"
                                            className="dark:fill-slate-800"
                                            stroke={color}
                                            strokeWidth={1.5}
                                        />
                                        <text
                                            x={pos.x < 150 ? pos.x + 52 : pos.x - 52}
                                            y={pos.y + 4}
                                            textAnchor="middle"
                                            fill="#0F172A"
                                            className="dark:fill-white"
                                            fontSize="11"
                                            fontWeight="600"
                                            style={{ fontFamily: 'sans-serif' }}
                                        >
                                            {getMeasurementLabel(type, view)}
                                        </text>
                                    </motion.g>
                                )}
                            </AnimatePresence>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}

// ============================================
// MeasurementTooltip Component
// ============================================
interface MeasurementTooltipProps {
    type: keyof BodyMeasurements;
    data: MeasurementData;
    goal?: number;
    onClose: () => void;
    view?: 'front' | 'back'; // Added view prop to resolve label
}

function MeasurementTooltip({ type, data, goal, onClose, view = 'front' }: MeasurementTooltipProps) {
    const isReduction = type === 'waist';
    const change = data.history.length >= 2
        ? data.value - data.history[0].value
        : 0;
    const percentChange = data.history.length >= 2
        ? Math.round((change / data.history[0].value) * 100)
        : 0;
    const progressToGoal = goal
        ? (isReduction ? Math.round((goal / data.value) * 100) : Math.round((data.value / goal) * 100))
        : null;

    const chartData = data.history.map(h => ({
        date: new Date(h.date).toLocaleDateString('pt-BR', { month: 'short' }),
        value: h.value,
    }));

    // Resolve label
    const label = getMeasurementLabel(type, view);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 bg-card/95 backdrop-blur-sm rounded-[24px] shadow-2xl border border-border p-6 z-30"
        >
            <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-foreground text-lg">{label}</h4>
                <button
                    onClick={onClose}
                    className="p-1.5 rounded-full hover:bg-muted transition-colors"
                >
                    <X className="w-4 h-4 text-muted-foreground" />
                </button>
            </div>

            <div className="flex items-baseline gap-3 mb-6">
                <span className="text-4xl font-extrabold text-foreground tracking-tight">
                    {data.value}
                </span>
                <span className="text-muted-foreground font-medium text-lg">{data.unit}</span>
                <div className={`flex items-center gap-1 ml-auto px-2.5 py-1 rounded-full text-xs font-bold ${(isReduction ? change < 0 : change > 0)
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-muted text-muted-foreground'
                    }`}>
                    {Math.abs(percentChange)}%
                </div>
            </div>

            {/* Chart */}
            <div className="h-28 -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <defs>
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00FFEF" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#00FFEF" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <YAxis hide domain={['auto', 'auto']} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '12px',
                                color: 'white',
                            }}
                            formatter={(value: number) => [`${value}${data.unit}`, label]}
                        />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#00FFEF"
                            strokeWidth={3}
                            dot={{ fill: '#00FFEF', strokeWidth: 0, r: 4 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}

// ViewToggle Component
interface ViewToggleProps {
    view: 'front' | 'back';
    onChange: (view: 'front' | 'back') => void;
}

function ViewToggle({ view, onChange }: ViewToggleProps) {
    return (
        <div className="flex items-center gap-1 bg-muted p-1 rounded-xl">
            <button
                onClick={() => onChange('front')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'front'
                    ? 'bg-card text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
            >
                Frente
            </button>
            <button
                onClick={() => onChange('back')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'back'
                    ? 'bg-card text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
            >
                Costas
            </button>
        </div>
    );
}

export default function InteractiveBodyMap({ studentId, data, onMeasurementClick }: InteractiveBodyMapProps) {
    const [view, setView] = useState<'front' | 'back'>('front');
    const [hoveredArea, setHoveredArea] = useState<keyof BodyMeasurements | null>(null);
    const [selectedArea, setSelectedArea] = useState<keyof BodyMeasurements | null>(null);

    const bodyMapData = useMemo(() => data || generateMockBodyMapData(), [data]);

    const handleClick = (type: keyof BodyMeasurements) => {
        setSelectedArea(selectedArea === type ? null : type);
        onMeasurementClick?.(type);
    };

    return (
        <div className="bg-card rounded-[24px] p-8 shadow-sm h-full flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="flex items-start justify-between mb-8 relative z-10">
                <div>
                    <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <Ruler className="w-5 h-5 text-primary" />
                        Avatar 3D
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Acompanhamento biométrico
                    </p>
                </div>
                <ViewToggle view={view} onChange={setView} />
            </div>

            <div className="flex-1 relative flex items-center justify-center min-h-[400px]">
                <BodyMapVisual
                    measurements={bodyMapData.measurements}
                    goals={bodyMapData.goals}
                    view={view}
                    onHover={setHoveredArea}
                    onClick={handleClick}
                    hoveredArea={hoveredArea}
                />

                <AnimatePresence>
                    {selectedArea && (
                        <MeasurementTooltip
                            type={selectedArea}
                            data={bodyMapData.measurements[selectedArea]}
                            goal={bodyMapData.goals[selectedArea]}
                            onClose={() => setSelectedArea(null)}
                            view={view}
                        />
                    )}
                </AnimatePresence>
            </div>

            {/* Stats Footer */}
            <div className="mt-8 relative z-10">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-muted-foreground">Gordura Corporal</span>
                        <div className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                            <TrendingDown className="w-3 h-3" />
                            Tendência
                        </div>
                    </div>
                    <span className="text-2xl font-black text-foreground">{bodyMapData.bodyFat.percentage}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${bodyMapData.bodyFat.percentage}%` }}
                    />
                </div>
            </div>
        </div>
    );
}

export { BodyMapVisual, MeasurementTooltip, ViewToggle };
export type { BodyMapData, BodyMeasurements, MeasurementData };
