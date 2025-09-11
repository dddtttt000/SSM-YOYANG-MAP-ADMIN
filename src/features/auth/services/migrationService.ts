import { supabase } from '@/lib/supabase'
import { AdminUser } from '@/types/database.types'

// interface AdminMigrationInfo {
//   admin_id: number
//   email: string
//   name: string
//   role: string
//   permissions: string[]
//   temp_password: string
// }

// 별도 마이그레이션 서비스 - 운영에서는 관리자가 수동으로 실행
export const migrationService = {
  // 마이그레이션이 필요한 admin 사용자들 조회
  async getAdminsForMigration(): Promise<AdminUser[]> {
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, email, name, role, permissions, supabase_user_id, last_login_at, is_active, created_at, updated_at')
      .eq('is_active', true)
      .is('supabase_user_id', null) // 아직 Supabase Auth와 연결되지 않은 계정들

    if (error) {
      throw new Error(`마이그레이션 대상 조회 실패: ${error.message}`)
    }

    return data || []
  },

  // 개별 admin 계정을 Supabase Auth로 마이그레이션
  async migrateAdminAccount(adminUser: AdminUser): Promise<{ success: boolean; message: string }> {
    try {
      // 임시 비밀번호 생성 (보안상 예측 불가능하게 수정)
      const randomString = Math.random().toString(36).substring(2, 15)
      const tempPassword = `${adminUser.email.split('@')[0]}_${randomString}_${Date.now()}`

      // 유효한 이메일 확인
      const hasValidDomain =
        adminUser.email.includes('@') && !adminUser.email.includes('@test.') && !adminUser.email.endsWith('.test')

      if (!hasValidDomain) {
        return {
          success: false,
          message: `유효하지 않은 이메일 형식: ${adminUser.email}`,
        }
      }

      // Supabase Auth 계정 생성
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: adminUser.email,
        password: tempPassword,
        options: {
          emailRedirectTo: undefined, // 이메일 확인 비활성화
          data: {
            admin_user_id: adminUser.id,
            email: adminUser.email,
            role: adminUser.role,
            permissions: adminUser.permissions || [], // 기본값 처리
            full_name: adminUser.name,
          },
        },
      })

      if (signUpError) {
        return {
          success: false,
          message: `Supabase Auth 계정 생성 실패: ${signUpError.message}`,
        }
      }

      if (!authData.user) {
        return {
          success: false,
          message: '계정 생성은 성공했지만 사용자 정보가 반환되지 않았습니다.',
        }
      }

      // admin_users 테이블에 supabase_user_id 연결
      const { error: linkError } = await supabase
        .from('admin_users')
        .update({
          supabase_user_id: authData.user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', adminUser.id)

      if (linkError) {
        return {
          success: false,
          message: `계정 연결 실패: ${linkError.message}`,
        }
      }

      return {
        success: true,
        message: `성공적으로 마이그레이션됨. 임시 비밀번호: ${tempPassword}`,
      }
    } catch (error) {
      return {
        success: false,
        message: `마이그레이션 중 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
      }
    }
  },

  // 모든 admin 계정 일괄 마이그레이션
  async migrateAllAdminAccounts(): Promise<{
    total: number
    success: number
    failed: number
    results: Array<{ admin_id: number; email: string; success: boolean; message: string }>
  }> {
    const adminsToMigrate = await this.getAdminsForMigration()
    const results = []

    let successCount = 0
    let failedCount = 0

    for (const admin of adminsToMigrate) {
      const result = await this.migrateAdminAccount(admin)

      results.push({
        admin_id: admin.id,
        email: admin.email,
        success: result.success,
        message: result.message,
      })

      if (result.success) {
        successCount++
      } else {
        failedCount++
      }

      // API 제한 방지를 위한 잠시 대기
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    return {
      total: adminsToMigrate.length,
      success: successCount,
      failed: failedCount,
      results,
    }
  },

  // 마이그레이션 상태 확인
  async checkMigrationStatus(): Promise<{
    totalAdmins: number
    migratedAdmins: number
    pendingAdmins: number
    migrationPercentage: number
  }> {
    const { data: allAdmins, error } = await supabase
      .from('admin_users')
      .select('supabase_user_id')
      .eq('is_active', true)

    if (error) {
      throw new Error(`마이그레이션 상태 확인 실패: ${error.message}`)
    }

    const totalAdmins = allAdmins?.length || 0
    const migratedAdmins = allAdmins?.filter(admin => admin.supabase_user_id).length || 0
    const pendingAdmins = totalAdmins - migratedAdmins
    const migrationPercentage = totalAdmins > 0 ? Math.round((migratedAdmins / totalAdmins) * 100) : 0

    return {
      totalAdmins,
      migratedAdmins,
      pendingAdmins,
      migrationPercentage,
    }
  },
}
