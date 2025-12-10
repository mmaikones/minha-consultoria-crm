import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Icon3D from '../../components/ui/Icon3D';

const mockNotifications = [
    {
        id: '1',
        type: 'fire',
        title: 'Sequência em chamas!',
        message: 'Você atingiu 3 dias seguidos de treino. Continue assim! 🔥',
        date: 'Hoje, 09:41',
        read: false,
    },
    {
        id: '2',
        type: 'medal',
        title: 'Nova Conquista',
        message: 'Você completou 10 treinos este mês. Parabéns!',
        date: 'Ontem, 18:20',
        read: false,
    },
    {
        id: '3',
        type: 'diet',
        title: 'Lembrete de Refeição',
        message: 'Hora do lanche da tarde! Não esqueça sua proteína.',
        date: 'Ontem, 15:00',
        read: true,
    },
    {
        id: '4',
        type: 'info',
        title: 'Dica do Personal',
        message: 'Beba pelo menos 3L de água hoje.',
        date: '07 Jun',
        read: true,
    }
];

export default function Notifications() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState(mockNotifications);

    const handleMarkAsRead = (id: string) => {
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
    };

    const handleMarkAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    return (
        <div className="p-4 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-slate-900 dark:text-white" />
                </button>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Notificações</h1>
                <div className="w-10" /> {/* Spacer */}
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleMarkAllRead}
                    className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors"
                >
                    Marcar todas como lidas
                </button>
            </div>

            <div className="space-y-4">
                {notifications.map(notification => (
                    <div
                        key={notification.id}
                        className={`relative bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border transition-all ${notification.read
                            ? 'border-slate-100 dark:border-slate-700 opacity-70'
                            : 'border-primary-100 dark:border-primary-900/50 bg-primary-50/50 dark:bg-primary-900/10'
                            }`}
                        onClick={() => handleMarkAsRead(notification.id)}
                    >
                        {!notification.read && (
                            <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                        )}

                        <div className="flex gap-4">
                            <div className="shrink-0">
                                {notification.type === 'fire' && <Icon3D variant="fire" size="md" className="shadow-orange-200" />}
                                {notification.type === 'medal' && <Icon3D variant="trophy" size="md" className="shadow-yellow-200" />}
                                {notification.type === 'diet' && <Icon3D variant="diet" size="md" className="shadow-green-200" />}
                                {notification.type === 'info' && <Icon3D variant="message" size="md" className="shadow-blue-200" />}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className={`font-bold text-sm mb-1 ${notification.read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                                    {notification.title}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                    {notification.message}
                                </p>
                                <p className="text-xs text-slate-400 mt-2 font-medium">
                                    {notification.date}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}

                {notifications.length === 0 && (
                    <div className="text-center py-12">
                        <Icon3D variant="bell" size="xl" className="mx-auto mb-4 opacity-50 grayscale" />
                        <p className="text-slate-500">Nenhuma notificação por enquanto</p>
                    </div>
                )}
            </div>
        </div>
    );
}
