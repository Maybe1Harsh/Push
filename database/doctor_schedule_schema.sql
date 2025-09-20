-- Doctor Schedule Table
-- This table stores doctor availability schedules

CREATE TABLE IF NOT EXISTS doctor_schedule (
    id SERIAL PRIMARY KEY,
    doctor_email VARCHAR(255) NOT NULL,
    doctor_name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'available', -- available, booked, unavailable
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure no overlapping schedules for same doctor on same date
    CONSTRAINT unique_doctor_date_time UNIQUE (doctor_email, date, start_time, end_time)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_doctor_schedule_email ON doctor_schedule(doctor_email);
CREATE INDEX IF NOT EXISTS idx_doctor_schedule_date ON doctor_schedule(date);
CREATE INDEX IF NOT EXISTS idx_doctor_schedule_status ON doctor_schedule(status);
CREATE INDEX IF NOT EXISTS idx_doctor_schedule_created_at ON doctor_schedule(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE doctor_schedule ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Doctors can view their own schedules
CREATE POLICY "Doctors can view their own schedules" ON doctor_schedule
    FOR SELECT USING (doctor_email = auth.email());

-- Patients can view doctor schedules (for booking appointments)
CREATE POLICY "Patients can view doctor schedules" ON doctor_schedule
    FOR SELECT USING (true);

-- Doctors can create their own schedules
CREATE POLICY "Doctors can create their schedules" ON doctor_schedule
    FOR INSERT WITH CHECK (doctor_email = auth.email());

-- Doctors can update their own schedules
CREATE POLICY "Doctors can update their schedules" ON doctor_schedule
    FOR UPDATE USING (doctor_email = auth.email());

-- Doctors can delete their own schedules
CREATE POLICY "Doctors can delete their schedules" ON doctor_schedule
    FOR DELETE USING (doctor_email = auth.email());

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_doctor_schedule_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_doctor_schedule_updated_at
    BEFORE UPDATE ON doctor_schedule
    FOR EACH ROW
    EXECUTE FUNCTION update_doctor_schedule_updated_at();

-- Migration: Add description column and remove break time columns if they exist
DO $$
BEGIN
    -- Add description column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='doctor_schedule' AND column_name='description') THEN
        ALTER TABLE doctor_schedule ADD COLUMN description TEXT;
    END IF;
    
    -- Remove break_start column if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='doctor_schedule' AND column_name='break_start') THEN
        ALTER TABLE doctor_schedule DROP COLUMN break_start;
    END IF;
    
    -- Remove break_end column if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='doctor_schedule' AND column_name='break_end') THEN
        ALTER TABLE doctor_schedule DROP COLUMN break_end;
    END IF;
END $$;

-- Sample data (optional - for testing)
/*
INSERT INTO doctor_schedule (
    doctor_email, 
    doctor_name, 
    date, 
    start_time, 
    end_time,
    description,
    status
) VALUES 
    ('doctor@example.com', 'Dr. Sharma', '2025-09-20', '09:00', '17:00', 'General consultation hours', 'available'),
    ('doctor@example.com', 'Dr. Sharma', '2025-09-21', '10:00', '16:00', 'Emergency availability only', 'available');
*/