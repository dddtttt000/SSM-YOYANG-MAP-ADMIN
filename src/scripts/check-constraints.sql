-- admin_users 테이블의 제약 조건 확인
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'admin_users'::regclass;

-- role 컬럼에 허용된 값 확인
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable,
    character_maximum_length
FROM information_schema.columns
WHERE table_name = 'admin_users' 
  AND column_name = 'role';

-- 기존 데이터의 role 값 확인
SELECT DISTINCT role 
FROM admin_users 
ORDER BY role;