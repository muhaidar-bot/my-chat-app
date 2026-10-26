import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://yzihbeegbwxiykomeaxw.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

export const supabase =
  supabaseUrl && supabaseKey && !supabaseKey.includes('PASTE')
    ? createClient(supabaseUrl, supabaseKey)
    : null;

export { supabaseUrl, supabaseKey };
