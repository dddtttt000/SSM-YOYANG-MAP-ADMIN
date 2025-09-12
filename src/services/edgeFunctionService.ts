import { supabase } from '@/lib/supabase'

export interface CreateAdminUserRequest {
  email: string
  name: string
  role: 'super_admin' | 'admin'
  password: string
}

export interface CreateAdminUserResponse {
  success: boolean
  data?: {
    id: string
    email: string
    name: string
    role: string
    supabase_user_id: string
    is_active: boolean
    created_at: string
  }
  error?: string
}

export const createAdminUser = async (
  userData: CreateAdminUserRequest
): Promise<CreateAdminUserResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke('create-admin-user', {
      body: userData
    })

    if (error) {
      throw new Error(error.message || '관리자 생성 중 오류가 발생했습니다.')
    }

    return data
  } catch (error) {
    console.error('Error creating admin user:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
    }
  }
}