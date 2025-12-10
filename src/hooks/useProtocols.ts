// React Query hooks for protocols data
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, handleSupabaseError } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Protocol, WorkoutDay, Exercise, Meal, Food, InsertTables, UpdateTables } from '../lib/database.types';

export type ProtocolInsert = InsertTables<'protocols'>;
export type ProtocolUpdate = UpdateTables<'protocols'>;

// Full protocol with nested data
export interface ProtocolFull extends Protocol {
    workout_days?: (WorkoutDay & { exercises: Exercise[] })[];
    meals?: (Meal & { foods: Food[] })[];
}

// Query Keys
export const PROTOCOLS_QUERY_KEY = ['protocols'];

// Get all protocols for current professional
export function useProtocols() {
    const { professional } = useAuth();

    return useQuery({
        queryKey: PROTOCOLS_QUERY_KEY,
        queryFn: async (): Promise<Protocol[]> => {
            if (!professional?.id) return [];

            const { data, error } = await supabase
                .from('protocols')
                .select('*')
                .eq('professional_id', professional.id)
                .order('updated_at', { ascending: false });

            if (error) handleSupabaseError(error);
            return data || [];
        },
        enabled: !!professional?.id,
    });
}

// Get protocols by type
export function useProtocolsByType(type: 'workout' | 'diet' | 'combo') {
    const { professional } = useAuth();

    return useQuery({
        queryKey: ['protocols', 'type', type],
        queryFn: async (): Promise<Protocol[]> => {
            if (!professional?.id) return [];

            const { data, error } = await supabase
                .from('protocols')
                .select('*')
                .eq('professional_id', professional.id)
                .eq('type', type)
                .order('name');

            if (error) handleSupabaseError(error);
            return data || [];
        },
        enabled: !!professional?.id,
    });
}

// Get a full protocol with nested workout days, exercises, meals, foods
export function useProtocolFull(id: string | undefined) {
    return useQuery({
        queryKey: ['protocol', id],
        queryFn: async (): Promise<ProtocolFull | null> => {
            if (!id) return null;

            // Get protocol
            const { data: protocol, error: protocolError } = await supabase
                .from('protocols')
                .select('*')
                .eq('id', id)
                .single();

            if (protocolError) {
                if (protocolError.code === 'PGRST116') return null;
                handleSupabaseError(protocolError);
            }

            // Get workout days with exercises
            const { data: workoutDays, error: wdError } = await supabase
                .from('workout_days')
                .select(`*, exercises (*)`)
                .eq('protocol_id', id)
                .order('order_index');

            if (wdError) handleSupabaseError(wdError);

            // Get meals with foods
            const { data: meals, error: mealsError } = await supabase
                .from('meals')
                .select(`*, foods (*)`)
                .eq('protocol_id', id)
                .order('order_index');

            if (mealsError) handleSupabaseError(mealsError);

            return {
                // @ts-ignore
                ...protocol,
                workout_days: workoutDays || [],
                meals: meals || []
            };
        },
        enabled: !!id,
    });
}

// Create a new protocol
export function useCreateProtocol() {
    const queryClient = useQueryClient();
    const { professional } = useAuth();

    return useMutation({
        mutationFn: async (protocol: Omit<ProtocolInsert, 'professional_id'>) => {
            if (!professional?.id) throw new Error('Not authenticated');

            const { data, error } = await supabase
                .from('protocols')
                // @ts-ignore
                .insert({
                    ...protocol,
                    professional_id: professional.id,
                })
                .select()
                .single();

            if (error) handleSupabaseError(error);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PROTOCOLS_QUERY_KEY });
        },
    });
}

// Update a protocol
export function useUpdateProtocol() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: ProtocolUpdate }) => {
            const { data, error } = await supabase
                .from('protocols')
                // @ts-ignore
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) handleSupabaseError(error);
            return data;
        },
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: PROTOCOLS_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: ['protocol', data.id] });
        },
    });
}

// Delete a protocol
export function useDeleteProtocol() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('protocols')
                // @ts-ignore
                .delete()
                .eq('id', id);

            if (error) handleSupabaseError(error);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PROTOCOLS_QUERY_KEY });
        },
    });
}

// ==================== WORKOUT DAYS ====================

export function useAddWorkoutDay() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: InsertTables<'workout_days'>) => {
            const { data: day, error } = await supabase
                .from('workout_days')
                // @ts-ignore
                .insert(data)
                .select()
                .single();

            if (error) handleSupabaseError(error);
            return day;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['protocol', variables.protocol_id] });
        },
    });
}

export function useUpdateWorkoutDay() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, updates, protocolId }: { id: string; updates: Partial<WorkoutDay>; protocolId: string }) => {
            const { data, error } = await supabase
                .from('workout_days')
                // @ts-ignore
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) handleSupabaseError(error);
            return { data, protocolId };
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['protocol', result.protocolId] });
        },
    });
}

export function useDeleteWorkoutDay() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, protocolId }: { id: string; protocolId: string }) => {
            const { error } = await supabase
                .from('workout_days')
                // @ts-ignore
                .delete()
                .eq('id', id);

            if (error) handleSupabaseError(error);
            return { protocolId };
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['protocol', result.protocolId] });
        },
    });
}

// ==================== EXERCISES ====================

export function useAddExercise() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ exercise, protocolId }: { exercise: InsertTables<'exercises'>; protocolId: string }) => {
            const { data, error } = await supabase
                .from('exercises')
                // @ts-ignore
                .insert(exercise)
                .select()
                .single();

            if (error) handleSupabaseError(error);
            return { data, protocolId };
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['protocol', result.protocolId] });
        },
    });
}

export function useUpdateExercise() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, updates, protocolId }: { id: string; updates: Partial<Exercise>; protocolId: string }) => {
            const { data, error } = await supabase
                .from('exercises')
                // @ts-ignore
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) handleSupabaseError(error);
            return { data, protocolId };
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['protocol', result.protocolId] });
        },
    });
}

export function useDeleteExercise() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, protocolId }: { id: string; protocolId: string }) => {
            const { error } = await supabase
                .from('exercises')
                // @ts-ignore
                .delete()
                .eq('id', id);

            if (error) handleSupabaseError(error);
            return { protocolId };
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['protocol', result.protocolId] });
        },
    });
}

// ==================== MEALS ====================

export function useAddMeal() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: InsertTables<'meals'>) => {
            const { data: meal, error } = await supabase
                .from('meals')
                // @ts-ignore
                .insert(data)
                .select()
                .single();

            if (error) handleSupabaseError(error);
            return meal;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['protocol', variables.protocol_id] });
        },
    });
}

export function useUpdateMeal() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, updates, protocolId }: { id: string; updates: Partial<Meal>; protocolId: string }) => {
            const { data, error } = await supabase
                .from('meals')
                // @ts-ignore
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) handleSupabaseError(error);
            return { data, protocolId };
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['protocol', result.protocolId] });
        },
    });
}

export function useDeleteMeal() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, protocolId }: { id: string; protocolId: string }) => {
            const { error } = await supabase
                .from('meals')
                // @ts-ignore
                .delete()
                .eq('id', id);

            if (error) handleSupabaseError(error);
            return { protocolId };
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['protocol', result.protocolId] });
        },
    });
}

// ==================== FOODS ====================

export function useAddFood() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ food, protocolId }: { food: InsertTables<'foods'>; protocolId: string }) => {
            const { data, error } = await supabase
                .from('foods')
                // @ts-ignore
                .insert(food)
                .select()
                .single();

            if (error) handleSupabaseError(error);
            return { data, protocolId };
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['protocol', result.protocolId] });
        },
    });
}

export function useUpdateFood() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, updates, protocolId }: { id: string; updates: Partial<Food>; protocolId: string }) => {
            const { data, error } = await supabase
                .from('foods')
                // @ts-ignore
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) handleSupabaseError(error);
            return { data, protocolId };
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['protocol', result.protocolId] });
        },
    });
}

export function useDeleteFood() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, protocolId }: { id: string; protocolId: string }) => {
            const { error } = await supabase
                .from('foods')
                // @ts-ignore
                .delete()
                .eq('id', id);

            if (error) handleSupabaseError(error);
            return { protocolId };
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['protocol', result.protocolId] });
        },
    });
}

// ==================== ASSIGN TO STUDENT ====================

export function useAssignProtocolToStudent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ protocolId, studentId, expiresAt }: { protocolId: string; studentId: string; expiresAt?: string }) => {
            const { error } = await supabase
                .from('student_protocols')
                // @ts-ignore
                .upsert({
                    protocol_id: protocolId,
                    student_id: studentId,
                    expires_at: expiresAt || null,
                    is_active: true
                });

            if (error) handleSupabaseError(error);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['student_protocols'] });
        },
    });
}

// Get protocols assigned to a student
export function useStudentProtocols(studentId: string | undefined) {
    return useQuery({
        queryKey: ['student_protocols', studentId],
        queryFn: async (): Promise<Protocol[]> => {
            if (!studentId) return [];

            const { data, error } = await supabase
                .from('student_protocols')
                .select(`protocol:protocols (*)`)
                .eq('student_id', studentId)
                .eq('is_active', true);

            if (error) handleSupabaseError(error);

            // Extract protocols from nested structure
            // @ts-ignore
            return data?.map(d => d.protocol as unknown as Protocol).filter(Boolean) || [];
        },
        enabled: !!studentId,
    });
}
