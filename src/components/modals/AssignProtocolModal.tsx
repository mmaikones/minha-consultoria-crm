import { useState } from 'react';
import { X, Check, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Protocol } from '../../data/mockProtocols';
import { mockStudents } from '../../data/mockStudents';

interface AssignProtocolModalProps {
    isOpen: boolean;
    protocol: Protocol | null;
    onClose: () => void;
    onConfirm: (studentIds: string[], notify: boolean) => void;
}

export default function AssignProtocolModal({ isOpen, protocol, onClose, onConfirm }: AssignProtocolModalProps) {
    const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
    const [notifyStudent, setNotifyStudent] = useState(false);

    // Filter only active students (not leads)
    const activeStudents = mockStudents.filter(s => s.status !== 'novos_leads');

    const handleToggleStudent = (studentId: string) => {
        const newSelected = new Set(selectedStudents);
        if (newSelected.has(studentId)) {
            newSelected.delete(studentId);
        } else {
            newSelected.add(studentId);
        }
        setSelectedStudents(newSelected);
    };

    const handleSelectAll = () => {
        if (selectedStudents.size === activeStudents.length) {
            setSelectedStudents(new Set());
        } else {
            setSelectedStudents(new Set(activeStudents.map(s => s.id)));
        }
    };

    const handleConfirm = () => {
        onConfirm(Array.from(selectedStudents), notifyStudent);
        setSelectedStudents(new Set());
        setNotifyStudent(false);
    };

    const handleClose = () => {
        setSelectedStudents(new Set());
        setNotifyStudent(false);
        onClose();
    };

    if (!isOpen || !protocol) return null;

    const isAllSelected = selectedStudents.size === activeStudents.length;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                onClick={handleClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                        <div>
                            <h2 className="font-semibold text-slate-900 dark:text-white">
                                Atribuir Protocolo
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {protocol.name}
                            </p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>

                    {/* Select All */}
                    <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                        <button
                            onClick={handleSelectAll}
                            className="flex items-center gap-3 w-full"
                        >
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${isAllSelected
                                ? 'bg-primary-600 border-primary-600'
                                : 'border-slate-300 dark:border-slate-600'
                                }`}>
                                {isAllSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                Selecionar Todos ({activeStudents.length})
                            </span>
                        </button>
                    </div>

                    {/* Students List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {activeStudents.map(student => {
                            const isSelected = selectedStudents.has(student.id);
                            const hasProtocol = student.currentProtocolId && student.currentProtocolId !== protocol.id;

                            return (
                                <button
                                    key={student.id}
                                    onClick={() => handleToggleStudent(student.id)}
                                    className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                                >
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${isSelected
                                        ? 'bg-primary-600 border-primary-600'
                                        : 'border-slate-300 dark:border-slate-600'
                                        }`}>
                                        {isSelected && <Check className="w-3 h-3 text-white" />}
                                    </div>

                                    <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                        {student.avatar}
                                    </div>

                                    <div className="flex-1 text-left">
                                        <p className="font-medium text-slate-900 dark:text-white">
                                            {student.name}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {student.goal}
                                        </p>
                                    </div>

                                    {hasProtocol && (
                                        <div className="flex items-center gap-1 text-amber-500" title="Substituirá o protocolo atual">
                                            <AlertTriangle className="w-4 h-4" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 space-y-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={notifyStudent}
                                onChange={(e) => setNotifyStudent(e.target.checked)}
                                className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm text-slate-700 dark:text-slate-300">
                                Notificar aluno(s) sobre o novo protocolo
                            </span>
                        </label>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                                {selectedStudents.size} selecionado{selectedStudents.size !== 1 ? 's' : ''}
                            </span>
                            <button
                                onClick={handleConfirm}
                                disabled={selectedStudents.size === 0}
                                className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Confirmar Envio
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
