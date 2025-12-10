import { useState } from 'react';
import { Ruler, TrendingUp, TrendingDown, Plus, Calendar, ChevronDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { BodyMeasurements } from '../../data/mockStudents';

interface MeasurementsTabProps {
    measurements?: BodyMeasurements[];
    onAddMeasurement?: () => void;
}

// Mock de medidas corporais
export const mockMeasurements: BodyMeasurements[] = [
    {
        date: '2024-09-01',
        chest: 98,
        waist: 88,
        hip: 100,
        leftArm: 34,
        rightArm: 35,
        leftThigh: 58,
        rightThigh: 59,
        leftCalf: 38,
        rightCalf: 38,
    },
    {
        date: '2024-10-01',
        chest: 100,
        waist: 85,
        hip: 99,
        leftArm: 35,
        rightArm: 36,
        leftThigh: 59,
        rightThigh: 60,
        leftCalf: 39,
        rightCalf: 39,
    },
    {
        date: '2024-11-01',
        chest: 102,
        waist: 82,
        hip: 98,
        leftArm: 36,
        rightArm: 37,
        leftThigh: 60,
        rightThigh: 61,
        leftCalf: 39,
        rightCalf: 40,
    },
    {
        date: '2024-12-01',
        chest: 104,
        waist: 80,
        hip: 97,
        leftArm: 37,
        rightArm: 38,
        leftThigh: 61,
        rightThigh: 62,
        leftCalf: 40,
        rightCalf: 40,
    },
];

type MeasurementKey = keyof Omit<BodyMeasurements, 'date'>;

const measurementLabels: Record<MeasurementKey, string> = {
    chest: 'Peitoral',
    waist: 'Cintura',
    hip: 'Quadril',
    leftArm: 'Braço E',
    rightArm: 'Braço D',
    leftThigh: 'Coxa E',
    rightThigh: 'Coxa D',
    leftCalf: 'Panturrilha E',
    rightCalf: 'Panturrilha D',
};

const measurementColors: Record<MeasurementKey, string> = {
    chest: '#3b82f6',
    waist: '#ef4444',
    hip: '#8b5cf6',
    leftArm: '#10b981',
    rightArm: '#14b8a6',
    leftThigh: '#f59e0b',
    rightThigh: '#eab308',
    leftCalf: '#6366f1',
    rightCalf: '#8b5cf6',
};

export default function MeasurementsTab({ measurements = mockMeasurements, onAddMeasurement }: MeasurementsTabProps) {
    const [selectedMeasures, setSelectedMeasures] = useState<MeasurementKey[]>(['chest', 'waist', 'leftArm']);
    const [showSelector, setShowSelector] = useState(false);

    // Preparar dados para o gráfico
    const chartData = measurements.map(m => ({
        month: new Date(m.date).toLocaleDateString('pt-BR', { month: 'short' }),
        ...m,
    }));

    // Calcular diferenças entre primeira e última medida
    const getProgress = (key: MeasurementKey) => {
        if (measurements.length < 2) return { value: 0, percent: 0 };
        const first = measurements[0][key];
        const last = measurements[measurements.length - 1][key];
        const diff = last - first;
        const percent = ((diff / first) * 100).toFixed(1);
        return { value: diff, percent: parseFloat(percent) };
    };

    const toggleMeasure = (key: MeasurementKey) => {
        if (selectedMeasures.includes(key)) {
            if (selectedMeasures.length > 1) {
                setSelectedMeasures(selectedMeasures.filter(m => m !== key));
            }
        } else {
            setSelectedMeasures([...selectedMeasures, key]);
        }
    };

    const latestMeasurement = measurements[measurements.length - 1];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Ruler className="w-5 h-5 text-primary-500" />
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">Medidas Corporais</h3>
                </div>
                <button
                    onClick={onAddMeasurement}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white text-xs font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Nova Medição
                </button>
            </div>

            {measurements.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <Ruler className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500 dark:text-slate-400 mb-2 font-medium">Nenhuma medição registrada</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
                        Adicione medições para acompanhar a evolução corporal
                    </p>
                    <button
                        onClick={onAddMeasurement}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700"
                    >
                        <Plus className="w-4 h-4" />
                        Registrar primeira medição
                    </button>
                </div>
            ) : (
                <>
                    {/* Latest Measurements Cards */}
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                        {(['chest', 'waist', 'hip', 'leftArm', 'leftThigh'] as MeasurementKey[]).map(key => {
                            const progress = getProgress(key);
                            const isPositive = key === 'waist' ? progress.value < 0 : progress.value > 0;
                            const displayValue = key === 'waist' ? -progress.value : progress.value;

                            return (
                                <div
                                    key={key}
                                    className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-300 transition-colors cursor-pointer"
                                    onClick={() => toggleMeasure(key)}
                                >
                                    <p className="text-xs text-slate-500 font-medium mb-1 truncate">
                                        {measurementLabels[key]}
                                    </p>
                                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                                        {latestMeasurement[key]}
                                        <span className="text-xs font-normal text-slate-400 ml-0.5">cm</span>
                                    </p>
                                    <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-500'
                                        }`}>
                                        {isPositive ? (
                                            <TrendingUp className="w-3 h-3" />
                                        ) : (
                                            <TrendingDown className="w-3 h-3" />
                                        )}
                                        <span>{displayValue > 0 ? '+' : ''}{displayValue}cm</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Chart Section */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-slate-900 dark:text-white">Evolução das Medidas</h4>

                            {/* Measure Selector */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowSelector(!showSelector)}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                >
                                    <span>{selectedMeasures.length} selecionadas</span>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${showSelector ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {showSelector && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-10"
                                        >
                                            {(Object.keys(measurementLabels) as MeasurementKey[]).map(key => (
                                                <button
                                                    key={key}
                                                    onClick={() => toggleMeasure(key)}
                                                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${selectedMeasures.includes(key)
                                                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                                                        }`}
                                                >
                                                    <span
                                                        className="w-3 h-3 rounded-full"
                                                        style={{ backgroundColor: measurementColors[key] }}
                                                    />
                                                    <span>{measurementLabels[key]}</span>
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Chart */}
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                                    <YAxis stroke="#94a3b8" fontSize={12} domain={['auto', 'auto']} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1e293b',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: '#fff',
                                            fontSize: '12px',
                                        }}
                                        formatter={(value: number, name: string) => [
                                            `${value} cm`,
                                            measurementLabels[name as MeasurementKey] || name
                                        ]}
                                    />
                                    <Legend
                                        formatter={(value) => measurementLabels[value as MeasurementKey] || value}
                                    />
                                    {selectedMeasures.map(key => (
                                        <Line
                                            key={key}
                                            type="monotone"
                                            dataKey={key}
                                            stroke={measurementColors[key]}
                                            strokeWidth={2}
                                            dot={{ fill: measurementColors[key], strokeWidth: 2 }}
                                            activeDot={{ r: 6 }}
                                        />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* History Table */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <h4 className="font-semibold text-slate-900 dark:text-white">Histórico de Medições</h4>
                            <span className="text-xs text-slate-500">{measurements.length} registros</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-700/50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Data</th>
                                        <th className="px-4 py-2 text-center text-xs font-medium text-slate-500 uppercase">Peito</th>
                                        <th className="px-4 py-2 text-center text-xs font-medium text-slate-500 uppercase">Cintura</th>
                                        <th className="px-4 py-2 text-center text-xs font-medium text-slate-500 uppercase">Quadril</th>
                                        <th className="px-4 py-2 text-center text-xs font-medium text-slate-500 uppercase">Braço</th>
                                        <th className="px-4 py-2 text-center text-xs font-medium text-slate-500 uppercase">Coxa</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {[...measurements].reverse().map((m, i) => (
                                        <tr key={m.date} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                            <td className="px-4 py-3 text-slate-900 dark:text-white font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-slate-400" />
                                                    {new Date(m.date).toLocaleDateString('pt-BR')}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-300">{m.chest} cm</td>
                                            <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-300">{m.waist} cm</td>
                                            <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-300">{m.hip} cm</td>
                                            <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-300">{m.rightArm} cm</td>
                                            <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-300">{m.rightThigh} cm</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
