import { useState } from 'react';
import { Check, Clock, Dumbbell, Play, Home } from 'lucide-react';
import { weekWorkouts, TodayExercise } from '../../data/mockStudentData';

const days = [
    { id: 'seg', label: 'Seg' },
    { id: 'ter', label: 'Ter' },
    { id: 'qua', label: 'Qua' },
    { id: 'qui', label: 'Qui' },
    { id: 'sex', label: 'Sex' },
    { id: 'sab', label: 'Sáb' },
    { id: 'dom', label: 'Dom' },
];

export default function WorkoutView() {
    const today = new Date().getDay();
    const todayId = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'][today];

    const [selectedDay, setSelectedDay] = useState(todayId);
    const [exercises, setExercises] = useState<{ [key: string]: TodayExercise[] }>(() => {
        const initial: { [key: string]: TodayExercise[] } = {};
        Object.keys(weekWorkouts).forEach(day => {
            initial[day] = weekWorkouts[day].exercises.map(e => ({ ...e }));
        });
        return initial;
    });
    const [toast, setToast] = useState<string | null>(null);

    const currentWorkout = weekWorkouts[selectedDay];
    const currentExercises = exercises[selectedDay] || [];

    const handleToggleExercise = (exerciseId: string) => {
        const updated = { ...exercises };
        const dayExercises = [...(updated[selectedDay] || [])];
        const index = dayExercises.findIndex(e => e.id === exerciseId);

        if (index !== -1) {
            const wasCompleted = dayExercises[index].completed;
            dayExercises[index] = { ...dayExercises[index], completed: !wasCompleted };
            updated[selectedDay] = dayExercises;
            setExercises(updated);

            if (!wasCompleted) {
                setToast('Exercício concluído! 💪');
                setTimeout(() => setToast(null), 2000);
            }
        }
    };

    const completedCount = currentExercises.filter(e => e.completed).length;

    return (
        <div className="space-y-4">
            {/* Day Selector */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                {days.map(day => (
                    <button
                        key={day.id}
                        onClick={() => setSelectedDay(day.id)}
                        className={`flex-shrink-0 w-12 h-14 rounded-xl font-semibold text-sm transition-all flex flex-col items-center justify-center gap-0.5 ${selectedDay === day.id
                            ? 'bg-primary text-primary-foreground'
                            : day.id === todayId
                                ? 'bg-primary/10 text-primary'
                                : 'bg-card text-muted-foreground border border-border'
                            }`}
                    >
                        <span className="text-[10px] uppercase">{day.label}</span>
                        {day.id === todayId && <span className="w-1 h-1 rounded-full bg-current" />}
                    </button>
                ))}
            </div>

            {/* Workout Header */}
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-5 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8" />

                <div className="flex items-start justify-between relative z-10">
                    <div>
                        <span className="inline-block px-2 py-0.5 rounded-full bg-white/20 text-xs font-medium mb-2">
                            {currentWorkout.type}
                        </span>
                        <h1 className="text-xl font-bold mb-1">
                            {currentWorkout.name}
                        </h1>
                        <div className="flex items-center gap-2 text-white/80 text-sm">
                            <Clock className="w-4 h-4" />
                            <span>{currentWorkout.exercises.length * 10} min</span>
                        </div>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Dumbbell className="w-6 h-6" />
                    </div>
                </div>

                {currentExercises.length > 0 && (
                    <div className="mt-4">
                        <div className="flex justify-between text-xs mb-1.5 text-white/80">
                            <span>Progresso</span>
                            <span>{Math.round((completedCount / currentExercises.length) * 100)}%</span>
                        </div>
                        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white rounded-full transition-all duration-500"
                                style={{ width: `${(completedCount / currentExercises.length) * 100}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Exercises */}
            {currentExercises.length === 0 ? (
                <div className="text-center py-12 px-4">
                    <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-2xl flex items-center justify-center">
                        <Home className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h2 className="text-lg font-bold text-foreground mb-1">
                        Dia de Descanso
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Aproveite para recuperar seus músculos! 💧
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {currentExercises.map((exercise, index) => (
                        <div
                            key={exercise.id}
                            className={`bg-card rounded-xl p-3 border transition-all ${exercise.completed
                                ? 'border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                                : 'border-border'
                                }`}
                        >
                            <div className="flex gap-3">
                                {/* Toggle Button */}
                                <button
                                    onClick={() => handleToggleExercise(exercise.id)}
                                    className={`flex-shrink-0 w-11 h-11 rounded-lg flex items-center justify-center transition-all ${exercise.completed
                                        ? 'bg-green-500 text-white'
                                        : 'bg-muted text-muted-foreground'
                                        }`}
                                >
                                    {exercise.completed ? (
                                        <Check className="w-5 h-5" />
                                    ) : (
                                        <span className="text-lg font-bold">{index + 1}</span>
                                    )}
                                </button>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <p className={`font-semibold leading-tight truncate pr-2 ${exercise.completed
                                            ? 'text-green-700 dark:text-green-400'
                                            : 'text-foreground'
                                            }`}>
                                            {exercise.name}
                                        </p>

                                        {/* Video Button */}
                                        <button className="shrink-0 p-1.5 bg-primary/10 rounded-lg text-primary hover:bg-primary/20 transition-colors">
                                            <Play className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className="bg-muted px-2 py-0.5 rounded text-xs font-medium text-muted-foreground">
                                            {exercise.sets} séries
                                        </span>
                                        <span className="bg-muted px-2 py-0.5 rounded text-xs font-medium text-muted-foreground">
                                            {exercise.reps} reps
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-green-600 text-white px-5 py-2.5 rounded-xl shadow-lg text-sm font-semibold z-50 flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    {toast}
                </div>
            )}
        </div>
    );
}

