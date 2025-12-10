import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

export interface PlanCardProps {
    id: string;
    name: string;
    description?: string | null;
    price: number;
    durationDays: number;
    type: 'mensal' | 'trimestral' | 'semestral' | 'anual';
    features: string[];
    icon?: string | null;
    isPopular?: boolean;
    onSelect: (planId: string) => void;
}

const TYPE_LABELS: Record<string, string> = {
    mensal: 'Mensal',
    trimestral: 'Trimestral',
    semestral: 'Semestral',
    anual: 'Anual',
};

export default function PlanCard({
    id,
    name,
    description,
    price,
    durationDays,
    type,
    features,
    icon,
    isPopular,
    onSelect,
}: PlanCardProps) {
    // Format price to BRL
    const formattedPrice = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(price);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className={`relative bg-white rounded-2xl shadow-lg border-2 overflow-hidden transition-all ${isPopular ? 'border-emerald-500' : 'border-gray-100'
                }`}
        >
            {/* Popular Badge */}
            {isPopular && (
                <div className="absolute top-0 right-0 bg-emerald-500 text-white px-4 py-1 text-xs font-bold rounded-bl-xl">
                    ⭐ Mais Popular
                </div>
            )}

            {/* Card Content */}
            <div className="p-6">
                {/* Icon & Name */}
                <div className="flex items-center gap-3 mb-3">
                    {icon && (
                        <span className="text-3xl">{icon}</span>
                    )}
                    <h3 className="text-xl font-bold text-gray-900">{name}</h3>
                </div>

                {/* Description */}
                {description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {description}
                    </p>
                )}

                {/* Price */}
                <div className="mb-4">
                    <span className="text-4xl font-extrabold text-gray-900">
                        {formattedPrice}
                    </span>
                    <span className="text-gray-500 text-sm ml-1">
                        / {TYPE_LABELS[type] || `${durationDays} dias`}
                    </span>
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                    {features.slice(0, 5).map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-gray-700 text-sm">
                            <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>

                {/* CTA Button */}
                <button
                    onClick={() => onSelect(id)}
                    className="w-full py-3 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors shadow-md hover:shadow-lg active:scale-[0.98]"
                >
                    Comprar Agora
                </button>
            </div>
        </motion.div>
    );
}
