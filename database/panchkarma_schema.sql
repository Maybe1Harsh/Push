-- Panchkarma Prescriptions Table
-- This table stores Panchkarma treatment prescriptions sent by doctors to patients

CREATE TABLE IF NOT EXISTS panchkarma_prescriptions (
    id SERIAL PRIMARY KEY,
    doctor_email VARCHAR(255) NOT NULL,
    doctor_name VARCHAR(255) NOT NULL,
    patient_email VARCHAR(255) NOT NULL,
    patient_name VARCHAR(255) NOT NULL,
    treatments JSONB NOT NULL, -- Stores array of selected treatments
    notes TEXT, -- Additional notes from doctor
    status VARCHAR(50) DEFAULT 'prescribed', -- prescribed, in_progress, completed, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints (if tables exist)
    CONSTRAINT fk_doctor_email FOREIGN KEY (doctor_email) REFERENCES profiles(email) ON DELETE CASCADE,
    CONSTRAINT fk_patient_email FOREIGN KEY (patient_email) REFERENCES profiles(email) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_panchkarma_doctor_email ON panchkarma_prescriptions(doctor_email);
CREATE INDEX idx_panchkarma_patient_email ON panchkarma_prescriptions(patient_email);
CREATE INDEX idx_panchkarma_status ON panchkarma_prescriptions(status);
CREATE INDEX idx_panchkarma_created_at ON panchkarma_prescriptions(created_at);

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

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_panchkarma_prescriptions_updated_at
    BEFORE UPDATE ON panchkarma_prescriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Sample data (optional - remove in production)
/*
INSERT INTO panchkarma_prescriptions (
    doctor_email, 
    doctor_name, 
    patient_email, 
    patient_name, 
    treatments, 
    notes
) VALUES (
    'doctor@example.com',
    'Dr. Sharma',
    'patient@example.com',
    'John Doe',
    '[{"id": 1, "name": "Abhyanga", "category": "Snehana", "duration": "45-60 minutes"}]',
    'Start with gentle massage, increase pressure gradually'
);
*/