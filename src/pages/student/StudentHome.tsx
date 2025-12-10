import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, X, Flame, Trophy, Gift, Dumbbell, Utensils } from 'lucide-react';
import { studentProfile, todayWorkout, todayMeals } from '../../data/mockStudentData';

export default function StudentHome() {
    const [showPromo, setShowPromo] = useState(true);

    const completedExercises = todayWorkout.exercises.filter(e => e.completed).length;
    const totalExercises = todayWorkout.exercises.length;

    const consumedMeals = todayMeals.filter(m => m.consumed).length;
    const totalMeals = todayMeals.length;

    const pointsProgress = (studentProfile.points / studentProfile.nextRewardPoints) * 100;

    return (
        <div className="space-y-4">
            {/* Streak & Gamification Card */}
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-5 text-white relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10" />

                <div className="flex items-center justify-between mb-4 relative">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <Flame className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-white/80 font-medium text-xs uppercase tracking-wide">Sequência</p>
                            <p className="text-2xl font-bold">{studentProfile.streakDays} dias</p>
                        </div>
                    </div>
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <Trophy className="w-5 h-5" />
                    </div>
                </div>

                <div className="space-y-2 relative">
                    <div className="flex justify-between text-xs font-medium text-white/80">
                        <span>Próxima recompensa</span>
                        <span>{studentProfile.nextRewardPoints - studentProfile.points} pts</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white rounded-full"
                            style={{ width: `${Math.min(pointsProgress, 100)}%` }}
                        />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/80 bg-white/10 px-3 py-2 rounded-lg w-fit">
                        <Gift className="w-4 h-4" />
                        <span className="font-medium">{studentProfile.currentReward}</span>
                    </div>
                </div>
            </div>

            {/* Today's Tasks */}
            <div className="space-y-3">
                <h2 className="text-lg font-bold text-foreground px-1">
                    Hoje
                </h2>

                {/* Workout Task */}
                <Link
                    to="/app/treino"
                    className="group block bg-card rounded-xl p-4 border border-border active:scale-[0.98] transition-all"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                            <Dumbbell className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-foreground">
                                {todayWorkout.name}
                            </p>
                            <p className="text-sm text-muted-foreground mb-2">
                                {completedExercises}/{totalExercises} exercícios
                            </p>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-full transition-all"
                                    style={{ width: `${(completedExercises / totalExercises) * 100}%` }}
                                />
                            </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                    </div>
                </Link>

                {/* Diet Task */}
                <Link
                    to="/app/dieta"
                    className="group block bg-card rounded-xl p-4 border border-border active:scale-[0.98] transition-all"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                            <Utensils className="w-6 h-6 text-secondary" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-foreground">
                                Dieta do Dia
                            </p>
                            <p className="text-sm text-muted-foreground mb-2">
                                {consumedMeals}/{totalMeals} refeições
                            </p>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-secondary rounded-full transition-all"
                                    style={{ width: `${(consumedMeals / totalMeals) * 100}%` }}
                                />
                            </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-secondary/10 transition-colors">
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                    </div>
                </Link>
            </div>

            {/* Promo Banner */}
            {showPromo && (
                <div className="relative bg-card rounded-xl p-4 border border-border overflow-hidden">
                    <button
                        onClick={() => setShowPromo(false)}
                        className="absolute top-3 right-3 p-1 rounded-full bg-muted hover:bg-muted/80 transition-colors z-10"
                    >
                        <X className="w-4 h-4 text-muted-foreground" />
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-foreground">Renovação VIP</p>
                            <p className="text-muted-foreground text-sm">
                                Garanta 10% OFF renovando hoje!
                            </p>
                        </div>
                    </div>

                    <button className="mt-4 w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all active:scale-95">
                        Quero meu desconto
                    </button>
                </div>
            )}
        </div>
    );
}
