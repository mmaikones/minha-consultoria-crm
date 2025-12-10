import { useState } from 'react';
import { Save, Info } from 'lucide-react';
import { mockRules, PointRule } from '../../data/mockGamification';

interface RulesTabProps {
    onSave: () => void;
}

export default function RulesTab({ onSave }: RulesTabProps) {
    const [rules, setRules] = useState<PointRule[]>(mockRules);

    const handlePointsChange = (id: string, value: number) => {
        setRules(prev =>
            prev.map(rule =>
                rule.id === id ? { ...rule, points: value } : rule
            )
        );
    };

    const handleSave = () => {
        onSave();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                        Configure quantos pontos cada ação vale. Os alunos acumulam pontos automaticamente ao realizar essas ações no app.
                    </p>
                </div>
            </div>

            {/* Rules List */}
            <div className="space-y-3">
                {rules.map(rule => (
                    <div
                        key={rule.id}
                        className="flex items-center justify-between gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                    >
                        <div className="flex-1">
                            <p className="font-medium text-slate-900 dark:text-white">
                                {rule.action}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {rule.description}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={rule.points}
                                onChange={(e) => handlePointsChange(rule.id, parseInt(e.target.value) || 0)}
                                className="w-20 px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-center text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                            <span className="text-sm text-slate-500 dark:text-slate-400 w-8">pts</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/20"
                >
                    <Save className="w-5 h-5" />
                    <span>Salvar Regras</span>
                </button>
            </div>
        </div>
    );
}
