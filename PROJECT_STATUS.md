# SSM-YOYANG 관리자 시스템 프로젝트 현황

## 📅 작업 일자: 2025-08-05 ~ 2025-08-06

## ✅ 완료된 작업 내역

### 1. 프로젝트 초기 설정
- Vite + React + TypeScript 프로젝트 구성
- 필수 라이브러리 설치 및 설정
  - React Router v6 (라우팅)
  - TanStack Query v5 (상태 관리)
  - Chakra UI v2 (UI 프레임워크)
  - Supabase (백엔드/데이터베이스)
  - React Icons (아이콘)

### 2. 프로젝트 구조
```
src/
├── components/          # 재사용 가능한 UI 컴포넌트
│   ├── common/         # 공통 컴포넌트 (Pagination)
│   └── layout/         # 레이아웃 컴포넌트 (Layout, Sidebar, Header)
├── features/           # 기능별 모듈
│   ├── auth/          # 인증 관련
│   ├── admin-users/   # 관리자 관리
│   ├── members/       # 회원 관리
│   ├── facilities/    # 시설 관리
│   ├── dashboard/     # 대시보드
│   └── monitoring/    # 모니터링
├── hooks/             # 커스텀 훅 (usePermission)
├── lib/               # 외부 라이브러리 설정 (supabase.ts, firebase.ts)
├── types/             # TypeScript 타입 정의
└── App.tsx            # 메인 앱 컴포넌트
```

### 3. 구현된 기능

#### 3.1 인증 시스템
- ✅ Supabase Auth 연동
- ✅ 로그인/로그아웃 기능
- ✅ AuthContext를 통한 전역 인증 상태 관리
- ✅ ProtectedRoute 컴포넌트로 인증 라우트 보호

#### 3.2 권한 관리 (RBAC)
- ✅ 3단계 권한 시스템
  - Master: 모든 권한
  - Operator: 설정된 권한만
  - Monitor: 읽기 전용
- ✅ usePermission 훅으로 권한 체크
- ✅ 권한별 UI 표시/숨김

#### 3.3 관리자 관리
- ✅ 관리자 목록 조회 (테이블 뷰)
- ✅ 관리자 추가/수정/삭제(비활성화)
- ✅ Operator 권한 세부 설정 UI
- ✅ 검색 및 필터링 (역할, 상태)

#### 3.4 회원 관리
- ✅ 회원 목록 조회 (페이지네이션)
- ✅ 회원 상세 정보 모달
- ✅ 회원 상태 변경 (활성/비활성/정지/대기)
- ✅ 검색 및 필터링
- ✅ CSV 내보내기 기능
- ✅ 통계 표시 (전체/활성/신규 가입)

#### 3.5 시설 관리
- ✅ 시설 목록 (카드 뷰/테이블 뷰 전환)
- ✅ 시설 CRUD 기능
- ✅ 시설 상세 정보 (탭 구조)
- ✅ 시설 정보 폼 (기본/연락처/운영 정보)
- ✅ 검색 및 필터링 (유형, 상태)
- ✅ 통계 표시
- ✅ 시설 유형 툴팁 추가 (2025-08-06)

#### 3.6 공통 컴포넌트
- ✅ 반응형 레이아웃 (사이드바, 헤더)
- ✅ 페이지네이션 컴포넌트
- ✅ 로딩 상태 처리 (Skeleton)
- ✅ 에러 처리 (Toast)

## 🔧 환경 설정

### Supabase 연결 정보
- `.env.local` 파일에 저장됨
- URL과 Anon Key 설정 완료

### 데이터베이스 테이블
1. **admin_users**: 관리자 계정
   - role: master/operator/monitor
   - permissions: JSON 형태의 권한 정보
   
2. **members**: 일반 회원
   - status: active/inactive/suspended/pending
   
3. **facilities_ssmn_basic_full**: 시설 정보
   - 기본 정보, 연락처, 운영시간 등

## 🚨 주의사항 및 해결된 이슈

### 1. Chakra UI 버전 호환성
- 초기에 v3를 설치했으나 import 에러 발생
- v2.8.2로 다운그레이드하여 해결
- framer-motion도 v10.16.0으로 조정

### 2. @chakra-ui/icons 대체
- ViewIcon, ViewOffIcon 대신 react-icons의 FiEye, FiEyeOff 사용

## 🚀 프로젝트 실행 방법

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 프리뷰
npm run preview
```

## 📝 다음 작업을 위한 참고사항

### 필요한 추가 작업
1. **Supabase 설정**
   - admin_users 테이블에 초기 관리자 계정 생성 필요
   - RLS(Row Level Security) 정책 설정 권장

2. **테스트 데이터**
   - 회원, 시설 등 샘플 데이터 추가 필요

3. **성능 최적화**
   - 이미지 업로드 기능 추가 시 최적화 필요
   - 대량 데이터 처리 시 가상화 고려

4. **추가 기능 제안**
   - 대시보드 실시간 통계
   - 활동 로그
   - 알림 기능
   - 다크 모드

### 개발 팁
- 새로운 기능 추가 시 features 폴더에 모듈별로 구성
- TanStack Query의 캐싱 활용으로 API 호출 최적화
- Chakra UI 컴포넌트 커스터마이징은 theme 설정 활용

## 📁 주요 파일 경로
- 인증: `/src/features/auth/`
- 관리자: `/src/features/admin-users/`
- 회원: `/src/features/members/`
- 시설: `/src/features/facilities/`
- 공통 컴포넌트: `/src/components/`
- API 서비스: 각 feature의 `services/` 폴더
- React Query 훅: 각 feature의 `hooks/` 폴더

## 🔄 2025-08-05 추가 작업 내역

### 1. 로그인 시스템 수정
- ✅ 실제 DB 테이블 구조에 맞게 인증 시스템 수정
  - `admin_users` 테이블이 `password_digest` 컬럼 사용 (Supabase Auth 미사용)
  - role 값이 'admin', 'super_admin'만 허용
- ✅ 커스텀 인증 서비스 구현
  - `/src/features/auth/services/authService.ts` 생성
  - RPC 함수 기반 비밀번호 검증
- ✅ 관련 파일 업데이트
  - `AuthContext.tsx`: 커스텀 인증 사용하도록 수정
  - `database.types.ts`: 실제 테이블 구조 반영
  - `usePermission.ts`: 새로운 role 체계 적용
- ✅ SQL 스크립트 생성
  - `/src/scripts/create-auth-function.sql`: 비밀번호 검증 RPC 함수
  - `/src/scripts/setup-admin.sql`: 초기 관리자 계정 생성
  - `/README_LOGIN_SETUP.md`: 로그인 설정 가이드

### 2. 시설 관리 테이블 연동 작업 (완료)
- ✅ 테이블 구조 분석
  - Primary Key: `admin_code` (기존 `id`에서 변경)
  - 관련 테이블: 
    - `facilities_ssmn_basic_full` (기본 정보)
    - `facilities_ssmn_etc_nonbenefit` (비급여 항목)
    - `facilities_ssmn_etc_program` (프로그램 정보)
- ✅ 분석용 SQL 생성
  - `/src/scripts/check-facility-tables.sql`
- ✅ database.types.ts 수정
  - facilities_ssmn_basic_full: id → admin_code, phone 필드 추가
  - facilities_ssmn_etc_nonbenefit, facilities_ssmn_etc_program 타입 추가
- ✅ facilityService.ts 수정
  - getFacilityById → getFacilityByAdminCode
  - 모든 CRUD 작업 admin_code 기반으로 변경
  - generateAdminCode() 메서드 추가 (날짜 기반 고유 코드 생성)
- ✅ 시설 관리 컴포넌트들 수정
  - FacilityTable: key prop을 admin_code로 변경
  - FacilityDetailModal: 시설 ID → 시설 코드로 표시
  - FacilityFormModal: update 시 adminCode 사용
  - FacilitiesPage: selectedFacilityId → selectedFacilityAdminCode
  - phone 필드 처리: facility.phone || facility.contact_info?.phone 패턴 적용
- ✅ hooks/useFacilities.ts 수정
  - useFacility: adminCode 파라미터 사용
  - useUpdateFacility, useDeleteFacility: adminCode 기반 작업

### 3. MCP 설정 연동
- ✅ Claude Desktop MCP 설정을 CLI로 복사
  - `~/.config/claude/claude_desktop_config.json` 생성
  - Supabase MCP 서버 설정 포함

## 🔄 2025-08-06 추가 작업 내역

### 1. 모니터링 메뉴 구현
- ✅ Firebase 설정 및 연동
  - Firebase 프로젝트 설정 및 환경 변수 구성
  - Firestore 서비스 초기화
- ✅ 모니터링 라우팅 및 페이지 구조 생성
  - `/monitoring` 경로 추가
  - 활동 유형별 탭 구조 구현
- ✅ Firestore 실시간 데이터 연동
  - `ai_analysis_activity` 컬렉션: AI 분석 활동
  - `grade_evaluation_activity` 컬렉션: 요양등급 평가 활동
  - `consultation_activity` 컬렉션: 상담 전화 활동
  - `favorites_activity` 컬렉션: 즐겨찾기 활동
- ✅ 활동 유형별 모니터링 컴포넌트 구현
  - 실시간 데이터 표시
  - 회원 정보 및 시설 정보 연계
  - 타임스탬프 포맷팅
- ✅ React Query와 Firebase 통합
  - 실시간 구독 관리
  - 자동 갱신 설정

### 2. 대시보드 리팩토링
- ✅ 실제 데이터 연동
  - Supabase 및 Firestore 데이터 통합
  - 실시간 통계 표시
- ✅ 서비스 레이어 구현
  - `dashboardService.ts`: 통계 데이터 집계
  - `useDashboard.ts`: React Query 훅
- ✅ 로딩 상태 및 에러 처리 개선

### 3. UI/UX 개선
- ✅ 타이틀 변경
  - "SSM-YOYANG" → "순시미네 관리자"
  - 로그인 페이지, 사이드바, HTML 타이틀 모두 변경
- ✅ 시설 유형 코드 설명 툴팁 추가
  - 시설 유형별 한글 설명 제공
  - 사용자 편의성 향상
- ✅ 연락처 표시 형식 개선
  - 전화번호 포맷팅 추가

### 4. 관리자 생성 기능 수정
- ✅ 권한 제한 구현
  - super_admin만 관리자 생성 가능
  - admin 역할은 읽기/수정만 가능
- ✅ RPC 함수 방식으로 변경
  - Supabase Auth Admin API → password_digest 방식
  - bcrypt 해시 사용하는 create_admin_user 함수 구현
- ✅ RLS 정책 추가
  - admin_users 테이블 보안 강화
- ✅ permissions 컬럼 이슈 해결
  - 데이터베이스에 없는 컬럼 참조 제거
  - 프론트엔드 코드 수정 완료
  - TypeScript 빌드 오류 해결

### 5. 배포 환경 설정
- ✅ Vercel 배포 연동
- ✅ GitHub 메인 브랜치 자동 배포 설정
- ✅ 빌드 오류 수정 및 최적화

## 📌 다음 작업 필요 사항

### 1. 관리자 생성 기능 활성화
- Supabase 대시보드에서 `README_ADMIN_USER_FIX.md`의 SQL 스크립트 실행 필요
- RLS 정책 검토 및 보안 강화

### 2. 추가 개선 사항
- 비급여 항목(facilities_ssmn_etc_nonbenefit) 관리 기능 구현
- 프로그램 정보(facilities_ssmn_etc_program) 관리 기능 구현
- 시설 상세 정보에서 관련 테이블 데이터 표시
- 권한 시스템 고도화 (별도 permissions 테이블 구현)

### 3. 성능 최적화
- 대량 데이터 로딩 시 가상화 적용
- 이미지 최적화 및 lazy loading
- 번들 사이즈 최적화 (현재 698KB)

### 4. 모니터링 기능 확장
- 활동 통계 및 분석 대시보드
- 실시간 알림 기능
- 활동 로그 내보내기

## 🔗 관련 문서
- SYSTEM_DESIGN.md - 시스템 설계서
- DEVELOPMENT_TASKS.md - 개발 태스크 리스트
- DEVELOPMENT_PROMPT.md - 개발 가이드라인
- README_LOGIN_SETUP.md - 로그인 설정 가이드
- README_ADMIN_USER_FIX.md - 관리자 생성 기능 수정 가이드