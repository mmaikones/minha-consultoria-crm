import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Package } from 'lucide-react';
import { mockRewards, Reward } from '../../data/mockGamification';
import { motion, AnimatePresence } from 'framer-motion';

interface RewardsTabProps {
    onSave: () => void;
}

export default function RewardsTab({ onSave }: RewardsTabProps) {
    const [rewards, setRewards] = useState<Reward[]>(mockRewards);
    const [showModal, setShowModal] = useState(false);
    const [editingReward, setEditingReward] = useState<Reward | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        cost: 0,
        image: '🎁',
        stock: 'unlimited' as number | 'unlimited',
    });

    const handleAdd = () => {
        setEditingReward(null);
        setFormData({ title: '', description: '', cost: 0, image: '🎁', stock: 'unlimited' });
        setShowModal(true);
    };

    const handleEdit = (reward: Reward) => {
        setEditingReward(reward);
        setFormData({
            title: reward.title,
            description: reward.description,
            cost: reward.cost,
            image: reward.image,
            stock: reward.stock,
        });
        setShowModal(true);
    };

    const handleDelete = (id: string) => {
        setRewards(prev => prev.filter(r => r.id !== id));
        onSave();
    };

    const handleSubmit = () => {
        if (!formData.title || formData.cost <= 0) return;

        if (editingReward) {
            setRewards(prev =>
                prev.map(r =>
                    r.id === editingReward.id
                        ? { ...r, ...formData }
                        : r
                )
            );
        } else {
            const newReward: Reward = {
                id: `rw${Date.now()}`,
                ...formData,
                active: true,
            };
            setRewards(prev => [...prev, newReward]);
        }

        setShowModal(false);
        onSave();
    };

    const toggleActive = (id: string) => {
        setRewards(prev =>
            prev.map(r =>
                r.id === id ? { ...r, active: !r.active } : r
            )
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <p className="text-slate-500 dark:text-slate-400">
                    {rewards.filter(r => r.active).length} recompensas ativas
                </p>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    <span>Nova Recompensa</span>
                </button>
            </div>

            {/* Rewards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {rewards.map(reward => (
                    <div
                        key={reward.id}
                        className={`bg-white dark:bg-slate-800 rounded-xl p-4 border transition-all ${reward.active
                                ? 'border-slate-200 dark:border-slate-700'
                                : 'border-slate-200 dark:border-slate-700 opacity-50'
                            }`}
                    >
                        {/* Image/Icon */}
                        <div className="flex items-center gap-3 mb-3">
                            <div className="text-3xl">{reward.image}</div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-slate-900 dark:text-white">
                                    {reward.title}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {reward.description}
                                </p>
                            </div>
                        </div>

                        {/* Cost & Stock */}
                        <div className="flex items-center justify-between mb-3 py-2 border-t border-slate-100 dark:border-slate-700">
                            <span className="font-bold text-amber-600">
                                {reward.cost.toLocaleString()} pts
                            </span>
                            <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <Package className="w-4 h-4" />
                                {reward.stock === 'unlimited' ? '∞' : reward.stock} disponíveis
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => toggleActive(reward.id)}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${reward.active
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                                    }`}
                            >
                                {reward.active ? 'Ativo' : 'Inativo'}
                            </button>
                            <button
                                onClick={() => handleEdit(reward)}
                                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(reward.id)}
                                className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
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
                            className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                    {editingReward ? 'Editar Recompensa' : 'Nova Recompensa'}
                                </h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Nome
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Descrição
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={2}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Custo (pts)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.cost}
                                            onChange={(e) => setFormData({ ...formData, cost: parseInt(e.target.value) || 0 })}
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Emoji/Ícone
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.image}
                                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-center text-2xl"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={!formData.title || formData.cost <= 0}
                                    className="w-full px-4 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {editingReward ? 'Salvar Alterações' : 'Criar Recompensa'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
