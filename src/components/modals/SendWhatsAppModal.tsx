import { useState } from 'react';
import { X, Send, Loader2, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { whatsappService } from '../../services/whatsappService';
import { evolutionService } from '../../services/evolutionService';

interface SendWhatsAppModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentName: string;
    studentPhone: string;
    studentId?: string;
}

export default function SendWhatsAppModal({
    isOpen,
    onClose,
    studentName,
    studentPhone,
    studentId
}: SendWhatsAppModalProps) {
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Format phone for display
    const formatPhoneDisplay = (phone: string): string => {
        const clean = phone.replace(/\D/g, '');
        if (clean.length === 11) {
            return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
        }
        if (clean.length === 10) {
            return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
        }
        return phone;
    };

    const handleSend = async () => {
        if (!message.trim() || !studentPhone) return;

        setIsSending(true);
        setFeedback(null);

        try {
            const result = await whatsappService.sendDirectMessage(studentPhone, message.trim());

            if (result.success) {
                setFeedback({ type: 'success', text: 'Mensagem enviada com sucesso! 📱' });
                setMessage('');
                // Auto-close after success
                setTimeout(() => {
                    onClose();
                    setFeedback(null);
                }, 2000);
            } else {
                setFeedback({ type: 'error', text: result.error || 'Erro ao enviar mensagem.' });
            }
        } catch (error: any) {
            setFeedback({ type: 'error', text: error.message || 'Erro ao enviar mensagem.' });
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && e.ctrlKey && !isSending) {
            handleSend();
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white dark:bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 bg-[#25D366] text-white">
                        <div className="flex items-center gap-3">
                            <MessageSquare className="w-6 h-6" />
                            <h2 className="text-lg font-bold">Enviar WhatsApp</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-4">
                        {/* Recipient Info */}
                        <div className="bg-muted/50 rounded-xl p-3">
                            <p className="text-sm text-muted-foreground mb-1">Destinatário</p>
                            <p className="font-semibold text-foreground">{studentName}</p>
                            <p className="text-sm text-muted-foreground">{formatPhoneDisplay(studentPhone)}</p>
                        </div>

                        {/* Message Input */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Sua mensagem
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Digite sua mensagem aqui..."
                                rows={4}
                                className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#25D366] resize-none"
                                disabled={isSending}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Ctrl + Enter para enviar
                            </p>
                        </div>

                        {/* Feedback */}
                        {feedback && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`p-3 rounded-xl text-sm font-medium ${feedback.type === 'success'
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                    }`}
                            >
                                {feedback.text}
                            </motion.div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-3 bg-muted text-foreground rounded-xl font-semibold hover:bg-muted/80 transition-colors"
                                disabled={isSending}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSend}
                                disabled={!message.trim() || isSending}
                                className="flex-1 px-4 py-3 bg-[#25D366] text-white rounded-xl font-semibold hover:bg-[#128C7E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSending ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Enviar
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
