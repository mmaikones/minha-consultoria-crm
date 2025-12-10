-- =============================================
-- FIT360 CRM - ADDITIONAL TABLES & RLS
-- Migration 002 - Execute in Supabase SQL Editor
-- =============================================

-- Enable UUID extension (if not exists)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ADDITIONAL TABLES (if not exist)
-- =============================================

-- PLANS (Subscription Plans)
CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration_days INTEGER NOT NULL DEFAULT 30,
    features TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    stripe_price_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_plans_professional ON plans(professional_id);

-- DIETS (Diet Templates)
CREATE TABLE IF NOT EXISTS diets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    total_calories INTEGER,
    meals_data JSONB DEFAULT '[]'::jsonb,
    is_template BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_diets_professional ON diets(professional_id);

-- EXERCISE LIBRARY (Exercise Database)
CREATE TABLE IF NOT EXISTS exercise_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    muscle_group TEXT NOT NULL,
    equipment TEXT,
    difficulty TEXT DEFAULT 'intermediate',
    video_url TEXT,
    instructions TEXT,
    is_global BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_exercise_library_professional ON exercise_library(professional_id);

-- FOOD LIBRARY (Food Database)
CREATE TABLE IF NOT EXISTS food_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT,
    portion_size DECIMAL(8,2) DEFAULT 100,
    portion_unit TEXT DEFAULT 'g',
    protein DECIMAL(6,2) DEFAULT 0,
    carbs DECIMAL(6,2) DEFAULT 0,
    fat DECIMAL(6,2) DEFAULT 0,
    fiber DECIMAL(6,2) DEFAULT 0,
    calories INTEGER DEFAULT 0,
    is_global BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_food_library_professional ON food_library(professional_id);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    read BOOLEAN DEFAULT FALSE,
    data JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_notifications_professional ON notifications(professional_id);
CREATE INDEX IF NOT EXISTS idx_notifications_student ON notifications(student_id);

-- STUDENT ACTIVITIES (Check-ins, Workouts, etc)
CREATE TABLE IF NOT EXISTS student_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    points_earned INTEGER DEFAULT 0,
    data JSONB DEFAULT '{}'::jsonb,
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_student_activities_student ON student_activities(student_id);

-- COLUMNS (Kanban Columns for CRM)
CREATE TABLE IF NOT EXISTS columns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#3B82F6',
    order_index INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_columns_professional ON columns(professional_id);

-- =============================================
-- ENABLE RLS ON NEW TABLES
-- =============================================
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE diets ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES (Drop if exist, then create)
-- =============================================

-- Plans
DROP POLICY IF EXISTS "plans_all" ON plans;
CREATE POLICY "plans_all" ON plans FOR ALL USING (professional_id = get_my_professional_id());

-- Diets
DROP POLICY IF EXISTS "diets_all" ON diets;
CREATE POLICY "diets_all" ON diets FOR ALL USING (professional_id = get_my_professional_id());

-- Exercise Library (own + global)
DROP POLICY IF EXISTS "exercise_library_select" ON exercise_library;
DROP POLICY IF EXISTS "exercise_library_insert" ON exercise_library;
DROP POLICY IF EXISTS "exercise_library_update" ON exercise_library;
DROP POLICY IF EXISTS "exercise_library_delete" ON exercise_library;

CREATE POLICY "exercise_library_select" ON exercise_library FOR SELECT USING (
    is_global = TRUE OR professional_id = get_my_professional_id()
);
CREATE POLICY "exercise_library_insert" ON exercise_library FOR INSERT WITH CHECK (
    professional_id = get_my_professional_id()
);
CREATE POLICY "exercise_library_update" ON exercise_library FOR UPDATE USING (
    professional_id = get_my_professional_id()
);
CREATE POLICY "exercise_library_delete" ON exercise_library FOR DELETE USING (
    professional_id = get_my_professional_id()
);

-- Food Library (own + global)
DROP POLICY IF EXISTS "food_library_select" ON food_library;
DROP POLICY IF EXISTS "food_library_insert" ON food_library;
DROP POLICY IF EXISTS "food_library_update" ON food_library;
DROP POLICY IF EXISTS "food_library_delete" ON food_library;

CREATE POLICY "food_library_select" ON food_library FOR SELECT USING (
    is_global = TRUE OR professional_id = get_my_professional_id()
);
CREATE POLICY "food_library_insert" ON food_library FOR INSERT WITH CHECK (
    professional_id = get_my_professional_id()
);
CREATE POLICY "food_library_update" ON food_library FOR UPDATE USING (
    professional_id = get_my_professional_id()
);
CREATE POLICY "food_library_delete" ON food_library FOR DELETE USING (
    professional_id = get_my_professional_id()
);

-- Notifications
DROP POLICY IF EXISTS "notifications_all" ON notifications;
CREATE POLICY "notifications_all" ON notifications FOR ALL USING (
    professional_id = get_my_professional_id() OR
    student_id IN (SELECT id FROM students WHERE professional_id = get_my_professional_id())
);

-- Student Activities
DROP POLICY IF EXISTS "student_activities_all" ON student_activities;
CREATE POLICY "student_activities_all" ON student_activities FOR ALL USING (
    student_id IN (SELECT id FROM students WHERE professional_id = get_my_professional_id())
);

-- Columns
DROP POLICY IF EXISTS "columns_all" ON columns;
CREATE POLICY "columns_all" ON columns FOR ALL USING (professional_id = get_my_professional_id());

-- =============================================
-- GRANT EXECUTE ON FUNCTION (Fix RLS)
-- =============================================
GRANT EXECUTE ON FUNCTION public.get_my_professional_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_professional_id() TO anon;

-- =============================================
-- VERIFY TRIGGER EXISTS
-- =============================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
    ) THEN
        RAISE NOTICE 'Creating trigger on_auth_user_created...';
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    ELSE
        RAISE NOTICE 'Trigger on_auth_user_created already exists';
    END IF;
END $$;

-- =============================================
-- SUCCESS!
-- =============================================
SELECT 'SUCCESS: Additional tables and RLS policies created!' as message;
