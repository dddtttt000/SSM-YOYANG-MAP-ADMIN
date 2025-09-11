-- admin_users 테이블에 permissions 컬럼 추가 (향후 권한 시스템 확장용)
-- 이 스크립트는 권한 시스템을 구현할 때 실행

-- 1. permissions 컬럼 추가 (JSONB 타입으로 유연성 확보)
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]'::jsonb;

-- 2. permissions 컬럼에 인덱스 추가 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_admin_users_permissions ON admin_users USING GIN (permissions);

-- 3. 기존 사용자들에게 역할별 기본 권한 설정
UPDATE admin_users 
SET permissions = CASE 
  WHEN role = 'super_admin' THEN '["admin_management", "member_management", "facility_management", "monitoring", "announcements", "questions"]'::jsonb
  WHEN role = 'admin' THEN '["member_management", "facility_management", "monitoring", "announcements", "questions"]'::jsonb
  ELSE '[]'::jsonb
END
WHERE permissions = '[]'::jsonb OR permissions IS NULL;

-- 4. 권한 검증 함수 추가
CREATE OR REPLACE FUNCTION check_admin_permission(
  p_admin_id INTEGER,
  p_required_permission TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  user_permissions JSONB;
  user_role TEXT;
BEGIN
  -- 사용자 권한과 역할 조회
  SELECT permissions, role INTO user_permissions, user_role
  FROM admin_users 
  WHERE id = p_admin_id AND is_active = true;
  
  -- 사용자가 존재하지 않으면 false
  IF user_permissions IS NULL THEN
    RETURN false;
  END IF;
  
  -- super_admin은 모든 권한 보유
  IF user_role = 'super_admin' THEN
    RETURN true;
  END IF;
  
  -- 특정 권한 확인
  RETURN user_permissions ? p_required_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. 권한 관리 함수들
CREATE OR REPLACE FUNCTION add_admin_permission(
  p_admin_id INTEGER,
  p_permission TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE admin_users 
  SET permissions = permissions || jsonb_build_array(p_permission),
      updated_at = NOW()
  WHERE id = p_admin_id 
    AND is_active = true
    AND NOT (permissions ? p_permission);
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION remove_admin_permission(
  p_admin_id INTEGER,
  p_permission TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE admin_users 
  SET permissions = permissions - p_permission,
      updated_at = NOW()
  WHERE id = p_admin_id 
    AND is_active = true;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. 컬럼 추가 확인
SELECT 
  'permissions 컬럼 추가 완료' as status,
  EXISTS(
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'admin_users' 
    AND column_name = 'permissions'
  ) as column_exists,
  COUNT(*) as total_admins
FROM admin_users;