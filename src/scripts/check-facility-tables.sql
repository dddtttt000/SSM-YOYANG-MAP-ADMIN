-- 시설 관련 테이블 구조 확인

-- 1. facilities_ssmn_basic_full 테이블 구조
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'facilities_ssmn_basic_full'
ORDER BY ordinal_position;

-- 2. facilities_ssmn_etc_nonbenefit 테이블 구조
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'facilities_ssmn_etc_nonbenefit'
ORDER BY ordinal_position;

-- 3. facilities_ssmn_etc_program 테이블 구조
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'facilities_ssmn_etc_program'
ORDER BY ordinal_position;

-- 4. 샘플 데이터 확인
SELECT admin_code, facility_name, facility_type, status 
FROM facilities_ssmn_basic_full 
LIMIT 5;

-- 5. admin_code가 Primary Key인지 확인
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'facilities_ssmn_basic_full'
    AND tc.constraint_type = 'PRIMARY KEY';