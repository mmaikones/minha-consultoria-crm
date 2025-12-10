import { NavLink, useLocation } from 'react-router-dom';
import { Package, FileText, Star } from 'lucide-react';

const MARKETING_LINKS = [
    { path: '/admin/planos', label: 'Planos', icon: Package, description: 'Produtos para vender' },
    { path: '/admin/templates', label: 'Templates', icon: FileText, description: 'Modelos de mensagens' },
    { path: '/admin/gamificacao', label: 'Pontuação', icon: Star, description: 'Sistema de recompensas' },
];

export default function MarketingNav() {
    const location = useLocation();

    // Filter out current page
    const otherLinks = MARKETING_LINKS.filter(link => link.path !== location.pathname);

    return (
        <div className="flex gap-2 mb-6">
            {otherLinks.map(link => {
                const Icon = link.icon;
                return (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        className="flex items-center gap-2 px-4 py-2.5 bg-muted/50 hover:bg-muted text-foreground rounded-xl text-sm font-medium transition-colors border border-border hover:border-primary/30"
                    >
                        <Icon className="w-4 h-4 text-primary" />
                        <span>{link.label}</span>
                    </NavLink>
                );
            })}
        </div>
    );
}
