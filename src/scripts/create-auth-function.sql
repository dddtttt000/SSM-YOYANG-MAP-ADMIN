-- 관리자 비밀번호 검증을 위한 RPC 함수 생성
-- Supabase SQL Editor에서 실행

CREATE OR REPLACE FUNCTION verify_admin_password(p_email VARCHAR, p_password VARCHAR)
RETURNS TABLE (
  id BIGINT,
  email VARCHAR,
  name VARCHAR,
  role VARCHAR,
  is_active BOOLEAN,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.email,
    a.name,
    a.role,
    a.is_active,
    a.last_login_at,
    a.created_at,
    a.updated_at
  FROM admin_users a
  WHERE a.email = p_email 
    AND a.password_digest = crypt(p_password, a.password_digest)
    AND a.is_active = true;
END;
$$;

-- 함수 실행 권한 부여
GRANT EXECUTE ON FUNCTION verify_admin_password(VARCHAR, VARCHAR) TO anon;
GRANT EXECUTE ON FUNCTION verify_admin_password(VARCHAR, VARCHAR) TO authenticated;