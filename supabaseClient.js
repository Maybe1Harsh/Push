
// filepath: c:\Users\harsh\OneDrive\Desktop\SIH\ayur_healthplix\supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sphfvepyjatxbzwnnvbv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwaGZ2ZXB5amF0eGJ6d25udmJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwOTQxMTcsImV4cCI6MjA3MjY3MDExN30.aZ87EwK3-Cvs_ADNQXdcyS25MYSPXgCJqllEbwR2aXY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);