// React Query hooks for payments data
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, handleSupabaseError } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Payment, InsertTables, UpdateTables } from '../lib/database.types';

export type PaymentInsert = InsertTables<'payments'>;
export type PaymentUpdate = UpdateTables<'payments'>;

// Query Keys
export const PAYMENTS_QUERY_KEY = ['payments'];

// Get all payments for current professional
export function usePayments() {
    const { professional } = useAuth();

    return useQuery({
        queryKey: PAYMENTS_QUERY_KEY,
        queryFn: async (): Promise<Payment[]> => {
            if (!professional?.id) return [];

            const { data, error } = await supabase
                .from('payments')
                .select('*')
                .eq('professional_id', professional.id)
                .order('due_date', { ascending: false });

            if (error) handleSupabaseError(error);
            return data || [];
        },
        enabled: !!professional?.id,
    });
}

// Get payments with student info
export function usePaymentsWithStudents() {
    const { professional } = useAuth();

    return useQuery({
        queryKey: ['payments', 'with-students'],
        queryFn: async () => {
            if (!professional?.id) return [];

            const { data, error } = await supabase
                .from('payments')
                .select(`
                    *,
                    student:students (id, name, email, avatar_url)
                `)
                .eq('professional_id', professional.id)
                .order('due_date', { ascending: false });

            if (error) handleSupabaseError(error);
            return data || [];
        },
        enabled: !!professional?.id,
    });
}

// Get payments by status
export function usePaymentsByStatus(status: 'pending' | 'paid' | 'overdue' | 'cancelled') {
    const { professional } = useAuth();

    return useQuery({
        queryKey: ['payments', 'status', status],
        queryFn: async (): Promise<Payment[]> => {
            if (!professional?.id) return [];

            const { data, error } = await supabase
                .from('payments')
                .select('*')
                .eq('professional_id', professional.id)
                .eq('status', status)
                .order('due_date');

            if (error) handleSupabaseError(error);
            return data || [];
        },
        enabled: !!professional?.id,
    });
}

// Get payment stats
export function usePaymentStats() {
    const { data: payments } = usePayments();

    const stats = {
        totalReceived: 0,
        totalPending: 0,
        totalOverdue: 0,
        pendingCount: 0,
        overdueCount: 0,
        paidThisMonth: 0,
    };

    if (payments) {
        const now = new Date();
        const thisMonth = now.toISOString().slice(0, 7); // YYYY-MM

        payments.forEach((payment) => {
            const amount = Number(payment.amount) || 0;

            if (payment.status === 'paid') {
                stats.totalReceived += amount;
                if (payment.paid_at?.startsWith(thisMonth)) {
                    stats.paidThisMonth += amount;
                }
            } else if (payment.status === 'pending') {
                stats.totalPending += amount;
                stats.pendingCount++;
            } else if (payment.status === 'overdue') {
                stats.totalOverdue += amount;
                stats.overdueCount++;
            }
        });
    }

    return stats;
}

// Create a new payment
export function useCreatePayment() {
    const queryClient = useQueryClient();
    const { professional } = useAuth();

    return useMutation({
        mutationFn: async (payment: Omit<PaymentInsert, 'professional_id'>) => {
            if (!professional?.id) throw new Error('Not authenticated');

            const { data, error } = await supabase
                .from('payments')
                // @ts-ignore
                .insert({
                    ...payment,
                    professional_id: professional.id,
                })
                .select()
                .single();

            if (error) handleSupabaseError(error);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PAYMENTS_QUERY_KEY });
        },
    });
}

// Update a payment
export function useUpdatePayment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: PaymentUpdate }) => {
            const { data, error } = await supabase
                .from('payments')
                // @ts-ignore
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) handleSupabaseError(error);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PAYMENTS_QUERY_KEY });
        },
    });
}

// Mark payment as paid
export function useMarkPaymentAsPaid() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { data, error } = await supabase
                .from('payments')
                // @ts-ignore
                .update({
                    status: 'paid',
                    paid_at: new Date().toISOString(),
                })
                .eq('id', id)
                .select()
                .single();

            if (error) handleSupabaseError(error);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PAYMENTS_QUERY_KEY });
        },
    });
}

// Delete a payment
export function useDeletePayment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('payments')
                // @ts-ignore
                .delete()
                .eq('id', id);

            if (error) handleSupabaseError(error);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PAYMENTS_QUERY_KEY });
        },
    });
}

// Get payments for a specific student
export function useStudentPayments(studentId: string | undefined) {
    const { professional } = useAuth();

    return useQuery({
        queryKey: ['payments', 'student', studentId],
        queryFn: async (): Promise<Payment[]> => {
            if (!professional?.id || !studentId) return [];

            const { data, error } = await supabase
                .from('payments')
                .select('*')
                .eq('professional_id', professional.id)
                .eq('student_id', studentId)
                .order('due_date', { ascending: false });

            if (error) handleSupabaseError(error);
            return data || [];
        },
        enabled: !!professional?.id && !!studentId,
    });
}
