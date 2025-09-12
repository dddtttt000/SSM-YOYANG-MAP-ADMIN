import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

// Node.js 환경에서 환경 변수 접근
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Make sure .env.local file exists with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Node.js 환경에서는 세션 비활성화
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
})