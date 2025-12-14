import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rybqolewawemajhhftzv.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5YnFvbGV3YXdlbWFqaGhmdHp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MjkyMzgsImV4cCI6MjA4MTEwNTIzOH0.Xc6CARsOxD2Qax4XQUb791Dq4l7ipY0eD7QN10KcbFE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = () => true;
