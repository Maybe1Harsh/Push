// Test script to check and create doctor_schedule table
import { supabase } from './supabaseClient.js';

async function testScheduleTable() {
  console.log('Testing doctor_schedule table...');
  
  try {
    // Test if we can query the table
    const { data, error } = await supabase
      .from('doctor_schedule')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Table does not exist or has access issues:', error);
      
      // Try to create the table using the SQL from our schema
      console.log('Attempting to create table...');
      
      const { data: createResult, error: createError } = await supabase.rpc('exec_sql', {
        sql: `
        CREATE TABLE IF NOT EXISTS doctor_schedule (
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
          CONSTRAINT unique_doctor_date_time UNIQUE (doctor_email, date, start_time, end_time)
        );
        
        CREATE INDEX IF NOT EXISTS idx_doctor_schedule_email ON doctor_schedule(doctor_email);
        CREATE INDEX IF NOT EXISTS idx_doctor_schedule_date ON doctor_schedule(date);
        CREATE INDEX IF NOT EXISTS idx_doctor_schedule_status ON doctor_schedule(status);
        `
      });
      
      if (createError) {
        console.error('Failed to create table:', createError);
        console.log('You need to run the SQL manually in Supabase SQL editor.');
      } else {
        console.log('Table created successfully!');
      }
    } else {
      console.log('Table exists and is accessible!');
      
      // Test inserting a record
      const testRecord = {
        doctor_email: 'test@example.com',
        doctor_name: 'Test Doctor',
        date: '2025-09-21',
        start_time: '09:00',
        end_time: '10:00',
        description: 'Test schedule entry',
        status: 'available'
      };
      
      const { data: insertData, error: insertError } = await supabase
        .from('doctor_schedule')
        .insert([testRecord])
        .select();
      
      if (insertError) {
        console.error('Insert test failed:', insertError);
      } else {
        console.log('Insert test successful:', insertData);
        
        // Clean up test record
        await supabase
          .from('doctor_schedule')
          .delete()
          .eq('doctor_email', 'test@example.com');
        console.log('Test record cleaned up');
      }
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testScheduleTable();