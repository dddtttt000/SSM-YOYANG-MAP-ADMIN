-- 중복된 admin_code 확인
SELECT admin_code, COUNT(*) as count
FROM facilities_ssmn_basic_full
GROUP BY admin_code
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- 전체 시설 수 확인
SELECT COUNT(*) as total_facilities FROM facilities_ssmn_basic_full;

-- admin_code가 NULL인 레코드 확인
SELECT COUNT(*) as null_admin_codes 
FROM facilities_ssmn_basic_full 
WHERE admin_code IS NULL;

-- admin_code가 빈 문자열인 레코드 확인
SELECT COUNT(*) as empty_admin_codes 
FROM facilities_ssmn_basic_full 
WHERE admin_code = '';