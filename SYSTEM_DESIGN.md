# SSM-YOYANG 관리자 시스템 설계서

## 1. 시스템 개요

### 1.1 프로젝트 목표
- 시설 관리 및 회원 관리를 위한 종합 관리자 대시보드 구축
- 역할 기반 접근 제어(RBAC) 시스템 구현
- 직관적이고 효율적인 관리자 인터페이스 제공

### 1.2 기술 스택
- **Frontend**: React 18+ with TypeScript
- **State Management**: TanStack Query v5 (React Query)
- **Database**: Supabase (PostgreSQL)
- **UI Framework**: Chakra UI 또는 Tailwind CSS
- **Authentication**: Supabase Auth
- **Routing**: React Router v6
- **Build Tool**: Vite

## 2. 데이터베이스 설계

### 2.1 핵심 테이블 구조

#### admin_users (관리자 계정)
```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('master', 'operator', 'monitor')),
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### members (일반 회원)
```sql
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### facilities_ssmn_basic_full (시설 정보)
```sql
CREATE TABLE facilities_ssmn_basic_full (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_name VARCHAR(255) NOT NULL,
  facility_type VARCHAR(100),
  address TEXT,
  contact_info JSONB,
  operating_hours JSONB,
  capacity INTEGER,
  amenities TEXT[],
  status VARCHAR(50) DEFAULT 'active',
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 3. 권한 시스템 설계 (RBAC)

### 3.1 역할 정의
```typescript
enum AdminRole {
  MASTER = 'master',     // 모든 테이블 CRUD 권한
  OPERATOR = 'operator', // 허가된 테이블만 CRUD 권한
  MONITOR = 'monitor'    // 모든 테이블 읽기 전용
}
```

### 3.2 권한 매트릭스
| 역할 | admin_users | members | facilities |
|------|-------------|---------|------------|
| MASTER | CRUD | CRUD | CRUD |
| OPERATOR | R | 권한에 따라 | 권한에 따라 |
| MONITOR | R | R | R |

### 3.3 권한 관리 시스템
```typescript
interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  permissions: Permission[]; // OPERATOR 역할용 세부 권한
  isActive: boolean;
}
```

## 4. 시스템 아키텍처

### 4.1 전체 구조
```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
├─────────────────────────────────────────────────────────┤
│                  TanStack Query Layer                    │
├─────────────────────────────────────────────────────────┤
│                   Supabase Client                        │
├─────────────────────────────────────────────────────────┤
│              Supabase (PostgreSQL + Auth)               │
└─────────────────────────────────────────────────────────┘
```

### 4.2 폴더 구조
```
src/
├── components/          # 재사용 가능한 UI 컴포넌트
│   ├── common/         # 공통 컴포넌트
│   ├── layout/         # 레이아웃 컴포넌트
│   └── forms/          # 폼 컴포넌트
├── features/           # 기능별 모듈
│   ├── auth/          # 인증 관련
│   ├── admin-users/   # 관리자 관리
│   ├── members/       # 회원 관리
│   └── facilities/    # 시설 관리
├── hooks/             # 커스텀 훅
│   ├── useAuth.ts
│   ├── usePermission.ts
│   └── queries/       # TanStack Query 훅
├── services/          # API 서비스
│   ├── supabase.ts
│   └── api/
├── types/             # TypeScript 타입 정의
├── utils/             # 유틸리티 함수
└── App.tsx

## 5. 주요 기능 설계

### 5.1 인증 시스템
- Supabase Auth를 활용한 로그인/로그아웃
- JWT 토큰 기반 인증
- 역할 기반 라우트 보호

### 5.2 관리자 관리 (admin_users)
- 관리자 목록 조회 (페이지네이션)
- 관리자 추가/수정/삭제 (MASTER만)
- 역할 및 권한 설정
- 활성/비활성 상태 관리

### 5.3 회원 관리 (members)
- 회원 목록 조회 및 검색
- 회원 상세 정보 조회
- 회원 상태 관리

### 5.4 시설 관리 (facilities)
- 시설 목록 조회 (필터링, 정렬, 검색)
- 시설 상세 정보 보기
- 시설 정보 수정 (권한에 따라)
- 시설 삭제 (권한에 따라)
- 신규 시설 등록 (권한에 따라)

## 6. API 설계

### 6.1 인증 API
```typescript
// 로그인
POST /auth/login
// 로그아웃
POST /auth/logout
// 토큰 갱신
POST /auth/refresh
```

### 6.2 관리자 API
```typescript
// 관리자 목록
GET /api/admin-users
// 관리자 상세
GET /api/admin-users/:id
// 관리자 생성
POST /api/admin-users
// 관리자 수정
PUT /api/admin-users/:id
// 관리자 삭제
DELETE /api/admin-users/:id
```

### 6.3 회원 API
```typescript
// 회원 목록
GET /api/members
// 회원 상세
GET /api/members/:id
```

### 6.4 시설 API
```typescript
// 시설 목록
GET /api/facilities
// 시설 상세
GET /api/facilities/:id
// 시설 생성
POST /api/facilities
// 시설 수정
PUT /api/facilities/:id
// 시설 삭제
DELETE /api/facilities/:id
```

## 7. 보안 고려사항

### 7.1 인증 및 권한
- Row Level Security (RLS) 활용
- API 레벨 권한 검증
- 프론트엔드 권한 체크

### 7.2 데이터 보호
- HTTPS 통신
- 민감 정보 암호화
- SQL Injection 방지
- XSS 방지

## 8. 성능 최적화

### 8.1 프론트엔드
- React.lazy를 활용한 코드 스플리팅
- TanStack Query의 캐싱 전략
- 이미지 최적화
- 번들 사이즈 최적화

### 8.2 백엔드
- 데이터베이스 인덱싱
- 쿼리 최적화
- 페이지네이션
- 캐싱 전략

## 9. 개발 로드맵

### Phase 1: 기초 설정 (1주)
- 프로젝트 초기 설정
- Supabase 연동
- 인증 시스템 구현
- 기본 라우팅 설정

### Phase 2: 핵심 기능 개발 (3주)
- 관리자 관리 기능
- 회원 조회 기능
- 시설 CRUD 기능
- 권한 시스템 구현

### Phase 3: UI/UX 개선 (1주)
- 대시보드 구현
- 반응형 디자인
- 사용성 개선
- 에러 처리

### Phase 4: 테스트 및 배포 (1주)
- 단위 테스트
- 통합 테스트
- 성능 최적화
- 배포 준비