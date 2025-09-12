import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // JWT 기반 세션 관리 활성화
    autoRefreshToken: true, // 자동 토큰 갱신 활성화
    detectSessionInUrl: true, // URL에서 세션 감지 활성화
    storage: window.localStorage, // localStorage에 세션 저장
  },
})
