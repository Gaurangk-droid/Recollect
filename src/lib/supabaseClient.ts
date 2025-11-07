import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://jnfelyhctvlmhkkujhuw.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuZmVseWhjdHZsbWhra3VqaHV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NDQxMjgsImV4cCI6MjA3ODAyMDEyOH0.sr5l5H0HgZ2QE7MgT6Pi6EpqgD0YKwTMDFvFysbQ7dU'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)