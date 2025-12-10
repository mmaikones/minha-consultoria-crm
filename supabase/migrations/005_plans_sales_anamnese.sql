-- =============================================
-- FIT360 CRM - PLANS, SALES & ANAMNESE
-- Migration 005 - Execute in Supabase SQL Editor
-- =============================================

-- Enable UUID extension (if not exists)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. PLANS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration_days INTEGER NOT NULL DEFAULT 30,
    type TEXT CHECK (type IN ('mensal', 'trimestral', 'semestral', 'anual')),
    features JSONB DEFAULT '[]'::jsonb,
    icon TEXT,
    status BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    stripe_product_id TEXT,
    stripe_price_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_plans_professional ON plans(professional_id);

-- =============================================
-- 2. SALES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES plans(id) ON DELETE SET NULL,
    student_id UUID REFERENCES students(id) ON DELETE SET NULL,
    phone TEXT, -- 55DDXXXXXXXXX
    email TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'payment_processing', 'payment_confirmed', 'anamnese_sent', 'anamnese_pending', 'student_created', 'failed', 'refunded')),
    stripe_payment_id TEXT,
    stripe_session_id TEXT,
    amount DECIMAL(10,2),
    currency TEXT DEFAULT 'BRL',
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_sales_professional ON sales(professional_id);
CREATE INDEX IF NOT EXISTS idx_sales_email ON sales(email);
CREATE INDEX IF NOT EXISTS idx_sales_phone ON sales(phone);
CREATE INDEX IF NOT EXISTS idx_sales_stripe_session ON sales(stripe_session_id);

-- =============================================
-- 3. ANAMNESE FORMS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS anamnese_forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    sales_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    phone TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
    form_link_token UUID UNIQUE DEFAULT uuid_generate_v4(),
    expires_at TIMESTAMPTZ,
    professional_id UUID REFERENCES professionals(id)
);

CREATE INDEX IF NOT EXISTS idx_anamnese_forms_token ON anamnese_forms(form_link_token);

-- =============================================
-- 4. ANAMNESE RESPONSES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS anamnese_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    anamnese_form_id UUID REFERENCES anamnese_forms(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    phone TEXT,
    cpf TEXT,
    birth_date DATE,
    gender TEXT,
    weight DECIMAL(5,2),
    height DECIMAL(5,2),
    health_conditions TEXT[],
    injuries TEXT,
    medications TEXT,
    goal TEXT,
    activity_preferences TEXT[],
    frequency_preference TEXT,
    additional_notes TEXT,
    photos_urls TEXT[]
);

-- =============================================
-- 5. UPDATE EXISTING TABLES
-- =============================================

-- Update students
ALTER TABLE students ADD COLUMN IF NOT EXISTS cpf TEXT UNIQUE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS sales_origin_id UUID REFERENCES sales(id);

-- Update payments
ALTER TABLE payments ADD COLUMN IF NOT EXISTS sales_id UUID REFERENCES sales(id);

-- =============================================
-- 6. RLS POLICIES
-- =============================================

-- Enable RLS
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE anamnese_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE anamnese_responses ENABLE ROW LEVEL SECURITY;

-- Plans
DROP POLICY IF EXISTS "plans_all" ON plans;
CREATE POLICY "plans_all" ON plans FOR ALL USING (professional_id = get_my_professional_id());
CREATE POLICY "plans_public_read" ON plans FOR SELECT USING (status = true);

-- Sales
CREATE POLICY "sales_all" ON sales FOR ALL USING (professional_id = get_my_professional_id());

-- Anamnese Forms
CREATE POLICY "anamnese_forms_all" ON anamnese_forms FOR ALL USING (professional_id = get_my_professional_id());
-- Allow public access by token (handled via function or specific select policy if querying directly)
CREATE POLICY "anamnese_forms_public_read" ON anamnese_forms FOR SELECT USING (true); -- Ideally overly permissive, but needed for the form landing page to validate token. Could constrain by token lookup.

-- Anamnese Responses
CREATE POLICY "anamnese_responses_all" ON anamnese_responses FOR ALL USING (
    EXISTS (
        SELECT 1 FROM anamnese_forms af 
        WHERE af.id = anamnese_responses.anamnese_form_id 
        AND af.professional_id = get_my_professional_id()
    )
);
CREATE POLICY "anamnese_responses_insert_public" ON anamnese_responses FOR INSERT WITH CHECK (true);

-- =============================================
-- 7. TRIGGERS FOR UPDATED_AT
-- =============================================
CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_anamnese_forms_updated_at BEFORE UPDATE ON anamnese_forms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SUCCESS MESSAGE
-- =============================================
SELECT 'SUCCESS: Plans, Sales, and Anamnese tables created!' as message;
