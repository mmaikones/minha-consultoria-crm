# Payment Flow & Sales Automation

## Overview
This document describes the flow for selling plans, processing payments via Stripe, and automating student onboarding via WhatsApp.

## 1. Plan Subscription Flow
1. **Selection**: User selects a plan (Mensal, Trimestral, Semestral, Anual) on the public sales page.
2. **Checkout Start**:
   - Frontend calls `stripeService.createCheckoutSession({ planId, email, phone })`.
   - Backend (Edge Function) validates the plan and creates a `sales` record (status: `pending`).
   - Returns a Stripe Checkout URL.
3. **Payment**: User completes payment on Stripe.

## 2. Payment Confirmation (Webhook)
1. **Trigger**: Stripe sends `payment_intent.succeeded` webhook to `/api/webhook/stripe`.
2. **Processing**:
   - Verify signature.
   - Update `sales` record to `payment_confirmed`.
   - Create a `payments` record for financial tracking.
   - Trigger **WhatsApp Automation**.

## 3. WhatsApp Automation
1. **Message**: System sends a welcome message to the student's phone via Evolution API.
2. **Content**: "Parabéns pela compra! Para iniciar, preencha sua anamnese aqui: [LINK]".
3. **Link**: Unique tokenized link to `/anamnese/:token`.

## 4. Student Onboarding (Anamnese)
1. **Submission**: Student fills out the health/goal form.
2. **Creation**:
   - `anamnese_responses` recorded.
   - `students` record created/updated (matched by Phone/CPF).
   - Sales record linked to student.
   - Status updated to `student_created`.

## Environment Setup
Required Environment Variables in Supabase Edge Functions:
- `STRIPE_SECRET_KEY`: sk_live_...
- `STRIPE_WEBHOOK_SECRET`: whsec_...
- `EVOLUTION_API_URL`: https://...
- `EVOLUTION_API_KEY`: ...
- `SUPABASE_URL`: ...
- `SUPABASE_SERVICE_ROLE_KEY`: ... (for bypassing RLS in webhooks)

## Testing
- Use Stripe Test Cards (e.g., 4242 4242 4242 4242).
- Check `sales` table for status updates.
- Check Evolution API logs for message delivery.
