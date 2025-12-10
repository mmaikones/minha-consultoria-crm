// WhatsApp Automation Service
// Handles higher-level business logic for sending messages

import { evolutionService } from './evolutionService';
import { supabase, supabaseUntyped } from '../lib/supabase';

export const whatsappService = {

    /**
     * Send Anamnese Link via WhatsApp
     * 1. Generates a unique token for the anamnese form
     * 2. Saves it to 'anamnese_forms'
     * 3. Sends the message with the link
     */
    async sendAnamneseViaWhatsApp(salesId: string, phone: string, email: string, planName: string): Promise<{ success: boolean; error?: string }> {
        try {
            // 1. Get current professional ID (needed for RLS/Association)
            const { data: sale } = await supabase
                .from('sales')
                .select('professional_id')
                .eq('id', salesId)
                .single();

            const saleData = sale as any;
            if (!saleData) throw new Error('Venda não encontrada');

            // 2. Create Anamnese Form Record
            const { data: form, error: formError } = await supabase
                .from('anamnese_forms')
                .insert({
                    sales_id: salesId,
                    professional_id: saleData.professional_id,
                    phone: phone,
                    status: 'pending',
                    // expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Optional: 7 days expiry
                } as any)
                .select()
                .single();

            if (formError || !form) {
                console.error('Error creating anamnese form:', formError);
                throw new Error('Erro ao gerar formulário de anamnese');
            }

            // 3. Construct Message
            const formData = form as any;
            const formLink = `${window.location.origin}/anamnese/${formData.form_link_token}`;
            const firstName = email.split('@')[0]; // Fallback name if we don't have it yet, usually we might have it from Stripe metadata

            const message = `🎉 Parabéns! Compra do plano *${planName}* confirmada.\n\nPara montarmos seu treino e dieta 100% personalizados, preciso que responda essa anamnese:\n\n👉 ${formLink}\n\nAssim que responder, vou analisar e preparar tudo! 🚀`;

            // 4. Send Message
            const formattedNumber = evolutionService.formatWhatsAppNumber(phone);
            await evolutionService.sendText(formattedNumber, message);

            // 5. Update Sales Status
            // @ts-ignore - Supabase type inference issue
            await supabaseUntyped
                .from('sales')
                .update({ status: 'anamnese_sent' })
                .eq('id', salesId);

            return { success: true };

        } catch (error: any) {
            console.error('Error sending anamnese:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Send a workout reminder to a student
     */
    async sendWorkoutReminder(studentId: string, instanceName?: string): Promise<{ success: boolean; error?: string }> {
        try {
            // 1. Fetch Student
            const { data: studentData, error: sError } = await supabase
                .from('students')
                .select('name, phone, professional_id')
                .eq('id', studentId)
                .single();

            const student = studentData as any;

            if (sError || !student) throw new Error('Aluno não encontrado');
            if (!student.phone) throw new Error('Aluno não possui telefone cadastrado');

            // 2. Fetch Active Protocol (Workout)
            const { data: protocolsData } = await supabase
                .from('protocols')
                .select('name')
                .eq('professional_id', student.professional_id)
                .eq('type', 'workout')
                // Ideally this would join with student_protocols to get assigned one
                // For now, simplifed to demonstrate logic
                .limit(1);

            const protocols = protocolsData as any[];
            const workoutName = protocols?.[0]?.name || 'seu treino personalizado';

            // 3. Construct Message
            const firstName = student.name.split(' ')[0];
            const message = `💪 Oi ${firstName}! Tudo pronto para o treino de hoje?\n\nO foco é: *${workoutName}*.\n\nBora pra cima! 🔥`;

            // 4. Send via Evolution API (using formatted WhatsApp number)
            const formattedNumber = evolutionService.formatWhatsAppNumber(student.phone);
            await evolutionService.sendText(formattedNumber, message, instanceName);

            return { success: true };

        } catch (error: any) {
            console.error('Error sending workout reminder:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Send a payment reminder
     */
    async sendPaymentReminder(studentId: string, paymentId: string, instanceName?: string): Promise<{ success: boolean; error?: string }> {
        try {
            // 1. Fetch Payment & Student
            const { data: paymentData, error: pError } = await supabase
                .from('payments')
                .select(`
                    amount, due_date,
                    student:students (name, phone)
                `)
                .eq('id', paymentId)
                .single();

            const payment = paymentData as any;

            if (pError || !payment) throw new Error('Pagamento não encontrado');

            const student = payment.student;
            if (!student?.phone) throw new Error('Telefone do aluno não encontrado');

            // 2. Format Currency & Date
            const amount = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payment.amount);
            const dueDate = new Date(payment.due_date).toLocaleDateString('pt-BR');

            // 3. Construct Message
            const firstName = student.name.split(' ')[0];
            const message = `💰 Oi ${firstName}, lembrete de pagamento do seu plano.\n\nValor: *${amount}*\nVencimento: *${dueDate}*\n\nQualquer dúvida, estou à disposição!`;

            // 4. Send via Evolution API (using formatted WhatsApp number)
            const formattedNumber = evolutionService.formatWhatsAppNumber(student.phone);
            await evolutionService.sendText(formattedNumber, message, instanceName);

            return { success: true };

        } catch (error: any) {
            console.error('Error sending payment reminder:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Send a custom message to a phone number
     */
    async sendDirectMessage(phone: string, text: string, instanceName?: string): Promise<{ success: boolean; error?: string }> {
        try {
            if (!phone) throw new Error('Telefone não informado');
            if (!text) throw new Error('Mensagem não informada');

            const formattedNumber = evolutionService.formatWhatsAppNumber(phone);
            await evolutionService.sendText(formattedNumber, text, instanceName);

            return { success: true };
        } catch (error: any) {
            console.error('Error sending direct message:', error);
            return { success: false, error: error.message };
        }
    }
};
