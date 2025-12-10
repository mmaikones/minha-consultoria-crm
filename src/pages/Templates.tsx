import { useState, useMemo } from 'react';
import {
    Search,
    Plus,
    Edit2,
    Trash2,
    X,
    Check,
    Copy,
    Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageTemplate,
    mockTemplates as initialTemplates,
    templateCategories
} from '../data/mockTemplates';
import MarketingNav from '../components/marketing/MarketingNav';

interface TemplatesProps {
    showHeader?: boolean;
}

export default function Templates({ showHeader = true }: TemplatesProps) {
    const [templates, setTemplates] = useState<MessageTemplate[]>(initialTemplates);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    // Modals
    const [showModal, setShowModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
    const [previewTemplate, setPreviewTemplate] = useState<MessageTemplate | null>(null);

    // Form
    const [form, setForm] = useState({
        name: '',
        category: 'lembrete' as MessageTemplate['category'],
        content: ''
    });

    // Toast
    const [toast, setToast] = useState<string | null>(null);

    // Filtered templates
    const filteredTemplates = useMemo(() => {
        return templates.filter(t => {
            const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.content.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = !selectedCategory || t.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [templates, searchQuery, selectedCategory]);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const extractVariables = (content: string): string[] => {
        const matches = content.match(/\{\{(\w+)\}\}/g) || [];
        return [...new Set(matches.map(m => m.replace(/\{\{|\}\}/g, '')))];
    };

    const handleOpenModal = (template?: MessageTemplate) => {
        if (template) {
            setEditingTemplate(template);
            setForm({ name: template.name, category: template.category, content: template.content });
        } else {
            setEditingTemplate(null);
            setForm({ name: '', category: 'lembrete', content: '' });
        }
        setShowModal(true);
    };

    const handleSave = () => {
        if (!form.name || !form.content) return;

        const variables = extractVariables(form.content);

        if (editingTemplate) {
            setTemplates(templates.map(t =>
                t.id === editingTemplate.id
                    ? { ...t, name: form.name, category: form.category, content: form.content, variables }
                    : t
            ));
            showToast('Template atualizado!');
        } else {
            const newTemplate: MessageTemplate = {
                id: `tpl-${Date.now()}`,
                name: form.name,
                category: form.category,
                content: form.content,
                variables
            };
            setTemplates([newTemplate, ...templates]);
            showToast('Template criado!');
        }
        setShowModal(false);
    };

    const handleDelete = (id: string) => {
        setTemplates(templates.filter(t => t.id !== id));
        showToast('Template removido!');
    };

    const handleCopy = (content: string) => {
        navigator.clipboard.writeText(content);
        showToast('Copiado!');
    };

    const handlePreview = (template: MessageTemplate) => {
        setPreviewTemplate(template);
        setShowPreviewModal(true);
    };

    const getCategoryInfo = (categoryId: string) => {
        return templateCategories.find(c => c.id === categoryId) || templateCategories[0];
    };

    return (
        <div className="space-y-4">
            {/* Marketing Navigation */}
            {showHeader && <MarketingNav />}

            {/* Header */}
            {showHeader && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Templates de Mensagens</h1>
                        <p className="text-sm text-slate-500">Mensagens prontas para situações comuns</p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Novo Template
                    </button>
                </div>
            )}

            {/* Search & Filter */}
            <div className="flex gap-2 flex-wrap">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                    />
                </div>
                <div className="flex gap-1 overflow-x-auto">
                    <button
                        onClick={() => setSelectedCategory('')}
                        className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${!selectedCategory
                            ? 'bg-primary-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                    >
                        Todos
                    </button>
                    {templateCategories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${selectedCategory === cat.id
                                ? 'bg-primary-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                }`}
                        >
                            {cat.icon} {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredTemplates.length === 0 ? (
                    <div className="col-span-full p-8 text-center text-slate-500 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        Nenhum template encontrado
                    </div>
                ) : (
                    filteredTemplates.map(template => {
                        const category = getCategoryInfo(template.category);
                        return (
                            <div
                                key={template.id}
                                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow"
                            >
                                <div className="p-3">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-8 h-8 ${category.color} rounded-lg flex items-center justify-center text-sm`}>
                                                {category.icon}
                                            </span>
                                            <div>
                                                <h3 className="font-medium text-slate-900 dark:text-white text-sm">{template.name}</h3>
                                                <p className="text-xs text-slate-500">{category.label}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 mb-3">
                                        {template.content}
                                    </p>
                                    {template.variables.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {template.variables.map(v => (
                                                <span key={v} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[10px] text-slate-500">
                                                    {`{{${v}}}`}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handlePreview(template)}
                                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-lg text-xs font-medium hover:bg-primary-100"
                                        >
                                            <Send className="w-3 h-3" />
                                            Usar
                                        </button>
                                        <button
                                            onClick={() => handleCopy(template.content)}
                                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                                        >
                                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                                        </button>
                                        <button
                                            onClick={() => handleOpenModal(template)}
                                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                                        >
                                            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(template.id)}
                                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                        >
                                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Create/Edit Modal */}
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
                                    {editingTemplate ? 'Editar Template' : 'Novo Template'}
                                </h2>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="Ex: Lembrete de Treino"
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Categoria</label>
                                    <select
                                        value={form.category}
                                        onChange={(e) => setForm({ ...form, category: e.target.value as MessageTemplate['category'] })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
                                    >
                                        {templateCategories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Mensagem
                                        <span className="text-xs text-slate-400 ml-2">Use {'{{variavel}}'} para campos dinâmicos</span>
                                    </label>
                                    <textarea
                                        value={form.content}
                                        onChange={(e) => setForm({ ...form, content: e.target.value })}
                                        rows={4}
                                        placeholder="Oi {{nome}}, tudo bem? ..."
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
                                    />
                                </div>
                                <button
                                    onClick={handleSave}
                                    disabled={!form.name || !form.content}
                                    className="w-full py-2.5 bg-primary-600 text-white rounded-xl font-medium disabled:opacity-50"
                                >
                                    Salvar
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Preview Modal */}
            <AnimatePresence>
                {showPreviewModal && previewTemplate && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowPreviewModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-5"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-semibold text-slate-900 dark:text-white">Usar Template</h2>
                                <button onClick={() => setShowPreviewModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-3 mb-4">
                                <p className="text-sm text-slate-700 dark:text-slate-300">{previewTemplate.content}</p>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => { handleCopy(previewTemplate.content); setShowPreviewModal(false); }}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium"
                                >
                                    <Copy className="w-4 h-4" />
                                    Copiar
                                </button>
                                <button
                                    onClick={() => setShowPreviewModal(false)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium"
                                >
                                    <Send className="w-4 h-4" />
                                    Enviar
                                </button>
                            </div>
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
