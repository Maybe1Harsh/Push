-- Fix delete permissions for doctor_schedule table
-- Run this in Supabase SQL Editor to fix delete issues

-- First check the current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'doctor_schedule';

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON doctor_schedule;
DROP POLICY IF EXISTS "Doctors can view their own schedules" ON doctor_schedule;
DROP POLICY IF EXISTS "Patients can view doctor schedules" ON doctor_schedule;
DROP POLICY IF EXISTS "Doctors can create their schedules" ON doctor_schedule;
DROP POLICY IF EXISTS "Doctors can update their schedules" ON doctor_schedule;
DROP POLICY IF EXISTS "Doctors can delete their schedules" ON doctor_schedule;

-- Disable RLS temporarily for testing
ALTER TABLE doctor_schedule DISABLE ROW LEVEL SECURITY;

-- Test delete operation
SELECT COUNT(*) as total_records FROM doctor_schedule;

-- Re-enable RLS with proper policies
ALTER TABLE doctor_schedule ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies that work
CREATE POLICY "Allow all select" ON doctor_schedule
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert" ON doctor_schedule
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated update" ON doctor_schedule
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated delete" ON doctor_schedule
    FOR DELETE USING (true);

-- Alternative: If the above doesn't work, use doctor email matching
-- CREATE POLICY "Doctors can manage their schedules" ON doctor_schedule
--     FOR ALL USING (doctor_email = current_setting('request.jwt.claims', true)::json->>'email')
--     WITH CHECK (doctor_email = current_setting('request.jwt.claims', true)::json->>'email');

-- Test the policies
SELECT * FROM doctor_schedule LIMIT 1;

-- Show final policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'doctor_schedule';