-- admin_users 테이블 RLS 활성화 및 정책 적용
-- 모든 admin 계정 마이그레이션 완료 후 안전하게 활성화

-- 1. admin_users 테이블에 RLS 활성화
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 2. 기존 정책들 정리 (혹시 있다면)
DROP POLICY IF EXISTS "Super Admin만 모든 관리자 조회 가능" ON admin_users;
DROP POLICY IF EXISTS "관리자는 자신의 정보만 조회 가능" ON admin_users;
DROP POLICY IF EXISTS "Super Admin만 관리자 정보 수정 가능" ON admin_users;
DROP POLICY IF EXISTS "관리자는 자신의 정보만 수정 가능" ON admin_users;
DROP POLICY IF EXISTS "Super Admin만 관리자 생성 가능" ON admin_users;
DROP POLICY IF EXISTS "Super Admin만 관리자 삭제 가능" ON admin_users;
DROP POLICY IF EXISTS "관리자 조회 정책" ON admin_users;
DROP POLICY IF EXISTS "관리자 수정 정책" ON admin_users;
DROP POLICY IF EXISTS "관리자 생성 정책" ON admin_users;
DROP POLICY IF EXISTS "관리자 삭제 정책" ON admin_users;

-- 3. 새로운 RLS 정책 생성

-- 조회 정책: Super Admin은 모든 관리자 조회 가능, 일반 관리자는 자신만 조회 가능
CREATE POLICY "관리자 조회 정책" ON admin_users
    FOR SELECT 
    USING (
        -- Super Admin은 모든 관리자 조회 가능
        has_admin_permission('super_admin') 
        OR 
        -- 일반 관리자는 자신의 정보만 조회 가능
        (is_authenticated_user() AND id = get_current_admin_user_id())
    );

-- 수정 정책: Super Admin은 모든 관리자 수정 가능, 일반 관리자는 자신만 수정 가능
CREATE POLICY "관리자 수정 정책" ON admin_users
    FOR UPDATE 
    USING (
        -- Super Admin은 모든 관리자 수정 가능
        has_admin_permission('super_admin')
        OR 
        -- 일반 관리자는 자신의 정보만 수정 가능
        (is_authenticated_user() AND id = get_current_admin_user_id())
    );

-- 생성 정책: Super Admin만 새 관리자 생성 가능
CREATE POLICY "관리자 생성 정책" ON admin_users
    FOR INSERT 
    WITH CHECK (has_admin_permission('super_admin'));

-- 삭제 정책: Super Admin만 관리자 삭제 가능 (단, 자기 자신은 삭제 불가)
CREATE POLICY "관리자 삭제 정책" ON admin_users
    FOR DELETE 
    USING (
        has_admin_permission('super_admin') 
        AND id != get_current_admin_user_id()  -- 자기 자신 삭제 방지
    );

-- 4. 정책 검증
SELECT 
    'admin_users RLS activation complete' as status,
    now() as completed_at,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'admin_users') as policies_created,
    (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admin_users') as rls_enabled;