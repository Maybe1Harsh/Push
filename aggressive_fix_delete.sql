-- AGGRESSIVE FIX: Completely disable RLS and test delete
-- Run this in Supabase SQL Editor

-- Step 1: Completely disable RLS on the table
ALTER TABLE doctor_schedule DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL policies (force clean slate)
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'doctor_schedule') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON doctor_schedule';
    END LOOP;
END $$;

-- Step 3: Test direct delete (replace ID with actual ID from your table)
-- First, see what records exist
SELECT id, doctor_email, date, start_time, end_time, description FROM doctor_schedule;

-- Step 4: Test delete with a specific ID (CHANGE THIS ID TO MATCH YOUR DATA)
-- DELETE FROM doctor_schedule WHERE id = 1;  -- UNCOMMENT AND USE REAL ID

-- Step 5: Check if delete worked
-- SELECT id, doctor_email, date, start_time, end_time, description FROM doctor_schedule;

-- Step 6: Grant explicit permissions to authenticated users
GRANT ALL ON doctor_schedule TO authenticated;
GRANT ALL ON doctor_schedule TO anon;

-- Step 7: If you still want RLS later, re-enable with super permissive policy
-- ALTER TABLE doctor_schedule ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "allow_everything" ON doctor_schedule FOR ALL USING (true) WITH CHECK (true);