# SSM-YOYANG 관리자 시스템 개발 태스크 리스트

## 🚀 Phase 1: 프로젝트 초기 설정 (3-5일)

### 1.1 프로젝트 환경 구성
- [ ] Vite + React + TypeScript 프로젝트 생성
- [ ] ESLint, Prettier 설정
- [ ] 폴더 구조 설정
- [ ] 환경 변수 설정 (.env.local)

### 1.2 핵심 라이브러리 설치
```bash
# 핵심 의존성
npm install @supabase/supabase-js @tanstack/react-query react-router-dom
npm install @chakra-ui/react @emotion/react @emotion/styled framer-motion
# 또는 Tailwind CSS 선택 시
npm install -D tailwindcss postcss autoprefixer

# 개발 의존성
npm install -D @types/react @types/react-dom typescript
```

### 1.3 Supabase 설정
- [ ] Supabase 클라이언트 초기화
- [ ] 타입 생성 (supabase gen types)
- [ ] RLS 정책 설정
- [ ] 기본 테이블 생성 확인

### 1.4 기본 라우팅 구조
```typescript
// 라우트 구조
/login          - 로그인 페이지
/dashboard      - 대시보드
/admin-users    - 관리자 관리
/members        - 회원 관리
/facilities     - 시설 관리
```

## 🔐 Phase 2: 인증 시스템 구현 (5-7일)

### 2.1 로그인/로그아웃 기능
- [ ] 로그인 페이지 UI 구현
- [ ] Supabase Auth 연동
- [ ] JWT 토큰 관리
- [ ] 자동 로그인 기능

### 2.2 권한 관리 시스템
- [ ] useAuth 훅 구현
- [ ] usePermission 훅 구현
- [ ] ProtectedRoute 컴포넌트
- [ ] 역할별 메뉴 표시/숨김

### 2.3 권한 미들웨어
```typescript
// 권한 체크 예시
const canAccess = (user: AdminUser, resource: string, action: string) => {
  if (user.role === 'master') return true;
  if (user.role === 'monitor' && action === 'read') return true;
  if (user.role === 'operator') {
    return user.permissions.some(p => 
      p.resource === resource && p.actions.includes(action)
    );
  }
  return false;
};
```

## 👥 Phase 3: 관리자 관리 기능 (7-10일)

### 3.1 관리자 목록 페이지
- [ ] 테이블 컴포넌트 구현
- [ ] 페이지네이션 구현
- [ ] 검색 및 필터 기능
- [ ] 정렬 기능

### 3.2 관리자 CRUD
- [ ] 관리자 추가 모달/페이지
- [ ] 관리자 수정 기능
- [ ] 관리자 삭제 기능 (확인 다이얼로그)
- [ ] 권한 설정 UI (OPERATOR용)

### 3.3 TanStack Query 통합
```typescript
// Query 예시
const useAdminUsers = () => {
  return useQuery({
    queryKey: ['adminUsers'],
    queryFn: fetchAdminUsers,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

const useCreateAdminUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });
};
```

## 🏃 Phase 4: 회원 관리 기능 (5-7일)

### 4.1 회원 목록 조회
- [ ] 회원 테이블 컴포넌트
- [ ] 고급 검색 기능 (이름, 이메일, 전화번호)
- [ ] 상태별 필터링
- [ ] 엑셀 내보내기 기능

### 4.2 회원 상세 정보
- [ ] 회원 상세 모달/페이지
- [ ] 회원 활동 이력
- [ ] 회원 상태 변경 기능

## 🏢 Phase 5: 시설 관리 기능 (10-14일)

### 5.1 시설 목록 페이지
- [ ] 카드/테이블 뷰 전환
- [ ] 다중 필터 기능 (유형, 상태, 지역)
- [ ] 지도 뷰 (선택사항)
- [ ] 대량 작업 기능

### 5.2 시설 상세 정보
- [ ] 상세 정보 페이지 레이아웃
- [ ] 탭 구조 (기본정보, 상세정보, 운영시간 등)
- [ ] 이미지 갤러리
- [ ] 편의시설 태그 표시

### 5.3 시설 CRUD
- [ ] 시설 등록 폼 (다단계)
- [ ] 시설 정보 수정
- [ ] 시설 삭제 (권한 체크)
- [ ] 입력 유효성 검사

### 5.4 고급 기능
- [ ] 운영시간 설정 UI
- [ ] 편의시설 다중 선택
- [ ] 이미지 업로드 (Supabase Storage)
- [ ] 변경 이력 추적

## 📊 Phase 6: 대시보드 및 분석 (5-7일)

### 6.1 대시보드 구현
- [ ] 통계 카드 컴포넌트
- [ ] 차트 컴포넌트 (Chart.js 또는 Recharts)
- [ ] 최근 활동 위젯
- [ ] 빠른 작업 버튼

### 6.2 분석 기능
- [ ] 회원 가입 추이
- [ ] 시설 이용 통계
- [ ] 관리자 활동 로그
- [ ] 보고서 생성 기능

## 🎨 Phase 7: UI/UX 개선 (5-7일)

### 7.1 반응형 디자인
- [ ] 모바일 레이아웃 최적화
- [ ] 태블릿 뷰 조정
- [ ] 사이드바 접기/펼치기

### 7.2 사용성 개선
- [ ] 로딩 상태 표시
- [ ] 에러 처리 및 표시
- [ ] 토스트 알림
- [ ] 키보드 단축키

### 7.3 테마 및 스타일
- [ ] 다크 모드 지원 (선택사항)
- [ ] 브랜드 컬러 적용
- [ ] 애니메이션 효과
- [ ] 접근성 개선

## 🧪 Phase 8: 테스트 및 최적화 (7-10일)

### 8.1 테스트 구현
- [ ] 단위 테스트 (Vitest)
- [ ] 통합 테스트
- [ ] E2E 테스트 (Playwright)
- [ ] 성능 테스트

### 8.2 성능 최적화
- [ ] 번들 사이즈 최적화
- [ ] 이미지 최적화
- [ ] 쿼리 최적화
- [ ] 캐싱 전략 구현

### 8.3 보안 강화
- [ ] 보안 감사
- [ ] OWASP Top 10 체크
- [ ] 펜테스트 (선택사항)
- [ ] 보안 헤더 설정

## 🚀 Phase 9: 배포 준비 (3-5일)

### 9.1 빌드 및 배포
- [ ] 프로덕션 빌드 설정
- [ ] CI/CD 파이프라인 구성
- [ ] 환경별 설정 분리
- [ ] 배포 스크립트 작성

### 9.2 문서화
- [ ] API 문서 작성
- [ ] 사용자 매뉴얼
- [ ] 개발자 가이드
- [ ] 배포 가이드

### 9.3 모니터링
- [ ] 에러 추적 (Sentry)
- [ ] 성능 모니터링
- [ ] 사용자 분석
- [ ] 로그 수집

## 📝 추가 고려사항

### 선택적 기능
- [ ] 실시간 알림 (Supabase Realtime)
- [ ] 다국어 지원 (i18n)
- [ ] PWA 지원
- [ ] 오프라인 모드

### 기술적 부채 관리
- [ ] 코드 리뷰 프로세스
- [ ] 리팩토링 일정
- [ ] 의존성 업데이트 계획
- [ ] 기술 스택 재평가

## 🎯 예상 일정

- **총 개발 기간**: 약 8-10주
- **MVP 완성**: 6주
- **프로덕션 준비**: 2-4주

## 우선순위 매트릭스

### P0 (필수)
- 인증 시스템
- 권한 관리
- 기본 CRUD 기능

### P1 (중요)
- 검색 및 필터
- 페이지네이션
- 대시보드

### P2 (선택)
- 실시간 기능
- 고급 분석
- 다국어 지원