-- 초기 관리자 계정 설정 SQL
-- Supabase SQL Editor에서 실행해주세요

-- 0. role 제약 조건 확인
SELECT DISTINCT role FROM admin_users ORDER BY role;

-- 1. 비밀번호 해시 생성을 위한 확장 기능 활성화 (이미 활성화되어 있을 수 있음)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. admin_users 테이블에 관리자 정보 추가
-- role 값은 실제 테이블의 제약 조건에 맞게 수정 필요
-- 일반적으로: 'admin', 'user', 'superadmin' 등이 사용됨
INSERT INTO admin_users (
  email,
  password_digest,
  name,
  role,
  is_active,
  created_at,
  updated_at
) VALUES (
  'admin@example.com',
  crypt('admin123456', gen_salt('bf')), -- bcrypt로 비밀번호 해시
  '시스템 관리자',
  'super_admin', -- 최고 관리자 권한
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  password_digest = EXCLUDED.password_digest,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- 3. 생성된 관리자 확인
SELECT id, email, name, role, is_active, created_at 
FROM admin_users 
WHERE email = 'admin@example.com';

-- 4. 로그인 테스트용 쿼리 (선택사항)
-- 비밀번호가 맞는지 확인
SELECT email, name, role 
FROM admin_users 
WHERE email = 'admin@example.com' 
  AND password_digest = crypt('admin123456', password_digest)
  AND is_active = true;