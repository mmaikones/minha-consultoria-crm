# Supabase RLS Policies

This document explains the Row Level Security (RLS) policies implemented in the Fit360 CRM database.

## Core Principle

The system is multi-tenant by design.
- **Professionals** can only access data where they are the owner (`professional_id`).
- **Students** can only access data where they are the subject (`student_id` or linked via `student_protocols`).

## Helper Function: `get_my_professional_id()`

To simplify policies and avoid recursive infinite loops when joining tables, we use a stable helper function:

```sql
CREATE FUNCTION get_my_professional_id()
RETURNS UUID AS $$
    SELECT id FROM professionals WHERE user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

This function returns the `id` from the `professionals` table that corresponds to the currently authenticated user (`auth.uid()`).

## Table Policies

### 1. `professionals`
- **SELECT/UPDATE**: Users can only see and update their own record (`user_id = auth.uid()`).
- **INSERT**: Handled via Trigger (`on_auth_user_created`) automatically upon sign-up.

### 2. `students`
- **ALL (Select, Insert, Update, Delete)**: Allowed if `professional_id = get_my_professional_id()`.
- *Note:* Students cannot access the `students` table directly; they access their profile via a separate view or RPC if needed (currently the student app uses specific queries).

### 3. `protocols`
- **ALL**: Allowed if `professional_id = get_my_professional_id()`.

### 4. `student_protocols` (The link between students and protocols)
- **ALL**: Allowed if the student belongs to the professional:
  ```sql
  EXISTS (
      SELECT 1 FROM students
      WHERE students.id = student_protocols.student_id
      AND students.professional_id = get_my_professional_id()
  )
  ```

### 5. `payments`
- **ALL**: Allowed if `professional_id = get_my_professional_id()`.

### 6. `anamnesis`
- **SELECT**: `professional_id = get_my_professional_id()`.
- **INSERT**: Allowed for anyone (public/anon) to support public anamnesis forms, OR restricted to `true` with check.

## Common Issues & Troubleshooting

### Error: `PGRST301` (Row level security violation)
- **Cause**: The user is trying to access data that doesn't belong to them, or isn't logged in.
- **Fix**: Check `auth.uid()` and ensure the `professionals` table has a record for that user.

### Error: Infinite Recursion
- **Cause**: A policy on Table A selects from Table B, which has a policy selecting from Table A.
- **Fix**: Use `SECURITY DEFINER` functions like `get_my_professional_id()` to break the chain. 
