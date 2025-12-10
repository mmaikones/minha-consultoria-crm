import { useState } from 'react';
import { X, Copy, Send, Check, Link } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnamneseModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AnamneseModal({ isOpen, onClose }: AnamneseModalProps) {
    const [copied, setCopied] = useState(false);
    const anamneseUrl = 'minhaconsultoria.app/anamnese/ref123';

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(`https://${anamneseUrl}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleWhatsApp = () => {
        const message = encodeURIComponent(
            `Olá! Preencha sua ficha de anamnese para começarmos seu acompanhamento:\n\nhttps://${anamneseUrl}`
        );
        window.open(`https://wa.me/?text=${message}`, '_blank');
    };

    if (!isOpen) return null;

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
                    className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                                <Link className="w-5 h-5 text-primary-600" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-slate-900 dark:text-white">
                                    Link de Cadastro
                                </h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Envie para novos alunos
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-4">
                        {/* URL Display */}
                        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                                Link da Anamnese
                            </p>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 text-sm font-mono text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 truncate">
                                    https://{anamneseUrl}
                                </code>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleCopy}
                                className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg font-medium transition-all ${copied
                                    ? 'bg-green-500 text-white'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
                                    }`}
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-5 h-5" />
                                        <span>Link Copiado!</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-5 h-5" />
                                        <span>Copiar Link</span>
                                    </>
                                )}
                            </button>

                            <button
                                onClick={handleWhatsApp}
                                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                            >
                                <Send className="w-5 h-5" />
                                <span>Enviar via WhatsApp</span>
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
