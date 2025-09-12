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
- **공지사항 관리**: 사용자 공지사항 CRUD, 상태 토글, 필터링/검색
- **FAQ 관리**: 자주 묻는 질문 CRUD, 카테고리별 분류
- **서비스 문의 처리**: 고객 문의 조회, 상태 관리, 페이지네이션
- **데이터 모니터링**: Firebase 연동 실시간 데이터 분석, 통계 대시보드

## 🛠 기술 스택

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Framework**: Chakra UI v2.8.2
- **State Management**: TanStack Query v5.84.1
- **Routing**: React Router v7.7.1
- **Form Management**: React Hook Form v7.62.0
- **Backend**: Supabase (PostgreSQL)
- **Real-time Data**: Firebase v12.0.0 (Firestore)
- **Testing**: Vitest v3.2.4 + React Testing Library
- **Icons**: React Icons

## 📁 프로젝트 구조

```
src/
├── components/        # 공통 컴포넌트
├── features/          # 9개 기능 모듈
│   ├── auth/          # 인증 시스템
│   ├── admin-users/   # 관리자 관리  
│   ├── members/       # 회원 관리
│   ├── facilities/    # 시설 관리
│   ├── dashboard/     # 대시보드
│   ├── announcements/ # 공지사항 관리
│   ├── questions/     # FAQ 관리
│   ├── service-inquiries/ # 서비스 문의
│   └── monitoring/    # 데이터 모니터링
├── hooks/            # 커스텀 훅
├── lib/              # 외부 라이브러리 (Supabase + Firebase)
├── services/         # API 서비스 레이어
├── types/            # TypeScript 타입
├── utils/            # 유틸리티 함수
└── App.tsx           # 메인 앱
```

## 🔐 권한 시스템

| 역할 | 설명 | 권한 |
|------|------|------|
| Master | 마스터 관리자 | 모든 기능에 대한 전체 권한 |
| Operator | 운영 관리자 | 설정된 테이블/작업에 대한 권한 |
| Monitor | 모니터링 관리자 | 모든 데이터 읽기 전용 |

## 📝 초기 설정

### 환경 변수 설정
`.env.local` 파일에 다음 환경 변수들을 설정해주세요:

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Firebase (모니터링용)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

## 🧪 개발 스크립트

### 테스팅
```bash
npm test              # Vitest 대화형 모드
npm run test:run      # 한 번만 테스트 실행 (CI용)
npm run test:coverage # 테스트 커버리지 리포트 생성
npm run test:ui       # Vitest UI로 테스트 실행
```

### 빌드 & 개발
```bash
npm run dev           # 개발 서버 (development 모드)
npm run prod          # 개발 서버 (production 모드)
npm run build         # Development 빌드
npm run build:prod    # Production 최적화 빌드
npm run preview       # 빌드된 앱 미리보기
```

### 코드 품질
```bash
npm run lint          # ESLint 실행
npm run lint:strict   # ESLint 실행 (경고 0개)
```

## 🐛 알려진 이슈

- Chakra UI v3 호환성 문제로 v2.8.2 사용 중