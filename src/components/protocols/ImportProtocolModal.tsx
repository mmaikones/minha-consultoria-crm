
import { useState } from 'react';
import { Search, Dumbbell, Apple, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Protocol, mockProtocols } from '../../data/mockProtocols';

interface ImportProtocolModalProps {
    currentType: 'workout' | 'diet';
    onImport: (protocol: Protocol) => void;
    onClose: () => void;
}

export default function ImportProtocolModal({ currentType, onImport, onClose }: ImportProtocolModalProps) {
    const [search, setSearch] = useState('');

    // Filter protocols of the OPPOSITE type
    const targetType = currentType === 'workout' ? 'diet' : 'workout';
    const availableProtocols = mockProtocols.filter(p =>
        (p.type === targetType || p.type === 'combo') &&
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            {targetType === 'diet' ? <Apple className="w-5 h-5 text-green-600" /> : <Dumbbell className="w-5 h-5 text-blue-600" />}
                            Adicionar {targetType === 'diet' ? 'Dieta' : 'Treino'} ao Protocolo
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>

                    <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder={`Buscar ${targetType === 'diet' ? 'dieta' : 'treino'}...`}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto p-2">
                        {availableProtocols.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                                Nenhum protocolo encontrado.
                            </div>
                        ) : (
                            availableProtocols.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => onImport(p)}
                                    className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors text-left group"
                                >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${p.type === 'diet' ? 'bg-green-100 text-green-600' :
                                            p.type === 'workout' ? 'bg-blue-100 text-blue-600' :
                                                'bg-purple-100 text-purple-600'
                                        }`}>
                                        {p.type === 'diet' ? <Apple className="w-5 h-5" /> : <Dumbbell className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">
                                            {p.name}
                                        </h3>
                                        <p className="text-xs text-slate-500 line-clamp-1">
                                            {p.description}
                                        </p>
                                    </div>
                                    <Plus className="w-5 h-5 text-slate-300 group-hover:text-primary-600" />
                                </button>
                            ))
                        )}

                        {/* Option to add empty */}
                        <button
                            onClick={() => onImport({ ...mockProtocols[0], id: 'empty', name: 'Novo (Vazio)', workoutDays: [], meals: [] })} // Hacky empty pass
                            className="w-full flex items-center gap-3 p-3 mt-2 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 rounded-xl transition-all text-left text-slate-500 hover:text-primary-600"
                        >
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                                <Plus className="w-5 h-5" />
                            </div>
                            <span className="font-medium">Criar {targetType === 'diet' ? 'Dieta' : 'Treino'} em branco</span>
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
