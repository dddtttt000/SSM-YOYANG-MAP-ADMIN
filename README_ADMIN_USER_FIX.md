# 관리자 생성 기능 수정 가이드

## 문제
- `admin_users` 테이블에 `permissions` 컬럼이 존재하지 않음
- `create_admin_user` 함수가 존재하지 않는 컬럼을 참조하여 오류 발생

## 해결 방법

### 1. Supabase 대시보드에서 SQL 실행

다음 SQL을 Supabase 대시보드의 SQL Editor에서 실행하세요:

```sql
-- 기존 함수 삭제 (있을 경우)
DROP FUNCTION IF EXISTS public.create_admin_user(character varying, character varying, character varying, character varying, jsonb);

-- 새로운 함수 생성 (permissions 파라미터 제거)
CREATE OR REPLACE FUNCTION public.create_admin_user(
  p_email character varying,
  p_name character varying,
  p_role character varying,
  p_password character varying
)
RETURNS TABLE(
  id bigint,
  email character varying,
  name character varying,
  role character varying,
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
    is_active,
    created_at,
    updated_at
  ) VALUES (
    p_email,
    p_name,
    p_role,
    v_password_digest,
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
    v_new_user.is_active,
    v_new_user.created_at,
    v_new_user.updated_at;
END;
$function$;

-- 권한 부여
GRANT EXECUTE ON FUNCTION public.create_admin_user(character varying, character varying, character varying, character varying) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_admin_user(character varying, character varying, character varying, character varying) TO anon;
```

### 2. 프론트엔드 코드 수정 완료

이미 다음 파일들이 수정되었습니다:
- `/src/features/admin-users/services/adminUserService.ts`
  - `CreateAdminUserDto`에서 `permissions` 필드 제거
  - `UpdateAdminUserDto`에서 `permissions` 필드 제거
  - `createAdminUser` 메서드에서 `p_permissions` 파라미터 제거
  - `updateAdminUserPermissions` 메서드 주석 처리

### 3. 권한 관리

현재 권한 시스템은 role 기반으로만 작동합니다:
- `super_admin`: 모든 권한 (관리자 생성 포함)
- `admin`: 읽기, 수정 권한 (관리자 생성 불가)

향후 더 세밀한 권한 관리가 필요하면 별도의 permissions 테이블을 생성하여 구현할 수 있습니다.