import { useState, useMemo } from 'react';
import {
    Dumbbell,
    Apple,
    Search,
    Plus,
    Edit2,
    Trash2,
    X,
    Check,
    Filter,
    ChevronDown,
    FileText,
    Download,
    Link as LinkIcon,
    Image as ImageIcon,
    Video as VideoIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LibraryExercise,
    LibraryFood,
    LibraryDocument,
    mockExercises as initialExercises,
    mockFoods as initialFoods,
    mockDocuments as initialDocuments,
    muscleGroups,
    equipmentTypes,
    foodCategories,
    documentCategories
} from '../data/mockLibrary';

type Tab = 'exercises' | 'foods' | 'files';

export default function Library() {
    const [activeTab, setActiveTab] = useState<Tab>('exercises');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('');
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);

    // Data
    const [exercises, setExercises] = useState<LibraryExercise[]>(initialExercises);
    const [foods, setFoods] = useState<LibraryFood[]>(initialFoods);
    const [documents, setDocuments] = useState<LibraryDocument[]>(initialDocuments);

    // Modal
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<LibraryExercise | LibraryFood | LibraryDocument | null>(null);

    // Toast
    const [toast, setToast] = useState<string | null>(null);

    // Form state for exercises
    const [exerciseForm, setExerciseForm] = useState({
        name: '', muscleGroup: '', equipment: '', instructions: ''
    });

    // Form state for foods
    const [foodForm, setFoodForm] = useState({
        name: '', category: '', portion: '', measure: '',
        protein: '', carbs: '', fat: '', calories: ''
    });

    // Form state for documents
    const [documentForm, setDocumentForm] = useState({
        title: '', category: '', type: 'pdf', url: '', description: ''
    });

    // Filters
    const filterOptions = activeTab === 'exercises' ? muscleGroups : activeTab === 'foods' ? foodCategories : documentCategories;

    // Filtered data
    const filteredExercises = useMemo(() => {
        return exercises.filter(ex => {
            const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter = !selectedFilter || ex.muscleGroup === selectedFilter;
            return matchesSearch && matchesFilter;
        });
    }, [exercises, searchQuery, selectedFilter]);

    const filteredFoods = useMemo(() => {
        return foods.filter(fd => {
            const matchesSearch = fd.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter = !selectedFilter || fd.category === selectedFilter;
            return matchesSearch && matchesFilter;
        });
    }, [foods, searchQuery, selectedFilter]);

    const filteredDocuments = useMemo(() => {
        return documents.filter(doc => {
            const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter = !selectedFilter || doc.category === selectedFilter;
            return matchesSearch && matchesFilter;
        });
    }, [documents, searchQuery, selectedFilter]);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const handleOpenModal = (item?: LibraryExercise | LibraryFood | LibraryDocument) => {
        if (item) {
            setEditingItem(item);
            if (activeTab === 'exercises') {
                const ex = item as LibraryExercise;
                setExerciseForm({ name: ex.name, muscleGroup: ex.muscleGroup, equipment: ex.equipment, instructions: ex.instructions || '' });
            } else if (activeTab === 'foods') {
                const fd = item as LibraryFood;
                setFoodForm({
                    name: fd.name, category: fd.category, portion: fd.portion.toString(), measure: fd.measure,
                    protein: fd.protein.toString(), carbs: fd.carbs.toString(), fat: fd.fat.toString(), calories: fd.calories.toString()
                });
            } else {
                const doc = item as LibraryDocument;
                setDocumentForm({
                    title: doc.title, category: doc.category, type: doc.type, url: doc.url, description: doc.description || ''
                });
            }
        } else {
            setEditingItem(null);
            setExerciseForm({ name: '', muscleGroup: '', equipment: '', instructions: '' });
            setFoodForm({ name: '', category: '', portion: '', measure: 'g', protein: '', carbs: '', fat: '', calories: '' });
            setDocumentForm({ title: '', category: '', type: 'pdf', url: '', description: '' });
        }
        setShowModal(true);
    };

    const handleSaveExercise = () => {
        if (!exerciseForm.name || !exerciseForm.muscleGroup) return;

        if (editingItem) {
            setExercises(exercises.map(ex =>
                ex.id === editingItem.id
                    ? { ...ex, ...exerciseForm }
                    : ex
            ));
            showToast('Exercício atualizado!');
        } else {
            const newEx: LibraryExercise = {
                id: `ex-${Date.now()}`,
                ...exerciseForm
            };
            setExercises([newEx, ...exercises]);
            showToast('Exercício adicionado!');
        }
        setShowModal(false);
    };

    const handleSaveFood = () => {
        if (!foodForm.name || !foodForm.category) return;

        const foodData: LibraryFood = {
            id: editingItem?.id || `fd-${Date.now()}`,
            name: foodForm.name,
            category: foodForm.category,
            portion: parseFloat(foodForm.portion) || 0,
            measure: foodForm.measure,
            protein: parseFloat(foodForm.protein) || 0,
            carbs: parseFloat(foodForm.carbs) || 0,
            fat: parseFloat(foodForm.fat) || 0,
            calories: parseFloat(foodForm.calories) || 0
        };

        if (editingItem) {
            setFoods(foods.map(fd => fd.id === editingItem.id ? foodData : fd));
            showToast('Alimento atualizado!');
        } else {
            setFoods([foodData, ...foods]);
            showToast('Alimento adicionado!');
        }
        setShowModal(false);
    };

    const handleSaveDocument = () => {
        if (!documentForm.title || !documentForm.category) return;

        const docData: LibraryDocument = {
            id: editingItem?.id || `doc-${Date.now()}`,
            title: documentForm.title,
            category: documentForm.category,
            type: documentForm.type as any,
            url: documentForm.url,
            description: documentForm.description,
            size: '2.5 MB', // Mock size
            createdAt: new Date().toISOString().split('T')[0]
        };

        if (editingItem) {
            setDocuments(documents.map(d => d.id === editingItem.id ? docData : d));
            showToast('Arquivo atualizado!');
        } else {
            setDocuments([docData, ...documents]);
            showToast('Arquivo adicionado!');
        }
        setShowModal(false);
    };

    const handleDelete = (id: string) => {
        if (activeTab === 'exercises') {
            setExercises(exercises.filter(ex => ex.id !== id));
        } else if (activeTab === 'foods') {
            setFoods(foods.filter(fd => fd.id !== id));
        } else {
            setDocuments(documents.filter(d => d.id !== id));
        }
        showToast('Item removido!');
    };

    const getFileIcon = (type: string) => {
        switch (type) {
            case 'pdf': return <FileText className="w-5 h-5 text-red-500" />;
            case 'image': return <ImageIcon className="w-5 h-5 text-blue-500" />;
            case 'video': return <VideoIcon className="w-5 h-5 text-purple-500" />;
            case 'link': return <LinkIcon className="w-5 h-5 text-green-500" />;
            default: return <FileText className="w-5 h-5 text-slate-500" />;
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Biblioteca</h1>
                    <p className="text-sm text-slate-500">Exercícios, alimentos e arquivos reutilizáveis</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium text-sm"
                >
                    <Plus className="w-4 h-4" />
                    Adicionar {activeTab === 'exercises' ? 'Exercício' : activeTab === 'foods' ? 'Alimento' : 'Arquivo'}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                <button
                    onClick={() => { setActiveTab('exercises'); setSelectedFilter(''); setSearchQuery(''); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'exercises'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400'
                        }`}
                >
                    <Dumbbell className="w-4 h-4" />
                    Exercícios ({exercises.length})
                </button>
                <button
                    onClick={() => { setActiveTab('foods'); setSelectedFilter(''); setSearchQuery(''); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'foods'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400'
                        }`}
                >
                    <Apple className="w-4 h-4" />
                    Alimentos ({foods.length})
                </button>
                <button
                    onClick={() => { setActiveTab('files'); setSelectedFilter(''); setSearchQuery(''); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'files'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400'
                        }`}
                >
                    <FileText className="w-4 h-4" />
                    Arquivos ({documents.length})
                </button>
            </div>

            {/* Search & Filter */}
            <div className="flex gap-2">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder={`Buscar ${activeTab === 'exercises' ? 'exercícios' : activeTab === 'foods' ? 'alimentos' : 'arquivos'}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500"
                    />
                </div>
                <div className="relative">
                    <button
                        onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${selectedFilter
                            ? 'bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-900/30 dark:border-primary-800 dark:text-primary-400'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                    >
                        <Filter className="w-4 h-4" />
                        {selectedFilter || 'Filtrar'}
                        <ChevronDown className="w-3 h-3" />
                    </button>

                    {showFilterDropdown && (
                        <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto">
                            <button
                                onClick={() => { setSelectedFilter(''); setShowFilterDropdown(false); }}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
                            >
                                Todos
                            </button>
                            {filterOptions.map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => { setSelectedFilter(opt); setShowFilterDropdown(false); }}
                                    className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 ${selectedFilter === opt ? 'text-primary-600 font-medium' : 'text-slate-700 dark:text-slate-300'
                                        }`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {activeTab === 'exercises' ? (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[60vh] overflow-y-auto">
                        {filteredExercises.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">Nenhum exercício encontrado</div>
                        ) : (
                            filteredExercises.map(ex => (
                                <div key={ex.id} className="p-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                        <Dumbbell className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-900 dark:text-white text-sm">{ex.name}</p>
                                        <div className="flex gap-2 mt-0.5">
                                            <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-400">{ex.muscleGroup}</span>
                                            <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-400">{ex.equipment}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => handleOpenModal(ex)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                                        <Edit2 className="w-4 h-4 text-slate-500" />
                                    </button>
                                    <button onClick={() => handleDelete(ex.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                ) : activeTab === 'foods' ? (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[60vh] overflow-y-auto">
                        {filteredFoods.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">Nenhum alimento encontrado</div>
                        ) : (
                            filteredFoods.map(fd => (
                                <div key={fd.id} className="p-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                        <Apple className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-900 dark:text-white text-sm">{fd.name}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            {fd.portion}{fd.measure} • P:{fd.protein}g C:{fd.carbs}g G:{fd.fat}g • {fd.calories}kcal
                                        </p>
                                    </div>
                                    <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-400">{fd.category}</span>
                                    <button onClick={() => handleOpenModal(fd)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                                        <Edit2 className="w-4 h-4 text-slate-500" />
                                    </button>
                                    <button onClick={() => handleDelete(fd.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[60vh] overflow-y-auto">
                        {filteredDocuments.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">Nenhum arquivo encontrado</div>
                        ) : (
                            filteredDocuments.map(doc => (
                                <div key={doc.id} className="p-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                                        {getFileIcon(doc.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-900 dark:text-white text-sm">{doc.title}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            {doc.category} • {doc.size}
                                        </p>
                                    </div>
                                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                                        <Download className="w-4 h-4 text-slate-500" />
                                    </button>
                                    <button onClick={() => handleOpenModal(doc)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                                        <Edit2 className="w-4 h-4 text-slate-500" />
                                    </button>
                                    <button onClick={() => handleDelete(doc.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-5"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-semibold text-slate-900 dark:text-white">
                                    {editingItem ? 'Editar' : 'Adicionar'} {activeTab === 'exercises' ? 'Exercício' : activeTab === 'foods' ? 'Alimento' : 'Arquivo'}
                                </h2>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>

                            {activeTab === 'exercises' ? (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome</label>
                                        <input
                                            type="text"
                                            value={exerciseForm.name}
                                            onChange={(e) => setExerciseForm({ ...exerciseForm, name: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Grupo Muscular</label>
                                            <select
                                                value={exerciseForm.muscleGroup}
                                                onChange={(e) => setExerciseForm({ ...exerciseForm, muscleGroup: e.target.value })}
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
                                            >
                                                <option value="">Selecione</option>
                                                {muscleGroups.map(mg => <option key={mg} value={mg}>{mg}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Equipamento</label>
                                            <select
                                                value={exerciseForm.equipment}
                                                onChange={(e) => setExerciseForm({ ...exerciseForm, equipment: e.target.value })}
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
                                            >
                                                <option value="">Selecione</option>
                                                {equipmentTypes.map(eq => <option key={eq} value={eq}>{eq}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Instruções (opcional)</label>
                                        <textarea
                                            value={exerciseForm.instructions}
                                            onChange={(e) => setExerciseForm({ ...exerciseForm, instructions: e.target.value })}
                                            rows={2}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
                                        />
                                    </div>
                                    <button
                                        onClick={handleSaveExercise}
                                        disabled={!exerciseForm.name || !exerciseForm.muscleGroup}
                                        className="w-full py-2.5 bg-primary-600 text-white rounded-xl font-medium disabled:opacity-50"
                                    >
                                        Salvar
                                    </button>
                                </div>
                            ) : activeTab === 'foods' ? (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome</label>
                                        <input
                                            type="text"
                                            value={foodForm.name}
                                            onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Categoria</label>
                                        <select
                                            value={foodForm.category}
                                            onChange={(e) => setFoodForm({ ...foodForm, category: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
                                        >
                                            <option value="">Selecione</option>
                                            {foodCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Porção</label>
                                            <input
                                                type="number"
                                                value={foodForm.portion}
                                                onChange={(e) => setFoodForm({ ...foodForm, portion: e.target.value })}
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Medida</label>
                                            <select
                                                value={foodForm.measure}
                                                onChange={(e) => setFoodForm({ ...foodForm, measure: e.target.value })}
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
                                            >
                                                <option value="g">g</option>
                                                <option value="ml">ml</option>
                                                <option value="un">unidade</option>
                                                <option value="fatia">fatia</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Prot (g)</label>
                                            <input type="number" value={foodForm.protein} onChange={(e) => setFoodForm({ ...foodForm, protein: e.target.value })}
                                                className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-center" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Carb (g)</label>
                                            <input type="number" value={foodForm.carbs} onChange={(e) => setFoodForm({ ...foodForm, carbs: e.target.value })}
                                                className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-center" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Gord (g)</label>
                                            <input type="number" value={foodForm.fat} onChange={(e) => setFoodForm({ ...foodForm, fat: e.target.value })}
                                                className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-center" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Kcal</label>
                                            <input type="number" value={foodForm.calories} onChange={(e) => setFoodForm({ ...foodForm, calories: e.target.value })}
                                                className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-center" />
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleSaveFood}
                                        disabled={!foodForm.name || !foodForm.category}
                                        className="w-full py-2.5 bg-primary-600 text-white rounded-xl font-medium disabled:opacity-50"
                                    >
                                        Salvar
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Título</label>
                                        <input
                                            type="text"
                                            value={documentForm.title}
                                            onChange={(e) => setDocumentForm({ ...documentForm, title: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Categoria</label>
                                            <select
                                                value={documentForm.category}
                                                onChange={(e) => setDocumentForm({ ...documentForm, category: e.target.value })}
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
                                            >
                                                <option value="">Selecione</option>
                                                {documentCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo</label>
                                            <select
                                                value={documentForm.type}
                                                onChange={(e) => setDocumentForm({ ...documentForm, type: e.target.value })}
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
                                            >
                                                <option value="pdf">PDF</option>
                                                <option value="image">Imagem</option>
                                                <option value="video">Vídeo</option>
                                                <option value="link">Link</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">URL (Mock)</label>
                                        <input
                                            type="text"
                                            value={documentForm.url}
                                            onChange={(e) => setDocumentForm({ ...documentForm, url: e.target.value })}
                                            placeholder="https://..."
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descrição</label>
                                        <textarea
                                            value={documentForm.description}
                                            onChange={(e) => setDocumentForm({ ...documentForm, description: e.target.value })}
                                            rows={2}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
                                        />
                                    </div>
                                    <button
                                        onClick={handleSaveDocument}
                                        disabled={!documentForm.title || !documentForm.category}
                                        className="w-full py-2.5 bg-primary-600 text-white rounded-xl font-medium disabled:opacity-50"
                                    >
                                        Salvar
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 z-50"
                    >
                        <Check className="w-5 h-5" />
                        <span className="text-sm">{toast}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
