import { useState } from 'react';
import { Search, Plus, Pin, PinOff, Trash2, User, X } from 'lucide-react';
import { Note, NoteColor, mockNotes as initialNotes, noteColors, getColorClasses } from '../data/mockNotes';
import { mockStudents } from '../data/mockStudents';

export default function Notes() {
    const [notes, setNotes] = useState<Note[]>(initialNotes);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'pinned'>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);

    // Form state
    const [formTitle, setFormTitle] = useState('');
    const [formContent, setFormContent] = useState('');
    const [formColor, setFormColor] = useState<NoteColor>('yellow');
    const [formIsPinned, setFormIsPinned] = useState(false);
    const [formStudentId, setFormStudentId] = useState<string>('');

    const filteredNotes = notes
        .filter(note => {
            const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                note.content.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter = filter === 'all' || (filter === 'pinned' && note.isPinned);
            return matchesSearch && matchesFilter;
        })
        .sort((a, b) => {
            // Pinned notes first
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });

    const handleOpenModal = (note?: Note) => {
        if (note) {
            setEditingNote(note);
            setFormTitle(note.title);
            setFormContent(note.content);
            setFormColor(note.color);
            setFormIsPinned(note.isPinned);
            setFormStudentId(note.studentId || '');
        } else {
            setEditingNote(null);
            setFormTitle('');
            setFormContent('');
            setFormColor('yellow');
            setFormIsPinned(false);
            setFormStudentId('');
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingNote(null);
    };

    const handleSaveNote = () => {
        const now = new Date().toISOString();

        if (editingNote) {
            // Update existing note
            setNotes(notes.map(n =>
                n.id === editingNote.id
                    ? { ...n, title: formTitle, content: formContent, color: formColor, isPinned: formIsPinned, studentId: formStudentId || undefined, updatedAt: now }
                    : n
            ));
        } else {
            // Create new note
            const newNote: Note = {
                id: `note-${Date.now()}`,
                title: formTitle || 'Nova Nota',
                content: formContent,
                color: formColor,
                isPinned: formIsPinned,
                studentId: formStudentId || undefined,
                createdAt: now,
                updatedAt: now,
            };
            setNotes([newNote, ...notes]);
        }
        handleCloseModal();
    };

    const handleTogglePin = (noteId: string) => {
        setNotes(notes.map(n =>
            n.id === noteId
                ? { ...n, isPinned: !n.isPinned, updatedAt: new Date().toISOString() }
                : n
        ));
    };

    const handleDeleteNote = (noteId: string) => {
        setNotes(notes.filter(n => n.id !== noteId));
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        } else if (days === 1) {
            return 'Ontem';
        } else if (days < 7) {
            return date.toLocaleDateString('pt-BR', { weekday: 'long' });
        } else {
            return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
        }
    };

    const getStudentName = (studentId?: string) => {
        if (!studentId) return null;
        const student = mockStudents.find(s => s.id === studentId);
        return student?.name || null;
    };

    return (
        <div className="h-[calc(100vh-4rem)] lg:h-[calc(100vh-1.5rem)] flex flex-col -m-4 lg:-m-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <div>
                    <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                        Anotações
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {notes.length} notas • {notes.filter(n => n.isPinned).length} fixadas
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-700 border-0 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 w-48"
                        />
                    </div>

                    {/* Filter */}
                    <div className="flex bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${filter === 'all'
                                ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-400'
                                }`}
                        >
                            Todas
                        </button>
                        <button
                            onClick={() => setFilter('pinned')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1 ${filter === 'pinned'
                                ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-400'
                                }`}
                        >
                            <Pin className="w-3.5 h-3.5" />
                            Fixadas
                        </button>
                    </div>

                    {/* New Note Button */}
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium shadow-lg shadow-primary-500/25"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="hidden sm:inline">Nova Nota</span>
                    </button>
                </div>
            </div>

            {/* Notes Grid */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950 relative">
                {/* Ambient Background for Glassmorphism */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-primary-400/5 rounded-full blur-[120px]" />
                    <div className="absolute top-[40%] right-[0%] w-[60%] h-[60%] bg-blue-400/5 rounded-full blur-[100px]" />
                    <div className="absolute bottom-[0%] left-[20%] w-[50%] h-[50%] bg-purple-400/5 rounded-full blur-[100px]" />
                </div>

                <div className="relative z-10">
                    {filteredNotes.length === 0 ? (
                        <div className="flex items-center justify-center h-[60vh]">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                                    <Plus className="w-8 h-8 text-slate-400/80" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                                    {searchQuery ? 'Sem resultados' : 'Comece suas anotações'}
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-xs mx-auto">
                                    {searchQuery ? 'Tente buscar por outro termo.' : 'Crie notas para organizar suas ideias, treinos e metas.'}
                                </p>
                                <button
                                    onClick={() => handleOpenModal()}
                                    className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-medium hover:scale-105 transition-transform shadow-lg hover:shadow-xl"
                                >
                                    Criar nota
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredNotes.map(note => {
                                const colorClasses = getColorClasses(note.color);
                                const studentName = getStudentName(note.studentId);

                                return (
                                    <div
                                        key={note.id}
                                        onClick={() => handleOpenModal(note)}
                                        className={`${colorClasses.bg} ${colorClasses.border} border rounded-[2rem] p-6 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/5 group relative overflow-hidden`}
                                    >
                                        {/* Glossy Reflection */}
                                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                        {/* Pin indicator */}
                                        {note.isPinned && (
                                            <div className="absolute top-6 right-6 w-8 h-8 bg-white/40 dark:bg-black/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                                                <Pin className={`w-3.5 h-3.5 ${colorClasses.text}`} />
                                            </div>
                                        )}

                                        {/* Actions Overlay */}
                                        <div className="absolute top-4 right-16 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleTogglePin(note.id); }}
                                                className="p-2 bg-white/50 dark:bg-black/20 backdrop-blur-md rounded-full hover:bg-white/80 dark:hover:bg-black/40 transition-colors border border-white/10"
                                                title={note.isPinned ? 'Desafixar' : 'Fixar'}
                                            >
                                                {note.isPinned ? (
                                                    <PinOff className="w-4 h-4 text-slate-700 dark:text-slate-200" />
                                                ) : (
                                                    <Pin className="w-4 h-4 text-slate-700 dark:text-slate-200" />
                                                )}
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }}
                                                className="p-2 bg-white/50 dark:bg-black/20 backdrop-blur-md rounded-full hover:bg-red-500/80 hover:text-white transition-all border border-white/10"
                                                title="Excluir"
                                            >
                                                <Trash2 className="w-4 h-4 text-slate-700 dark:text-slate-200 hover:text-white" />
                                            </button>
                                        </div>

                                        {/* Content */}
                                        <div className="mb-4">
                                            <h3 className={`text-lg font-bold ${colorClasses.text} truncate mb-3 pr-8 tracking-tight`}>
                                                {note.title || 'Sem título'}
                                            </h3>
                                            <p className={`text-[15px] leading-relaxed ${colorClasses.text} opacity-80 line-clamp-5`}>
                                                {note.content || 'Nota vazia'}
                                            </p>
                                        </div>

                                        {/* Footer */}
                                        <div className="flex items-center justify-between pt-4 mt-auto border-t border-black/5 dark:border-white/5">
                                            <span className={`text-xs font-medium ${colorClasses.text} opacity-60`}>
                                                {formatDate(note.updatedAt)}
                                            </span>
                                            {studentName && (
                                                <span className={`text-xs font-medium ${colorClasses.text} opacity-70 flex items-center gap-1.5 bg-black/5 dark:bg-white/5 px-2 py-1 rounded-lg`}>
                                                    <User className="w-3 h-3" />
                                                    {studentName}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                {editingNote ? 'Editar Nota' : 'Nova Nota'}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-4 space-y-4">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Título
                                </label>
                                <input
                                    type="text"
                                    value={formTitle}
                                    onChange={(e) => setFormTitle(e.target.value)}
                                    placeholder="Digite o título..."
                                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700 border-0 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            {/* Content */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Conteúdo
                                </label>
                                <textarea
                                    value={formContent}
                                    onChange={(e) => setFormContent(e.target.value)}
                                    placeholder="Digite o conteúdo..."
                                    rows={6}
                                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700 border-0 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                                />
                            </div>

                            {/* Color Picker */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Cor
                                </label>
                                <div className="flex gap-2">
                                    {noteColors.map(color => (
                                        <button
                                            key={color.value}
                                            onClick={() => setFormColor(color.value)}
                                            className={`w-10 h-10 rounded-xl ${color.bg} ${color.border} border-2 transition-all ${formColor === color.value ? 'ring-2 ring-offset-2 ring-primary-500 scale-110' : ''
                                                }`}
                                            title={color.label}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Pin Toggle */}
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Fixar nota
                                </label>
                                <button
                                    onClick={() => setFormIsPinned(!formIsPinned)}
                                    className={`w-12 h-6 rounded-full transition-colors ${formIsPinned ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-600'
                                        }`}
                                >
                                    <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${formIsPinned ? 'translate-x-6' : 'translate-x-0.5'
                                        }`} />
                                </button>
                            </div>

                            {/* Student Link */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Vincular a aluno (opcional)
                                </label>
                                <select
                                    value={formStudentId}
                                    onChange={(e) => setFormStudentId(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700 border-0 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="">Nenhum aluno</option>
                                    {mockStudents.map(student => (
                                        <option key={student.id} value={student.id}>
                                            {student.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-3 p-4 border-t border-slate-200 dark:border-slate-700">
                            <button
                                onClick={handleCloseModal}
                                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveNote}
                                className="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium shadow-lg shadow-primary-500/25"
                            >
                                {editingNote ? 'Salvar' : 'Criar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
