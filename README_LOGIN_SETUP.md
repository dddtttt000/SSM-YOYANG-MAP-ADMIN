# 로그인 설정 가이드

## 문제 원인
시스템이 `admin_users` 테이블의 `password_digest` 컬럼을 사용하는 커스텀 인증 방식을 사용합니다.
Supabase Auth가 아닌 별도의 인증 시스템입니다.

## 해결 방법

### 1단계: RPC 함수 생성 (필수)
Supabase SQL Editor에서 다음 파일의 SQL을 실행:
- `src/scripts/create-auth-function.sql` - 비밀번호 검증 함수 생성

### 2단계: 관리자 계정 생성
Supabase SQL Editor에서 다음 파일의 SQL을 실행:
- `src/scripts/setup-admin.sql` - 초기 관리자 계정 생성

### 기본 관리자 계정 정보
- 이메일: admin@example.com
- 비밀번호: admin123456
- 역할: super_admin (모든 권한)

## 추가 계정 생성 방법

### SQL로 새 관리자 추가
```sql
INSERT INTO admin_users (
  email,
  password_digest,
  name,
  role,
  is_active,
  created_at,
  updated_at
) VALUES (
  'new-admin@example.com',
  crypt('newpassword123', gen_salt('bf')),
  '새 관리자',
  'admin', -- admin 또는 super_admin 중 선택
  true,
  NOW(),
  NOW()
);
```

## 주의사항
- 실제 운영 환경에서는 강력한 비밀번호 사용
- 테스트 완료 후 기본 계정은 삭제 또는 비밀번호 변경 권장
- `password_digest`는 bcrypt로 해시되어 저장됨