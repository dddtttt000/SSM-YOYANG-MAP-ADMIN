-- 시설 유형 데이터 분포 확인 쿼리

-- 1. 시설 테이블의 facility_type 분포 확인
SELECT 
    facility_type,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM facility), 2) as percentage
FROM facility
GROUP BY facility_type
ORDER BY count DESC;

-- 2. NULL 값 확인
SELECT 
    COUNT(*) as total_facilities,
    COUNT(facility_type) as with_facility_type,
    COUNT(*) - COUNT(facility_type) as null_facility_types
FROM facility;

-- 3. 고유한 facility_type 값들 확인
SELECT DISTINCT facility_type
FROM facility
WHERE facility_type IS NOT NULL
ORDER BY facility_type;

-- 4. 시설 유형별 상세 정보 (상위 10개 시설)
SELECT 
    id,
    name,
    facility_type,
    created_at,
    updated_at
FROM facility
ORDER BY created_at DESC
LIMIT 10;

-- 5. 특정 시설 유형별 예시 데이터
SELECT 
    facility_type,
    MIN(name) as example_facility_name,
    COUNT(*) as type_count
FROM facility
WHERE facility_type IS NOT NULL
GROUP BY facility_type
ORDER BY type_count DESC;

-- 6. 시설 유형이 없는 시설들 확인
SELECT 
    id,
    name,
    created_at
FROM facility
WHERE facility_type IS NULL
LIMIT 20;

-- 7. 시설 유형별 생성 시간 분포
SELECT 
    facility_type,
    DATE(MIN(created_at)) as first_created,
    DATE(MAX(created_at)) as last_created,
    COUNT(*) as count
FROM facility
WHERE facility_type IS NOT NULL
GROUP BY facility_type
ORDER BY count DESC;