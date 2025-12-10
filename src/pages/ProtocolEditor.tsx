import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, GripVertical, Dumbbell, Apple, Zap, Clock, Edit2, Search, X, Sparkles, Check, CheckCircle2, UserPlus } from 'lucide-react';
import { Protocol, ProtocolType, WorkoutDay, Exercise, Meal, Food, mockProtocols } from '../data/mockProtocols';
import { mockExercises, mockFoods, muscleGroups, foodCategories, LibraryExercise, LibraryFood } from '../data/mockLibrary';
import { motion, AnimatePresence } from 'framer-motion';
import AIGeneratorModal from '../components/protocols/AIGeneratorModal';
import AssignProtocolModal from '../components/modals/AssignProtocolModal';

import ImportProtocolModal from '../components/protocols/ImportProtocolModal';

type EditorTab = 'workout' | 'diet';

export default function ProtocolEditor() {
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const isNew = id === 'novo';

    const getInitialType = (): ProtocolType => {
        const typeParam = searchParams.get('type');
        if (typeParam === 'workout' || typeParam === 'diet' || typeParam === 'combo') {
            return typeParam;
        }
        return 'workout';
    };

    const [protocol, setProtocol] = useState<Protocol>(() => {
        if (isNew) {
            const type = getInitialType();
            return {
                id: `p${Date.now()}`,
                name: '',
                type,
                description: '',
                workoutDays: type !== 'diet' ? [{ id: 'd1', name: 'Treino A', exercises: [] }] : undefined,
                meals: type !== 'workout' ? [{ id: 'm1', name: 'Café da Manhã', time: '07:00', foods: [] }] : undefined,
                studentsUsing: [],
                createdAt: new Date().toISOString().split('T')[0],
                updatedAt: new Date().toISOString().split('T')[0],
                status: 'draft',
            };
        }
        return mockProtocols.find(p => p.id === id) || mockProtocols[0];
    });

    const [activeTab, setActiveTab] = useState<EditorTab>(protocol.type === 'diet' ? 'diet' : 'workout');
    const [toast, setToast] = useState<string | null>(null);
    const [editingDayId, setEditingDayId] = useState<string | null>(null);
    const [editingMealId, setEditingMealId] = useState<string | null>(null);

    // Library picker state
    const [showExercisePicker, setShowExercisePicker] = useState<string | null>(null); // dayId
    const [showFoodPicker, setShowFoodPicker] = useState<string | null>(null); // mealId
    const [librarySearch, setLibrarySearch] = useState('');
    const [libraryFilter, setLibraryFilter] = useState('');
    const [selectedLibraryItems, setSelectedLibraryItems] = useState<string[]>([]);

    // Local Library State (to allow creation)
    const [localExercises, setLocalExercises] = useState<LibraryExercise[]>(mockExercises);
    const [localFoods, setLocalFoods] = useState<LibraryFood[]>(mockFoods);

    // Creation State
    const [isCreatingExercise, setIsCreatingExercise] = useState(false);
    const [isCreatingFood, setIsCreatingFood] = useState(false);

    const [newExercise, setNewExercise] = useState<Partial<LibraryExercise>>({
        name: '',
        muscleGroup: 'Peito',
        equipment: 'Barra',
        instructions: ''
    });

    const [newFood, setNewFood] = useState<Partial<LibraryFood>>({
        name: '',
        category: 'Proteínas',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        portion: 100,
        measure: 'g'
    });

    const handleCreateExercise = () => {
        if (!newExercise.name) return showToast('❌ Nome é obrigatório!');

        const newItem: LibraryExercise = {
            id: `le${Date.now()}`,
            name: newExercise.name!,
            muscleGroup: newExercise.muscleGroup || 'Outros',
            equipment: newExercise.equipment || 'Livre',
            instructions: newExercise.instructions || '',
            videoUrl: ''
        };

        setLocalExercises([...localExercises, newItem]);
        toggleLibrarySelection(newItem.id);
        setIsCreatingExercise(false);
        setNewExercise({ name: '', muscleGroup: 'Peito', equipment: 'Barra', instructions: '' });
        showToast('✅ Exercício criado e selecionado!');
    };

    const handleCreateFood = () => {
        if (!newFood.name) return showToast('❌ Nome é obrigatório!');

        const newItem: LibraryFood = {
            id: `lf${Date.now()}`,
            name: newFood.name!,
            category: newFood.category || 'Outros',
            calories: Number(newFood.calories) || 0,
            protein: Number(newFood.protein) || 0,
            carbs: Number(newFood.carbs) || 0,
            fat: Number(newFood.fat) || 0,
            portion: Number(newFood.portion) || 100,
            measure: newFood.measure || 'g'
        };

        setLocalFoods([...localFoods, newItem]);
        toggleLibrarySelection(newItem.id);
        setIsCreatingFood(false);
        setNewFood({ name: '', category: 'Proteínas', calories: 0, protein: 0, carbs: 0, fat: 0, portion: 100, measure: 'g' });
        showToast('✅ Alimento criado e selecionado!');
    };

    const [showAIModal, setShowAIModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);

    const handleAssign = (studentIds: string[]) => {
        showToast(`✅ Protocolo atribuído a ${studentIds.length} aluno(s)!`);
        setShowAssignModal(false);
    };

    const handleAIGenerated = (aiData: any) => {
        setProtocol(prev => ({
            ...prev,
            name: aiData.name || prev.name,
            description: aiData.description || prev.description,
            // If type is combo, it overwrites both. If it was specialized, it might change type.
            // For this mock, we assume AI returns a combo structure which fits all or specific parts.
            workoutDays: aiData.workoutDays || prev.workoutDays,
            meals: aiData.meals || prev.meals,
            type: aiData.type || prev.type
        }));
        showToast('✨ Protocolo gerado com IA!');
    };

    const handleImportProtocol = (importedProtocol: Protocol) => {
        setProtocol(prev => {
            const isAddingDiet = prev.type === 'workout';

            // If importing an empty one
            if (importedProtocol.id === 'empty') {
                return {
                    ...prev,
                    type: 'combo',
                    meals: isAddingDiet ? [{ id: `m${Date.now()}`, name: 'Refeição 1', time: '08:00', foods: [] }] : prev.meals,
                    workoutDays: !isAddingDiet ? [{ id: `d${Date.now()}`, name: 'Treino A', exercises: [] }] : prev.workoutDays
                };
            }

            return {
                ...prev,
                type: 'combo',
                meals: isAddingDiet ? importedProtocol.meals : prev.meals,
                workoutDays: !isAddingDiet ? importedProtocol.workoutDays : prev.workoutDays
            };
        });

        setActiveTab(protocol.type === 'workout' ? 'diet' : 'workout');
        setShowImportModal(false);
        showToast(`✅ ${protocol.type === 'workout' ? 'Dieta' : 'Treino'} adicionado com sucesso!`);
    };

    const showToast = (message: string) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const handleSave = () => {
        showToast('✅ Protocolo salvo com sucesso!');
        setTimeout(() => navigate('/admin/protocolos'), 1500);
    };

    // Workout Day Operations
    const addWorkoutDay = () => {
        const newDay: WorkoutDay = {
            id: `d${Date.now()}`,
            name: `Treino ${String.fromCharCode(65 + (protocol.workoutDays?.length || 0))}`,
            exercises: [],
        };
        setProtocol(prev => ({
            ...prev,
            workoutDays: [...(prev.workoutDays || []), newDay],
        }));
    };

    const renameWorkoutDay = (dayId: string, newName: string) => {
        setProtocol(prev => ({
            ...prev,
            workoutDays: prev.workoutDays?.map(d => d.id === dayId ? { ...d, name: newName } : d),
        }));
    };

    const deleteWorkoutDay = (dayId: string) => {
        setProtocol(prev => ({
            ...prev,
            workoutDays: prev.workoutDays?.filter(d => d.id !== dayId),
        }));
    };

    const addExercise = (dayId: string) => {
        // Open picker instead of adding empty
        setShowExercisePicker(dayId);
        setLibrarySearch('');
        setLibraryFilter('');
        setSelectedLibraryItems([]);
    };

    const toggleLibrarySelection = (id: string) => {
        setSelectedLibraryItems(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const addSelectedExercises = (dayId: string) => {
        const exercisesToAdd = mockExercises.filter(ex => selectedLibraryItems.includes(ex.id));

        const newExercises: Exercise[] = exercisesToAdd.map(libExercise => ({
            id: `e${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: libExercise.name,
            sets: 3,
            reps: '12',
            load: 0,
            restSeconds: 60,
            notes: libExercise.instructions,
        }));

        setProtocol(prev => ({
            ...prev,
            workoutDays: prev.workoutDays?.map(d =>
                d.id === dayId ? { ...d, exercises: [...d.exercises, ...newExercises] } : d
            ),
        }));

        setShowExercisePicker(null);
        setSelectedLibraryItems([]);
        showToast(`${newExercises.length} exercícios adicionados!`);
    };

    const updateExercise = (dayId: string, exerciseId: string, field: keyof Exercise, value: string | number) => {
        setProtocol(prev => ({
            ...prev,
            workoutDays: prev.workoutDays?.map(d =>
                d.id === dayId
                    ? {
                        ...d,
                        exercises: d.exercises.map(e =>
                            e.id === exerciseId ? { ...e, [field]: value } : e
                        ),
                    }
                    : d
            ),
        }));
    };

    const deleteExercise = (dayId: string, exerciseId: string) => {
        setProtocol(prev => ({
            ...prev,
            workoutDays: prev.workoutDays?.map(d =>
                d.id === dayId ? { ...d, exercises: d.exercises.filter(e => e.id !== exerciseId) } : d
            ),
        }));
    };

    // Meal Operations
    const addMeal = () => {
        const newMeal: Meal = {
            id: `m${Date.now()}`,
            name: 'Nova Refeição',
            time: '12:00',
            foods: [],
        };
        setProtocol(prev => ({
            ...prev,
            meals: [...(prev.meals || []), newMeal],
        }));
    };

    const renameMeal = (mealId: string, newName: string) => {
        setProtocol(prev => ({
            ...prev,
            meals: prev.meals?.map(m => m.id === mealId ? { ...m, name: newName } : m),
        }));
    };

    const updateMealTime = (mealId: string, time: string) => {
        setProtocol(prev => ({
            ...prev,
            meals: prev.meals?.map(m => m.id === mealId ? { ...m, time } : m),
        }));
    };

    const deleteMeal = (mealId: string) => {
        setProtocol(prev => ({
            ...prev,
            meals: prev.meals?.filter(m => m.id !== mealId),
        }));
    };

    const addFood = (mealId: string) => {
        // Open picker instead of adding empty
        setShowFoodPicker(mealId);
        setLibrarySearch('');
        setLibraryFilter('');
        setSelectedLibraryItems([]);
    };

    const addSelectedFoods = (mealId: string) => {
        const foodsToAdd = mockFoods.filter(f => selectedLibraryItems.includes(f.id));

        const newFoods: Food[] = foodsToAdd.map(libFood => ({
            id: `f${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: libFood.name,
            quantity: libFood.portion,
            measure: libFood.measure,
            protein: libFood.protein,
            carbs: libFood.carbs,
            fat: libFood.fat,
            calories: libFood.calories,
        }));

        setProtocol(prev => ({
            ...prev,
            meals: prev.meals?.map(m =>
                m.id === mealId ? { ...m, foods: [...m.foods, ...newFoods] } : m
            ),
        }));
        setShowFoodPicker(null);
        setSelectedLibraryItems([]);
        showToast(`${newFoods.length} alimentos adicionados!`);
    };

    const updateFood = (mealId: string, foodId: string, field: keyof Food, value: string | number) => {
        setProtocol(prev => ({
            ...prev,
            meals: prev.meals?.map(m =>
                m.id === mealId
                    ? {
                        ...m,
                        foods: m.foods.map(f =>
                            f.id === foodId ? { ...f, [field]: value } : f
                        ),
                    }
                    : m
            ),
        }));
    };

    const deleteFood = (mealId: string, foodId: string) => {
        setProtocol(prev => ({
            ...prev,
            meals: prev.meals?.map(m =>
                m.id === mealId ? { ...m, foods: m.foods.filter(f => f.id !== foodId) } : m
            ),
        }));
    };

    const getTypeBadge = () => {
        switch (protocol.type) {
            case 'workout': return { text: '🏋️ Treino', bg: 'bg-blue-100 text-blue-700' };
            case 'diet': return { text: '🍎 Dieta', bg: 'bg-green-100 text-green-700' };
            case 'combo': return { text: '⚡ Combo', bg: 'bg-purple-100 text-purple-700' };
        }
    };

    const badge = getTypeBadge();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/protocolos')}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.bg}`}>
                                {badge.text}
                            </span>
                        </div>
                        <input
                            type="text"
                            value={protocol.name}
                            onChange={(e) => setProtocol({ ...protocol, name: e.target.value })}
                            placeholder="Nome do Protocolo"
                            className="text-xl font-bold text-slate-900 dark:text-white bg-transparent border-none focus:outline-none w-full"
                        />
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowAssignModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-sm"
                    >
                        <UserPlus className="w-5 h-5" />
                        <span className="hidden sm:inline">Atribuir</span>
                    </button>
                    <button
                        onClick={() => setShowAIModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md shadow-purple-500/20"
                    >
                        <Sparkles className="w-5 h-5" />
                        <span className="hidden sm:inline">Gerar com IA</span>
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                    >
                        <Save className="w-5 h-5" />
                        <span>Salvar</span>
                    </button>
                </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Descrição
                </label>
                <textarea
                    value={protocol.description}
                    onChange={(e) => setProtocol({ ...protocol, description: e.target.value })}
                    placeholder="Descreva o objetivo deste protocolo..."
                    rows={2}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
            </div>

            {/* Combo Tabs & Add Buttons */}
            <div className="flex items-center gap-4">
                {protocol.type === 'combo' ? (
                    <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-fit">
                        <button
                            onClick={() => setActiveTab('workout')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'workout'
                                ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <Dumbbell className="w-4 h-4" />
                            <span>Treino</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('diet')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'diet'
                                ? 'bg-white dark:bg-slate-700 text-green-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <Apple className="w-4 h-4" />
                            <span>Dieta</span>
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowImportModal(true)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border-2 border-dashed ${protocol.type === 'workout'
                            ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                            : 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                            }`}
                    >
                        <Plus className="w-4 h-4" />
                        {protocol.type === 'workout' ? 'Adicionar Dieta' : 'Adicionar Treino'}
                    </button>
                )}
            </div>

            {/* Workout Editor */}
            {(protocol.type === 'workout' || (protocol.type === 'combo' && activeTab === 'workout')) && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <Dumbbell className="w-5 h-5 text-blue-600" />
                            Dias de Treino
                        </h2>
                        <button
                            onClick={addWorkoutDay}
                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Adicionar Dia</span>
                        </button>
                    </div>

                    {protocol.workoutDays?.map(day => (
                        <div key={day.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                            {/* Day Header */}
                            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                                {editingDayId === day.id ? (
                                    <input
                                        type="text"
                                        value={day.name}
                                        onChange={(e) => renameWorkoutDay(day.id, e.target.value)}
                                        onBlur={() => setEditingDayId(null)}
                                        onKeyDown={(e) => e.key === 'Enter' && setEditingDayId(null)}
                                        autoFocus
                                        className="font-semibold text-slate-900 dark:text-white bg-white dark:bg-slate-600 px-2 py-1 rounded border border-slate-300 dark:border-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                ) : (
                                    <button
                                        onClick={() => setEditingDayId(day.id)}
                                        className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 hover:text-primary-600"
                                    >
                                        {day.name}
                                        <Edit2 className="w-4 h-4 opacity-50" />
                                    </button>
                                )}
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-slate-500">{day.exercises.length} exercícios</span>
                                    <button
                                        onClick={() => deleteWorkoutDay(day.id)}
                                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Exercises Table */}
                            <div className="p-4">
                                {day.exercises.length > 0 && (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="text-left text-slate-500 dark:text-slate-400">
                                                    <th className="pb-2 pr-2 w-8"></th>
                                                    <th className="pb-2 px-2">Exercício</th>
                                                    <th className="pb-2 px-2 w-16">Séries</th>
                                                    <th className="pb-2 px-2 w-24">Reps</th>
                                                    <th className="pb-2 px-2 w-20">Carga</th>
                                                    <th className="pb-2 px-2 w-20">Descanso</th>
                                                    <th className="pb-2 px-2 min-w-[140px]">Notas / Técnica</th>
                                                    <th className="pb-2 pl-2 w-10"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                                {day.exercises.map(exercise => (
                                                    <tr key={exercise.id} className="group">
                                                        <td className="py-2 pr-2">
                                                            <GripVertical className="w-4 h-4 text-slate-300 cursor-grab" />
                                                        </td>
                                                        <td className="py-2 px-2">
                                                            <input
                                                                type="text"
                                                                value={exercise.name}
                                                                onChange={(e) => updateExercise(day.id, exercise.id, 'name', e.target.value)}
                                                                placeholder="Nome do exercício"
                                                                className="w-full bg-transparent border-none focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                                                            />
                                                        </td>
                                                        <td className="py-2 px-2">
                                                            <input
                                                                type="number"
                                                                value={exercise.sets}
                                                                onChange={(e) => updateExercise(day.id, exercise.id, 'sets', parseInt(e.target.value) || 0)}
                                                                className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-2 py-1 text-center focus:outline-none focus:ring-1 focus:ring-primary-500"
                                                            />
                                                        </td>
                                                        <td className="py-2 px-2">
                                                            <input
                                                                type="text"
                                                                value={exercise.reps}
                                                                onChange={(e) => updateExercise(day.id, exercise.id, 'reps', e.target.value)}
                                                                className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-2 py-1 text-center focus:outline-none focus:ring-1 focus:ring-primary-500"
                                                            />
                                                        </td>
                                                        <td className="py-2 px-2">
                                                            <div className="flex items-center gap-1">
                                                                <input
                                                                    type="number"
                                                                    value={exercise.load || ''}
                                                                    onChange={(e) => updateExercise(day.id, exercise.id, 'load', parseInt(e.target.value) || 0)}
                                                                    placeholder="-"
                                                                    className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-2 py-1 text-center focus:outline-none focus:ring-1 focus:ring-primary-500"
                                                                />
                                                                <span className="text-xs text-slate-400">kg</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-2 px-2">
                                                            <div className="flex items-center gap-1">
                                                                <input
                                                                    type="number"
                                                                    value={exercise.restSeconds}
                                                                    onChange={(e) => updateExercise(day.id, exercise.id, 'restSeconds', parseInt(e.target.value) || 0)}
                                                                    className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-2 py-1 text-center focus:outline-none focus:ring-1 focus:ring-primary-500"
                                                                />
                                                                <span className="text-xs text-slate-400">s</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-2 px-2">
                                                            <input
                                                                type="text"
                                                                value={exercise.notes || ''}
                                                                onChange={(e) => updateExercise(day.id, exercise.id, 'notes', e.target.value)}
                                                                placeholder="Ex: Rest-pause, Pirâmide, Drop-set..."
                                                                className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
                                                            />
                                                        </td>
                                                        <td className="py-2 pl-2">
                                                            <button
                                                                onClick={() => deleteExercise(day.id, exercise.id)}
                                                                className="p-1 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 opacity-0 group-hover:opacity-100 transition-all"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                <button
                                    onClick={() => addExercise(day.id)}
                                    className="mt-3 flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors w-full justify-center border-2 border-dashed border-slate-200 dark:border-slate-700"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Adicionar Exercício</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}



            {/* Import Modal */}
            {showImportModal && (
                <ImportProtocolModal
                    currentType={protocol.type as 'workout' | 'diet'}
                    onImport={handleImportProtocol}
                    onClose={() => setShowImportModal(false)}
                />
            )}

            {/* Diet Editor */}
            {(protocol.type === 'diet' || (protocol.type === 'combo' && activeTab === 'diet')) && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <Apple className="w-5 h-5 text-green-600" />
                            Refeições
                        </h2>
                        <button
                            onClick={addMeal}
                            className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-lg text-sm font-medium hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Adicionar Refeição</span>
                        </button>
                    </div>

                    {protocol.meals?.map(meal => (
                        <div key={meal.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                            {/* Meal Header */}
                            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                                <div className="flex items-center gap-3">
                                    {editingMealId === meal.id ? (
                                        <input
                                            type="text"
                                            value={meal.name}
                                            onChange={(e) => renameMeal(meal.id, e.target.value)}
                                            onBlur={() => setEditingMealId(null)}
                                            onKeyDown={(e) => e.key === 'Enter' && setEditingMealId(null)}
                                            autoFocus
                                            className="font-semibold text-slate-900 dark:text-white bg-white dark:bg-slate-600 px-2 py-1 rounded border border-slate-300 dark:border-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    ) : (
                                        <button
                                            onClick={() => setEditingMealId(meal.id)}
                                            className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 hover:text-primary-600"
                                        >
                                            {meal.name}
                                            <Edit2 className="w-4 h-4 opacity-50" />
                                        </button>
                                    )}
                                    <div className="flex items-center gap-1 text-slate-500">
                                        <Clock className="w-4 h-4" />
                                        <input
                                            type="time"
                                            value={meal.time}
                                            onChange={(e) => updateMealTime(meal.id, e.target.value)}
                                            className="bg-transparent border-none focus:outline-none text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-slate-500">{meal.foods.length} alimentos</span>
                                    <button
                                        onClick={() => deleteMeal(meal.id)}
                                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Foods Table */}
                            <div className="p-4">
                                {meal.foods.length > 0 && (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="text-left text-slate-500 dark:text-slate-400">
                                                    <th className="pb-2 px-2">Alimento</th>
                                                    <th className="pb-2 px-2 w-20">Qtd</th>
                                                    <th className="pb-2 px-2 w-16">Medida</th>
                                                    <th className="pb-2 px-2 w-16 text-center">Prot</th>
                                                    <th className="pb-2 px-2 w-16 text-center">Carb</th>
                                                    <th className="pb-2 px-2 w-16 text-center">Gord</th>
                                                    <th className="pb-2 px-2 w-16 text-center">Kcal</th>
                                                    <th className="pb-2 pl-2 w-10"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                                {meal.foods.map(food => (
                                                    <tr key={food.id} className="group">
                                                        <td className="py-2 px-2">
                                                            <input
                                                                type="text"
                                                                value={food.name}
                                                                onChange={(e) => updateFood(meal.id, food.id, 'name', e.target.value)}
                                                                placeholder="Nome do alimento"
                                                                className="w-full bg-transparent border-none focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                                                            />
                                                        </td>
                                                        <td className="py-2 px-2">
                                                            <input
                                                                type="number"
                                                                value={food.quantity}
                                                                onChange={(e) => updateFood(meal.id, food.id, 'quantity', parseInt(e.target.value) || 0)}
                                                                className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-2 py-1 text-center focus:outline-none focus:ring-1 focus:ring-primary-500"
                                                            />
                                                        </td>
                                                        <td className="py-2 px-2">
                                                            <select
                                                                value={food.measure}
                                                                onChange={(e) => updateFood(meal.id, food.id, 'measure', e.target.value)}
                                                                className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-1 py-1 text-center focus:outline-none focus:ring-1 focus:ring-primary-500"
                                                            >
                                                                <option value="g">g</option>
                                                                <option value="ml">ml</option>
                                                                <option value="un">un</option>
                                                                <option value="fatias">fatias</option>
                                                                <option value="colher">col</option>
                                                            </select>
                                                        </td>
                                                        <td className="py-2 px-2">
                                                            <input
                                                                type="number"
                                                                value={food.protein}
                                                                onChange={(e) => updateFood(meal.id, food.id, 'protein', parseInt(e.target.value) || 0)}
                                                                className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-2 py-1 text-center focus:outline-none focus:ring-1 focus:ring-primary-500"
                                                            />
                                                        </td>
                                                        <td className="py-2 px-2">
                                                            <input
                                                                type="number"
                                                                value={food.carbs}
                                                                onChange={(e) => updateFood(meal.id, food.id, 'carbs', parseInt(e.target.value) || 0)}
                                                                className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-2 py-1 text-center focus:outline-none focus:ring-1 focus:ring-primary-500"
                                                            />
                                                        </td>
                                                        <td className="py-2 px-2">
                                                            <input
                                                                type="number"
                                                                value={food.fat}
                                                                onChange={(e) => updateFood(meal.id, food.id, 'fat', parseInt(e.target.value) || 0)}
                                                                className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-2 py-1 text-center focus:outline-none focus:ring-1 focus:ring-primary-500"
                                                            />
                                                        </td>
                                                        <td className="py-2 px-2">
                                                            <input
                                                                type="number"
                                                                value={food.calories}
                                                                onChange={(e) => updateFood(meal.id, food.id, 'calories', parseInt(e.target.value) || 0)}
                                                                className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-2 py-1 text-center focus:outline-none focus:ring-1 focus:ring-primary-500"
                                                            />
                                                        </td>
                                                        <td className="py-2 pl-2">
                                                            <button
                                                                onClick={() => deleteFood(meal.id, food.id)}
                                                                className="p-1 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 opacity-0 group-hover:opacity-100 transition-all"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                <button
                                    onClick={() => addFood(meal.id)}
                                    className="mt-3 flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors w-full justify-center border-2 border-dashed border-slate-200 dark:border-slate-700"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Adicionar Alimento</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Exercise Picker Modal */}
            <AnimatePresence>
                {showExercisePicker && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowExercisePicker(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Dumbbell className="w-5 h-5 text-blue-600" />
                                    {isCreatingExercise ? 'Novo Exercício' : 'Selecionar Exercício'}
                                </h2>
                                <div className="flex items-center gap-1">
                                    {!isCreatingExercise && (
                                        <button
                                            onClick={() => setIsCreatingExercise(true)}
                                            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                                        >
                                            <Plus className="w-4 h-4" /> Novo
                                        </button>
                                    )}
                                    <button onClick={() => setShowExercisePicker(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                                        <X className="w-5 h-5 text-slate-500" />
                                    </button>
                                </div>
                            </div>

                            {isCreatingExercise ? (
                                <div className="p-4 space-y-4 overflow-y-auto flex-1">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nome</label>
                                        <input
                                            type="text"
                                            value={newExercise.name}
                                            onChange={e => setNewExercise({ ...newExercise, name: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg"
                                            placeholder="Ex: Supino Reto"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Grupo Muscular</label>
                                            <select
                                                value={newExercise.muscleGroup}
                                                onChange={e => setNewExercise({ ...newExercise, muscleGroup: e.target.value })}
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg"
                                            >
                                                {muscleGroups.map(g => <option key={g} value={g}>{g}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Equipamento</label>
                                            <input
                                                type="text"
                                                value={newExercise.equipment}
                                                onChange={e => setNewExercise({ ...newExercise, equipment: e.target.value })}
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg"
                                                placeholder="Ex: Barra, Halter..."
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Instruções (Opcional)</label>
                                        <textarea
                                            value={newExercise.instructions}
                                            onChange={e => setNewExercise({ ...newExercise, instructions: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg"
                                            rows={3}
                                            placeholder="Dicas de execução..."
                                        />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex gap-2">
                                        <div className="flex-1 relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder="Buscar exercício..."
                                                value={librarySearch}
                                                onChange={(e) => setLibrarySearch(e.target.value)}
                                                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                                            />
                                        </div>
                                        <select
                                            value={libraryFilter}
                                            onChange={(e) => setLibraryFilter(e.target.value)}
                                            className="px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                                        >
                                            <option value="">Todos</option>
                                            {muscleGroups.map(g => <option key={g} value={g}>{g}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-2 pb-20">
                                        {localExercises
                                            .filter(e => (!librarySearch || e.name.toLowerCase().includes(librarySearch.toLowerCase())) &&
                                                (!libraryFilter || e.muscleGroup === libraryFilter))
                                            .map(ex => {
                                                const isSelected = selectedLibraryItems.includes(ex.id);
                                                return (
                                                    <button
                                                        key={ex.id}
                                                        onClick={() => toggleLibrarySelection(ex.id)}
                                                        className={`w-full p-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg text-left border mb-2 transition-all ${isSelected
                                                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                                                            : 'bg-white dark:bg-slate-800 border-transparent'
                                                            }`}
                                                    >
                                                        <div className="relative">
                                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-600' : 'bg-blue-100 dark:bg-blue-900/30'
                                                                }`}>
                                                                <Dumbbell className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-blue-600'}`} />
                                                            </div>
                                                            {isSelected && (
                                                                <div className="absolute -top-1 -right-1 bg-blue-600 rounded-full border-2 border-white dark:border-slate-800">
                                                                    <Check className="w-3 h-3 text-white" />
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex-1">
                                                            <p className={`font-medium text-sm ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-900 dark:text-white'}`}>
                                                                {ex.name}
                                                            </p>
                                                            <p className="text-xs text-slate-500">{ex.muscleGroup} • {ex.equipment}</p>
                                                        </div>
                                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isSelected
                                                            ? 'bg-blue-600 border-blue-600'
                                                            : 'border-slate-300 dark:border-slate-600'
                                                            }`}>
                                                            {isSelected && <Check className="w-3 h-3 text-white" />}
                                                        </div>
                                                    </button>
                                                )
                                            })}
                                    </div>
                                </>
                            )}

                            {/* Sticky Footer */}
                            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                                {isCreatingExercise ? (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setIsCreatingExercise(false)}
                                            className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleCreateExercise}
                                            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                                        >
                                            Salvar e Usar
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => addSelectedExercises(showExercisePicker)}
                                        disabled={selectedLibraryItems.length === 0}
                                        className="w-full py-3 bg-blue-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 disabled:shadow-none flex items-center justify-center gap-2"
                                    >
                                        <span>Adicionar {selectedLibraryItems.length > 0 ? `${selectedLibraryItems.length} Selecionados` : ''}</span>
                                        {selectedLibraryItems.length > 0 && <CheckCircle2 className="w-5 h-5" />}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Food Picker Modal */}
            <AnimatePresence>
                {showFoodPicker && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowFoodPicker(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Apple className="w-5 h-5 text-green-600" />
                                    {isCreatingFood ? 'Novo Alimento' : 'Selecionar Alimento'}
                                </h2>
                                <div className="flex items-center gap-1">
                                    {!isCreatingFood && (
                                        <button
                                            onClick={() => setIsCreatingFood(true)}
                                            className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                                        >
                                            <Plus className="w-4 h-4" /> Novo
                                        </button>
                                    )}
                                    <button onClick={() => setShowFoodPicker(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                                        <X className="w-5 h-5 text-slate-500" />
                                    </button>
                                </div>
                            </div>

                            {isCreatingFood ? (
                                <div className="p-4 space-y-4 overflow-y-auto flex-1">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nome</label>
                                        <input
                                            type="text"
                                            value={newFood.name}
                                            onChange={e => setNewFood({ ...newFood, name: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg"
                                            placeholder="Ex: Arroz Branco"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Categoria</label>
                                            <select
                                                value={newFood.category}
                                                onChange={e => setNewFood({ ...newFood, category: e.target.value })}
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg"
                                            >
                                                {foodCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Porção Padrão (g/ml)</label>
                                            <input
                                                type="number"
                                                value={newFood.portion}
                                                onChange={e => setNewFood({ ...newFood, portion: Number(e.target.value) })}
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2">
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-500">Kcal</label>
                                            <input
                                                type="number"
                                                value={newFood.calories}
                                                onChange={e => setNewFood({ ...newFood, calories: Number(e.target.value) })}
                                                className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-center"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-500">Prot</label>
                                            <input
                                                type="number"
                                                value={newFood.protein}
                                                onChange={e => setNewFood({ ...newFood, protein: Number(e.target.value) })}
                                                className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-center"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-500">Carb</label>
                                            <input
                                                type="number"
                                                value={newFood.carbs}
                                                onChange={e => setNewFood({ ...newFood, carbs: Number(e.target.value) })}
                                                className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-center"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-500">Gord</label>
                                            <input
                                                type="number"
                                                value={newFood.fat}
                                                onChange={e => setNewFood({ ...newFood, fat: Number(e.target.value) })}
                                                className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-center"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex gap-2">
                                        <div className="flex-1 relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder="Buscar alimento..."
                                                value={librarySearch}
                                                onChange={(e) => setLibrarySearch(e.target.value)}
                                                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                                            />
                                        </div>
                                        <select
                                            value={libraryFilter}
                                            onChange={(e) => setLibraryFilter(e.target.value)}
                                            className="px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                                        >
                                            <option value="">Todas</option>
                                            {foodCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-2 pb-20">
                                        {localFoods
                                            .filter(f => (!librarySearch || f.name.toLowerCase().includes(librarySearch.toLowerCase())) &&
                                                (!libraryFilter || f.category === libraryFilter))
                                            .map(food => {
                                                const isSelected = selectedLibraryItems.includes(food.id);
                                                return (
                                                    <button
                                                        key={food.id}
                                                        onClick={() => toggleLibrarySelection(food.id)}
                                                        className={`w-full p-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg text-left border mb-2 transition-all ${isSelected
                                                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                                            : 'bg-white dark:bg-slate-800 border-transparent'
                                                            }`}
                                                    >
                                                        <div className="relative">
                                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${isSelected ? 'bg-green-600' : 'bg-green-100 dark:bg-green-900/30'
                                                                }`}>
                                                                <Apple className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-green-600'}`} />
                                                            </div>
                                                            {isSelected && (
                                                                <div className="absolute -top-1 -right-1 bg-green-600 rounded-full border-2 border-white dark:border-slate-800">
                                                                    <Check className="w-3 h-3 text-white" />
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex-1">
                                                            <p className={`font-medium text-sm ${isSelected ? 'text-green-700 dark:text-green-300' : 'text-slate-900 dark:text-white'}`}>
                                                                {food.name}
                                                            </p>
                                                            <p className="text-xs text-slate-500">
                                                                {food.calories}kcal • P:{food.protein} C:{food.carbs} G:{food.fat}
                                                            </p>
                                                        </div>
                                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isSelected
                                                            ? 'bg-green-600 border-green-600'
                                                            : 'border-slate-300 dark:border-slate-600'
                                                            }`}>
                                                            {isSelected && <Check className="w-3 h-3 text-white" />}
                                                        </div>
                                                    </button>
                                                )
                                            })}
                                    </div>

                                    {/* Sticky Footer */}
                                    <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                                        {isCreatingFood ? (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setIsCreatingFood(false)}
                                                    className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    onClick={handleCreateFood}
                                                    className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors shadow-lg shadow-green-500/20"
                                                >
                                                    Salvar e Usar
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => addSelectedFoods(showFoodPicker)}
                                                disabled={selectedLibraryItems.length === 0}
                                                className="w-full py-3 bg-green-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-xl font-medium hover:bg-green-700 transition-colors shadow-lg shadow-green-500/20 disabled:shadow-none flex items-center justify-center gap-2"
                                            >
                                                <span>Adicionar {selectedLibraryItems.length > 0 ? `${selectedLibraryItems.length} Selecionados` : ''}</span>
                                                {selectedLibraryItems.length > 0 && <CheckCircle2 className="w-5 h-5" />}
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Import Modal */}
            {
                showImportModal && (
                    <ImportProtocolModal
                        currentType={protocol.type as 'workout' | 'diet'}
                        onImport={handleImportProtocol}
                        onClose={() => setShowImportModal(false)}
                    />
                )
            }

            <AssignProtocolModal
                isOpen={showAssignModal}
                protocol={protocol}
                onClose={() => setShowAssignModal(false)}
                onConfirm={handleAssign}
            />

            <AIGeneratorModal
                isOpen={showAIModal}
                onClose={() => setShowAIModal(false)}
                onGenerate={handleAIGenerated}
            />

            {/* Toast */}
            {
                toast && (
                    <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
                        <span>{toast}</span>
                    </div>
                )
            }
        </div >
    );
}
