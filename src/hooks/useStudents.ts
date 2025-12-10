// React Query hooks for students data
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, handleSupabaseError } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Student, InsertTables, UpdateTables } from '../lib/database.types';

export type StudentInsert = InsertTables<'students'>;
export type StudentUpdate = UpdateTables<'students'>;

// Keys for React Query
export const STUDENTS_QUERY_KEY = ['students'];

// Get all students for current professional
export function useStudents() {
    const { professional } = useAuth();

    return useQuery({
        queryKey: STUDENTS_QUERY_KEY,
        queryFn: async (): Promise<Student[]> => {
            if (!professional?.id) return [];

            const { data, error } = await supabase
                .from('students')
                .select('*')
                .eq('professional_id', professional.id)
                .order('name');

            if (error) handleSupabaseError(error);
            return data || [];
        },
        enabled: !!professional?.id,
    });
}

// Get a single student by ID
export function useStudent(id: string | undefined) {
    return useQuery({
        queryKey: ['student', id],
        queryFn: async (): Promise<Student | null> => {
            if (!id) return null;

            const { data, error } = await supabase
                .from('students')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null;
                handleSupabaseError(error);
            }
            return data;
        },
        enabled: !!id,
    });
}

// Create a new student
export function useCreateStudent() {
    const queryClient = useQueryClient();
    const { professional } = useAuth();

    return useMutation({
        mutationFn: async (student: Omit<StudentInsert, 'professional_id'>) => {
            if (!professional?.id) throw new Error('Not authenticated');

            const { data, error } = await supabase
                .from('students')
                // @ts-ignore
                .insert({
                    ...student,
                    professional_id: professional.id,
                })
                .select()
                .single();

            if (error) handleSupabaseError(error);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: STUDENTS_QUERY_KEY });
        },
    });
}

// Update a student
export function useUpdateStudent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: StudentUpdate }) => {
            const { data, error } = await supabase
                .from('students')
                // @ts-ignore
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) handleSupabaseError(error);
            return data;
        },
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: STUDENTS_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: ['student', data.id] });
        },
    });
}

// Delete a student
export function useDeleteStudent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('students')
                // @ts-ignore
                .delete()
                .eq('id', id);

            if (error) handleSupabaseError(error);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: STUDENTS_QUERY_KEY });
        },
    });
}

// Search students
export function useSearchStudents(query: string) {
    const { professional } = useAuth();

    return useQuery({
        queryKey: ['students', 'search', query],
        queryFn: async (): Promise<Student[]> => {
            if (!professional?.id || !query) return [];

            const { data, error } = await supabase
                .from('students')
                .select('*')
                .eq('professional_id', professional.id)
                .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
                .order('name')
                .limit(20);

            if (error) handleSupabaseError(error);
            return data || [];
        },
        enabled: !!professional?.id && query.length > 0,
    });
}

// Get students count by plan type
export function useStudentsCounts() {
    const { data: students } = useStudents();

    const counts = {
        mensal: 0,
        trimestral: 0,
        semestral: 0,
        anual: 0,
        total: 0,
    };

    if (students) {
        students.forEach((student) => {
            const plan = student.plan_type?.toLowerCase() || '';
            if (plan.includes('mensal')) counts.mensal++;
            else if (plan.includes('trimestral')) counts.trimestral++;
            else if (plan.includes('semestral')) counts.semestral++;
            else if (plan.includes('anual')) counts.anual++;
            counts.total++;
        });
    }

    return counts;
}
