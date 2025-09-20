# Panchkarma Prescription Issue - Troubleshooting Guide

## Problem: Patients not receiving Panchkarma prescriptions

### Most Likely Causes:

## 1. Database Table Missing ⚠️
**This is the most common issue!**

The `panchkarma_prescriptions` table likely doesn't exist in your Supabase database.

### How to Fix:
1. Go to your Supabase Dashboard
2. Navigate to the SQL Editor
3. Run the following SQL:

```sql
-- Create the panchkarma_prescriptions table
CREATE TABLE IF NOT EXISTS panchkarma_prescriptions (
    id SERIAL PRIMARY KEY,
    doctor_email VARCHAR(255) NOT NULL,
    doctor_name VARCHAR(255) NOT NULL,
    patient_email VARCHAR(255) NOT NULL,
    patient_name VARCHAR(255) NOT NULL,
    treatments JSONB NOT NULL,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'prescribed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_panchkarma_doctor_email ON panchkarma_prescriptions(doctor_email);
CREATE INDEX IF NOT EXISTS idx_panchkarma_patient_email ON panchkarma_prescriptions(patient_email);
CREATE INDEX IF NOT EXISTS idx_panchkarma_status ON panchkarma_prescriptions(status);
CREATE INDEX IF NOT EXISTS idx_panchkarma_created_at ON panchkarma_prescriptions(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE panchkarma_prescriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Doctors can see prescriptions they created
CREATE POLICY "Doctors can view their own prescriptions" ON panchkarma_prescriptions
    FOR SELECT USING (doctor_email = auth.email());

-- Patients can see prescriptions sent to them
CREATE POLICY "Patients can view their prescriptions" ON panchkarma_prescriptions
    FOR SELECT USING (patient_email = auth.email());

-- Doctors can insert new prescriptions
CREATE POLICY "Doctors can create prescriptions" ON panchkarma_prescriptions
    FOR INSERT WITH CHECK (doctor_email = auth.email());

-- Doctors can update their own prescriptions
CREATE POLICY "Doctors can update their prescriptions" ON panchkarma_prescriptions
    FOR UPDATE USING (doctor_email = auth.email());
```

## 2. Row Level Security (RLS) Issues

If the table exists but policies are wrong:

### Check RLS Policies:
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'panchkarma_prescriptions';

-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'panchkarma_prescriptions';
```

### Fix RLS Policies:
If policies are missing or incorrect, run the policy creation SQL above.

## 3. Authentication Context Mismatch

The authenticated user email might not match the doctor/patient email.

### How to Debug:
1. Use the "Debug Database (Test Only)" button in the Doctor Dashboard
2. Check the browser console logs for authentication mismatches

## 4. Case Sensitivity Issues

Email addresses might have case mismatches.

### How to Fix:
```sql
-- Make email comparisons case-insensitive in policies
DROP POLICY IF EXISTS "Doctors can view their own prescriptions" ON panchkarma_prescriptions;
DROP POLICY IF EXISTS "Patients can view their prescriptions" ON panchkarma_prescriptions;
DROP POLICY IF EXISTS "Doctors can create prescriptions" ON panchkarma_prescriptions;

CREATE POLICY "Doctors can view their own prescriptions" ON panchkarma_prescriptions
    FOR SELECT USING (LOWER(doctor_email) = LOWER(auth.email()));

CREATE POLICY "Patients can view their prescriptions" ON panchkarma_prescriptions
    FOR SELECT USING (LOWER(patient_email) = LOWER(auth.email()));

CREATE POLICY "Doctors can create prescriptions" ON panchkarma_prescriptions
    FOR INSERT WITH CHECK (LOWER(doctor_email) = LOWER(auth.email()));
```

## How to Test the Fix:

### Step 1: Use the Debug Tool
1. Login as a doctor
2. Go to Doctor Dashboard
3. Click "🔧 Debug Database (Test Only)"
4. Click "Test Panchkarma Table"
5. Check the results

### Step 2: Test End-to-End
1. Login as a doctor
2. Go to Panchkarma screen
3. Create a prescription for a patient
4. Check browser console for any errors
5. Login as that patient
6. Go to Prescriptions → Panchkarma tab
7. Check if prescription appears

### Step 3: Check Console Logs
Look for these debug messages in the browser console:
- "=== SENDING PANCHKARMA PRESCRIPTION ==="
- "=== FETCHING PANCHKARMA PRESCRIPTIONS ==="
- "Supabase Insert Result:"
- "Panchkarma Fetch Result:"

## Common Error Messages:

### "relation 'panchkarma_prescriptions' does not exist"
**Fix:** Create the table using the SQL above

### "permission denied for table panchkarma_prescriptions"
**Fix:** Set up RLS policies using the SQL above

### "No rows returned from query"
**Fix:** Check email case sensitivity and authentication context

### "Failed to send prescription: Invalid input"
**Fix:** Check that all required fields are provided and JSON is valid

## Production Cleanup:

After fixing the issue, remove the debug elements:

1. Remove `DatabaseTestScreen.js`
2. Remove the debug button from `DoctorDashboard.js`
3. Remove excessive console.log statements from production code

## Quick Verification:

Run this SQL to check if everything is set up correctly:

```sql
-- Check table exists
SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'panchkarma_prescriptions';

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'panchkarma_prescriptions';

-- Check policies exist
SELECT COUNT(*) FROM pg_policies WHERE tablename = 'panchkarma_prescriptions';

-- Test data structure
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'panchkarma_prescriptions' 
ORDER BY ordinal_position;
```

Expected results:
- Table count: 1
- RLS enabled: true
- Policy count: 4 (or more)
- Columns: id, doctor_email, doctor_name, patient_email, patient_name, treatments, notes, status, created_at, updated_at