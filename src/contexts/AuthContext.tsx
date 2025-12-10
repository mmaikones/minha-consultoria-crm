import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import type { Professional } from '../lib/database.types';

type UserRole = 'pro' | 'student' | null;

interface AuthContextType {
    user: User | null;
    session: Session | null;
    professional: Professional | null;
    role: UserRole;
    isAuthenticated: boolean;
    isLoading: boolean;
    signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
    // Legacy support for demo mode
    login: (role: 'pro' | 'student') => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [professional, setProfessional] = useState<Professional | null>(null);
    const [role, setRole] = useState<UserRole>(() => {
        return localStorage.getItem('fitpro_user') as UserRole || null;
    });
    const [isLoading, setIsLoading] = useState(true);

    // Fetch professional profile with timeout
    const fetchProfessional = async (userId: string) => {
        console.log('AuthContext: Fetching professional for userId:', userId);
        try {
            // Add a timeout to prevent hanging
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const { data, error } = await supabase
                .from('professionals')
                .select('*')
                .eq('user_id', userId)
                .single();

            clearTimeout(timeoutId);

            if (error) {
                console.error('AuthContext: Error fetching professional:', error);
                // Don't throw - just continue without professional data
            } else if (data) {
                // @ts-ignore
                console.log('AuthContext: Professional found:', data.name);
                setProfessional(data);
            } else {
                console.log('AuthContext: No professional found for this user');
            }
        } catch (err) {
            console.error('AuthContext: fetchProfessional failed:', err);
            // Continue without professional data
        }
    };

    // Listen to auth state changes
    useEffect(() => {
        console.log('AuthContext: Initializing...');

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            console.log('AuthContext: Initial session:', session ? 'found' : 'none');
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                setRole('pro');
                fetchProfessional(session.user.id);
            }
        }).catch(err => {
            console.error('AuthContext: Failed to get session:', err);
        }).finally(() => {
            setIsLoading(false);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('AuthContext: Auth state changed:', event);
                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    console.log('AuthContext: User authenticated, setting role...');
                    setRole('pro');
                    // Don't await - let it happen in background
                    fetchProfessional(session.user.id);
                } else {
                    setRole(null);
                    setProfessional(null);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    // Persist demo role
    useEffect(() => {
        if (role) {
            localStorage.setItem('fitpro_user', role);
        } else {
            localStorage.removeItem('fitpro_user');
        }
    }, [role]);

    // Sign up new user
    const signUp = async (email: string, password: string, name: string) => {
        console.log('AuthContext: signUp called');
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { name }
                }
            });
            if (error) throw error;
            console.log('AuthContext: signUp success');
            return { error: null };
        } catch (error) {
            console.error('AuthContext: signUp error:', error);
            return { error: error as Error };
        }
    };

    // Sign in existing user
    const signIn = async (email: string, password: string) => {
        console.log('AuthContext: signIn called');
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            if (error) throw error;
            console.log('AuthContext: signIn success, user:', data.user?.email);
            return { error: null };
        } catch (error) {
            console.error('AuthContext: signIn error:', error);
            return { error: error as Error };
        }
    };

    // Sign out
    const signOut = async () => {
        console.log('AuthContext: signOut called');
        await supabase.auth.signOut();
        setRole(null);
        setProfessional(null);
    };

    // Legacy demo mode support
    const login = (demoRole: 'pro' | 'student') => {
        console.log('AuthContext: demo login:', demoRole);
        setRole(demoRole);
    };

    const logout = () => {
        signOut();
    };

    const isAuthenticated = !!session || !!role;

    return (
        <AuthContext.Provider value={{
            user,
            session,
            professional,
            role,
            isAuthenticated,
            isLoading,
            signUp,
            signIn,
            signOut,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}


