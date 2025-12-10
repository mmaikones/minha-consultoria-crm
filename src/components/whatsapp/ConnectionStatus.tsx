import { motion } from 'framer-motion';

interface ConnectionStatusProps {
    status: 'connected' | 'connecting' | 'disconnected' | 'error';
    errorMessage?: string;
    className?: string;
}

const STATUS_CONFIG = {
    connected: {
        color: 'bg-emerald-500',
        glow: 'shadow-emerald-500/50',
        text: 'Conectado',
        textColor: 'text-emerald-600',
        bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
        animate: false,
    },
    connecting: {
        color: 'bg-amber-500',
        glow: 'shadow-amber-500/50',
        text: 'Aguardando conexão...',
        textColor: 'text-amber-600',
        bgColor: 'bg-amber-50 dark:bg-amber-900/20',
        animate: true,
    },
    disconnected: {
        color: 'bg-red-500',
        glow: 'shadow-red-500/50',
        text: 'Desconectado',
        textColor: 'text-red-600',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        animate: false,
    },
    error: {
        color: 'bg-red-600',
        glow: 'shadow-red-600/50',
        text: 'Erro',
        textColor: 'text-red-700',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        animate: false,
    },
};

export default function ConnectionStatus({ status, errorMessage, className = '' }: ConnectionStatusProps) {
    const config = STATUS_CONFIG[status];

    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bgColor} ${className}`}>
            {/* LED Indicator */}
            <motion.div
                className={`relative w-3 h-3 rounded-full ${config.color} shadow-lg ${config.glow}`}
                animate={config.animate ? { scale: [1, 1.2, 1], opacity: [1, 0.7, 1] } : {}}
                transition={config.animate ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } : {}}
            >
                {/* Inner glow */}
                <div className={`absolute inset-0 rounded-full ${config.color} blur-sm opacity-60`} />
            </motion.div>

            {/* Status Text */}
            <span className={`text-sm font-semibold ${config.textColor}`}>
                {errorMessage || config.text}
            </span>
        </div>
    );
}
