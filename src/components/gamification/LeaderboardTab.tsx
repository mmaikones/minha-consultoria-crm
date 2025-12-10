import { Trophy, Medal, Flame, Target } from 'lucide-react';
import { mockLeaderboard } from '../../data/mockGamification';

export default function LeaderboardTab() {
    const topThree = mockLeaderboard.slice(0, 3);
    const rest = mockLeaderboard.slice(3);

    return (
        <div className="space-y-6">
            {/* Top 3 Podium */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
                {/* 2nd Place */}
                <div className="order-1 pt-6">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-center">
                        <div className="relative inline-block mb-2">
                            <div className="w-16 h-16 bg-gradient-to-br from-slate-300 to-slate-400 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                {topThree[1]?.studentAvatar}
                            </div>
                            <span className="absolute -top-2 -right-2 text-2xl">🥈</span>
                        </div>
                        <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                            {topThree[1]?.studentName}
                        </p>
                        <p className="text-lg font-bold text-amber-500">
                            {topThree[1]?.totalPoints.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500">pontos</p>
                    </div>
                </div>

                {/* 1st Place */}
                <div className="order-2">
                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl p-4 border-2 border-amber-300 dark:border-amber-700 text-center shadow-lg">
                        <div className="relative inline-block mb-2">
                            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-xl ring-4 ring-yellow-300 dark:ring-yellow-700">
                                {topThree[0]?.studentAvatar}
                            </div>
                            <span className="absolute -top-3 -right-1 text-3xl">🥇</span>
                        </div>
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <Trophy className="w-4 h-4 text-amber-500" />
                            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">CAMPEÃO</span>
                        </div>
                        <p className="font-bold text-slate-900 dark:text-white truncate">
                            {topThree[0]?.studentName}
                        </p>
                        <p className="text-2xl font-bold text-amber-500">
                            {topThree[0]?.totalPoints.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500">pontos</p>
                    </div>
                </div>

                {/* 3rd Place */}
                <div className="order-3 pt-8">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-center">
                        <div className="relative inline-block mb-2">
                            <div className="w-14 h-14 bg-gradient-to-br from-amber-600 to-amber-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                {topThree[2]?.studentAvatar}
                            </div>
                            <span className="absolute -top-2 -right-2 text-xl">🥉</span>
                        </div>
                        <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                            {topThree[2]?.studentName}
                        </p>
                        <p className="text-lg font-bold text-amber-500">
                            {topThree[2]?.totalPoints.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500">pontos</p>
                    </div>
                </div>
            </div>

            {/* Rest of the Leaderboard */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <Medal className="w-5 h-5 text-amber-500" />
                        Ranking Completo
                    </h3>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {rest.map(entry => (
                        <div
                            key={entry.studentId}
                            className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                            {/* Rank */}
                            <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center font-bold text-slate-500 dark:text-slate-400">
                                {entry.rank}
                            </div>

                            {/* Avatar */}
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                {entry.studentAvatar}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-900 dark:text-white truncate">
                                    {entry.studentName}
                                </p>
                                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <Target className="w-3 h-3" />
                                        {entry.checkins} check-ins
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Flame className="w-3 h-3 text-orange-500" />
                                        {entry.streakDays} dias
                                    </span>
                                </div>
                            </div>

                            {/* Points */}
                            <div className="text-right">
                                <p className="font-bold text-amber-500">
                                    {entry.totalPoints.toLocaleString()}
                                </p>
                                <p className="text-xs text-slate-500">pts</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
