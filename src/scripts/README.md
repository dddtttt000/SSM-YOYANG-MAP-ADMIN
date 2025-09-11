# Database Migration Scripts

이 디렉토리에는 중요한 데이터베이스 마이그레이션 스크립트들이 포함되어 있습니다.

## 핵심 마이그레이션 파일

### `migrate-admin-users-supabase.sql`
- Admin 사용자를 Supabase Auth와 연동하는 마이그레이션
- JWT 기반 인증 함수들 생성
- RLS 정책을 위한 헬퍼 함수들

### `complete-rls-migration.sql`  
- 모든 테이블에 대한 Row Level Security 정책 적용
- JWT 기반 권한 제어 시스템 구현

## 사용 방법

```bash
# Supabase Dashboard → SQL Editor에서 실행
# 1. 먼저 admin users 마이그레이션
\i migrate-admin-users-supabase.sql

# 2. RLS 정책 적용
\i complete-rls-migration.sql
```

## 주의사항

- 운영 환경에서 실행하기 전에 백업 필수
- 마이그레이션 후 이메일 인증이 완료된 admin 계정으로 테스트
- JWT 토큰이 제대로 생성되는지 확인 필요