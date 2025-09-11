-- Admin Users 테이블에 Supabase Auth 연결을 위한 마이그레이션
-- Phase 1: Database 스키마 + RLS 수정

-- 1. admin_users 테이블에 supabase_user_id 컬럼 추가
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS supabase_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. supabase_user_id에 인덱스 추가 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_admin_users_supabase_user_id ON admin_users(supabase_user_id);

-- 3. 개선된 JWT 기반 인증 함수들
-- JWT에서 admin 사용자 정보를 추출하는 함수
CREATE OR REPLACE FUNCTION get_current_admin_user_id()
RETURNS INTEGER AS $$
DECLARE
    current_admin_id INTEGER;
    jwt_payload JSON;
    auth_user_id UUID;
BEGIN
    -- JWT 토큰 존재 확인
    IF auth.jwt() IS NULL THEN
        RETURN NULL;
    END IF;
    
    jwt_payload := auth.jwt();
    auth_user_id := (jwt_payload ->> 'sub')::uuid;
    
    -- 1. JWT user_metadata에서 admin_user_id 직접 추출 시도
    current_admin_id := (jwt_payload -> 'user_metadata' ->> 'admin_user_id')::integer;
    
    -- 2. admin_user_id가 없으면 supabase_user_id로 조회
    IF current_admin_id IS NULL AND auth_user_id IS NOT NULL THEN
        SELECT id INTO current_admin_id 
        FROM public.admin_users
        WHERE supabase_user_id = auth_user_id
          AND is_active = true;
    END IF;
    
    -- 3. 여전히 없으면 email로 조회 (fallback)
    IF current_admin_id IS NULL THEN
        SELECT id INTO current_admin_id 
        FROM public.admin_users
        WHERE email = jwt_payload ->> 'email'
          AND is_active = true;
    END IF;
    
    RETURN current_admin_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 개선된 인증 확인 함수
CREATE OR REPLACE FUNCTION is_authenticated_user()
RETURNS BOOLEAN AS $$
DECLARE
    current_admin_id INTEGER;
BEGIN
    -- JWT 토큰 존재 확인
    IF auth.jwt() IS NULL THEN
        RETURN false;
    END IF;
    
    -- 현재 admin 사용자 ID 획득
    current_admin_id := get_current_admin_user_id();
    
    -- 유효한 활성 관리자인지 확인
    RETURN current_admin_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE id = current_admin_id
          AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Admin 권한 체크 함수 (역할 기반)
CREATE OR REPLACE FUNCTION has_admin_permission(required_role TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    current_admin_id INTEGER;
    user_role TEXT;
BEGIN
    -- 기본 인증 확인
    IF NOT is_authenticated_user() THEN
        RETURN false;
    END IF;
    
    -- 특정 역할 검사가 필요하지 않으면 true 반환
    IF required_role IS NULL THEN
        RETURN true;
    END IF;
    
    -- 현재 사용자의 역할 확인
    current_admin_id := get_current_admin_user_id();
    
    SELECT role INTO user_role
    FROM public.admin_users
    WHERE id = current_admin_id;
    
    -- 역할 계층: super_admin > admin
    CASE required_role
        WHEN 'super_admin' THEN
            RETURN user_role = 'super_admin';
        WHEN 'admin' THEN
            RETURN user_role IN ('admin', 'super_admin');
        ELSE
            RETURN false;
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. created_by 자동 설정 함수 개선
CREATE OR REPLACE FUNCTION set_created_by_column()
RETURNS TRIGGER AS $$
DECLARE
    current_admin_id INTEGER;
BEGIN
    -- 현재 admin 사용자 ID 획득
    current_admin_id := get_current_admin_user_id();
    
    -- admin_user_id가 없으면 에러
    IF current_admin_id IS NULL THEN
        RAISE EXCEPTION 'Cannot determine admin user ID from JWT token';
    END IF;
    
    NEW.created_by := current_admin_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. JWT 토큰 디버깅을 위한 개선된 헬퍼 함수
CREATE OR REPLACE FUNCTION debug_jwt_info()
RETURNS JSON AS $$
DECLARE
    jwt_payload JSON;
    current_admin_id INTEGER;
BEGIN
    jwt_payload := auth.jwt();
    current_admin_id := get_current_admin_user_id();
    
    RETURN json_build_object(
        'jwt_exists', CASE WHEN jwt_payload IS NULL THEN false ELSE true END,
        'auth_user_id', jwt_payload ->> 'sub',
        'email', jwt_payload ->> 'email',
        'user_metadata', jwt_payload -> 'user_metadata',
        'admin_user_id_from_metadata', (jwt_payload -> 'user_metadata' ->> 'admin_user_id')::integer,
        'resolved_admin_user_id', current_admin_id,
        'is_authenticated', is_authenticated_user(),
        'timestamp', now()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. 기존 RLS 정책들을 새로운 함수로 업데이트
-- announcements 테이블 정책 업데이트
DROP POLICY IF EXISTS "관리자는 모든 공지사항 조회 가능" ON announcements;
DROP POLICY IF EXISTS "관리자는 공지사항 생성 가능" ON announcements;
DROP POLICY IF EXISTS "관리자는 공지사항 수정 가능" ON announcements;
DROP POLICY IF EXISTS "관리자는 공지사항 삭제 가능" ON announcements;

CREATE POLICY "관리자는 모든 공지사항 조회 가능" ON announcements
    FOR SELECT USING (is_authenticated_user());

CREATE POLICY "관리자는 공지사항 생성 가능" ON announcements
    FOR INSERT WITH CHECK (is_authenticated_user());

CREATE POLICY "관리자는 공지사항 수정 가능" ON announcements
    FOR UPDATE USING (is_authenticated_user());

CREATE POLICY "관리자는 공지사항 삭제 가능" ON announcements
    FOR DELETE USING (is_authenticated_user());

-- questions 테이블 정책 업데이트
DROP POLICY IF EXISTS "관리자는 모든 FAQ 조회 가능" ON questions;
DROP POLICY IF EXISTS "관리자는 FAQ 생성 가능" ON questions;
DROP POLICY IF EXISTS "관리자는 FAQ 수정 가능" ON questions;
DROP POLICY IF EXISTS "관리자는 FAQ 삭제 가능" ON questions;

CREATE POLICY "관리자는 모든 FAQ 조회 가능" ON questions
    FOR SELECT USING (is_authenticated_user());

CREATE POLICY "관리자는 FAQ 생성 가능" ON questions
    FOR INSERT WITH CHECK (is_authenticated_user());

CREATE POLICY "관리자는 FAQ 수정 가능" ON questions
    FOR UPDATE USING (is_authenticated_user());

CREATE POLICY "관리자는 FAQ 삭제 가능" ON questions
    FOR DELETE USING (is_authenticated_user());

-- 9. 다른 테이블들에 대한 기본 RLS 정책 설정
-- admin_users 테이블 (super_admin만 관리 가능)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super Admin만 모든 관리자 조회 가능" ON admin_users;
DROP POLICY IF EXISTS "Super Admin만 관리자 생성 가능" ON admin_users;
DROP POLICY IF EXISTS "Super Admin만 관리자 수정 가능" ON admin_users;
DROP POLICY IF EXISTS "Super Admin만 관리자 삭제 가능" ON admin_users;
DROP POLICY IF EXISTS "자신의 정보는 조회 가능" ON admin_users;

-- Super Admin은 모든 관리자 관리 가능
CREATE POLICY "Super Admin만 모든 관리자 조회 가능" ON admin_users
    FOR SELECT USING (has_admin_permission('super_admin'));

CREATE POLICY "Super Admin만 관리자 생성 가능" ON admin_users
    FOR INSERT WITH CHECK (has_admin_permission('super_admin'));

CREATE POLICY "Super Admin만 관리자 수정 가능" ON admin_users
    FOR UPDATE USING (has_admin_permission('super_admin'));

CREATE POLICY "Super Admin만 관리자 삭제 가능" ON admin_users
    FOR DELETE USING (has_admin_permission('super_admin'));

-- 자신의 정보는 일반 관리자도 조회 가능
CREATE POLICY "자신의 정보는 조회 가능" ON admin_users
    FOR SELECT USING (id = get_current_admin_user_id());

-- members 테이블 (모든 관리자가 관리 가능)
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "관리자는 모든 회원 조회 가능" ON members;
DROP POLICY IF EXISTS "관리자는 회원 수정 가능" ON members;

CREATE POLICY "관리자는 모든 회원 조회 가능" ON members
    FOR SELECT USING (is_authenticated_user());

CREATE POLICY "관리자는 회원 수정 가능" ON members
    FOR UPDATE USING (is_authenticated_user());

-- 회원은 일반적으로 앱에서 생성되므로 INSERT/DELETE 정책은 필요시 추가

-- 10. 마이그레이션 검증을 위한 테스트 함수
CREATE OR REPLACE FUNCTION test_rls_functions()
RETURNS JSON AS $$
BEGIN
    RETURN json_build_object(
        'debug_info', debug_jwt_info(),
        'functions_exist', json_build_object(
            'get_current_admin_user_id', 
                (SELECT EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'get_current_admin_user_id')),
            'is_authenticated_user', 
                (SELECT EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'is_authenticated_user')),
            'has_admin_permission', 
                (SELECT EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'has_admin_permission'))
        ),
        'column_added', 
            (SELECT EXISTS(SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'admin_users' AND column_name = 'supabase_user_id')),
        'timestamp', now()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 마이그레이션 완료 후 실행할 수 있는 테스트 쿼리
-- SELECT test_rls_functions();