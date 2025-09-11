# 🚀 Supabase Auth 마이그레이션 실행 가이드

## 📋 마이그레이션 단계

### Phase 1: Database 스키마 마이그레이션
```sql
-- 1. Supabase Dashboard → SQL Editor 이동
-- 2. migrate-admin-users-supabase.sql 파일 내용 복사해서 붙여넣기 후 실행
-- 3. complete-rls-migration.sql 파일 내용 복사해서 붙여넣기 후 실행

-- 주의: \i 명령어는 Supabase SQL Editor에서 지원되지 않으므로 
-- 파일 내용을 직접 복사/붙여넣기 해야 합니다.
```

### Phase 2: 코드 변경사항 적용
```bash
# 1. AuthService 교체
mv src/features/auth/services/authService.ts src/features/auth/services/authService.old.ts
mv src/features/auth/services/authService.jwt.ts src/features/auth/services/authService.ts

# 2. AuthContext 교체  
mv src/features/auth/contexts/AuthContext.tsx src/features/auth/contexts/AuthContext.old.tsx
mv src/features/auth/contexts/AuthContext.jwt.tsx src/features/auth/contexts/AuthContext.tsx
```

### Phase 3: 데이터베이스 검증
```sql
-- 1. 마이그레이션 상태 확인
SELECT * FROM check_migration_status();

-- 2. RLS 정책 확인
SELECT * FROM check_rls_status();

-- 3. 함수 존재 확인
SELECT * FROM test_rls_functions();
```

### Phase 4: Admin 계정 마이그레이션

**TypeScript 마이그레이션 스크립트**:
```typescript
// migration-runner.ts
import { supabase } from '@/lib/supabase'

interface AdminMigrationInfo {
  admin_id: number
  email: string
  name: string
  role: string
  permissions: string[]
  temp_password: string
}

const migrateAdminAccounts = async () => {
  try {
    // 1. 마이그레이션 대상 조회
    const { data: adminsToMigrate, error: queryError } = await supabase
      .rpc('get_admins_for_migration')
    
    if (queryError) {
      console.error('Failed to get admins for migration:', queryError)
      return
    }

    console.log(`Found ${adminsToMigrate.length} admins to migrate`)

    // 2. 각 admin에 대해 Supabase Auth 계정 생성
    for (const admin of adminsToMigrate) {
      const migrationInfo = admin.migration_info as AdminMigrationInfo
      
      console.log(`Migrating admin: ${migrationInfo.email}`)

      // Supabase Auth 계정 생성
      const { data: authData, error: createError } = await supabase.auth.signUp({
        email: migrationInfo.email,
        password: migrationInfo.temp_password,
        options: {
          data: {
            admin_user_id: migrationInfo.admin_id,
            email: migrationInfo.email,
            role: migrationInfo.role,
            permissions: migrationInfo.permissions,
            full_name: migrationInfo.name,
          }
        }
      })

      if (createError) {
        console.error(`Failed to create auth user for ${migrationInfo.email}:`, createError)
        continue
      }

      if (!authData.user) {
        console.error(`No user returned for ${migrationInfo.email}`)
        continue
      }

      // admin_users 테이블에 연결
      const { error: linkError } = await supabase
        .rpc('link_admin_to_supabase_user', {
          p_admin_id: migrationInfo.admin_id,
          p_supabase_user_id: authData.user.id
        })

      if (linkError) {
        console.error(`Failed to link admin ${migrationInfo.admin_id}:`, linkError)
      } else {
        console.log(`✅ Successfully migrated admin: ${migrationInfo.email}`)
      }

      // 잠시 대기 (API 제한 방지)
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // 3. 마이그레이션 결과 확인
    const { data: finalStatus } = await supabase.rpc('check_migration_status')
    console.log('Final migration status:', finalStatus)

  } catch (error) {
    console.error('Migration failed:', error)
  }
}

// 실행
migrateAdminAccounts()
```

### Phase 5: 애플리케이션 테스트

**테스트 체크리스트**:
- [ ] 기존 admin 로그인 작동
- [ ] JWT 메타데이터 생성 확인
- [ ] RLS 정책으로 CUD 작업 가능
- [ ] 세션 자동 갱신 작동
- [ ] 로그아웃 정상 작동
- [ ] 권한 시스템 정상 작동

**테스트 코드**:
```typescript
// 디버깅용 테스트
const testAuthIntegration = async () => {
  // 1. 인증 상태 확인
  const authState = await authService.debugAuthState()
  console.log('Auth State:', authState)

  // 2. RLS 테스트 (로그인 후)
  try {
    const { data: members } = await supabase.from('members').select('count')
    console.log('✅ Members access successful:', members)
  } catch (error) {
    console.log('❌ Members access failed:', error)
  }

  // 3. JWT 메타데이터 확인
  const { data: { session } } = await supabase.auth.getSession()
  console.log('JWT Metadata:', session?.user?.user_metadata)
}
```

## ⚠️ 주의사항

### 실행 전 준비
1. **데이터베이스 백업** 필수
2. **Supabase Dashboard 접근** 권한 확인
3. **개발 환경**에서 먼저 테스트

### 실행 중 모니터링
1. **마이그레이션 로그** 확인
2. **에러 발생 시 즉시 중단**
3. **단계별 검증** 수행

### 실행 후 검증
1. **모든 admin 계정 마이그레이션** 확인
2. **CUD 작업 정상 동작** 테스트
3. **권한별 접근 제어** 테스트

## 🔄 롤백 계획

문제 발생 시:
1. Database 백업에서 복구
2. 기존 파일들 복원
3. Supabase Auth 설정 원복

## 📞 지원

마이그레이션 중 문제 발생 시 다음 정보와 함께 문의:
- 에러 메시지
- 실행한 단계
- 로그 파일

---

**마이그레이션 성공 후 정리**:
```sql
-- 임시 마이그레이션 함수들 정리
SELECT cleanup_migration_functions();
```

```bash
# 임시 파일들 정리
rm src/features/auth/services/authService.old.ts
rm src/features/auth/contexts/AuthContext.old.tsx
rm src/features/auth/services/authService.new.ts
rm src/features/auth/services/authService.jwt.ts
rm src/features/auth/contexts/AuthContext.jwt.tsx
```