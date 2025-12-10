import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Phone, Mail, ArrowRight, Dumbbell, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authenticateStudent } from '../../services/studentService';

export default function LoginStudent() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [method, setMethod] = useState<'phone' | 'email'>('phone');
    const [value, setValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Using phone as both login and password for this simplified flow
            // If method is email, we might need a different auth strategy, 
            // but for now let's assume phone auth is the primary one as per requirements.

            // Artificial delay for UX
            await new Promise(resolve => setTimeout(resolve, 1000));

            const student = await authenticateStudent(value);

            if (student) {
                localStorage.setItem('fitpro_student_id', student.id);
                login('student');
                navigate('/app');
            } else {
                setError('Aluno não encontrado. Verifique seu WhatsApp.');
            }
        } catch (err) {
            setError('Erro ao tentar entrar. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
            </div>

            {/* Content */}
            <div className="relative flex-1 flex flex-col items-center justify-center p-6">
                {/* Logo */}
                <div className="flex items-center gap-3 mb-12">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-600/30">
                        <Dumbbell className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <span className="text-2xl font-bold text-white">Minha Consultoria</span>
                        <p className="text-xs text-slate-400">Portal do Aluno</p>
                    </div>
                </div>

                {/* Card */}
                <div className="w-full max-w-sm bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-white">
                            Acessar App
                        </h1>
                        <p className="text-slate-400 mt-2 text-sm">
                            Entre para ver seus treinos e dietas
                        </p>
                    </div>

                    {/* Method Toggle */}
                    <div className="flex bg-slate-700/50 rounded-xl p-1 mb-6">
                        <button
                            onClick={() => setMethod('phone')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${method === 'phone'
                                ? 'bg-primary-600 text-white'
                                : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            <Phone className="w-4 h-4" />
                            Celular
                        </button>
                        <button
                            onClick={() => setMethod('email')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${method === 'email'
                                ? 'bg-primary-600 text-white'
                                : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            <Mail className="w-4 h-4" />
                            E-mail
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <div className="relative">
                                {method === 'phone' ? (
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                ) : (
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                )}
                                <input
                                    type={method === 'phone' ? 'tel' : 'email'}
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    placeholder={method === 'phone' ? '(11) 99999-9999' : 'seu@email.com'}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !value}
                            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-bold text-lg hover:from-primary-600 hover:to-primary-700 transition-all disabled:opacity-50 shadow-lg shadow-primary-600/30"
                        >
                            {isLoading ? (
                                <span>Acessando...</span>
                            ) : (
                                <>
                                    <span>Acessar App</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>

                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}
                    </form>

                    <p className="text-center text-slate-500 text-xs mt-6">
                        Ao continuar, você concorda com nossos{' '}
                        <a href="#" className="text-primary-400">Termos</a>
                    </p>
                </div>

                {/* Footer Link */}
                <div className="mt-8">
                    <Link
                        to="/login"
                        className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                    >
                        Sou profissional, acessar painel →
                    </Link>
                </div>
            </div>
        </div>
    );
}
