import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateAdminUserRequest {
  email: string
  name: string
  role: 'super_admin' | 'admin'
  password: string
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get request data
    const { email, name, role, password }: CreateAdminUserRequest = await req.json()

    // Validate input
    if (!email || !name || !role || !password) {
      return new Response(
        JSON.stringify({ error: '필수 필드가 누락되었습니다.' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create Supabase admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )


    // Check if email already exists in admin_users table (using admin client to bypass RLS)
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('admin_users')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (checkError) {
      throw new Error(`이메일 중복 확인 실패: ${checkError.message}`)
    }

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: '이미 존재하는 이메일입니다.' }),
        { 
          status: 409, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 1. Create Supabase Auth user
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name,
        role
      }
    })

    if (authError) {
      throw new Error(`Auth 사용자 생성 실패: ${authError.message}`)
    }

    if (!authUser.user) {
      throw new Error('Auth 사용자 생성 결과가 없습니다.')
    }

    // 2. Insert into admin_users table (using admin client to bypass RLS)
    const { data: adminUser, error: insertError } = await supabaseAdmin
      .from('admin_users')
      .insert({
        email,
        name,
        role,
        supabase_user_id: authUser.user.id,
        is_active: true,
        password_digest: 'managed_by_supabase_auth' // Flag to indicate Supabase Auth management
      })
      .select()
      .single()

    if (insertError) {
      // Rollback: Delete the created Auth user
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
      throw new Error(`관리자 정보 저장 실패: ${insertError.message}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role,
          supabase_user_id: adminUser.supabase_user_id,
          is_active: adminUser.is_active,
          created_at: adminUser.created_at
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      }
    )

  } catch (error) {
    console.error('Error in create-admin-user function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})