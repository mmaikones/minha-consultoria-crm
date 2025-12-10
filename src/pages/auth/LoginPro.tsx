import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Dumbbell, AlertCircle, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPro() {
    const navigate = useNavigate();
    const { signIn, signUp, login } = useAuth();
    const [isSignUp, setIsSignUp] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            if (isSignUp) {
                // Sign up
                if (!name.trim()) {
                    setError('Nome é obrigatório');
                    setIsLoading(false);
                    return;
                }
                console.log('Attempting signup with:', email);
                const { error: signUpError } = await signUp(email, password, name);
                if (signUpError) {
                    console.error('Signup error:', signUpError);
                    setError(signUpError.message);
                    setIsLoading(false);
                    return;
                }
                setSuccess('Conta criada com sucesso! Faça login agora.');
                setIsSignUp(false);
                setIsLoading(false);
            } else {
                // Sign in
                console.log('Attempting signin with:', email);
                const { error: signInError } = await signIn(email, password);
                if (signInError) {
                    console.error('Signin error:', signInError);
                    setError(signInError.message);
                    setIsLoading(false);
                    return;
                }
                console.log('Signin success, navigating...');
                setIsLoading(false);
                navigate('/admin/dashboard');
            }
        } catch (err) {
            console.error('Auth error:', err);
            setError('Erro de conexão. Verifique sua internet.');
            setIsLoading(false);
        }
    };

    // Demo mode - bypass auth
    const handleDemoLogin = () => {
        login('pro');
        navigate('/admin/dashboard');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 p-12 flex-col justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Dumbbell className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-white">Minha Consultoria</span>
                </div>

                <div>
                    <h1 className="text-4xl font-bold text-white mb-4">
                        Gerencie seus alunos como um profissional
                    </h1>
                    <p className="text-white/80 text-lg">
                        Treinos, dietas, mensagens, gamificação e muito mais em um só lugar.
                    </p>
                </div>

                <div className="flex gap-2">
                    <div className="w-12 h-12 bg-white/20 rounded-full" />
                    <div className="w-12 h-12 bg-white/20 rounded-full" />
                    <div className="w-12 h-12 bg-white/20 rounded-full" />
                    <p className="text-white/60 text-sm self-center ml-2">+500 profissionais confiam em nós</p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                            <Dumbbell className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-slate-900 dark:text-white">Minha Consultoria</span>
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {isSignUp ? 'Criar sua conta' : 'Bem-vindo de volta!'}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">
                            {isSignUp ? 'Preencha os dados para começar' : 'Entre na sua conta para continuar'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-600 dark:text-green-400 text-sm">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isSignUp && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Nome completo
                                </label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Seu nome"
                                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                E-mail
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Senha
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {!isSignUp && (
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Lembrar-me</span>
                                </label>
                                <a href="#" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                                    Esqueceu a senha?
                                </a>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-70"
                        >
                            {isLoading ? (
                                <span>{isSignUp ? 'Criando conta...' : 'Entrando...'}</span>
                            ) : (
                                <>
                                    <span>{isSignUp ? 'Criar Conta' : 'Entrar no Sistema'}</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-4">
                        <button
                            onClick={handleDemoLogin}
                            className="w-full py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm"
                        >
                            🚀 Entrar em Modo Demo (sem login)
                        </button>
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            {isSignUp ? 'Já tem uma conta?' : 'Não tem uma conta?'}{' '}
                            <button
                                onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccess(''); }}
                                className="text-primary-600 hover:text-primary-700 font-medium"
                            >
                                {isSignUp ? 'Fazer Login' : 'Criar Conta'}
                            </button>
                        </p>
                    </div>

                    <div className="mt-8 text-center">
                        <Link
                            to="/login/aluno"
                            className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        >
                            Sou aluno, acessar portal →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

