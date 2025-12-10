// Protocols Service - CRUD operations for protocols
import { supabase } from './supabase';
import type { Protocol, WorkoutDay, Exercise, Meal, Food, InsertTables, UpdateTables } from './database.types';

export type ProtocolInsert = InsertTables<'protocols'>;
export type ProtocolUpdate = UpdateTables<'protocols'>;
export type WorkoutDayInsert = InsertTables<'workout_days'>;
export type ExerciseInsert = InsertTables<'exercises'>;
export type MealInsert = InsertTables<'meals'>;
export type FoodInsert = InsertTables<'foods'>;

// Full protocol with nested data
export interface ProtocolFull extends Protocol {
    workout_days?: (WorkoutDay & { exercises: Exercise[] })[];
    meals?: (Meal & { foods: Food[] })[];
}

export const protocolsService = {
    // Get all protocols for current professional
    async getAll(): Promise<Protocol[]> {
        const { data, error } = await supabase
            .from('protocols')
            .select('*')
            .order('updated_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    // Get protocols by type
    async getByType(type: 'workout' | 'diet' | 'combo'): Promise<Protocol[]> {
        const { data, error } = await supabase
            .from('protocols')
            .select('*')
            .eq('type', type)
            .order('name');

        if (error) throw error;
        return data || [];
    },

    // Get a full protocol with all nested data
    async getFullById(id: string): Promise<ProtocolFull | null> {
        const { data: protocol, error: protocolError } = await supabase
            .from('protocols')
            .select('*')
            .eq('id', id)
            .single();

        if (protocolError) {
            if (protocolError.code === 'PGRST116') return null;
            throw protocolError;
        }

        // Get workout days with exercises
        const { data: workoutDays, error: wdError } = await supabase
            .from('workout_days')
            .select(`
                *,
                exercises (*)
            `)
            .eq('protocol_id', id)
            .order('order_index');

        if (wdError) throw wdError;

        // Get meals with foods
        const { data: meals, error: mealsError } = await supabase
            .from('meals')
            .select(`
                *,
                foods (*)
            `)
            .eq('protocol_id', id)
            .order('order_index');

        if (mealsError) throw mealsError;

        return {
            // @ts-ignore
            ...protocol,
            workout_days: workoutDays || [],
            meals: meals || []
        };
    },

    // Create a new protocol
    async create(protocol: ProtocolInsert): Promise<Protocol> {
        const { data, error } = await supabase
            .from('protocols')
            // @ts-ignore
            .insert(protocol)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Update a protocol
    async update(id: string, updates: ProtocolUpdate): Promise<Protocol> {
        const { data, error } = await supabase
            .from('protocols')
            // @ts-ignore
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Delete a protocol
    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('protocols')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // Workout Day operations
    async addWorkoutDay(data: WorkoutDayInsert): Promise<WorkoutDay> {
        const { data: day, error } = await supabase
            .from('workout_days')
            // @ts-ignore
            .insert(data)
            .select()
            .single();

        if (error) throw error;
        return day;
    },

    async updateWorkoutDay(id: string, updates: Partial<WorkoutDay>): Promise<WorkoutDay> {
        const { data, error } = await supabase
            .from('workout_days')
            // @ts-ignore
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteWorkoutDay(id: string): Promise<void> {
        const { error } = await supabase
            .from('workout_days')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // Exercise operations
    async addExercise(data: ExerciseInsert): Promise<Exercise> {
        const { data: exercise, error } = await supabase
            .from('exercises')
            // @ts-ignore
            .insert(data)
            .select()
            .single();

        if (error) throw error;
        return exercise;
    },

    async updateExercise(id: string, updates: Partial<Exercise>): Promise<Exercise> {
        const { data, error } = await supabase
            .from('exercises')
            // @ts-ignore
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteExercise(id: string): Promise<void> {
        const { error } = await supabase
            .from('exercises')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // Meal operations
    async addMeal(data: MealInsert): Promise<Meal> {
        const { data: meal, error } = await supabase
            .from('meals')
            // @ts-ignore
            .insert(data)
            .select()
            .single();

        if (error) throw error;
        return meal;
    },

    async updateMeal(id: string, updates: Partial<Meal>): Promise<Meal> {
        const { data, error } = await supabase
            .from('meals')
            // @ts-ignore
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteMeal(id: string): Promise<void> {
        const { error } = await supabase
            .from('meals')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // Food operations
    async addFood(data: FoodInsert): Promise<Food> {
        const { data: food, error } = await supabase
            .from('foods')
            // @ts-ignore
            .insert(data)
            .select()
            .single();

        if (error) throw error;
        return food;
    },

    async updateFood(id: string, updates: Partial<Food>): Promise<Food> {
        const { data, error } = await supabase
            .from('foods')
            // @ts-ignore
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteFood(id: string): Promise<void> {
        const { error } = await supabase
            .from('foods')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // Assign protocol to student
    async assignToStudent(protocolId: string, studentId: string, expiresAt?: string): Promise<void> {
        const { error } = await supabase
            .from('student_protocols')
            // @ts-ignore
            .upsert({
                protocol_id: protocolId,
                student_id: studentId,
                expires_at: expiresAt,
                is_active: true
            });

        if (error) throw error;
    },

    // Get protocols assigned to a student
    async getStudentProtocols(studentId: string): Promise<Protocol[]> {
        const { data, error } = await supabase
            .from('student_protocols')
            .select(`
                protocol:protocols (*)
            `)
            .eq('student_id', studentId)
            .eq('is_active', true);

        if (error) throw error;
        // @ts-ignore
        return data?.map(d => d.protocol as unknown as Protocol) || [];
    }
};
