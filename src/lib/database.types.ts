// Database types for Supabase
// These types define the structure of all tables
// Updated to include user_id in professionals and match Migration 005

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            professionals: {
                Row: {
                    id: string
                    user_id: string | null
                    created_at: string
                    updated_at: string
                    email: string
                    name: string
                    phone: string | null
                    avatar_url: string | null
                    specialty: string | null
                    cref: string | null
                    crn: string | null
                    bio: string | null
                    settings: Json | null
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    created_at?: string
                    updated_at?: string
                    email: string
                    name: string
                    phone?: string | null
                    avatar_url?: string | null
                    specialty?: string | null
                    cref?: string | null
                    crn?: string | null
                    bio?: string | null
                    settings?: Json | null
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    created_at?: string
                    updated_at?: string
                    email?: string
                    name?: string
                    phone?: string | null
                    avatar_url?: string | null
                    specialty?: string | null
                    cref?: string | null
                    crn?: string | null
                    bio?: string | null
                    settings?: Json | null
                }
            }
            students: {
                Row: {
                    id: string
                    created_at: string
                    updated_at: string
                    professional_id: string
                    email: string
                    name: string
                    phone: string | null
                    avatar_url: string | null
                    birth_date: string | null
                    gender: string | null
                    height: number | null
                    weight: number | null
                    goal: string | null
                    status: 'active' | 'inactive' | 'pending'
                    plan_type: string | null
                    plan_start: string | null
                    plan_end: string | null
                    notes: string | null
                    health_conditions: string[] | null
                    injuries: string[] | null
                    medications: string[] | null
                    activity_level: string | null
                    points: number
                    streak_days: number
                    custom_data: Json | null
                    cpf: string | null
                    sales_origin_id: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    professional_id: string
                    email: string
                    name: string
                    phone?: string | null
                    avatar_url?: string | null
                    birth_date?: string | null
                    gender?: string | null
                    height?: number | null
                    weight?: number | null
                    goal?: string | null
                    status?: 'active' | 'inactive' | 'pending'
                    plan_type?: string | null
                    plan_start?: string | null
                    plan_end?: string | null
                    notes?: string | null
                    health_conditions?: string[] | null
                    injuries?: string[] | null
                    medications?: string[] | null
                    activity_level?: string | null
                    points?: number
                    streak_days?: number
                    custom_data?: Json | null
                    cpf?: string | null
                    sales_origin_id?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    professional_id?: string
                    email?: string
                    name?: string
                    phone?: string | null
                    avatar_url?: string | null
                    birth_date?: string | null
                    gender?: string | null
                    height?: number | null
                    weight?: number | null
                    goal?: string | null
                    status?: 'active' | 'inactive' | 'pending'
                    plan_type?: string | null
                    plan_start?: string | null
                    plan_end?: string | null
                    notes?: string | null
                    health_conditions?: string[] | null
                    injuries?: string[] | null
                    medications?: string[] | null
                    activity_level?: string | null
                    points?: number
                    streak_days?: number
                    custom_data?: Json | null
                    cpf?: string | null
                    sales_origin_id?: string | null
                }
            }
            protocols: {
                Row: {
                    id: string
                    created_at: string
                    updated_at: string
                    professional_id: string
                    name: string
                    type: 'workout' | 'diet' | 'combo'
                    status: 'draft' | 'pending_review' | 'active'
                    description: string | null
                    ai_generated: boolean
                    content: Json | null
                    is_template: boolean
                }
                Insert: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    professional_id: string
                    name: string
                    type: 'workout' | 'diet' | 'combo'
                    status?: 'draft' | 'pending_review' | 'active'
                    description?: string | null
                    ai_generated?: boolean
                    content?: Json | null
                    is_template?: boolean
                }
                Update: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    professional_id?: string
                    name?: string
                    type?: 'workout' | 'diet' | 'combo'
                    status?: 'draft' | 'pending_review' | 'active'
                    description?: string | null
                    ai_generated?: boolean
                    content?: Json | null
                    is_template?: boolean
                }
            }
            workout_days: {
                Row: {
                    id: string
                    created_at: string
                    protocol_id: string
                    name: string
                    order_index: number
                }
                Insert: {
                    id?: string
                    created_at?: string
                    protocol_id: string
                    name: string
                    order_index?: number
                }
                Update: {
                    id?: string
                    created_at?: string
                    protocol_id?: string
                    name?: string
                    order_index?: number
                }
            }
            exercises: {
                Row: {
                    id: string
                    created_at: string
                    workout_day_id: string
                    name: string
                    sets: number
                    reps: string
                    load: string | null
                    rest_seconds: number
                    notes: string | null
                    order_index: number
                }
                Insert: {
                    id?: string
                    created_at?: string
                    workout_day_id: string
                    name: string
                    sets?: number
                    reps?: string
                    load?: string | null
                    rest_seconds?: number
                    notes?: string | null
                    order_index?: number
                }
                Update: {
                    id?: string
                    created_at?: string
                    workout_day_id?: string
                    name?: string
                    sets?: number
                    reps?: string
                    load?: string | null
                    rest_seconds?: number
                    notes?: string | null
                    order_index?: number
                }
            }
            meals: {
                Row: {
                    id: string
                    created_at: string
                    protocol_id: string
                    name: string
                    time: string | null
                    order_index: number
                }
                Insert: {
                    id?: string
                    created_at?: string
                    protocol_id: string
                    name: string
                    time?: string | null
                    order_index?: number
                }
                Update: {
                    id?: string
                    created_at?: string
                    protocol_id?: string
                    name?: string
                    time?: string | null
                    order_index?: number
                }
            }
            foods: {
                Row: {
                    id: string
                    created_at: string
                    meal_id: string
                    name: string
                    quantity: number
                    measure: string
                    protein: number
                    carbs: number
                    fat: number
                    calories: number
                    order_index: number
                }
                Insert: {
                    id?: string
                    created_at?: string
                    meal_id: string
                    name: string
                    quantity?: number
                    measure?: string
                    protein?: number
                    carbs?: number
                    fat?: number
                    calories?: number
                    order_index?: number
                }
                Update: {
                    id?: string
                    created_at?: string
                    meal_id?: string
                    name?: string
                    quantity?: number
                    measure?: string
                    protein?: number
                    carbs?: number
                    fat?: number
                    calories?: number
                    order_index?: number
                }
            }
            student_protocols: {
                Row: {
                    id: string
                    created_at: string
                    student_id: string
                    protocol_id: string
                    assigned_at: string
                    expires_at: string | null
                    is_active: boolean
                }
                Insert: {
                    id?: string
                    created_at?: string
                    student_id: string
                    protocol_id: string
                    assigned_at?: string
                    expires_at?: string | null
                    is_active?: boolean
                }
                Update: {
                    id?: string
                    created_at?: string
                    student_id?: string
                    protocol_id?: string
                    assigned_at?: string
                    expires_at?: string | null
                    is_active?: boolean
                }
            }
            payments: {
                Row: {
                    id: string
                    created_at: string
                    professional_id: string
                    student_id: string
                    amount: number
                    status: 'pending' | 'paid' | 'overdue' | 'cancelled'
                    due_date: string
                    paid_at: string | null
                    payment_method: string | null
                    description: string | null
                    stripe_payment_id: string | null
                    sales_id: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    professional_id: string
                    student_id: string
                    amount: number
                    status?: 'pending' | 'paid' | 'overdue' | 'cancelled'
                    due_date: string
                    paid_at?: string | null
                    payment_method?: string | null
                    description?: string | null
                    stripe_payment_id?: string | null
                    sales_id?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    professional_id?: string
                    student_id?: string
                    amount?: number
                    status?: 'pending' | 'paid' | 'overdue' | 'cancelled'
                    due_date?: string
                    paid_at?: string | null
                    payment_method?: string | null
                    description?: string | null
                    stripe_payment_id?: string | null
                    sales_id?: string | null
                }
            }
            anamnesis: {
                Row: {
                    id: string
                    created_at: string
                    professional_id: string
                    student_id: string | null
                    data: Json
                    processed: boolean
                }
                Insert: {
                    id?: string
                    created_at?: string
                    professional_id: string
                    student_id?: string | null
                    data: Json
                    processed?: boolean
                }
                Update: {
                    id?: string
                    created_at?: string
                    professional_id?: string
                    student_id?: string | null
                    data?: Json
                    processed?: boolean
                }
            }
            plans: {
                Row: {
                    id: string
                    created_at: string
                    updated_at: string
                    professional_id: string
                    name: string
                    description: string | null
                    price: number
                    duration_days: number
                    type: 'mensal' | 'trimestral' | 'semestral' | 'anual'
                    features: string[] | Json
                    icon: string | null
                    status: boolean
                    sort_order: number
                    stripe_product_id: string | null
                    stripe_price_id: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    professional_id: string
                    name: string
                    description?: string | null
                    price: number
                    duration_days?: number
                    type?: 'mensal' | 'trimestral' | 'semestral' | 'anual'
                    features?: string[] | Json
                    icon?: string | null
                    status?: boolean
                    sort_order?: number
                    stripe_product_id?: string | null
                    stripe_price_id?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    professional_id?: string
                    name?: string
                    description?: string | null
                    price?: number
                    duration_days?: number
                    type?: 'mensal' | 'trimestral' | 'semestral' | 'anual'
                    features?: string[] | Json
                    icon?: string | null
                    status?: boolean
                    sort_order?: number
                    stripe_product_id?: string | null
                    stripe_price_id?: string | null
                }
            }
            sales: {
                Row: {
                    id: string
                    created_at: string
                    updated_at: string
                    professional_id: string
                    plan_id: string | null
                    phone: string | null
                    email: string | null
                    status: 'pending' | 'payment_processing' | 'payment_confirmed' | 'anamnese_sent' | 'anamnese_pending' | 'student_created' | 'failed' | 'refunded'
                    stripe_payment_id: string | null
                    stripe_session_id: string | null
                    student_id: string | null
                    error_message: string | null
                    amount: number | null
                    currency: string | null
                    metadata: Json | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    professional_id: string
                    plan_id?: string | null
                    phone?: string | null
                    email?: string | null
                    status?: 'pending' | 'payment_processing' | 'payment_confirmed' | 'anamnese_sent' | 'anamnese_pending' | 'student_created' | 'failed' | 'refunded'
                    stripe_payment_id?: string | null
                    stripe_session_id?: string | null
                    student_id?: string | null
                    error_message?: string | null
                    amount?: number | null
                    currency?: string | null
                    metadata?: Json | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    professional_id?: string
                    plan_id?: string | null
                    phone?: string | null
                    email?: string | null
                    status?: 'pending' | 'payment_processing' | 'payment_confirmed' | 'anamnese_sent' | 'anamnese_pending' | 'student_created' | 'failed' | 'refunded'
                    stripe_payment_id?: string | null
                    stripe_session_id?: string | null
                    student_id?: string | null
                    error_message?: string | null
                    amount?: number | null
                    currency?: string | null
                    metadata?: Json | null
                }
            }
            anamnese_forms: {
                Row: {
                    id: string
                    created_at: string
                    updated_at: string
                    sales_id: string
                    professional_id: string
                    phone: string
                    status: 'pending' | 'completed' | 'expired'
                    form_link_token: string
                    expires_at: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    sales_id: string
                    professional_id: string
                    phone: string
                    status?: 'pending' | 'completed' | 'expired'
                    form_link_token?: string
                    expires_at?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    sales_id?: string
                    professional_id?: string
                    phone?: string
                    status?: 'pending' | 'completed' | 'expired'
                    form_link_token?: string
                    expires_at?: string | null
                }
            }
            anamnese_responses: {
                Row: {
                    id: string
                    submitted_at: string
                    anamnese_form_id: string
                    name: string
                    email: string
                    phone: string
                    cpf: string | null
                    birth_date: string | null
                    gender: string | null
                    weight: number | null
                    height: number | null
                    health_conditions: string[] | null
                    injuries: string | null
                    medications: string | null
                    goal: string | null
                    activity_preferences: string[] | null
                    frequency_preference: string | null
                    additional_notes: string | null
                    photos_urls: string[] | null
                }
                Insert: {
                    id?: string
                    submitted_at?: string
                    anamnese_form_id: string
                    name: string
                    email: string
                    phone: string
                    cpf?: string | null
                    birth_date?: string | null
                    gender?: string | null
                    weight?: number | null
                    height?: number | null
                    health_conditions?: string[] | null
                    injuries?: string | null
                    medications?: string | null
                    goal?: string | null
                    activity_preferences?: string[] | null
                    frequency_preference?: string | null
                    additional_notes?: string | null
                    photos_urls?: string[] | null
                }
                Update: {
                    id?: string
                    submitted_at?: string
                    anamnese_form_id?: string
                    name?: string
                    email?: string
                    phone?: string
                    cpf?: string | null
                    birth_date?: string | null
                    gender?: string | null
                    weight?: number | null
                    height?: number | null
                    health_conditions?: string[] | null
                    injuries?: string | null
                    medications?: string | null
                    goal?: string | null
                    activity_preferences?: string[] | null
                    frequency_preference?: string | null
                    additional_notes?: string | null
                    photos_urls?: string[] | null
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            student_status: 'active' | 'inactive' | 'pending'
            protocol_type: 'workout' | 'diet' | 'combo'
            protocol_status: 'draft' | 'pending_review' | 'active'
            payment_status: 'pending' | 'paid' | 'overdue' | 'cancelled'
        }
    }
}

// Utility types for easier usage
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Commonly used types
export type Professional = Tables<'professionals'>
export type Student = Tables<'students'>
export type Protocol = Tables<'protocols'>
export type WorkoutDay = Tables<'workout_days'>
export type Exercise = Tables<'exercises'>
export type Meal = Tables<'meals'>
export type Food = Tables<'foods'>
export type StudentProtocol = Tables<'student_protocols'>
export type Payment = Tables<'payments'>
export type Anamnesis = Tables<'anamnesis'>
export type Plan = Tables<'plans'>
export type Sale = Tables<'sales'>
export type AnamneseForm = Tables<'anamnese_forms'>
export type AnamneseResponse = Tables<'anamnese_responses'>
