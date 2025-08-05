# SSM-YOYANG Admin System

React + TypeScript + Supabase를 기반으로 한 관리자 시스템

## 🚀 Quick Start

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env.local` 파일이 이미 설정되어 있음 (Supabase 연결 정보 포함)

### 3. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

## 📋 주요 기능

- **인증 시스템**: Supabase Auth 기반 로그인/로그아웃
- **권한 관리**: Master/Operator/Monitor 3단계 권한 시스템
- **관리자 관리**: 관리자 계정 CRUD 및 권한 설정
- **회원 관리**: 회원 조회, 상태 변경, CSV 내보내기
- **시설 관리**: 시설 정보 CRUD, 카드/테이블 뷰 전환

## 🛠 기술 스택

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Framework**: Chakra UI v2
- **State Management**: TanStack Query v5
- **Routing**: React Router v6
- **Backend**: Supabase (PostgreSQL)
- **Icons**: React Icons

## 📁 프로젝트 구조

```
src/
├── components/      # 공통 컴포넌트
├── features/        # 기능별 모듈
├── hooks/           # 커스텀 훅
├── lib/             # 외부 라이브러리 설정
├── types/           # TypeScript 타입
└── App.tsx          # 메인 앱

```

## 🔐 권한 시스템

| 역할 | 설명 | 권한 |
|------|------|------|
| Master | 마스터 관리자 | 모든 기능에 대한 전체 권한 |
| Operator | 운영 관리자 | 설정된 테이블/작업에 대한 권한 |
| Monitor | 모니터링 관리자 | 모든 데이터 읽기 전용 |

## 📝 초기 설정

### 관리자 계정 생성
Supabase 대시보드에서 `admin_users` 테이블에 직접 관리자 계정을 추가해야 합니다.

```sql
-- 예시: 마스터 관리자 추가
INSERT INTO admin_users (email, name, role, permissions, is_active)
VALUES ('admin@example.com', '관리자', 'master', '[]', true);
```

## 🐛 알려진 이슈

- Chakra UI v3 호환성 문제로 v2.8.2 사용 중
- 초기 관리자 계정은 수동으로 생성 필요

## 📚 추가 문서

- [프로젝트 현황](./PROJECT_STATUS.md)
- [시스템 설계서](./SYSTEM_DESIGN.md)
- [개발 태스크](./DEVELOPMENT_TASKS.md)
- [개발 가이드](./DEVELOPMENT_PROMPT.md)