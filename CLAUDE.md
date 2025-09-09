# CLAUDE.md

이 파일은 이 repository에서 code 작업할 때 Claude Code (claude.ai/code)에게 guidance를 제공합니다.

## Development Command들

### Development Server

- `npm run dev` - hot reload와 함께 development server 시작 (default mode)
- `npm run prod` - production configuration으로 development server 시작

### Build & Deployment

- `npm run build` - development용 build (TypeScript compilation + Vite build)
- `npm run build:prod` - optimization과 함께 production용 build

### Code Quality

- `npm run lint` - TypeScript rules로 ESLint 실행
- `npm run preview` - build된 application을 locally preview

### Testing

- `npm test` - 대화형 모드로 테스트 실행 (watch mode)
- `npm run test:run` - 한 번만 테스트 실행 (CI 환경용)
- `npm run test:coverage` - 테스트 커버리지 리포트 생성 (HTML, JSON, 텍스트)
- `npm run test:ui` - Vitest UI로 테스트 실행

#### 테스트 커버리지 리포트
- 커버리지 리포트는 `coverage/` 디렉토리에 생성됩니다
- `coverage/index.html`을 브라우저에서 열어 상세한 커버리지 리포트 확인 가능
- 제외된 파일: `node_modules/`, `src/test/`, `**/*.d.ts`, `src/scripts/`, `**/*.test.*`, `**/*.spec.*`

## Architecture 개요

이것은 Supabase를 backend로 사용하는 React + TypeScript admin system이며, Vite와 Chakra UI v2로 구축되었습니다.

### 주요 기술들

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Chakra UI v2 (호환성을 위해 특별히 v2.8.2)
- **State Management**: server state를 위한 TanStack Query v5
- **Backend**: Supabase (PostgreSQL + Auth)
- **Routing**: React Router v7
- **Styling**: Emotion + Chakra UI

### Feature-Based Architecture

application은 각 feature가 자체 포함된 feature-based structure를 따릅니다:

```
src/features/
├── auth/           # AuthContext를 가진 Authentication system
├── admin-users/    # Admin user management (CRUD + permissions)
├── members/        # CSV export를 가진 Member management
├── facilities/     # card/table view를 가진 Facility management
├── monitoring/     # Data monitoring table들
└── dashboard/      # Main dashboard
```

### Authentication & Authorization

- email/password로 Supabase Auth 사용
- 3단계 permission system: Master/Operator/Monitor
- AuthContext가 app 전체에 user state 제공
- ProtectedRoute component가 route protection 처리
- Admin user들은 `admin_users` table에 저장 (Supabase auth user가 아님)

### Data Management

- server state management와 caching을 위한 TanStack Query
- `src/lib/supabase.ts`에서 설정된 Supabase client
- `src/types/database.types.ts`에서 type-safe database type들
- 각 feature의 API call들을 처리하는 Services layer

### UI Pattern들

- custom theming을 가진 Chakra UI component들
- CRUD operation을 위한 modal-based form들
- pagination, filtering, sorting을 가진 Table component들
- 다른 data presentation을 위한 Card/Table view toggle들
- 일관된 loading state들과 error handling

## Environment 설정

### 필수 Environment Variable들

`.env.local` 생성:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Development 참고사항

- `./src`에 대해 설정된 path alias `@`
- `.prettierrc`에서 Prettier configuration (semicolon 없음, single quote, 120 print width)
- 모든 page component들에 구현된 lazy loading
- auto-open browser와 함께 port 3000에서 실행되는 development server

## 중요한 제약사항들

### Chakra UI Version

- 호환성 문제로 인해 Chakra UI v2.8.2 사용 필수 (v3 아님)
- Chakra UI styling을 위해 Emotion package들 필요

### Database Schema

- Admin user들은 Supabase auth user들과 별도로 관리됨
- 초기 admin은 Supabase dashboard에서 수동으로 생성해야 함
- Permission system은 database에 저장된 JSON array들 사용

### Code Quality Rule들

- TypeScript rule들로 설정된 ESLint
- build 전에 엄격한 TypeScript compilation 필요
- 일관성을 위해 모든 import들이 path alias (@/) 사용
- 가능하면 함수형 프로그래밍
- 주석은 최소화, 코드로 설명

## Git 커밋 규칙

- feat: 새로운 기능 추가
- fix: 버그 수정
- docs: 문서 수정
- style: 코드 포매팅 (기능 변경 없음)
- refactor: 코드 리팩토링 (기능 변경 없음)
- test: 테스트 추가 또는 수정
- chore: 빌드 프로세스 또는 보조 도구 변경

## 💡 권장사항

- 새로운 라이브러리 도입 전 팀 논의
- 성능 최적화는 측정 후 진행
