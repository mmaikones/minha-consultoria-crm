import { useState } from 'react';
import { Camera, ChevronLeft, ChevronRight, X, Plus, Calendar, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EvolutionPhoto } from '../../data/mockStudents';

interface EvolutionGalleryProps {
    photos: EvolutionPhoto[];
    onAddPhoto?: () => void;
}

// Mock de fotos de evolução
export const mockEvolutionPhotos: EvolutionPhoto[] = [
    {
        id: '1',
        url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=600&fit=crop',
        date: '2024-09-01',
        type: 'front',
        notes: 'Início do protocolo - 85kg'
    },
    {
        id: '2',
        url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=600&fit=crop',
        date: '2024-09-01',
        type: 'side',
    },
    {
        id: '3',
        url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=600&fit=crop',
        date: '2024-10-15',
        type: 'front',
        notes: '6 semanas - 82kg'
    },
    {
        id: '4',
        url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=600&fit=crop',
        date: '2024-10-15',
        type: 'side',
    },
    {
        id: '5',
        url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=600&fit=crop',
        date: '2024-12-01',
        type: 'front',
        notes: '12 semanas - 79kg - Excelente progresso!'
    },
    {
        id: '6',
        url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&h=600&fit=crop',
        date: '2024-12-01',
        type: 'side',
    },
];

const typeLabels: Record<EvolutionPhoto['type'], string> = {
    front: 'Frente',
    side: 'Lateral',
    back: 'Costas',
};

export default function EvolutionGallery({ photos = mockEvolutionPhotos, onAddPhoto }: EvolutionGalleryProps) {
    const [selectedPhoto, setSelectedPhoto] = useState<EvolutionPhoto | null>(null);
    const [activeFilter, setActiveFilter] = useState<'all' | EvolutionPhoto['type']>('all');

    // Agrupar fotos por data
    const groupedByDate = photos.reduce((acc, photo) => {
        if (!acc[photo.date]) {
            acc[photo.date] = [];
        }
        acc[photo.date].push(photo);
        return acc;
    }, {} as Record<string, EvolutionPhoto[]>);

    const sortedDates = Object.keys(groupedByDate).sort((a, b) =>
        new Date(b).getTime() - new Date(a).getTime()
    );

    const filteredPhotos = activeFilter === 'all'
        ? photos
        : photos.filter(p => p.type === activeFilter);

    const navigatePhoto = (direction: 'prev' | 'next') => {
        if (!selectedPhoto) return;
        const currentIndex = filteredPhotos.findIndex(p => p.id === selectedPhoto.id);
        const newIndex = direction === 'prev'
            ? (currentIndex - 1 + filteredPhotos.length) % filteredPhotos.length
            : (currentIndex + 1) % filteredPhotos.length;
        setSelectedPhoto(filteredPhotos[newIndex]);
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Camera className="w-5 h-5 text-primary-500" />
                    <h3 className="font-bold text-slate-900 dark:text-white">Galeria de Evolução</h3>
                    <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 px-2 py-0.5 rounded-full">
                        {photos.length} fotos
                    </span>
                </div>
                <button
                    onClick={onAddPhoto}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white text-xs font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
                {(['all', 'front', 'side', 'back'] as const).map(filter => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${activeFilter === filter
                                ? 'bg-primary-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                            }`}
                    >
                        {filter === 'all' ? 'Todas' : typeLabels[filter]}
                    </button>
                ))}
            </div>

            {/* Timeline Gallery */}
            {photos.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <Camera className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500 dark:text-slate-400 mb-2 font-medium">Nenhuma foto de evolução</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
                        Adicione fotos para acompanhar a transformação
                    </p>
                    <button
                        onClick={onAddPhoto}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700"
                    >
                        <Plus className="w-4 h-4" />
                        Adicionar primeira foto
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {sortedDates.map(date => {
                        const datePhotos = groupedByDate[date].filter(
                            p => activeFilter === 'all' || p.type === activeFilter
                        );
                        if (datePhotos.length === 0) return null;

                        return (
                            <div key={date} className="space-y-3">
                                {/* Date Header */}
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        {new Date(date).toLocaleDateString('pt-BR', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </span>
                                    {datePhotos[0].notes && (
                                        <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                                            {datePhotos[0].notes}
                                        </span>
                                    )}
                                </div>

                                {/* Photos Grid */}
                                <div className="grid grid-cols-3 gap-3">
                                    {datePhotos.map(photo => (
                                        <motion.div
                                            key={photo.id}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setSelectedPhoto(photo)}
                                            className="relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer bg-slate-200 dark:bg-slate-700 group"
                                        >
                                            <img
                                                src={photo.url}
                                                alt={`Evolução ${typeLabels[photo.type]}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <span className="absolute bottom-2 left-2 text-xs font-medium text-white bg-black/50 px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                                                {typeLabels[photo.type]}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedPhoto && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
                        onClick={() => setSelectedPhoto(null)}
                    >
                        {/* Navigation */}
                        <button
                            onClick={(e) => { e.stopPropagation(); navigatePhoto('prev'); }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
                        >
                            <ChevronLeft className="w-8 h-8 text-white" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); navigatePhoto('next'); }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
                        >
                            <ChevronRight className="w-8 h-8 text-white" />
                        </button>

                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedPhoto(null)}
                            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
                        >
                            <X className="w-6 h-6 text-white" />
                        </button>

                        {/* Image */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative max-w-3xl max-h-[85vh]"
                            onClick={e => e.stopPropagation()}
                        >
                            <img
                                src={selectedPhoto.url}
                                alt="Foto de evolução"
                                className="max-w-full max-h-[85vh] object-contain rounded-lg"
                            />
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-white font-medium">
                                            {typeLabels[selectedPhoto.type]}
                                        </span>
                                        <span className="text-white/60 text-sm ml-2">
                                            {new Date(selectedPhoto.date).toLocaleDateString('pt-BR')}
                                        </span>
                                    </div>
                                    {selectedPhoto.notes && (
                                        <span className="text-white/80 text-sm bg-white/20 px-3 py-1 rounded-full">
                                            {selectedPhoto.notes}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
