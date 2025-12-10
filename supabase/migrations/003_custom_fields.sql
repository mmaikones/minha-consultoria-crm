-- Add custom_data column to students table for flexible custom fields
ALTER TABLE students ADD COLUMN IF NOT EXISTS custom_data JSONB DEFAULT '{}'::jsonb;

-- Create index for JSON queries
CREATE INDEX IF NOT EXISTS idx_students_custom_data ON students USING gin(custom_data);

SELECT 'SUCCESS: custom_data column added to students!' as message;
