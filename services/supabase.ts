import { createClient } from '@supabase/supabase-js';

// ==================================================================================
// 🟢 DATABASE CONNECTED
// Your Project Ref: wmjjusbgqgiwcznnbbqq
// ==================================================================================

const SUPABASE_URL = 'https://wmjjusbgqgiwcznnbbqq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indtamp1c2JncWdpd2N6bm5iYnFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMjQyOTAsImV4cCI6MjA4MDYwMDI5MH0.ag0k4kje0SYwu7LW34ZaBsR-8KH3IiT90XbIQeJWeso';

// SQL SETUP QUERY REMINDER:
// Ensure you have run the following in your Supabase SQL Editor:
/*
  create table tiles (
    id text primary key,
    json_data jsonb
  );

  create table customers (
    id text primary key,
    json_data jsonb
  );

  create table employees (
    id text primary key,
    json_data jsonb
  );
*/

export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
  : null;

export const isSupabaseConfigured = !!supabase;