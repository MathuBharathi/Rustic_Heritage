import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://tlhhxpttifgtgnrzjrga.supabase.co';
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsaGh4cHR0aWZndGducnpqcmdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyOTQ2MDUsImV4cCI6MjA5ODg3MDYwNX0.ZYB12Ekl1EImXRdxvyGNEvXLxnNOe-36oxvo3z4gSI0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

