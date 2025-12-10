-- =============================================
-- FIT360 CRM - FIX SCHEMA & CONSTRAINTS
-- Migration 004 - Execute in Supabase SQL Editor
-- =============================================

-- 1. STUDENTS: Add UNIQUE constraint for professional_id + email
-- This prevents a professional from adding the same student email twice
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'students_professional_id_email_key'
    ) THEN
        ALTER TABLE students ADD CONSTRAINT students_professional_id_email_key UNIQUE (professional_id, email);
    END IF;
END $$;

-- 2. STUDENTS: Ensure custom_data exists (idempotent check)
ALTER TABLE students ADD COLUMN IF NOT EXISTS custom_data JSONB DEFAULT '{}'::jsonb;
CREATE INDEX IF NOT EXISTS idx_students_custom_data ON students USING gin(custom_data);

-- 3. PROTOCOLS: Ensure content JSONB and status columns exist
ALTER TABLE protocols ADD COLUMN IF NOT EXISTS content JSONB DEFAULT '{}'::jsonb;
ALTER TABLE protocols ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT FALSE;
-- status already exists in 001 but good to check extensions if needed

-- 4. PAYMENTS: Ensure stripe fields exist
ALTER TABLE payments ADD COLUMN IF NOT EXISTS stripe_payment_id TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
-- due_date, status, payment_method already exist in 001

-- =============================================
-- SUCCESS MESSAGE
-- =============================================
SELECT 'SUCCESS: Schema fixed with constraints and missing columns!' as message;
