# Database Migration: Supabase Auth + JWT 메타데이터

## 🎯 목적
커스텀 세션 관리에서 Supabase Auth + JWT 메타데이터로 전환하여 RLS 정책 CUD 문제 해결

## 📁 마이그레이션 파일들

### 1. `migrate-admin-users-supabase.sql` (핵심 마이그레이션)
- `admin_users` 테이블에 `supabase_user_id` 컬럼 추가
- JWT 기반 인증 함수들 개선
- 기본 RLS 정책 업데이트

### 2. `complete-rls-migration.sql` (전체 RLS 완료)
- 모든 테이블에 RLS 정책 적용
- 동적 정책 적용 함수 제공
- 마이그레이션 검증 함수들

## 🚀 실행 순서

### Step 1: 기본 마이그레이션 실행
```sql
-- Supabase SQL Editor에서 실행
\i migrate-admin-users-supabase.sql
```

### Step 2: 전체 RLS 완료
```sql
-- Supabase SQL Editor에서 실행
\i complete-rls-migration.sql
```

### Step 3: 마이그레이션 검증
```sql
-- 1. RLS 상태 확인
SELECT * FROM check_rls_status();

-- 2. 함수 존재 확인
SELECT * FROM test_rls_functions();

-- 3. 컬럼 추가 확인
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'admin_users' AND column_name = 'supabase_user_id';
```

## 🔧 주요 변경 사항

### 데이터베이스 스키마
- ✅ `admin_users.supabase_user_id` 컬럼 추가 (UUID, auth.users FK)
- ✅ 인덱스 추가로 성능 최적화

### 함수 개선
- ✅ `get_current_admin_user_id()` - JWT에서 admin ID 추출
- ✅ `is_authenticated_user()` - JWT 기반 인증 확인
- ✅ `has_admin_permission()` - 역할 기반 권한 체크
- ✅ `debug_jwt_info()` - JWT 디버깅 정보

### RLS 정책
- ✅ `admin_users` - Super Admin만 관리, 자신 정보 조회 가능
- ✅ `members` - 모든 관리자 조회/수정 가능
- ✅ `announcements` - 모든 관리자 CRUD 가능
- ✅ `questions` - 모든 관리자 CRUD 가능
- ✅ `facilities_*` - 모든 관리자 조회/수정 가능

## 🔍 JWT 메타데이터 구조

마이그레이션 후 JWT `user_metadata`는 다음과 같이 설정되어야 함:

```json
{
  "admin_user_id": 123,
  "email": "admin@example.com",
  "role": "super_admin",
  "permissions": ["members", "facilities", "admin-users"],
  "full_name": "관리자 이름"
}
```

## ⚠️ 주의사항

### 실행 전
1. 데이터베이스 백업 필수
2. 개발 환경에서 먼저 테스트
3. Supabase Dashboard 접근 권한 확인

### 실행 후
1. JWT 토큰 없이는 CUD 작업 불가능
2. 기존 localStorage 세션은 무효화됨
3. AuthService 코드 업데이트 필요

## 🧪 테스트 방법

### 1. 함수 테스트 (JWT 없이)
```sql
SELECT * FROM test_rls_functions();
-- jwt_exists: false 확인
```

### 2. RLS 정책 테스트 (JWT 있을 때)
```sql
SELECT * FROM check_current_auth_state();
-- is_authenticated: true 확인
```

### 3. 권한 테스트
```sql
-- Super Admin 권한 확인
SELECT has_admin_permission('super_admin');

-- 일반 Admin 권한 확인  
SELECT has_admin_permission('admin');
```

## 🔄 롤백 방법

만약 문제 발생 시:

```sql
-- 1. RLS 비활성화
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE members DISABLE ROW LEVEL SECURITY;
ALTER TABLE announcements DISABLE ROW LEVEL SECURITY;
ALTER TABLE questions DISABLE ROW LEVEL SECURITY;

-- 2. 추가된 컬럼 제거 (필요시)
ALTER TABLE admin_users DROP COLUMN IF EXISTS supabase_user_id;

-- 3. 함수 제거 (필요시)  
DROP FUNCTION IF EXISTS get_current_admin_user_id();
DROP FUNCTION IF EXISTS has_admin_permission(TEXT);
```

## 📊 성공 지표

✅ `admin_users.supabase_user_id` 컬럼 존재  
✅ 모든 핵심 테이블에 RLS 활성화  
✅ JWT 기반 인증 함수들 정상 작동  
✅ 권한별 정책 정상 적용  
✅ 마이그레이션 검증 함수들 정상 실행  

이 마이그레이션 완료 후 AuthService 코드 업데이트를 진행하여 전체 시스템을 통합해야 합니다.