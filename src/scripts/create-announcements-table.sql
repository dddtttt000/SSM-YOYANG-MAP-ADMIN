-- 공지사항 테이블 생성
CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_important BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by INTEGER REFERENCES admin_users(id) NOT NULL
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_announcements_is_active ON announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at);

-- updated_at 자동 업데이트를 위한 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at 트리거 생성
DROP TRIGGER IF EXISTS update_announcements_updated_at ON announcements;
CREATE TRIGGER update_announcements_updated_at
    BEFORE UPDATE ON announcements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- created_by 자동 설정을 위한 트리거 함수
CREATE OR REPLACE FUNCTION set_created_by_column()
RETURNS TRIGGER AS $$
DECLARE
    current_admin_id INTEGER;
    jwt_payload JSON;
BEGIN
    -- JWT 토큰 존재 확인
    IF auth.jwt() IS NULL THEN
        RAISE EXCEPTION 'JWT token is required for creating announcements';
    END IF;
    
    jwt_payload := auth.jwt();
    
    -- JWT에서 admin_user_id 추출 (user_metadata에서)
    current_admin_id := (jwt_payload -> 'user_metadata' ->> 'admin_user_id')::integer;
    
    -- admin_user_id가 없으면 최상위에서 시도
    IF current_admin_id IS NULL THEN
        current_admin_id := (jwt_payload ->> 'admin_user_id')::integer;
    END IF;
    
    -- admin_user_id가 여전히 없으면 email로 조회 시도
    IF current_admin_id IS NULL THEN
        SELECT id INTO current_admin_id 
        FROM public.admin_users
        WHERE email = jwt_payload ->> 'email'
          AND is_active = true;
    END IF;
    
    -- created_by 설정
    IF current_admin_id IS NULL THEN
        RAISE EXCEPTION 'Cannot determine admin user ID from JWT token';
    END IF;
    
    NEW.created_by := current_admin_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- created_by 트리거 생성
DROP TRIGGER IF EXISTS set_announcements_created_by ON announcements;
CREATE TRIGGER set_announcements_created_by
    BEFORE INSERT ON announcements
    FOR EACH ROW
    EXECUTE FUNCTION set_created_by_column();

-- JWT 토큰 디버깅을 위한 헬퍼 함수
CREATE OR REPLACE FUNCTION debug_jwt_info()
RETURNS JSON AS $$
BEGIN
    RETURN json_build_object(
        'jwt_exists', CASE WHEN auth.jwt() IS NULL THEN false ELSE true END,
        'user_id', auth.jwt() ->> 'sub',
        'email', auth.jwt() ->> 'email',
        'admin_user_id', auth.jwt() ->> 'admin_user_id',
        'user_metadata', auth.jwt() -> 'user_metadata',
        'full_jwt', auth.jwt()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 현재 사용자가 인증된 활성 사용자인지 확인하는 헬퍼 함수
CREATE OR REPLACE FUNCTION is_authenticated_user()
RETURNS BOOLEAN AS $$
DECLARE
    current_user_id INTEGER;
    jwt_payload JSON;
BEGIN
    -- JWT 토큰 존재 확인
    IF auth.jwt() IS NULL THEN
        RAISE LOG 'JWT token is NULL';
        RETURN false;
    END IF;
    
    jwt_payload := auth.jwt();
    RAISE LOG 'JWT payload: %', jwt_payload;
    
    -- JWT에서 admin_user_id 추출 (user_metadata에서)
    current_user_id := (jwt_payload -> 'user_metadata' ->> 'admin_user_id')::integer;
    RAISE LOG 'admin_user_id from user_metadata: %', current_user_id;
    
    -- admin_user_id가 없으면 최상위에서 시도
    IF current_user_id IS NULL THEN
        current_user_id := (jwt_payload ->> 'admin_user_id')::integer;
        RAISE LOG 'admin_user_id from root: %', current_user_id;
    END IF;
    
    -- admin_user_id가 여전히 없으면 email로 조회 시도
    IF current_user_id IS NULL THEN
        SELECT id INTO current_user_id 
        FROM public.admin_users
        WHERE email = jwt_payload ->> 'email'
          AND is_active = true;
        RAISE LOG 'admin_user_id from email lookup: %', current_user_id;
    END IF;
    
    -- 유효한 활성 관리자인지 확인
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE id = current_user_id
          AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 기존 정책들 삭제 (있을 경우)
DROP POLICY IF EXISTS "관리자는 모든 공지사항 조회 가능" ON announcements;
DROP POLICY IF EXISTS "관리자는 공지사항 생성 가능" ON announcements;
DROP POLICY IF EXISTS "관리자는 공지사항 수정 가능" ON announcements;
DROP POLICY IF EXISTS "관리자는 공지사항 삭제 가능" ON announcements;
DROP POLICY IF EXISTS "활성 공지사항은 모든 사용자 조회 가능" ON announcements;

-- RLS (Row Level Security) 정책 설정
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- 관리자만 모든 공지사항을 볼 수 있도록 정책 설정
CREATE POLICY "관리자는 모든 공지사항 조회 가능" ON announcements
    FOR SELECT USING (is_authenticated_user());

-- 관리자만 공지사항 생성 가능 (created_by는 트리거에서 자동 설정)
CREATE POLICY "관리자는 공지사항 생성 가능" ON announcements
    FOR INSERT WITH CHECK (is_authenticated_user());

-- 관리자만 공지사항 수정 가능
CREATE POLICY "관리자는 공지사항 수정 가능" ON announcements
    FOR UPDATE USING (is_authenticated_user());

-- 관리자만 공지사항 삭제 가능
CREATE POLICY "관리자는 공지사항 삭제 가능" ON announcements
    FOR DELETE USING (is_authenticated_user());

-- 활성 공지사항은 모든 사용자가 볼 수 있도록 정책 설정 (사용자 앱용)
CREATE POLICY "활성 공지사항은 모든 사용자 조회 가능" ON announcements
    FOR SELECT USING (is_active = true);
