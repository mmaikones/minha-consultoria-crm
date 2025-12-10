import { useState } from 'react';
import { Gem, Check } from 'lucide-react';
import { mockRewards } from '../../data/mockRewards';
import { studentProfile } from '../../data/mockStudentData';

export default function RewardsStore() {
    const [balance, setBalance] = useState(studentProfile.points);
    const [toast, setToast] = useState<string | null>(null);
    const [redeeming, setRedeeming] = useState<string | null>(null);

    const handleRedeem = (rewardId: string, cost: number, name: string) => {
        if (balance >= cost) {
            setRedeeming(rewardId);
            setTimeout(() => {
                setBalance(prev => prev - cost);
                setRedeeming(null);
                const couponCode = `${name.toUpperCase().replace(/\s/g, '').substring(0, 6)}${Math.floor(Math.random() * 1000)}`;
                setToast(`🎉 Cupom: ${couponCode} gerado com sucesso!`);
                setTimeout(() => setToast(null), 4000);
            }, 1000);
        }
    };

    return (
        <div className="p-4 space-y-4">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-5 text-white shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-white/80 text-sm">Seu Saldo</p>
                        <p className="text-3xl font-bold flex items-center gap-2">
                            <Gem className="w-7 h-7" />
                            {balance.toLocaleString()}
                        </p>
                    </div>
                    <div className="text-5xl">🏆</div>
                </div>
            </div>

            {/* Title */}
            <h1 className="text-xl font-bold text-slate-900 dark:text-white px-1">
                Loja de Pontos
            </h1>

            {/* Rewards Grid */}
            <div className="grid grid-cols-2 gap-3">
                {mockRewards.map(reward => {
                    const canAfford = balance >= reward.cost;
                    const isRedeeming = redeeming === reward.id;
                    const pointsNeeded = reward.cost - balance;

                    return (
                        <div
                            key={reward.id}
                            className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col"
                        >
                            {/* Icon */}
                            <div className="text-4xl text-center mb-3">{reward.image}</div>

                            {/* Info */}
                            <h3 className="font-semibold text-slate-900 dark:text-white text-sm text-center">
                                {reward.name}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-1 flex-1">
                                {reward.description}
                            </p>

                            {/* Cost */}
                            <p className="text-center font-bold text-primary-600 my-2">
                                {reward.cost.toLocaleString()} pts
                            </p>

                            {/* Button */}
                            <button
                                onClick={() => canAfford && handleRedeem(reward.id, reward.cost, reward.name)}
                                disabled={!canAfford || isRedeeming}
                                className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all ${isRedeeming
                                        ? 'bg-green-500 text-white'
                                        : canAfford
                                            ? 'bg-green-500 text-white hover:bg-green-600 active:scale-95'
                                            : 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                                    }`}
                            >
                                {isRedeeming ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Check className="w-4 h-4 animate-bounce" />
                                        Resgatando...
                                    </span>
                                ) : canAfford ? (
                                    'Resgatar'
                                ) : (
                                    `Faltam ${pointsNeeded} pts`
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-24 left-4 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-4 rounded-xl shadow-lg text-center font-medium z-50 animate-bounce">
                    {toast}
                </div>
            )}
        </div>
    );
}
