-- =============================================
-- FIT360 CRM - COMPLETE SCHEMA
-- Safe script - works even on empty database
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- DROP EVERYTHING SAFELY (if exists)
-- =============================================

-- Drop trigger on auth.users first (always exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS get_my_professional_id() CASCADE;

-- Drop all tables with CASCADE (handles all dependencies)
DROP TABLE IF EXISTS anamnesis CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS student_protocols CASCADE;
DROP TABLE IF EXISTS foods CASCADE;
DROP TABLE IF EXISTS meals CASCADE;
DROP TABLE IF EXISTS exercises CASCADE;
DROP TABLE IF EXISTS workout_days CASCADE;
DROP TABLE IF EXISTS protocols CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS professionals CASCADE;

-- =============================================
-- CREATE TABLES
-- =============================================

-- PROFESSIONALS
CREATE TABLE professionals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    specialty TEXT,
    cref TEXT,
    crn TEXT,
    bio TEXT,
    settings JSONB DEFAULT '{}'::jsonb
);

-- STUDENTS
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    birth_date DATE,
    gender TEXT,
    height DECIMAL(5,2),
    weight DECIMAL(5,2),
    goal TEXT,
    status TEXT DEFAULT 'pending',
    plan_type TEXT,
    plan_start DATE,
    plan_end DATE,
    notes TEXT,
    health_conditions TEXT[],
    injuries TEXT[],
    medications TEXT[],
    activity_level TEXT,
    points INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0
);

CREATE INDEX idx_students_professional ON students(professional_id);

-- PROTOCOLS
CREATE TABLE protocols (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'draft',
    description TEXT,
    ai_generated BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_protocols_professional ON protocols(professional_id);

-- WORKOUT DAYS
CREATE TABLE workout_days (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    protocol_id UUID NOT NULL REFERENCES protocols(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    order_index INTEGER DEFAULT 0
);

CREATE INDEX idx_workout_days_protocol ON workout_days(protocol_id);

-- EXERCISES
CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    workout_day_id UUID NOT NULL REFERENCES workout_days(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sets INTEGER DEFAULT 3,
    reps TEXT DEFAULT '12',
    load TEXT,
    rest_seconds INTEGER DEFAULT 60,
    notes TEXT,
    order_index INTEGER DEFAULT 0
);

CREATE INDEX idx_exercises_workout_day ON exercises(workout_day_id);

-- MEALS
CREATE TABLE meals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    protocol_id UUID NOT NULL REFERENCES protocols(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    time TEXT,
    order_index INTEGER DEFAULT 0
);

CREATE INDEX idx_meals_protocol ON meals(protocol_id);

-- FOODS
CREATE TABLE foods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    meal_id UUID NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    quantity DECIMAL(8,2) DEFAULT 100,
    measure TEXT DEFAULT 'g',
    protein DECIMAL(6,2) DEFAULT 0,
    carbs DECIMAL(6,2) DEFAULT 0,
    fat DECIMAL(6,2) DEFAULT 0,
    calories INTEGER DEFAULT 0,
    order_index INTEGER DEFAULT 0
);

CREATE INDEX idx_foods_meal ON foods(meal_id);

-- STUDENT PROTOCOLS
CREATE TABLE student_protocols (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    protocol_id UUID NOT NULL REFERENCES protocols(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_student_protocols_student ON student_protocols(student_id);
CREATE INDEX idx_student_protocols_protocol ON student_protocols(protocol_id);

-- PAYMENTS
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending',
    due_date DATE NOT NULL,
    paid_at TIMESTAMPTZ,
    payment_method TEXT,
    description TEXT
);

CREATE INDEX idx_payments_professional ON payments(professional_id);
CREATE INDEX idx_payments_student ON payments(student_id);

-- ANAMNESIS
CREATE TABLE anamnesis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE SET NULL,
    data JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_anamnesis_professional ON anamnesis(professional_id);

-- =============================================
-- HELPER FUNCTION
-- =============================================
CREATE FUNCTION get_my_professional_id()
RETURNS UUID AS $$
    SELECT id FROM professionals WHERE user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- =============================================
-- ENABLE RLS
-- =============================================
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE anamnesis ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Professionals
CREATE POLICY "professionals_select" ON professionals FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "professionals_update" ON professionals FOR UPDATE USING (user_id = auth.uid());

-- Students
CREATE POLICY "students_select" ON students FOR SELECT USING (professional_id = get_my_professional_id());
CREATE POLICY "students_insert" ON students FOR INSERT WITH CHECK (professional_id = get_my_professional_id());
CREATE POLICY "students_update" ON students FOR UPDATE USING (professional_id = get_my_professional_id());
CREATE POLICY "students_delete" ON students FOR DELETE USING (professional_id = get_my_professional_id());

-- Protocols
CREATE POLICY "protocols_all" ON protocols FOR ALL USING (professional_id = get_my_professional_id());

-- Workout Days
CREATE POLICY "workout_days_all" ON workout_days FOR ALL USING (
    EXISTS (SELECT 1 FROM protocols WHERE protocols.id = workout_days.protocol_id AND protocols.professional_id = get_my_professional_id())
);

-- Exercises  
CREATE POLICY "exercises_all" ON exercises FOR ALL USING (
    EXISTS (
        SELECT 1 FROM workout_days wd JOIN protocols p ON wd.protocol_id = p.id
        WHERE wd.id = exercises.workout_day_id AND p.professional_id = get_my_professional_id()
    )
);

-- Meals
CREATE POLICY "meals_all" ON meals FOR ALL USING (
    EXISTS (SELECT 1 FROM protocols WHERE protocols.id = meals.protocol_id AND protocols.professional_id = get_my_professional_id())
);

-- Foods
CREATE POLICY "foods_all" ON foods FOR ALL USING (
    EXISTS (
        SELECT 1 FROM meals m JOIN protocols p ON m.protocol_id = p.id
        WHERE m.id = foods.meal_id AND p.professional_id = get_my_professional_id()
    )
);

-- Student Protocols
CREATE POLICY "student_protocols_all" ON student_protocols FOR ALL USING (
    EXISTS (SELECT 1 FROM students WHERE students.id = student_protocols.student_id AND students.professional_id = get_my_professional_id())
);

-- Payments
CREATE POLICY "payments_all" ON payments FOR ALL USING (professional_id = get_my_professional_id());

-- Anamnesis
CREATE POLICY "anamnesis_select" ON anamnesis FOR SELECT USING (professional_id = get_my_professional_id());
CREATE POLICY "anamnesis_insert" ON anamnesis FOR INSERT WITH CHECK (true);

-- =============================================
-- TRIGGERS
-- =============================================
CREATE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_professionals_updated_at BEFORE UPDATE ON professionals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_protocols_updated_at BEFORE UPDATE ON protocols FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- AUTO-CREATE PROFESSIONAL ON SIGNUP
-- =============================================
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.professionals (user_id, email, name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- SUCCESS!
-- =============================================
SELECT 'SUCCESS: Database schema created!' as message;
