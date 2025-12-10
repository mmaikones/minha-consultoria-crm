import React from 'react';
import {
    Home, Dumbbell, Apple, User, Flame,
    Gift, Hand, Trophy, Calendar,
    Wallet, Video, MessageSquare,
    Bell
} from 'lucide-react';

export type Icon3DVariant =
    | 'home' | 'workout' | 'diet' | 'profile'
    | 'fire' | 'gift' | 'hand' | 'trophy'
    | 'message' | 'bell' | 'calendar' | 'wallet'
    | 'video' | 'muscle' | 'protein' | 'carbs' | 'fat' | 'vip';

interface Icon3DProps {
    variant: Icon3DVariant;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export default function Icon3D({ variant, size = 'md', className = '' }: Icon3DProps) {

    const sizeClasses = {
        sm: 'w-8 h-8 p-1.5',
        md: 'w-10 h-10 p-2',
        lg: 'w-12 h-12 p-2.5',
        xl: 'w-16 h-16 p-4',
    };

    const iconSizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
        xl: 'w-8 h-8',
    };

    // Claymorphism/3D Styles
    // Inset shadows for depth + gradient bg
    const baseStyle = "rounded-2xl flex items-center justify-center transition-transform hover:scale-105 relative overflow-hidden shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.1),_inset_2px_2px_4px_rgba(255,255,255,0.25),_4px_4px_8px_rgba(0,0,0,0.05)]";

    const variants = {
        home: {
            bg: "bg-gradient-to-br from-indigo-400 to-indigo-600",
            icon: <Home className={`${iconSizes[size]} text-white drop-shadow-md`} strokeWidth={2.5} />,
        },
        workout: {
            bg: "bg-gradient-to-br from-blue-400 to-blue-600",
            icon: <Dumbbell className={`${iconSizes[size]} text-white drop-shadow-md`} strokeWidth={2.5} />,
        },
        diet: {
            bg: "bg-gradient-to-br from-emerald-400 to-emerald-600",
            icon: <Apple className={`${iconSizes[size]} text-white drop-shadow-md`} strokeWidth={2.5} />,
        },
        profile: {
            bg: "bg-gradient-to-br from-violet-400 to-violet-600",
            icon: <User className={`${iconSizes[size]} text-white drop-shadow-md`} strokeWidth={2.5} />,
        },
        fire: {
            bg: "bg-gradient-to-br from-orange-400 to-red-600",
            icon: <Flame className={`${iconSizes[size]} text-white drop-shadow-md fill-white/20`} strokeWidth={2.5} />,
        },
        gift: {
            bg: "bg-gradient-to-br from-pink-400 to-rose-600",
            icon: <Gift className={`${iconSizes[size]} text-white drop-shadow-md`} strokeWidth={2.5} />,
        },
        hand: {
            bg: "bg-gradient-to-br from-amber-300 to-amber-500",
            icon: <Hand className={`${iconSizes[size]} text-white drop-shadow-md`} strokeWidth={2.5} />,
        },
        trophy: {
            bg: "bg-gradient-to-br from-yellow-300 to-yellow-500",
            icon: <Trophy className={`${iconSizes[size]} text-white drop-shadow-md`} strokeWidth={2.5} />,
        },
        message: {
            bg: "bg-gradient-to-br from-sky-400 to-cyan-600",
            icon: <MessageSquare className={`${iconSizes[size]} text-white drop-shadow-md`} strokeWidth={2.5} />,
        },
        bell: {
            bg: "bg-gradient-to-br from-slate-400 to-slate-600",
            icon: <Bell className={`${iconSizes[size]} text-white drop-shadow-md`} strokeWidth={2.5} />,
        },
        calendar: {
            bg: "bg-gradient-to-br from-teal-400 to-teal-600",
            icon: <Calendar className={`${iconSizes[size]} text-white drop-shadow-md`} strokeWidth={2.5} />,
        },
        wallet: {
            bg: "bg-gradient-to-br from-emerald-500 to-teal-700",
            icon: <Wallet className={`${iconSizes[size]} text-white drop-shadow-md`} strokeWidth={2.5} />,
        },
        video: {
            bg: "bg-gradient-to-br from-red-500 to-pink-600",
            icon: <Video className={`${iconSizes[size]} text-white drop-shadow-md`} strokeWidth={2.5} />,
        },
        // Diet specifics
        protein: {
            bg: "bg-gradient-to-br from-blue-400 to-indigo-500",
            icon: <div className={`${iconSizes[size]} font-bold text-white flex items-center justify-center`}>P</div>,
        },
        carbs: {
            bg: "bg-gradient-to-br from-yellow-400 to-orange-500",
            icon: <div className={`${iconSizes[size]} font-bold text-white flex items-center justify-center`}>C</div>,
        },
        fat: {
            bg: "bg-gradient-to-br from-red-400 to-rose-500",
            icon: <div className={`${iconSizes[size]} font-bold text-white flex items-center justify-center`}>G</div>,
        },
        muscle: {
            bg: "bg-gradient-to-br from-slate-600 to-slate-800",
            icon: <Dumbbell className={`${iconSizes[size]} text-white`} strokeWidth={2.5} />,
        },
        vip: {
            bg: "bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-600 shadow-amber-500/50",
            icon: <Gift className={`${iconSizes[size]} text-white drop-shadow-md`} strokeWidth={2.5} />,
        }
    };

    const current = variants[variant] || variants.home;

    return (
        <div className={`${baseStyle} ${current.bg} ${sizeClasses[size]} ${className}`}>
            {/* Shine Reflection */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
            {current.icon}
        </div>
    );
}
