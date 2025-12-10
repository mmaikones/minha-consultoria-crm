import { useState } from 'react';
import { Plus, Edit2, Trash2, Check, X, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plan, mockPlans as initialPlans } from '../../data/mockPlans';

export default function PlansManager() {
    const [plans, setPlans] = useState<Plan[]>(initialPlans);
    const [showModal, setShowModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [form, setForm] = useState<Partial<Plan>>({
        name: '',
        price: 0,
        durationInDays: 30,
        description: '',
        features: ['']
    });

    const handleOpenModal = (plan?: Plan) => {
        if (plan) {
            setEditingPlan(plan);
            setForm({ ...plan });
        } else {
            setEditingPlan(null);
            setForm({
                name: '',
                price: 0,
                durationInDays: 30,
                description: '',
                features: ['']
            });
        }
        setShowModal(true);
    };

    const handleFeatureChange = (index: number, value: string) => {
        const newFeatures = [...(form.features || [])];
        newFeatures[index] = value;
        setForm({ ...form, features: newFeatures });
    };

    const addFeature = () => {
        setForm({ ...form, features: [...(form.features || []), ''] });
    };

    const removeFeature = (index: number) => {
        const newFeatures = [...(form.features || [])];
        newFeatures.splice(index, 1);
        setForm({ ...form, features: newFeatures });
    };

    const handleSave = () => {
        if (!form.name || !form.price) return;

        if (editingPlan) {
            setPlans(plans.map(p => p.id === editingPlan.id ? { ...p, ...form } as Plan : p));
        } else {
            const newPlan: Plan = {
                ...form,
                id: Math.random().toString(36).substr(2, 9),
                activeStudents: 0,
                color: 'bg-primary-500' // Default color
            } as Plan;
            setPlans([...plans, newPlan]);
        }
        setShowModal(false);
    };

    const handleDelete = (id: string) => {
        if (confirm('Tem certeza que deseja excluir este plano?')) {
            setPlans(plans.filter(p => p.id !== id));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Seus Planos & Pacotes</h2>
                    <p className="text-sm text-slate-500">Defina os produtos que você vende</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium text-sm"
                >
                    <Plus className="w-4 h-4" />
                    Novo Plano
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map(plan => (
                    <div key={plan.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow relative group">
                        <div className={`h-2 w-full ${plan.color || 'bg-slate-500'}`}></div>
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-xl text-slate-900 dark:text-white">{plan.name}</h3>
                                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                        <Package className="w-4 h-4" />
                                        <span>{plan.durationInDays} dias de acesso</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                        R$ {plan.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>

                            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 min-h-[40px]">
                                {plan.description}
                            </p>

                            <div className="space-y-2 mb-6">
                                {plan.features.slice(0, 4).map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                        <span>{feature}</span>
                                    </div>
                                ))}
                                {plan.features.length > 4 && (
                                    <p className="text-xs text-slate-400 pl-6">+ {plan.features.length - 4} benefícios</p>
                                )}
                            </div>

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                <span className="text-xs font-medium px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg">
                                    {plan.activeStudents} alunos ativos
                                </span>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleOpenModal(plan)}
                                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 hover:text-primary-600 transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(plan.id)}
                                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-slate-500 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

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
                            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg get-scrollbar-width overflow-y-auto max-h-[90vh] p-6"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                    {editingPlan ? 'Editar Plano' : 'Novo Plano'}
                                </h2>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome do Plano</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl"
                                        placeholder="Ex: Consultoria Trimestral"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Preço (R$)</label>
                                        <input
                                            type="number"
                                            value={form.price}
                                            onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Duração (Dias)</label>
                                        <input
                                            type="number"
                                            value={form.durationInDays}
                                            onChange={e => setForm({ ...form, durationInDays: Number(e.target.value) })}
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl"
                                            placeholder="30"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descrição Curta</label>
                                    <textarea
                                        value={form.description}
                                        onChange={e => setForm({ ...form, description: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl"
                                        rows={2}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Benefícios (Features)</label>
                                    <div className="space-y-2">
                                        {form.features?.map((feature, index) => (
                                            <div key={index} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={feature}
                                                    onChange={e => handleFeatureChange(index, e.target.value)}
                                                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                                                    placeholder="Ex: Treino Personalizado"
                                                />
                                                <button
                                                    onClick={() => removeFeature(index)}
                                                    className="p-2 text-slate-400 hover:text-red-500"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            onClick={addFeature}
                                            className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 mt-1"
                                        >
                                            <Plus className="w-3 h-3" /> Adicionar Benefício
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSave}
                                    className="w-full py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors mt-4"
                                >
                                    Salvar Plano
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
