# Panchkarma Feature Setup Instructions

## Overview
This document provides setup instructions for the new Panchkarma feature added to the Ayurvedic Health Management System.

## Features Added

### 1. Doctor Dashboard Integration
- Added a new "🌿 Panchkarma" button to the doctor dashboard
- Doctors can now access Panchkarma treatments from their main dashboard

### 2. Panchkarma Screen (`PanchkarmaScreen.js`)
- Comprehensive library of 10 traditional Panchkarma treatments
- Each treatment includes:
  - Name and category (Snehana, Shodhana, Swedana, Kriya, Rukshana)
  - Description and duration
  - Benefits and precautions
  - Detailed procedure information
- Search and filter functionality by category
- Modal interface for creating prescriptions
- Patient selection and treatment selection
- Recent prescriptions tracking

### 3. Patient Prescriptions Integration
- Added tab navigation to separate medicine and Panchkarma prescriptions
- Patients can view their Panchkarma treatment plans
- Detailed treatment cards with benefits and precautions
- Status tracking for prescribed treatments

## Database Setup

### Required Table: `panchkarma_prescriptions`

**Run the following SQL in your Supabase database:**

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

-- Create indexes
CREATE INDEX idx_panchkarma_doctor_email ON panchkarma_prescriptions(doctor_email);
CREATE INDEX idx_panchkarma_patient_email ON panchkarma_prescriptions(patient_email);
CREATE INDEX idx_panchkarma_status ON panchkarma_prescriptions(status);
CREATE INDEX idx_panchkarma_created_at ON panchkarma_prescriptions(created_at);

-- Enable RLS
ALTER TABLE panchkarma_prescriptions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Doctors can view their own prescriptions" ON panchkarma_prescriptions
    FOR SELECT USING (doctor_email = auth.email());

CREATE POLICY "Patients can view their prescriptions" ON panchkarma_prescriptions
    FOR SELECT USING (patient_email = auth.email());

CREATE POLICY "Doctors can create prescriptions" ON panchkarma_prescriptions
    FOR INSERT WITH CHECK (doctor_email = auth.email());

CREATE POLICY "Doctors can update their prescriptions" ON panchkarma_prescriptions
    FOR UPDATE USING (doctor_email = auth.email());
```

## How to Use

### For Doctors:
1. Login as a doctor
2. Go to Doctor Dashboard
3. Click on "🌿 Panchkarma" button
4. Browse the treatments library
5. Click "New Prescription" to create a prescription
6. Select a patient from the list
7. Choose one or more treatments
8. Add optional notes
9. Send the prescription

### For Patients:
1. Login as a patient
2. Go to "View Prescriptions & Diet Charts"
3. Click on the "Panchkarma" tab
4. View prescribed treatments with detailed information
5. Follow the treatment plan as prescribed

## Panchkarma Treatments Included

1. **Abhyanga** (Snehana) - Full body massage with medicated oils
2. **Shirodhara** (Snehana) - Continuous pouring of medicated oil on forehead
3. **Panchakarma Detox** (Shodhana) - Complete five-fold detoxification therapy
4. **Swedana** (Swedana) - Herbal steam therapy
5. **Nasya** (Shodhana) - Nasal administration of medicated oils/herbs
6. **Virechana** (Shodhana) - Therapeutic purgation therapy
7. **Basti** (Shodhana) - Medicated enema therapy
8. **Karna Purana** (Kriya) - Ear therapy with medicated oils
9. **Akshi Tarpana** (Kriya) - Eye therapy with medicated ghee
10. **Udvartana** (Rukshana) - Herbal powder massage for weight reduction

## Benefits

- **For Doctors**: Streamlined prescription process for traditional treatments
- **For Patients**: Clear understanding of prescribed treatments with detailed information
- **For Practice**: Better integration of traditional Ayurvedic therapies
- **For Tracking**: Centralized database of all Panchkarma prescriptions

## Files Modified/Added

### New Files:
- `PanchkarmaScreen.js` - Main Panchkarma interface for doctors
- `database/panchkarma_schema.sql` - Database schema and setup
- `PANCHKARMA_SETUP.md` - This setup guide

### Modified Files:
- `DoctorDashboard.js` - Added Panchkarma button
- `PatientPrescriptions.js` - Added Panchkarma tab and functionality
- `App.js` - Added navigation routes for PanchkarmaScreen

## Technical Details

- Uses React Native Paper components for consistent UI
- Integrates with existing Supabase backend
- Follows the same authentication and authorization patterns
- Responsive design works on both mobile and web
- Real-time updates through Supabase subscriptions
- JSON storage for treatment data allows flexible treatment information

## Troubleshooting

### Common Issues:
1. **Database table not found**: Make sure to run the SQL schema in Supabase
2. **Permission errors**: Verify RLS policies are set up correctly
3. **Navigation errors**: Ensure PanchkarmaScreen is imported in App.js
4. **Missing translations**: All text is hardcoded in English for now

### Support:
For any issues, check the browser console or Metro bundler logs for specific error messages.