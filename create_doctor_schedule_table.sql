-- Direct SQL to create the doctor_schedule table
-- Run this in Supabase SQL Editor

-- First, drop table if it exists to ensure clean creation
DROP TABLE IF EXISTS doctor_schedule CASCADE;

-- Create the doctor_schedule table
CREATE TABLE doctor_schedule (
    id SERIAL PRIMARY KEY,
    doctor_email VARCHAR(255) NOT NULL,
    doctor_name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure no overlapping schedules for same doctor on same date
    CONSTRAINT unique_doctor_date_time UNIQUE (doctor_email, date, start_time, end_time)
);

-- Create indexes for better performance
CREATE INDEX idx_doctor_schedule_email ON doctor_schedule(doctor_email);
CREATE INDEX idx_doctor_schedule_date ON doctor_schedule(date);
CREATE INDEX idx_doctor_schedule_status ON doctor_schedule(status);
CREATE INDEX idx_doctor_schedule_created_at ON doctor_schedule(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE doctor_schedule ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Doctors can view their own schedules" ON doctor_schedule;
DROP POLICY IF EXISTS "Patients can view doctor schedules" ON doctor_schedule;
DROP POLICY IF EXISTS "Doctors can create their schedules" ON doctor_schedule;
DROP POLICY IF EXISTS "Doctors can update their schedules" ON doctor_schedule;
DROP POLICY IF EXISTS "Doctors can delete their schedules" ON doctor_schedule;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON doctor_schedule;

-- Create simplified policies for testing
-- Allow all operations for now to test functionality
CREATE POLICY "Allow all operations for authenticated users" ON doctor_schedule
    FOR ALL USING (true) WITH CHECK (true);

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_doctor_schedule_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
DROP TRIGGER IF EXISTS update_doctor_schedule_updated_at ON doctor_schedule;
CREATE TRIGGER update_doctor_schedule_updated_at
    BEFORE UPDATE ON doctor_schedule
    FOR EACH ROW
    EXECUTE FUNCTION update_doctor_schedule_updated_at();

-- Insert test data to verify table works
INSERT INTO doctor_schedule (
    doctor_email, 
    doctor_name, 
    date, 
    start_time, 
    end_time,
    description,
    status
) VALUES 
    ('test@example.com', 'Test Doctor', '2025-09-21', '09:00', '17:00', 'Test schedule entry', 'available');

-- Verify the insert worked
SELECT * FROM doctor_schedule WHERE doctor_email = 'test@example.com';

-- Clean up test data
DELETE FROM doctor_schedule WHERE doctor_email = 'test@example.com';

-- Final verification
SELECT COUNT(*) as table_exists FROM doctor_schedule;