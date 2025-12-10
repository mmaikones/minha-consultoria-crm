// Students Service - CRUD operations for students
import { supabase } from './supabase';
import type { Student, InsertTables, UpdateTables } from './database.types';

export type StudentInsert = InsertTables<'students'>;
export type StudentUpdate = UpdateTables<'students'>;

export const studentsService = {
    // Get all students for current professional
    async getAll(): Promise<Student[]> {
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .order('name');

        if (error) throw error;
        return data || [];
    },

    // Get a single student by ID
    async getById(id: string): Promise<Student | null> {
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw error;
        }
        return data;
    },

    // Create a new student
    async create(student: StudentInsert): Promise<Student> {
        const { data, error } = await supabase
            .from('students')
            // @ts-ignore
            .insert(student)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Update a student
    async update(id: string, updates: StudentUpdate): Promise<Student> {
        const { data, error } = await supabase
            .from('students')
            // @ts-ignore
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Delete a student
    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('students')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // Get students by status
    async getByStatus(status: 'active' | 'inactive' | 'pending'): Promise<Student[]> {
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .eq('status', status)
            .order('name');

        if (error) throw error;
        return data || [];
    },

    // Get students by plan type
    async getByPlanType(planType: string): Promise<Student[]> {
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .eq('plan_type', planType)
            .order('name');

        if (error) throw error;
        return data || [];
    },

    // Get students with expiring plans
    async getExpiringPlans(daysAhead: number = 7): Promise<Student[]> {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + daysAhead);

        const { data, error } = await supabase
            .from('students')
            .select('*')
            .lte('plan_end', futureDate.toISOString().split('T')[0])
            .gte('plan_end', new Date().toISOString().split('T')[0])
            .order('plan_end');

        if (error) throw error;
        return data || [];
    },

    // Search students by name or email
    async search(query: string): Promise<Student[]> {
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
            .order('name')
            .limit(20);

        if (error) throw error;
        return data || [];
    },

    // Update student points
    async addPoints(id: string, points: number): Promise<Student> {
        const student = await this.getById(id);
        if (!student) throw new Error('Student not found');

        return this.update(id, {
            points: (student.points || 0) + points
        });
    },

    // Update streak days
    async updateStreak(id: string, streakDays: number): Promise<Student> {
        return this.update(id, { streak_days: streakDays });
    }
};
