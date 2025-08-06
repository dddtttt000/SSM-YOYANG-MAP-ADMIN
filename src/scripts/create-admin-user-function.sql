-- create_admin_user 함수 생성
-- 이 함수는 비밀번호를 bcrypt로 해시화하여 관리자를 생성합니다

CREATE OR REPLACE FUNCTION public.create_admin_user(
  p_email character varying,
  p_name character varying,
  p_role character varying,
  p_password character varying,
  p_permissions jsonb DEFAULT '[]'::jsonb
)
RETURNS TABLE(
  id bigint,
  email character varying,
  name character varying,
  role character varying,
  permissions jsonb,
  is_active boolean,
  created_at timestamp without time zone,
  updated_at timestamp without time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_password_digest text;
  v_new_user admin_users;
BEGIN
  -- 이메일 중복 확인
  IF EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = p_email) THEN
    RAISE EXCEPTION '이미 존재하는 이메일입니다: %', p_email;
  END IF;

  -- 비밀번호 해시 생성
  v_password_digest := crypt(p_password, gen_salt('bf'));

  -- 관리자 생성
  INSERT INTO admin_users (
    email,
    name,
    role,
    password_digest,
    permissions,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    p_email,
    p_name,
    p_role,
    v_password_digest,
    p_permissions,
    true,
    NOW(),
    NOW()
  ) RETURNING * INTO v_new_user;

  -- 결과 반환
  RETURN QUERY
  SELECT 
    v_new_user.id,
    v_new_user.email,
    v_new_user.name,
    v_new_user.role,
    v_new_user.permissions,
    v_new_user.is_active,
    v_new_user.created_at,
    v_new_user.updated_at;
END;
$function$;

-- 권한 부여
GRANT EXECUTE ON FUNCTION public.create_admin_user(character varying, character varying, character varying, character varying, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_admin_user(character varying, character varying, character varying, character varying, jsonb) TO anon;