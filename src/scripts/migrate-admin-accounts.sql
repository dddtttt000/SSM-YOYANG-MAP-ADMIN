-- 기존 admin 계정들을 Supabase Auth로 마이그레이션하는 스크립트
-- 이 스크립트는 admin_users 테이블의 모든 활성 계정을 위한 Supabase Auth 사용자를 생성합니다.

-- 1. 마이그레이션용 임시 함수 생성
CREATE OR REPLACE FUNCTION migrate_admin_to_supabase_auth(
    p_admin_id INTEGER,
    p_email TEXT,
    p_name TEXT,
    p_role TEXT,
    p_permissions JSONB
) RETURNS JSON AS $$
DECLARE
    new_user_id UUID;
    temp_password TEXT;
    migration_result JSON;
BEGIN
    -- 임시 비밀번호 생성
    temp_password := 'temp_' || p_admin_id || '_' || extract(epoch from now());
    
    -- Supabase Auth 사용자 생성 (RPC 호출)
    -- 주의: 이 부분은 실제로는 애플리케이션 레벨에서 처리해야 합니다.
    -- SQL에서 직접 Supabase Auth API를 호출할 수 없기 때문입니다.
    
    -- 대신 마이그레이션 상태를 추적하는 정보를 반환
    migration_result := json_build_object(
        'admin_id', p_admin_id,
        'email', p_email,
        'name', p_name,
        'role', p_role,
        'permissions', p_permissions,
        'temp_password', temp_password,
        'status', 'ready_for_migration',
        'migration_needed', true
    );
    
    RETURN migration_result;
END;
$$ LANGUAGE plpgsql;

-- 2. 마이그레이션이 필요한 admin 사용자들 조회
CREATE OR REPLACE FUNCTION get_admins_for_migration()
RETURNS TABLE (
    admin_id INTEGER,
    email TEXT,
    name TEXT,
    role TEXT,
    permissions JSONB,
    is_active BOOLEAN,
    has_supabase_id BOOLEAN,
    migration_info JSON
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id as admin_id,
        a.email,
        a.name,
        a.role,
        a.permissions,
        a.is_active,
        (a.supabase_user_id IS NOT NULL) as has_supabase_id,
        migrate_admin_to_supabase_auth(
            a.id,
            a.email,
            a.name,
            a.role,
            a.permissions
        ) as migration_info
    FROM admin_users a
    WHERE a.is_active = true
    AND a.supabase_user_id IS NULL  -- 아직 Supabase Auth와 연결되지 않은 계정들
    ORDER BY a.id;
END;
$$ LANGUAGE plpgsql;

-- 3. 마이그레이션 후 연결 함수 (애플리케이션에서 Supabase user_id를 얻은 후 사용)
CREATE OR REPLACE FUNCTION link_admin_to_supabase_user(
    p_admin_id INTEGER,
    p_supabase_user_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    -- admin_users 테이블 업데이트
    UPDATE admin_users 
    SET supabase_user_id = p_supabase_user_id,
        updated_at = NOW()
    WHERE id = p_admin_id
    AND is_active = true;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    IF updated_count = 1 THEN
        RAISE NOTICE 'Successfully linked admin_id % to supabase_user_id %', p_admin_id, p_supabase_user_id;
        RETURN true;
    ELSE
        RAISE WARNING 'Failed to link admin_id % to supabase_user_id %', p_admin_id, p_supabase_user_id;
        RETURN false;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 4. 마이그레이션 상태 확인 함수
CREATE OR REPLACE FUNCTION check_migration_status()
RETURNS TABLE (
    total_admins INTEGER,
    migrated_admins INTEGER,
    pending_admins INTEGER,
    migration_percentage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_admins,
        COUNT(CASE WHEN supabase_user_id IS NOT NULL THEN 1 END)::INTEGER as migrated_admins,
        COUNT(CASE WHEN supabase_user_id IS NULL THEN 1 END)::INTEGER as pending_admins,
        ROUND(
            (COUNT(CASE WHEN supabase_user_id IS NOT NULL THEN 1 END) * 100.0 / COUNT(*)), 2
        ) as migration_percentage
    FROM admin_users
    WHERE is_active = true;
END;
$$ LANGUAGE plpgsql;

-- 5. 마이그레이션 정리 함수 (마이그레이션 완료 후 임시 함수들 제거)
CREATE OR REPLACE FUNCTION cleanup_migration_functions()
RETURNS VOID AS $$
BEGIN
    DROP FUNCTION IF EXISTS migrate_admin_to_supabase_auth(INTEGER, TEXT, TEXT, TEXT, JSONB);
    DROP FUNCTION IF EXISTS get_admins_for_migration();
    DROP FUNCTION IF EXISTS link_admin_to_supabase_user(INTEGER, UUID);
    DROP FUNCTION IF EXISTS check_migration_status();
    DROP FUNCTION IF EXISTS cleanup_migration_functions();
    
    RAISE NOTICE 'Migration functions cleaned up successfully';
END;
$$ LANGUAGE plpgsql;

-- 6. 마이그레이션 실행 가이드 (주석)
/*
마이그레이션 실행 단계:

1. 마이그레이션이 필요한 admin 사용자들 확인:
   SELECT * FROM get_admins_for_migration();

2. 마이그레이션 상태 확인:
   SELECT * FROM check_migration_status();

3. 애플리케이션에서 각 admin에 대해:
   - Supabase Auth.signUp() 호출
   - 성공 시 link_admin_to_supabase_user() 호출

4. 마이그레이션 완료 확인:
   SELECT * FROM check_migration_status();

5. 정리:
   SELECT cleanup_migration_functions();

예시 마이그레이션 코드 (TypeScript):

```typescript
const migrateAdminAccounts = async () => {
  // 1. 마이그레이션 대상 조회
  const { data: adminsToMigrate } = await supabase.rpc('get_admins_for_migration')
  
  for (const admin of adminsToMigrate) {
    const migrationInfo = admin.migration_info
    
    // 2. Supabase Auth 계정 생성
    const { data: authData, error } = await supabase.auth.admin.createUser({
      email: migrationInfo.email,
      password: migrationInfo.temp_password,
      email_confirm: true,
      user_metadata: {
        admin_user_id: migrationInfo.admin_id,
        email: migrationInfo.email,
        role: migrationInfo.role,
        permissions: migrationInfo.permissions,
        full_name: migrationInfo.name,
      }
    })
    
    if (error) {
      console.error(`Failed to create auth user for admin ${admin.admin_id}:`, error)
      continue
    }
    
    // 3. 연결
    const { error: linkError } = await supabase.rpc('link_admin_to_supabase_user', {
      p_admin_id: migrationInfo.admin_id,
      p_supabase_user_id: authData.user.id
    })
    
    if (linkError) {
      console.error(`Failed to link admin ${admin.admin_id}:`, linkError)
    } else {
      console.log(`Successfully migrated admin ${admin.admin_id}`)
    }
  }
}
```

주의사항:
- 이 마이그레이션은 관리자 권한이 필요합니다
- Supabase Dashboard에서 이메일 확인을 비활성화하거나, 임시 비밀번호를 사용자에게 안내해야 합니다
- 마이그레이션 후 사용자들은 새 비밀번호를 설정해야 할 수 있습니다
*/