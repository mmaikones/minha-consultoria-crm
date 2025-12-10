import { useState } from 'react';
import { Check, Clock, Flame } from 'lucide-react';
import { todayMeals as initialMeals, macroSummary, StudentMeal } from '../../data/mockStudentData';

const MacroCircle = ({ label, current, target, color }: { label: string; current: number; target: number; color: string }) => {
    const percentage = Math.min((current / target) * 100, 100);
    const circumference = 2 * Math.PI * 32;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-18 h-18">
                <svg className="w-18 h-18 -rotate-90" viewBox="0 0 72 72">
                    <circle
                        cx="36"
                        cy="36"
                        r="32"
                        stroke="currentColor"
                        strokeWidth="5"
                        fill="transparent"
                        className="text-muted"
                    />
                    <circle
                        cx="36"
                        cy="36"
                        r="32"
                        stroke={color}
                        strokeWidth="5"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-sm font-bold text-foreground">{current}g</span>
                </div>
            </div>
            <span className="text-xs text-muted-foreground mt-1.5">{label}</span>
            <span className="text-[10px] text-muted-foreground/60">{target}g</span>
        </div>
    );
};

export default function DietView() {
    const [meals, setMeals] = useState<StudentMeal[]>(initialMeals);
    const [toast, setToast] = useState<string | null>(null);

    const handleToggleMeal = (mealId: string) => {
        setMeals(prev => prev.map(meal => {
            if (meal.id === mealId) {
                const wasConsumed = meal.consumed;
                if (!wasConsumed) {
                    setToast('+15 pts! 🍎');
                    setTimeout(() => setToast(null), 2000);
                }
                return { ...meal, consumed: !wasConsumed };
            }
            return meal;
        }));
    };

    const consumedCalories = meals.filter(m => m.consumed).reduce((sum, m) => sum + m.calories, 0);
    const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);

    return (
        <div className="space-y-4">
            {/* Macro Summary */}
            <div className="bg-card rounded-xl p-4 border border-border">
                <h2 className="text-base font-bold text-foreground mb-3 text-center">
                    Macros do Dia
                </h2>

                <div className="flex justify-around">
                    <MacroCircle
                        label="Proteína"
                        current={macroSummary.protein.current}
                        target={macroSummary.protein.target}
                        color="var(--primary)"
                    />
                    <MacroCircle
                        label="Carbo"
                        current={macroSummary.carbs.current}
                        target={macroSummary.carbs.target}
                        color="var(--secondary)"
                    />
                    <MacroCircle
                        label="Gordura"
                        current={macroSummary.fat.current}
                        target={macroSummary.fat.target}
                        color="#f97316"
                    />
                </div>

                <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-center justify-center gap-2">
                        <Flame className="w-4 h-4 text-primary" />
                        <span className="text-sm text-foreground font-medium">
                            {consumedCalories} / {totalCalories} kcal
                        </span>
                    </div>
                </div>
            </div>

            {/* Meals */}
            <div className="space-y-3">
                <h2 className="text-base font-bold text-foreground px-1">
                    Refeições
                </h2>

                {meals.map(meal => (
                    <div
                        key={meal.id}
                        className={`bg-card rounded-xl overflow-hidden border transition-all ${meal.consumed
                            ? 'border-green-300 dark:border-green-800'
                            : 'border-border'
                            }`}
                    >
                        {/* Header */}
                        <div
                            onClick={() => handleToggleMeal(meal.id)}
                            className={`flex items-center justify-between p-3 cursor-pointer active:bg-muted/50 ${meal.consumed ? 'bg-green-50 dark:bg-green-900/20' : ''
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <button
                                    className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all ${meal.consumed
                                        ? 'bg-green-500 text-white'
                                        : 'bg-muted text-muted-foreground'
                                        }`}
                                >
                                    {meal.consumed ? (
                                        <Check className="w-4 h-4" />
                                    ) : (
                                        <Clock className="w-4 h-4" />
                                    )}
                                </button>
                                <div>
                                    <p className={`font-medium text-sm ${meal.consumed
                                        ? 'text-green-700 dark:text-green-400 line-through'
                                        : 'text-foreground'
                                        }`}>
                                        {meal.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {meal.time} • {meal.calories} kcal
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Foods */}
                        <div className="px-3 pb-3">
                            <div className="bg-muted/50 rounded-lg p-2.5">
                                <ul className="space-y-0.5">
                                    {meal.foods.map((food, i) => (
                                        <li
                                            key={i}
                                            className={`text-xs ${meal.consumed
                                                ? 'text-muted-foreground line-through'
                                                : 'text-foreground/80'
                                                }`}
                                        >
                                            • {food}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-green-600 text-white px-5 py-2.5 rounded-xl shadow-lg text-sm font-semibold z-50">
                    {toast}
                </div>
            )}
        </div>
    );
}

