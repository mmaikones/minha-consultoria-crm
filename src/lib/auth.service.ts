// Auth Service - Authentication operations
import { supabase, getCurrentUser, getCurrentSession } from './supabase';
import type { Professional } from './database.types';

export interface SignUpData {
    email: string;
    password: string;
    name: string;
}

export interface SignInData {
    email: string;
    password: string;
}

export const authService = {
    // Sign up a new professional
    async signUp({ email, password, name }: SignUpData) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name }
            }
        });

        if (error) throw error;
        return data;
    },

    // Sign in with email and password
    async signIn({ email, password }: SignInData) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;
        return data;
    },

    // Sign out
    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    // Get current user
    async getCurrentUser() {
        return getCurrentUser();
    },

    // Get current session
    async getCurrentSession() {
        return getCurrentSession();
    },

    // Get current professional profile
    async getCurrentProfessional(): Promise<Professional | null> {
        const user = await getCurrentUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from('professionals')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }

        return data;
    },

    // Update professional profile
    async updateProfile(updates: Partial<Professional>): Promise<Professional> {
        const user = await getCurrentUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('professionals')
            // @ts-ignore
            .update(updates)
            .eq('id', user.id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Send password reset email
    async resetPassword(email: string) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`
        });

        if (error) throw error;
    },

    // Update password
    async updatePassword(newPassword: string) {
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) throw error;
    },

    // Listen to auth state changes
    onAuthStateChange(callback: (event: string, session: any) => void) {
        return supabase.auth.onAuthStateChange(callback);
    }
};
