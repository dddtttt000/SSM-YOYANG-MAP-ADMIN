# SSM-YOYANG 관리자 시스템 개발 프롬프트

## 🎯 프로젝트 개요

당신은 이제 시니어 풀스택 개발자입니다. SSM-YOYANG 관리자 시스템을 개발하는 것이 목표입니다.

### 기술 스택
- **Frontend**: React 18 + TypeScript
- **State Management**: TanStack Query v5
- **Database**: Supabase (PostgreSQL)
- **UI**: Chakra UI 또는 Tailwind CSS
- **Auth**: Supabase Auth
- **Routing**: React Router v6
- **Build**: Vite

### 데이터베이스 정보
- **URL**: https://gfclxscgsoyochbnzipo.supabase.co
- **Anon Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmY2x4c2Nnc295b2NoYm56aXBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MjgwMDcsImV4cCI6MjA2OTUwNDAwN30.PiNDlLEG_IerDSWg8VVk28vfR8yTvhknDiw4Lq5h0K0
- **Service Role Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmY2x4c2Nnc285b2NoYm56aXBvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzkyODAwNywiZXhwIjoyMDY5NTA0MDA3fQ.3EcR9S2lTGBN_ASFTzMXHckxSWS6YPS8_CRsKJ28fhI

## 📋 핵심 요구사항

### 1. 권한 시스템 (RBAC)
```typescript
// 권한 레벨
- master: 모든 테이블 CRUD 권한
- operator: 허가된 테이블만 CRUD 권한
- monitor: 모든 테이블 읽기 전용
```

### 2. 주요 기능
1. **관리자 관리** (admin_users)
   - 관리자 계정 CRUD
   - 역할 및 권한 설정
   - 활성/비활성 관리

2. **회원 조회** (members)
   - 회원 목록 조회
   - 상세 정보 확인
   - 검색 및 필터링

3. **시설 관리** (facilities_ssmn_basic_full)
   - 시설 목록 조회
   - 시설 정보 CRUD
   - 상세 정보 관리

## 🛠️ 개발 가이드라인

### 코드 스타일
```typescript
// 컴포넌트 구조 예시
interface FacilityCardProps {
  facility: Facility;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

const FacilityCard: React.FC<FacilityCardProps> = ({ 
  facility, 
  onEdit, 
  onDelete,
  canEdit = false,
  canDelete = false 
}) => {
  // 권한 체크
  const { user } = useAuth();
  const { hasPermission } = usePermission();
  
  const handleEdit = () => {
    if (hasPermission('facilities', 'update')) {
      onEdit?.(facility.id);
    }
  };
  
  return (
    // UI 구현
  );
};
```

### Supabase 쿼리 패턴
```typescript
// TanStack Query와 Supabase 통합
export const useFacilities = (filters?: FacilityFilters) => {
  return useQuery({
    queryKey: ['facilities', filters],
    queryFn: async () => {
      let query = supabase
        .from('facilities_ssmn_basic_full')
        .select('*');
      
      if (filters?.type) {
        query = query.eq('facility_type', filters.type);
      }
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5분
  });
};
```

### 권한 체크 패턴
```typescript
// 권한 체크 훅
export const usePermission = () => {
  const { user } = useAuth();
  
  const hasPermission = useCallback((resource: string, action: string) => {
    if (!user) return false;
    
    // Master는 모든 권한
    if (user.role === 'master') return true;
    
    // Monitor는 읽기만 가능
    if (user.role === 'monitor') return action === 'read';
    
    // Operator는 설정된 권한 확인
    if (user.role === 'operator') {
      return user.permissions?.some(
        p => p.resource === resource && p.actions.includes(action)
      );
    }
    
    return false;
  }, [user]);
  
  return { hasPermission };
};
```

## 🚀 개발 진행 순서

### Step 1: 프로젝트 초기화
```bash
# 프로젝트 생성
npm create vite@latest ssm-yoyang-admin -- --template react-ts

# 의존성 설치
cd ssm-yoyang-admin
npm install @supabase/supabase-js @tanstack/react-query react-router-dom
npm install @chakra-ui/react @emotion/react @emotion/styled framer-motion

# 개발 서버 실행
npm run dev
```

### Step 2: Supabase 설정
1. `src/lib/supabase.ts` 파일 생성
2. 환경 변수 설정
3. 타입 생성 및 설정

### Step 3: 라우팅 및 레이아웃
1. React Router 설정
2. 보호된 라우트 구현
3. 레이아웃 컴포넌트 생성

### Step 4: 인증 시스템
1. 로그인 페이지 구현
2. 인증 상태 관리
3. 권한 체크 시스템

### Step 5: 기능 개발
1. 관리자 관리 기능
2. 회원 조회 기능
3. 시설 관리 기능

## 💡 추가 프롬프트 예시

### 컴포넌트 생성 요청
"시설 목록을 표시하는 FacilityList 컴포넌트를 만들어주세요. 다음 기능이 필요합니다:
- 그리드 레이아웃으로 카드 표시
- 각 카드에는 시설명, 주소, 상태 표시
- 권한에 따라 수정/삭제 버튼 표시
- 페이지네이션 지원
- Chakra UI 사용"

### API 함수 생성 요청
"facilities 테이블을 위한 CRUD API 함수들을 만들어주세요:
- getFacilities: 목록 조회 (필터, 정렬, 페이지네이션)
- getFacility: 상세 조회
- createFacility: 생성
- updateFacility: 수정
- deleteFacility: 삭제
TanStack Query 훅도 함께 만들어주세요."

### 권한 체크 구현 요청
"ProtectedRoute 컴포넌트를 만들어주세요:
- 로그인 여부 체크
- 역할별 접근 제어
- 권한 없으면 리다이렉트
- 로딩 상태 처리"

## 🔍 디버깅 팁

### Supabase 에러 처리
```typescript
const { data, error } = await supabase
  .from('table')
  .select('*');

if (error) {
  console.error('Supabase error:', error);
  // 에러 타입별 처리
  if (error.code === '42501') {
    // 권한 에러
  }
}
```

### React Query 디버깅
```typescript
// React Query Devtools 추가
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// App.tsx에 추가
<ReactQueryDevtools initialIsOpen={false} />
```

## 📚 참고 자료

- [Supabase 문서](https://supabase.com/docs)
- [TanStack Query 문서](https://tanstack.com/query/latest)
- [Chakra UI 문서](https://chakra-ui.com)
- [React Router 문서](https://reactrouter.com)

## 🎨 UI/UX 가이드라인

### 색상 팔레트
- Primary: 청색 계열 (#3182CE)
- Success: 녹색 계열 (#38A169)
- Warning: 노란색 계열 (#D69E2E)
- Danger: 빨간색 계열 (#E53E3E)

### 레이아웃 원칙
- 사이드바 네비게이션
- 반응형 디자인
- 카드 기반 UI
- 일관된 여백과 간격

### 인터랙션 패턴
- 로딩 상태 표시
- 에러 메시지 표시
- 성공 토스트 알림
- 확인 다이얼로그