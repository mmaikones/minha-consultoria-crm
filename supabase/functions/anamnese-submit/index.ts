import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
    try {
        const { formLinkToken, formData } = await req.json()

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Validate Token
        const { data: form } = await supabase
            .from('anamnese_forms')
            .select('*')
            .eq('form_link_token', formLinkToken)
            .eq('status', 'pending')
            .single()

        if (!form) throw new Error('Formulário inválido ou já respondido.')

        // 2. Validate Sale
        const { data: sale } = await supabase
            .from('sales')
            .select('*')
            .eq('id', form.sales_id)
            .single()

        if (!sale) throw new Error('Venda vinculada não encontrada.')

        // 3. Save Response
        await supabase.from('anamnese_responses').insert({
            anamnese_form_id: form.id,
            submitted_at: new Date().toISOString(),
            ...formData, // Flatten the form data into the columns
            phone: formData.phone || sale.phone,
            email: formData.email || sale.email
        })

        // 4. Update Form Status
        await supabase
            .from('anamnese_forms')
            .update({ status: 'completed' })
            .eq('id', form.id)

        // 5. Create/Update Student (Business Logic)
        // Same logic as studentService.ts but server-side

        // Check existing
        let studentId = null;
        const { data: existingStudent } = await supabase
            .from('students')
            .select('id')
            .eq('professional_id', form.professional_id)
            .eq('phone', formData.phone || sale.phone)
            .maybeSingle()

        const studentDTO = {
            professional_id: form.professional_id,
            name: formData.name,
            email: formData.email || sale.email,
            phone: formData.phone || sale.phone,
            sales_origin_id: sale.id,
            status: 'active',
            // ... map other fields
        }

        if (existingStudent) {
            await supabase.from('students').update(studentDTO).eq('id', existingStudent.id)
            studentId = existingStudent.id
        } else {
            const { data: newStudent } = await supabase.from('students').insert(studentDTO).select().single()
            studentId = newStudent.id
        }

        // 6. Link Sale
        await supabase.from('sales').update({
            student_id: studentId,
            status: 'student_created'
        }).eq('id', sale.id)

        return new Response(
            JSON.stringify({ success: true, studentId }),
            { headers: { "Content-Type": "application/json" } },
        )

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        })
    }
})
