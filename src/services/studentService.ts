
import { supabase, supabaseUntyped } from '../lib/supabase';

// Helper to get current professional ID
async function getProfessionalId(): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user.id)
        .single();

    return (data as any)?.id || null;
}

export interface Student {
    id: string;
    professional_id: string;
    name: string;
    email: string;
    phone?: string;
    cpf?: string;
    photo_url?: string;
    status: string;
    created_at: string;
    // Add other fields as needed based on schema
}

/**
 * Get all students for the current professional
 */
export async function getStudents(): Promise<Student[]> {
    const professionalId = await getProfessionalId();
    if (!professionalId) return [];

    const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('professional_id', professionalId)
        .order('name');

    if (error) {
        console.error('Error fetching students:', error);
        return [];
    }

    return data as Student[];
}

/**
 * Get student by ID
 */
export async function getStudentById(id: string): Promise<Student | null> {
    const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .single();

    if (error) return null;
    return data as Student;
}

/**
 * Create or Update Student from Anamnese Response
 * Logic:
 * 1. Find sales record to get professional_id and plan info
 * 2. Check if student already exists (by phone or cpf)
 * 3. Update or Insert Student
 * 4. Link Student to Sales
 */
export async function createOrUpdateStudentFromAnamnese(salesId: string, anamneseFormId: string): Promise<Student | null> {

    // 1. Get Sales Data
    const { data: sale } = await supabase
        .from('sales')
        .select('professional_id, phone, email, plan_id')
        .eq('id', salesId)
        .single();

    if (!sale) throw new Error('Venda não encontrada');

    // 2. Get Anamnese Data
    const { data: response } = await supabase
        .from('anamnese_responses')
        .select('*')
        .eq('anamnese_form_id', anamneseFormId)
        .single();

    if (!response) throw new Error('Resposta da anamnese não encontrada');

    // 3. Prepare Student Data
    const saleData = sale as any;
    const anamneseData = response as any;
    const studentData = {
        professional_id: saleData.professional_id,
        name: anamneseData.name,
        email: anamneseData.email || saleData.email,
        phone: anamneseData.phone || saleData.phone,
        cpf: anamneseData.cpf,
        birth_date: anamneseData.birth_date,
        gender: anamneseData.gender,
        height: anamneseData.height,
        weight: anamneseData.weight,
        goal: anamneseData.goal,
        health_conditions: anamneseData.health_conditions,
        injuries: anamneseData.injuries ? [anamneseData.injuries] : [],
        medications: anamneseData.medications ? [anamneseData.medications] : [],
        status: 'active', // Plan just started
        sales_origin_id: salesId,
        updated_at: new Date().toISOString()
    };

    // 4. Upsert Student (Match on Phone or CPF - simplified to Phone specific to this user flow)
    // Note: 'students_professional_id_email_key' constraint exists, but phone is our primary key for WhatsApp login
    // We try to find by phone first

    let studentId: string | null = null;

    const { data: existingStudent } = await supabase
        .from('students')
        .select('id')
        .eq('professional_id', saleData.professional_id)
        .eq('phone', saleData.phone)
        .maybeSingle();

    if (existingStudent) {
        // Update
        // @ts-ignore - Supabase type inference issue
        const { data, error } = await supabaseUntyped
            .from('students')
            .update(studentData)
            .eq('id', (existingStudent as any).id)
            .select()
            .single();

        if (error) throw error;
        studentId = (data as any).id;
    } else {
        // Insert
        // @ts-ignore - Supabase type inference issue
        const { data, error } = await supabaseUntyped
            .from('students')
            .insert(studentData)
            .select()
            .single();

        if (error) throw error;
        studentId = (data as any).id;
    }

    // 5. Update Sales record with student_id
    if (studentId) {
        await supabaseUntyped
            .from('sales')
            .update({
                student_id: studentId,
                status: 'student_created'
            })
            .eq('id', salesId);
    }

    return getStudentById(studentId!);
}

/**
 * Authenticate student (via Phone matches)
 * Note: Only for student portal access
 */
export async function authenticateStudent(phone: string): Promise<Student | null> {
    const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('phone', phone)
        .maybeSingle(); // Assumes phone is unique per professional? schema constraint might be needed or we limit by domain 
    // Ideally student portal should handle multi-tenant via professional subdomain or ask for professional code.
    // For 'FitPro', we assume unique phone global or just return first match.

    if (error || !data) return null;
    return data as Student;
}
