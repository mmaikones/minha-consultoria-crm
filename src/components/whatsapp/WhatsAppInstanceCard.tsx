import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Smartphone,
    RefreshCw,
    Trash2,
    X,
    Edit2,
    Power,
    QrCode,
    Clock
} from 'lucide-react';
import ConnectionStatus from './ConnectionStatus';

interface WhatsAppInstanceCardProps {
    instance: {
        id: string;
        name: string;
        status: 'connected' | 'connecting' | 'disconnected' | 'error';
        phone?: string;
        connectedAt?: string;
        lastActivity?: string;
        errorMessage?: string;
    };
    qrCode?: string;
    isLoadingQR?: boolean;
    onConnect: () => void;
    onDisconnect: () => void;
    onDelete: () => void;
    onEdit?: () => void;
    onRetry?: () => void;
}

export default function WhatsAppInstanceCard({
    instance,
    qrCode,
    isLoadingQR,
    onConnect,
    onDisconnect,
    onDelete,
    onEdit,
    onRetry,
}: WhatsAppInstanceCardProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const formatPhone = (phone?: string) => {
        if (!phone) return null;
        // Format as (XX) XXXXX-XXXX
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 13) {
            // 5511999998888 format
            return `(${cleaned.slice(2, 4)}) ${cleaned.slice(4, 9)}-${cleaned.slice(9)}`;
        }
        if (cleaned.length === 11) {
            return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
        }
        return phone;
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const isConnecting = instance.status === 'connecting';
    const isConnected = instance.status === 'connected';
    const isDisconnected = instance.status === 'disconnected';
    const hasError = instance.status === 'error';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`
                relative bg-white dark:bg-slate-800 rounded-2xl border-2 overflow-hidden
                shadow-sm hover:shadow-lg transition-all duration-300
                ${isConnected ? 'border-emerald-200 dark:border-emerald-900/50' :
                    isConnecting ? 'border-amber-200 dark:border-amber-900/50' :
                        hasError ? 'border-red-300 dark:border-red-900/50' :
                            'border-slate-200 dark:border-slate-700'}
            `}
        >
            {/* Card Header */}
            <div className="p-4 pb-3">
                <div className="flex items-start justify-between gap-3">
                    {/* Instance Info */}
                    <div className="flex items-center gap-3 min-w-0">
                        {/* Icon with status ring */}
                        <div className={`
                            relative w-12 h-12 rounded-xl flex items-center justify-center
                            ${isConnected ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                                isConnecting ? 'bg-amber-100 dark:bg-amber-900/30' :
                                    hasError ? 'bg-red-100 dark:bg-red-900/30' :
                                        'bg-slate-100 dark:bg-slate-700'}
                        `}>
                            <Smartphone className={`w-6 h-6 ${isConnected ? 'text-emerald-600' :
                                    isConnecting ? 'text-amber-600' :
                                        hasError ? 'text-red-600' :
                                            'text-slate-500'
                                }`} />
                        </div>

                        <div className="min-w-0">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate capitalize">
                                {instance.name}
                            </h3>
                            {instance.phone ? (
                                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                                    {formatPhone(instance.phone)}
                                </p>
                            ) : (
                                <p className="text-sm text-slate-400 dark:text-slate-500 italic">
                                    Número não conectado
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Status Badge */}
                    <ConnectionStatus
                        status={instance.status}
                        errorMessage={instance.errorMessage}
                    />
                </div>

                {/* Connection Timestamp */}
                {isConnected && instance.connectedAt && (
                    <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-500 dark:text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Conectado desde {formatDate(instance.connectedAt)}</span>
                    </div>
                )}
            </div>

            {/* QR Code Section - Shows when connecting */}
            <AnimatePresence>
                {(isConnecting || isLoadingQR) && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50"
                    >
                        <div className="p-4 flex flex-col items-center">
                            {isLoadingQR ? (
                                <div className="flex flex-col items-center py-8">
                                    <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mb-3" />
                                    <p className="text-sm text-slate-500">Gerando QR Code...</p>
                                </div>
                            ) : qrCode ? (
                                <>
                                    <div className="bg-white p-3 rounded-xl shadow-inner border border-slate-200">
                                        <img
                                            src={qrCode.startsWith('data:') ? qrCode : `data:image/png;base64,${qrCode}`}
                                            alt="QR Code WhatsApp"
                                            className="w-48 h-48"
                                        />
                                    </div>
                                    <div className="mt-3 text-center">
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Escaneie com seu WhatsApp
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Dispositivos Conectados → Conectar
                                        </p>
                                        {/* Loading dots */}
                                        <div className="flex items-center justify-center gap-1.5 mt-3">
                                            {[0, 1, 2].map((i) => (
                                                <motion.span
                                                    key={i}
                                                    className="w-2 h-2 bg-emerald-500 rounded-full"
                                                    animate={{
                                                        scale: [1, 1.3, 1],
                                                        opacity: [0.5, 1, 0.5]
                                                    }}
                                                    transition={{
                                                        duration: 1,
                                                        repeat: Infinity,
                                                        delay: i * 0.2,
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center py-8">
                                    <QrCode className="w-12 h-12 text-slate-300 mb-2" />
                                    <p className="text-sm text-slate-500">Aguardando QR Code...</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Actions Footer */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
                <div className="flex items-center justify-between gap-2">
                    {/* Main Action */}
                    <div className="flex-1">
                        {isDisconnected && (
                            <button
                                onClick={onConnect}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 
                                    bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl 
                                    font-bold text-sm transition-colors shadow-sm"
                            >
                                <Power className="w-4 h-4" />
                                Conectar
                            </button>
                        )}

                        {isConnecting && (
                            <button
                                onClick={onDisconnect}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 
                                    bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 
                                    text-slate-700 dark:text-slate-300 rounded-xl 
                                    font-medium text-sm transition-colors"
                            >
                                <X className="w-4 h-4" />
                                Cancelar
                            </button>
                        )}

                        {isConnected && (
                            <button
                                onClick={onDisconnect}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 
                                    bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 
                                    text-amber-700 dark:text-amber-400 rounded-xl 
                                    font-medium text-sm transition-colors"
                            >
                                <Power className="w-4 h-4" />
                                Desconectar
                            </button>
                        )}

                        {hasError && (
                            <button
                                onClick={onRetry || onConnect}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 
                                    bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 
                                    text-red-700 dark:text-red-400 rounded-xl 
                                    font-medium text-sm transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Tentar Novamente
                            </button>
                        )}
                    </div>

                    {/* Secondary Actions */}
                    <div className="flex items-center gap-1">
                        {onEdit && (
                            <button
                                onClick={onEdit}
                                className="p-2 rounded-lg text-slate-500 hover:text-slate-700 
                                    hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                title="Editar"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                        )}

                        {showDeleteConfirm ? (
                            <div className="flex items-center gap-1 bg-red-100 dark:bg-red-900/30 rounded-lg px-2 py-1">
                                <span className="text-xs text-red-600 font-medium">Confirmar?</span>
                                <button
                                    onClick={() => { onDelete(); setShowDeleteConfirm(false); }}
                                    className="p-1 text-red-600 hover:text-red-700"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="p-1 text-slate-500 hover:text-slate-700"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="p-2 rounded-lg text-slate-400 hover:text-red-600 
                                    hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                title="Excluir"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
