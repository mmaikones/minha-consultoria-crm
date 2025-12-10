import React, { useEffect, useState } from 'react';
import {
    Plus,
    Trash2,
    RefreshCw,
    Smartphone,
    QrCode,
    LogOut,
    Wifi,
    WifiOff,
    Loader2,
    X,
    AlertCircle
} from 'lucide-react';
import { evolutionService, EvolutionInstance, ConnectionState, QRCodeResponse } from '../../services/evolutionService';
import { motion, AnimatePresence } from 'framer-motion';

interface ConnectionManagerProps {
    isOpen: boolean;
    onClose: () => void;
    onConnect?: (instanceName: string) => void;
}

export default function ConnectionManager({ isOpen, onClose, onConnect }: ConnectionManagerProps) {
    const [instances, setInstances] = useState<EvolutionInstance[]>([]);
    const [loading, setLoading] = useState(false);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [pairingCode, setPairingCode] = useState<string | null>(null);
    const [selectedInstance, setSelectedInstance] = useState<string | null>(null);
    const [newInstanceName, setNewInstanceName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [showNewForm, setShowNewForm] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Load cache immediately
            const cached = evolutionService.getCachedInstances();
            if (cached.length > 0) {
                setInstances(cached);
            }
            loadInstances();
        }
    }, [isOpen]);

    const loadInstances = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await evolutionService.fetchAllInstances();

            // Verificação de Segurança
            if (data && data.length > 0) {
                setInstances(data);

                // AUTO-CORREÇÃO: Se temos instâncias na API mas o localStorage tá vazio,
                // pega a primeira e salva como ativa.
                const saved = evolutionService.getActiveInstance();
                if (!saved) {
                    const firstName = data[0].instanceName;
                    console.log('[ConnectionManager] Recuperando sessão perdida. Definindo ativa:', firstName);
                    evolutionService.setInstance(firstName);
                }
            } else {
                setInstances([]);
            }
        } catch (err) {
            setError('Erro ao carregar conexões');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateInstance = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newInstanceName) return;

        try {
            setLoading(true);
            setError(null);
            const formattedPhone = phoneNumber.replace(/\D/g, '');

            await evolutionService.createInstance(newInstanceName, formattedPhone || undefined);
            setNewInstanceName('');
            setPhoneNumber('');
            setShowNewForm(false);
            await loadInstances();

            setTimeout(() => handleConnect(newInstanceName), 500);
        } catch (err: any) {
            if (err?.message?.includes('409') || err?.response?.status === 409) {
                setShowNewForm(false);
                setTimeout(() => handleConnect(newInstanceName), 500);
            } else {
                setError(err.response?.data?.message || 'Erro ao criar instância');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async (instanceName: string) => {
        setSelectedInstance(instanceName);
        setLoading(true);
        setQrCode(null);
        setError(null);

        try {
            const data: QRCodeResponse = await evolutionService.getQRCode(instanceName);
            if (data.base64) {
                setQrCode(data.base64);
                setPairingCode(data.pairingCode || null);
                startPolling(instanceName);
            }
        } catch (err: any) {
            try {
                const status: ConnectionState = await evolutionService.getConnectionState(instanceName);
                if (status.state === 'open') {
                    setSelectedInstance(null);
                    if (onConnect) onConnect(instanceName);
                    loadInstances();
                    return;
                }
            } catch (e) {
                console.error(e);
            }
            setError('Erro ao buscar QR Code');
            setSelectedInstance(null);
        } finally {
            setLoading(false);
        }
    };

    const startPolling = (instanceName: string) => {
        const interval = setInterval(async () => {
            try {
                const status: ConnectionState = await evolutionService.getConnectionState(instanceName);
                if (status.state === 'open') {
                    clearInterval(interval);
                    setSelectedInstance(null);
                    setQrCode(null);
                    if (onConnect) onConnect(instanceName);
                    loadInstances();
                }
            } catch (e) {
                console.error('Polling error:', e);
            }
        }, 3000);

        setTimeout(() => {
            clearInterval(interval);
            if (selectedInstance === instanceName) {
                setError('QR Code expirado. Tente novamente.');
                setSelectedInstance(null);
                setQrCode(null);
            }
        }, 120000);
    };

    const handleDelete = async (instanceName: string) => {
        if (!confirm(`Tem certeza que deseja deletar ${instanceName}?`)) return;
        try {
            setLoading(true);
            await evolutionService.deleteInstance(instanceName);
            loadInstances();
        } catch (err) {
            setError('Erro ao deletar');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async (instanceName: string) => {
        try {
            setLoading(true);
            await evolutionService.logoutInstance(instanceName);
            loadInstances();
        } catch (err) {
            setError('Erro ao desconectar');
        } finally {
            setLoading(false);
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
                    className="bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <Smartphone className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Gerenciar Conexões</h2>
                                <p className="text-sm text-white/70">Conecte seus números de WhatsApp via Evolution API</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={loadInstances}
                                disabled={loading}
                                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                                title="Recarregar Lista"
                            >
                                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Error Alert */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="mx-5 mt-4"
                            >
                                <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5" />
                                    <p className="text-sm font-medium flex-1">{error}</p>
                                    <button
                                        onClick={() => setError(null)}
                                        className="p-1 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-lg"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Content */}
                    <div className="p-5 overflow-y-auto max-h-[calc(85vh-100px)]">
                        {/* Add New Instance Button */}
                        {!showNewForm && (
                            <button
                                onClick={() => setShowNewForm(true)}
                                className="w-full flex items-center justify-center gap-2 p-4 mb-5 
                                    border-2 border-dashed border-emerald-300 dark:border-emerald-800 
                                    rounded-xl text-emerald-600 dark:text-emerald-400 
                                    hover:bg-emerald-50 dark:hover:bg-emerald-900/20 
                                    hover:border-emerald-500 transition-all font-bold"
                            >
                                <Plus className="w-5 h-5" />
                                Nova Instância
                            </button>
                        )}

                        {/* New Instance Form */}
                        <AnimatePresence>
                            {showNewForm && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="mb-5"
                                >
                                    <form onSubmit={handleCreateInstance} className="p-5 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
                                        <h3 className="font-bold text-slate-900 dark:text-white">Criar Nova Instância</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <input
                                                type="text"
                                                placeholder="Nome da instância (ex: vendas)"
                                                value={newInstanceName}
                                                onChange={(e) => setNewInstanceName(e.target.value.toLowerCase().replace(/\s/g, '-'))}
                                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                required
                                            />
                                            <div className="space-y-1">
                                                <input
                                                    type="tel"
                                                    placeholder="DDI + DDD + Número (ex: 5511999998888)"
                                                    value={phoneNumber}
                                                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                />
                                                <p className="text-xs text-slate-500 pl-1">
                                                    Formato: 55 + DDD + Número (apenas números)
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                type="submit"
                                                disabled={!newInstanceName.trim() || loading}
                                                className="flex-1 px-4 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                            >
                                                {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                                Criar e Conectar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setShowNewForm(false); setNewInstanceName(''); setPhoneNumber(''); }}
                                                className="px-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Loading State */}
                        {loading && instances.length === 0 && (
                            <div className="text-center py-12">
                                <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-4" />
                                <p className="text-slate-600 dark:text-slate-400 font-medium">Carregando instâncias...</p>
                            </div>
                        )}

                        {/* Instances Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {instances.map((item) => {
                                const name = item.instanceName || '';
                                const status = item.status || 'close';
                                const isConnected = status === 'open';

                                if (!name) return null;

                                return (
                                    <motion.div
                                        key={name}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-white dark:bg-slate-800 shadow-sm relative overflow-hidden"
                                    >
                                        <div className={`absolute top-0 left-0 w-1 h-full ${status === 'open' ? 'bg-green-500' :
                                            status === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                                            }`} />

                                        <div className="flex justify-between items-start mb-4 pl-3">
                                            <div>
                                                <h3 className="font-semibold text-slate-800 dark:text-slate-200">{item.instanceName}</h3>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize border ${status === 'open'
                                                    ? 'bg-green-100 text-green-700 border-green-200'
                                                    : status === 'connecting'
                                                        ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                                        : 'bg-red-100 text-red-700 border-red-200'
                                                    }`}>
                                                    {status === 'open' ? 'Online' : status === 'connecting' ? 'Conectando...' : status === 'close' ? 'Offline' : status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                                                {item.profileName || item.instanceId}
                                            </p>
                                            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full">
                                                <Smartphone className="h-5 w-5 text-slate-500" />
                                            </div>
                                        </div>

                                        <div className="flex gap-2 pl-3">
                                            {!isConnected ? (
                                                <button
                                                    onClick={() => handleConnect(name)}
                                                    disabled={loading}
                                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                                                >
                                                    <QrCode className="h-3 w-3" /> Conectar
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleLogout(name)}
                                                    disabled={loading}
                                                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-1.5 rounded text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                                                >
                                                    <LogOut className="h-3 w-3" /> Desconectar
                                                </button>
                                            )}

                                            <button
                                                onClick={() => handleDelete(name)}
                                                disabled={loading}
                                                className="px-3 py-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded text-xs disabled:opacity-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* No instances */}
                        {!loading && instances.length === 0 && (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Smartphone className="w-8 h-8 text-slate-400" />
                                </div>
                                <p className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                                    Nenhuma conexão encontrada
                                </p>
                                <p className="text-slate-500">
                                    Crie uma nova instância para conectar ao WhatsApp
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* QR Code Modal */}
                <AnimatePresence>
                    {selectedInstance && qrCode && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60]"
                            onClick={() => { setSelectedInstance(null); setQrCode(null); }}
                        >
                            <div
                                className="bg-white dark:bg-slate-800 p-6 rounded-2xl max-w-sm w-full text-center relative shadow-2xl mx-4"
                                onClick={e => e.stopPropagation()}
                            >
                                <button
                                    onClick={() => { setSelectedInstance(null); setQrCode(null); }}
                                    className="absolute top-3 right-3 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">Escaneie o QR Code</h3>
                                <p className="text-sm text-slate-500 mb-4">
                                    Abra o WhatsApp &gt; Aparelhos Conectados &gt; Conectar
                                </p>

                                <div className="bg-white p-4 rounded-xl shadow-inner mb-4 inline-block">
                                    <img src={qrCode} alt="QR Code" className="w-48 h-48 mx-auto object-contain" />
                                </div>

                                {pairingCode && (
                                    <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm font-mono select-all">
                                        Código: <span className="font-bold">{pairingCode}</span>
                                    </div>
                                )}

                                <button
                                    onClick={() => { setSelectedInstance(null); setQrCode(null); loadInstances(); }}
                                    className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold transition-colors"
                                >
                                    Pronto, já escaneei
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </AnimatePresence>
    );
}
