# 댓글 관리 시스템 구현 계획서

> 📅 계획 수립일: 2025-09-17
> 🎯 예상 완료: 2025-10-29 (6주)
> 📋 담당: 개발팀
> 🔄 상태: 계획 단계

## 📊 프로젝트 개요

### 🎯 목표
기존 댓글 조회 중심의 시스템을 **완전한 댓글 관리 시스템**으로 확장하여 관리자의 효율적인 댓글 관리를 지원

### 📈 기대 효과
- **관리 효율성 300% 향상**: 일괄 처리 기능으로 관리 시간 단축
- **신고 처리 시간 80% 단축**: 자동화된 워크플로우 도입
- **사용자 만족도 향상**: 신속한 부적절 댓글 처리
- **데이터 기반 의사결정**: 관리 이력 추적 및 분석

---

## 🔍 현재 상황 분석

### ✅ 구현 완료 기능
- [x] 댓글 조회 (트리 구조, 작성자 정보)
- [x] 댓글 상태 업데이트 (숨김/활성)
- [x] 댓글 삭제 (기본 기능)
- [x] 신고된 댓글 조회
- [x] 댓글 통계 (좋아요 수)
- [x] 대댓글 트리 구조 생성

### 🚨 부족한 기능 (구현 대상)
- [ ] 관리자 댓글 일괄 관리
- [ ] 댓글 수정 기능 (관리자용)
- [ ] 댓글 신고 처리 워크플로우
- [ ] 대댓글 개별 관리
- [ ] 고급 검색 및 필터링
- [ ] 관리 이력 추적

### 📊 기술 스택
- **Frontend**: React 18 + TypeScript + Chakra UI v2
- **Backend**: Supabase (PostgreSQL + RLS)
- **State**: TanStack Query v5
- **Auth**: Supabase Auth + RLS 정책

---

## 🎯 핵심 요구사항

### 🔥 최우선 요구사항 (1-2주 내)

| 기능 | 설명 | 비즈니스 임팩트 | 기술 복잡도 |
|------|------|-----------------|-------------|
| **댓글 일괄 관리** | 체크박스 선택 후 일괄 숨김/삭제/복원 | 🔥 High | 🟡 Medium |
| **댓글 상세 정보** | 작성자, 게시글, 신고 현황 통합 view | 🔥 High | 🟢 Low |
| **신고 댓글 처리** | 신고 승인/반려, 처리 이력 관리 | 🔥 High | 🔴 High |

### 🟡 중요 요구사항 (2-4주 내)

| 기능 | 설명 | 비즈니스 임팩트 | 기술 복잡도 |
|------|------|-----------------|-------------|
| **댓글 검색 강화** | 작성자, 내용, 기간별 고급 검색 | 🟡 Medium | 🟡 Medium |
| **관리 이력 추적** | 관리자 액션 기록 및 감사 | 🟡 Medium | 🟡 Medium |

### 🟢 장기 요구사항 (1-2개월 내)

| 기능 | 설명 | 비즈니스 임팩트 | 기술 복잡도 |
|------|------|-----------------|-------------|
| **댓글 내용 수정** | 관리자가 부적절한 내용 직접 수정 | 🟢 Low | 🟡 Medium |
| **실시간 알림** | 신고/관리 필요 댓글 실시간 알림 | 🟢 Low | 🔴 High |

---

## 🗄️ 데이터베이스 확장 계획

### 📋 새로운 테이블 설계

#### comment_admin_actions (댓글 관리 이력)
```sql
CREATE TABLE comment_admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES community_comments_list(id) ON DELETE CASCADE,
  admin_id INTEGER NOT NULL REFERENCES admin_users(id),
  action_type VARCHAR(50) NOT NULL, -- 'hide', 'restore', 'edit', 'delete', 'bulk_hide', 'bulk_delete'
  reason TEXT, -- 관리 사유
  previous_content TEXT, -- 수정 전 내용 (수정 시에만)
  affected_count INTEGER DEFAULT 1, -- 일괄 작업 시 영향받은 댓글 수
  metadata JSONB, -- 추가 메타데이터 (필터 조건, 선택 기준 등)
  created_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_comment_admin_actions_comment_id ON comment_admin_actions(comment_id);
CREATE INDEX idx_comment_admin_actions_admin_id ON comment_admin_actions(admin_id);
CREATE INDEX idx_comment_admin_actions_created_at ON comment_admin_actions(created_at);
CREATE INDEX idx_comment_admin_actions_action_type ON comment_admin_actions(action_type);
```

#### comment_report_processing (신고 처리 이력)
```sql
CREATE TABLE comment_report_processing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES community_reports(id) ON DELETE CASCADE,
  comment_id UUID NOT NULL REFERENCES community_comments_list(id) ON DELETE CASCADE,
  admin_id INTEGER NOT NULL REFERENCES admin_users(id),
  action_taken VARCHAR(50) NOT NULL, -- 'approve', 'reject', 'pending'
  admin_reason TEXT, -- 관리자 처리 사유
  auto_action VARCHAR(50), -- 승인 시 자동 실행된 액션 ('hide', 'delete', 'none')
  processing_time_seconds INTEGER, -- 처리에 걸린 시간
  created_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_comment_report_processing_report_id ON comment_report_processing(report_id);
CREATE INDEX idx_comment_report_processing_admin_id ON comment_report_processing(admin_id);
CREATE INDEX idx_comment_report_processing_created_at ON comment_report_processing(created_at);
```

### 🔄 기존 테이블 확장

#### community_comments_list 확장
```sql
-- 관리자 관련 필드 추가
ALTER TABLE community_comments_list
ADD COLUMN admin_updated_at TIMESTAMP,
ADD COLUMN admin_updated_by INTEGER REFERENCES admin_users(id),
ADD COLUMN admin_reason TEXT, -- 관리자 액션 사유
ADD COLUMN edit_count INTEGER DEFAULT 0, -- 수정 횟수
ADD COLUMN last_edited_at TIMESTAMP; -- 마지막 수정 시간

-- 인덱스 추가
CREATE INDEX idx_comments_admin_updated_at ON community_comments_list(admin_updated_at);
CREATE INDEX idx_comments_admin_updated_by ON community_comments_list(admin_updated_by);
CREATE INDEX idx_comments_status_admin ON community_comments_list(status, admin_updated_by);
```

#### community_reports 확장
```sql
-- 신고 처리 상태 필드 추가
ALTER TABLE community_reports
ADD COLUMN processing_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
ADD COLUMN processed_at TIMESTAMP,
ADD COLUMN processed_by INTEGER REFERENCES admin_users(id),
ADD COLUMN admin_reason TEXT, -- 처리 사유
ADD COLUMN auto_action_taken VARCHAR(50); -- 자동 실행된 액션

-- 인덱스 추가
CREATE INDEX idx_reports_processing_status ON community_reports(processing_status);
CREATE INDEX idx_reports_processed_by ON community_reports(processed_by);
CREATE INDEX idx_reports_processed_at ON community_reports(processed_at);
```

---

## ⚙️ 백엔드 서비스 확장

### 📝 commentService.ts 신규 메서드

#### 🔥 Phase 1: 기본 관리 기능
```typescript
class CommentService {
  /**
   * 댓글 일괄 상태 업데이트
   * @param commentIds 대상 댓글 ID 배열
   * @param status 변경할 상태 ('active', 'hidden', 'deleted')
   * @param adminId 관리자 ID
   * @param reason 관리 사유
   */
  async bulkUpdateCommentStatus(
    commentIds: string[],
    status: 'active' | 'hidden' | 'deleted',
    adminId: number,
    reason?: string
  ): Promise<BulkUpdateResult>

  /**
   * 댓글 내용 수정 (관리자용)
   * @param commentId 댓글 ID
   * @param newContent 새로운 내용
   * @param adminId 관리자 ID
   * @param reason 수정 사유
   */
  async updateCommentContent(
    commentId: string,
    newContent: string,
    adminId: number,
    reason?: string
  ): Promise<void>

  /**
   * 댓글 관리 이력 조회
   * @param commentId 댓글 ID (선택사항)
   * @param adminId 관리자 ID (선택사항)
   * @param dateRange 기간 (선택사항)
   */
  async getCommentAdminActions(
    filters?: {
      commentId?: string
      adminId?: number
      dateRange?: { start: string; end: string }
      actionType?: string
    }
  ): Promise<CommentAdminAction[]>
}
```

#### 🟡 Phase 2: 신고 처리 시스템
```typescript
  /**
   * 신고 처리 (승인/반려)
   * @param reportId 신고 ID
   * @param action 처리 액션 ('approve', 'reject')
   * @param adminId 관리자 ID
   * @param reason 처리 사유
   * @param autoAction 승인 시 자동 실행할 액션 (선택사항)
   */
  async processCommentReport(
    reportId: string,
    action: 'approve' | 'reject',
    adminId: number,
    reason?: string,
    autoAction?: 'hide' | 'delete' | 'none'
  ): Promise<ReportProcessingResult>

  /**
   * 신고 일괄 처리
   * @param reportIds 신고 ID 배열
   * @param action 처리 액션
   * @param adminId 관리자 ID
   * @param reason 처리 사유
   */
  async bulkProcessReports(
    reportIds: string[],
    action: 'approve' | 'reject',
    adminId: number,
    reason?: string
  ): Promise<BulkReportProcessingResult>

  /**
   * 신고 통계 조회
   * @param dateRange 조회 기간
   * @param adminId 특정 관리자 (선택사항)
   */
  async getReportProcessingStats(
    dateRange?: { start: string; end: string },
    adminId?: number
  ): Promise<ReportProcessingStats>
```

#### 🟢 Phase 3: 고급 기능
```typescript
  /**
   * 고급 댓글 검색
   * @param filters 고급 필터 조건
   * @param pagination 페이지네이션 정보
   */
  async searchComments(
    filters: AdvancedCommentFilters,
    pagination?: PaginationOptions
  ): Promise<CommentSearchResult>


```

### 📋 새로운 타입 정의

#### 관리 관련 타입
```typescript
// types/comment-management.types.ts

export interface CommentAdminAction {
  id: string
  comment_id: string
  admin_id: number
  admin?: {
    id: number
    name: string
    email: string
  }
  action_type: 'hide' | 'restore' | 'edit' | 'delete' | 'bulk_hide' | 'bulk_delete'
  reason?: string
  previous_content?: string
  affected_count: number
  metadata?: Record<string, any>
  created_at: string
}

export interface BulkUpdateResult {
  success: boolean
  updated_count: number
  failed_count: number
  failed_comments?: {
    comment_id: string
    error: string
  }[]
  action_id: string // 관리 이력 ID
}

export interface ReportProcessingResult {
  success: boolean
  report_id: string
  comment_id: string
  action_taken: 'approve' | 'reject'
  auto_action_executed?: 'hide' | 'delete' | 'none'
  processing_id: string
}

export interface BulkReportProcessingResult {
  success: boolean
  processed_count: number
  failed_count: number
  results: ReportProcessingResult[]
}
```

#### 검색 및 필터링 타입
```typescript
export interface AdvancedCommentFilters extends CommentFilters {
  // 기존 필터 확장
  hasReports?: boolean
  reportCount?: { min?: number; max?: number }
  likesCount?: { min?: number; max?: number }

  // 작성자 관련
  authorKeyword?: string
  authorIds?: number[]

  // 내용 관련
  contentKeyword?: string
  contentLength?: { min?: number; max?: number }

  // 관리 관련
  adminActioned?: boolean
  adminId?: number
  lastActionDate?: { start?: string; end?: string }

  // 게시글 관련
  postIds?: string[]
  postCategories?: string[]

  // 고급 옵션
  hasChildren?: boolean // 대댓글이 있는 댓글만
  isReply?: boolean // 대댓글만
  sortBy?: 'created_at' | 'updated_at' | 'likes_count' | 'report_count'
  sortOrder?: 'asc' | 'desc'
}

export interface CommentSearchResult {
  comments: CommentWithExtendedInfo[]
  total_count: number
  total_pages: number
  current_page: number
  filters_applied: AdvancedCommentFilters
  search_time_ms: number
}

export interface CommentWithExtendedInfo extends CommunityCommentWithAuthor {
  // 확장 정보
  report_summary?: {
    total_reports: number
    pending_reports: number
    recent_report_date?: string
    most_common_reason?: string
  }
  admin_summary?: {
    last_action?: CommentAdminAction
    total_actions: number
    last_action_date?: string
  }
  post_info?: {
    id: string
    title: string
    category_1?: string
    author_nickname?: string
  }
  engagement_stats?: {
    likes_count: number
    replies_count: number
    views_count?: number
  }
}
```

#### 대시보드 및 통계 타입
```typescript

```

---

## 🎨 프론트엔드 컴포넌트 설계

### 📁 새로운 컴포넌트 구조

```
src/features/community/components/comments/
├── management/                          # 🆕 관리 기능 컴포넌트
│   ├── CommentManagementTable.tsx       # 관리자용 댓글 테이블
│   ├── CommentBulkActions.tsx           # 일괄 작업 컴포넌트
│   ├── CommentDetailModal.tsx           # 댓글 상세 모달
│   ├── CommentAdminHistory.tsx          # 관리 이력 표시
│   └── CommentFilters.tsx               # 고급 필터링
├── reports/                             # 🆕 신고 관리 컴포넌트
│   ├── CommentReportModal.tsx           # 신고 처리 모달
│   ├── ReportProcessingPanel.tsx        # 신고 처리 패널
│   ├── ReportBulkActions.tsx            # 신고 일괄 처리
│   └── ReportDashboard.tsx              # 신고 통계 대시보드
├── dashboard/                           # 🆕 관리 현황
│   ├── AdminActivityPanel.tsx           # 관리자 활동 현황
│   └── AdminActivityPanel.tsx           # 관리자 활동 패널
├── CommentList.tsx                      # 기존 (개선)
└── CommentItem.tsx                      # 기존 (개선)
```

### 🔧 기존 컴포넌트 개선 계획

#### CommentList.tsx 개선사항
```typescript
interface CommentListProps {
  postId: string
  managementMode?: boolean // 🆕 관리 모드 여부
  showBulkActions?: boolean // 🆕 일괄 작업 표시 여부
  onSelectionChange?: (selectedIds: string[]) => void // 🆕 선택 변경 콜백
}

// 새로운 기능들
- [ ] 체크박스 일괄 선택
- [ ] 페이지네이션 (무한 스크롤 대신)
- [ ] 가상화 (대용량 댓글 처리)
- [ ] 관리자 전용 정보 표시
- [ ] 빠른 액션 버튼 그룹
- [ ] 필터링 연동
```

#### CommentItem.tsx 개선사항
```typescript
interface CommentItemProps extends Existing {
  showAdminInfo?: boolean // 🆕 관리자 정보 표시 여부
  onQuickAction?: (action: string, commentId: string) => void // 🆕 빠른 액션
  isSelected?: boolean // 🆕 선택 상태
  onSelectionChange?: (selected: boolean) => void // 🆕 선택 변경
}

// 새로운 UI 요소들
- [ ] 신고 수 뱃지 (빨간색 알림)
- [ ] 관리 상태 뱃지 (관리자 액션 이력)
- [ ] 빠른 액션 버튼 (숨김/복원)
- [ ] 관리 이력 툴팁
- [ ] 위험도 인디케이터
```

### 🆕 핵심 신규 컴포넌트

#### 1. CommentManagementTable.tsx
```typescript
interface CommentManagementTableProps {
  filters?: AdvancedCommentFilters
  onFiltersChange?: (filters: AdvancedCommentFilters) => void
  showBulkActions?: boolean
}

// 주요 기능
- 고급 필터링과 연동된 댓글 테이블
- 일괄 선택 및 액션 실행
- 정렬, 페이지네이션
- 관리자 정보 및 통계 표시
- 신고 현황 및 위험도 표시
```

#### 2. CommentBulkActions.tsx
```typescript
interface CommentBulkActionsProps {
  selectedComments: string[]
  onBulkAction: (action: BulkAction, reason?: string) => Promise<void>
  loading?: boolean
}

interface BulkAction {
  type: 'hide' | 'restore' | 'delete' | 'export'
  label: string
  color: string
  icon: React.ComponentType
  requiresReason?: boolean
  confirmMessage?: string
}

// 제공할 일괄 액션들
const bulkActions: BulkAction[] = [
  {
    type: 'hide',
    label: '선택한 댓글 숨기기',
    color: 'yellow',
    icon: EyeOffIcon,
    requiresReason: true,
    confirmMessage: '선택한 댓글들을 숨기시겠습니까?'
  },
  {
    type: 'restore',
    label: '선택한 댓글 복원',
    color: 'green',
    icon: EyeIcon,
    requiresReason: false,
    confirmMessage: '선택한 댓글들을 복원하시겠습니까?'
  },
  // ... 더 많은 액션들
]
```

#### 3. CommentDetailModal.tsx
```typescript
interface CommentDetailModalProps {
  commentId: string
  isOpen: boolean
  onClose: () => void
  onAction?: (action: string, commentId: string) => void
}

// 모달에서 표시할 정보 섹션들
- 📝 댓글 기본 정보 (작성자, 내용, 작성일, 수정일)
- 📄 원 게시글 정보 및 바로가기 링크
- 🚨 신고 현황 (신고 수, 신고 사유, 신고자 정보)
- 👤 관리자 액션 이력 (시간순 타임라인)
- ⚡ 빠른 관리 액션 버튼들
- 📊 참여 통계 (좋아요, 답글 수)
- 🔗 관련 댓글들 (같은 작성자의 다른 댓글)
```

#### 4. CommentReportModal.tsx
```typescript
interface CommentReportModalProps {
  reportId: string
  commentId: string
  isOpen: boolean
  onClose: () => void
  onProcessed?: (result: ReportProcessingResult) => void
}

// 신고 처리 워크플로우 UI
1. 📋 신고 정보 표시
   - 신고자 정보, 신고 사유, 신고 날짜
   - 신고 설명 및 추가 정보

2. 📝 댓글 내용 검토
   - 원문 표시 (하이라이팅)
   - 컨텍스트 (전후 댓글들)

3. ⚖️ 처리 액션 선택
   - 승인 (자동 액션 선택 포함)
   - 반려 (사유 입력)
   - 보류 (추가 검토 필요)

4. 📄 처리 사유 입력
   - 승인/반려 사유
   - 향후 참고사항
```


---

## 🔐 RLS 정책 설계

### 📋 권한 매트릭스 (확장)

| 작업 | 일반 사용자 | 작성자 | admin | super_admin |
|------|-------------|--------|-------|-------------|
| **댓글 CRUD** |
| 댓글 조회 | 활성만 | 본인 모든 댓글 | 모든 댓글 | 모든 댓글 |
| 댓글 작성 | ✅ | ✅ | ❌ | ❌ |
| 댓글 수정 | ❌ | 본인만 (24시간 내) | ✅ 모든 댓글 | ✅ 모든 댓글 |
| 댓글 삭제 | ❌ | 본인만 | ❌ | ✅ 모든 댓글 |
| **관리 기능** |
| 댓글 숨김/복원 | ❌ | ❌ | ✅ | ✅ |
| 일괄 관리 | ❌ | ❌ | ✅ | ✅ |
| 내용 수정 | ❌ | ❌ | ✅ 제한적 | ✅ 전체 |
| **신고 관리** |
| 신고 처리 | ❌ | ❌ | ✅ | ✅ |
| 신고 통계 조회 | ❌ | ❌ | ✅ | ✅ |
| **관리 정보** |
| 관리 이력 조회 | ❌ | ❌ | ✅ 본인만 | ✅ 전체 |
| 대시보드 접근 | ❌ | ❌ | ✅ 제한적 | ✅ 전체 |

### 🛡️ RLS 정책 구현

#### 1. 댓글 조회 정책 (개선)
```sql
-- 기존 정책 삭제 후 재생성
DROP POLICY IF EXISTS "comment_select_policy" ON community_comments_list;

CREATE POLICY "comment_select_policy"
ON community_comments_list
FOR SELECT
TO public
USING (
  -- 활성 댓글은 누구나
  (status = 'active') OR
  -- 작성자 본인의 모든 댓글
  EXISTS (
    SELECT 1 FROM members
    WHERE id = community_comments_list.author_id
    AND social_id::text = auth.uid()::text
  ) OR
  -- 관리자는 모든 댓글
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE supabase_user_id = auth.uid()
    AND is_active = true
    AND role IN ('super_admin', 'admin')
  )
);
```

#### 2. 댓글 수정 정책 (세분화)
```sql
-- 기존 정책 삭제 후 재생성
DROP POLICY IF EXISTS "comment_update_policy" ON community_comments_list;

CREATE POLICY "comment_update_policy"
ON community_comments_list
FOR UPDATE
TO authenticated
USING (
  -- 작성자 본인 (24시간 내 수정 가능)
  (
    EXISTS (
      SELECT 1 FROM members
      WHERE id = community_comments_list.author_id
      AND social_id::text = auth.uid()::text
    )
    AND created_at > (NOW() - INTERVAL '24 hours')
  ) OR
  -- 관리자 (모든 수정 가능)
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE supabase_user_id = auth.uid()
    AND is_active = true
    AND role IN ('super_admin', 'admin')
  )
)
WITH CHECK (
  -- 동일한 조건으로 WITH CHECK 설정
  (
    EXISTS (
      SELECT 1 FROM members
      WHERE id = community_comments_list.author_id
      AND social_id::text = auth.uid()::text
    )
    AND created_at > (NOW() - INTERVAL '24 hours')
  ) OR
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE supabase_user_id = auth.uid()
    AND is_active = true
    AND role IN ('super_admin', 'admin')
  )
);
```

#### 3. 관리 이력 테이블 정책
```sql
-- comment_admin_actions 테이블 RLS 정책
ALTER TABLE comment_admin_actions ENABLE ROW LEVEL SECURITY;

-- 조회 정책: 관리자만 조회 가능
CREATE POLICY "admin_actions_select_policy"
ON comment_admin_actions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE supabase_user_id = auth.uid()
    AND is_active = true
    AND role IN ('super_admin', 'admin')
  )
);

-- 삽입 정책: 관리자만 기록 가능
CREATE POLICY "admin_actions_insert_policy"
ON comment_admin_actions
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE supabase_user_id = auth.uid()
    AND is_active = true
    AND role IN ('super_admin', 'admin')
    AND id = admin_id -- 본인의 액션만 기록 가능
  )
);
```

#### 4. 신고 처리 테이블 정책
```sql
-- comment_report_processing 테이블 RLS 정책
ALTER TABLE comment_report_processing ENABLE ROW LEVEL SECURITY;

-- 조회 정책: 관리자만 조회 가능
CREATE POLICY "report_processing_select_policy"
ON comment_report_processing
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE supabase_user_id = auth.uid()
    AND is_active = true
    AND role IN ('super_admin', 'admin')
  )
);

-- 삽입 정책: 관리자만 처리 기록 가능
CREATE POLICY "report_processing_insert_policy"
ON comment_report_processing
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE supabase_user_id = auth.uid()
    AND is_active = true
    AND role IN ('super_admin', 'admin')
    AND id = admin_id -- 본인의 처리만 기록 가능
  )
);
```

---

## 📅 개발 단계별 상세 계획

### 🚀 Phase 1: 기본 관리 기능 (2025-09-17 ~ 2025-09-30)

#### Week 1 (2025-09-17 ~ 2025-09-23): 백엔드 기반 구축
**Day 1-2 (9/17-9/18): 데이터베이스 확장**
- [ ] `comment_admin_actions` 테이블 생성
- [ ] `community_comments_list` 테이블 필드 추가
- [ ] 인덱스 생성 및 성능 최적화
- [ ] RLS 정책 수정 및 적용

**Day 3-5 (9/19-9/23): 서비스 레이어 확장**
- [ ] `bulkUpdateCommentStatus` 메서드 구현
- [ ] `updateCommentContent` 메서드 구현
- [ ] `getCommentAdminActions` 메서드 구현
- [ ] 관련 타입 정의 및 인터페이스 작성
- [ ] 단위 테스트 작성

#### Week 2 (2025-09-24 ~ 2025-09-30): 프론트엔드 기본 UI
**Day 1-3 (9/24-9/26): 기존 컴포넌트 개선**
- [ ] CommentList에 일괄 선택 체크박스 추가
- [ ] CommentItem에 관리 액션 버튼 추가
- [ ] 선택 상태 관리 훅 구현
- [ ] 관리자 정보 표시 UI 추가

**Day 4-5 (9/27-9/30): 신규 컴포넌트 구현**
- [ ] CommentBulkActions 컴포넌트 구현
- [ ] CommentDetailModal 기본 버전 구현
- [ ] 일괄 작업 처리 로직 연동
- [ ] 에러 처리 및 사용자 피드백

### 🔥 Phase 2: 신고 처리 시스템 (2025-10-01 ~ 2025-10-14)

#### Week 3 (2025-10-01 ~ 2025-10-07): 신고 처리 백엔드
**Day 1-2 (10/1-10/2): 신고 처리 데이터베이스**
- [ ] `comment_report_processing` 테이블 생성
- [ ] `community_reports` 테이블 확장
- [ ] 신고 처리 워크플로우 설계
- [ ] RLS 정책 추가

**Day 3-5 (10/3-10/7): 신고 처리 서비스**
- [ ] `processCommentReport` 메서드 구현
- [ ] `bulkProcessReports` 메서드 구현
- [ ] `getReportProcessingStats` 메서드 구현
- [ ] 자동 액션 실행 로직 구현
- [ ] 통합 테스트 작성

#### Week 4 (2025-10-08 ~ 2025-10-14): 신고 처리 UI
**Day 1-3 (10/8-10/10): 신고 관리 컴포넌트**
- [ ] CommentReportModal 구현
- [ ] ReportProcessingPanel 구현
- [ ] 신고 목록 및 상세 페이지 개선
- [ ] 신고 처리 워크플로우 UI

**Day 4-5 (10/11-10/14): 신고 처리 워크플로우 완성**
- [ ] ReportDashboard 기본 버전 구현
- [ ] 신고 처리 통계 차트
- [ ] 관리자 성과 지표 표시
- [ ] 실시간 업데이트 구현

### 📊 Phase 3: 고급 기능 및 최적화 (2025-10-15 ~ 2025-10-29)

#### Week 5 (2025-10-15 ~ 2025-10-21): 고급 검색 및 필터링
**Day 1-3 (10/15-10/17): 고급 검색 백엔드**
- [ ] `searchComments` 메서드 구현
- [ ] 복합 인덱스 최적화
- [ ] 전문 검색 기능 (PostgreSQL FTS)
- [ ] 검색 성능 벤치마킹

**Day 4-5 (10/18-10/21): 고급 필터링 UI**
- [ ] CommentFilters 고급 버전 구현
- [ ] 저장된 필터 기능
- [ ] 검색 히스토리 관리
- [ ] 필터 공유 기능

#### Week 6 (2025-10-22 ~ 2025-10-29): 최종 최적화 및 마무리
**Day 1-3 (10/22-10/24): 기능 완성도 향상**
- [ ] 고급 검색 기능 완성
- [ ] 관리 이력 추적 완성
- [ ] UI/UX 개선 및 최적화

**Day 4-5 (10/25-10/29): 성능 최적화 및 마무리**
- [ ] 대용량 데이터 처리 최적화
- [ ] 캐싱 전략 구현
- [ ] 로딩 성능 개선
- [ ] 전체 시스템 통합 테스트
- [ ] 사용자 문서 작성

---

## 🎯 성공 지표 및 검증 방법

### 📊 정량적 지표 (KPI)

#### 관리 효율성
- **일괄 작업 사용률**: 전체 관리 작업 중 70% 이상
- **평균 댓글 처리 시간**: 기존 대비 60% 단축 (5분 → 2분)
- **관리자 생산성**: 시간당 처리 댓글 수 300% 증가

#### 신고 처리 효율
- **신고 처리 완료 시간**: 24시간 내 처리율 90% 이상
- **신고 처리 정확도**: 재신고율 5% 이하
- **자동화 비율**: 단순 신고 80% 자동 처리

#### 시스템 성능
- **댓글 로딩 시간**: < 500ms (1000개 댓글 기준)
- **검색 응답 시간**: < 300ms (복합 조건 검색)
- **일괄 작업 처리 시간**: < 2초 (100개 댓글 기준)
- **대시보드 렌더링**: < 1초 (1개월 데이터 기준)

#### 사용자 만족도
- **관리자 만족도**: 설문조사 4.5/5 이상
- **시스템 오류율**: < 0.5% (모든 관리 작업 기준)
- **학습 곡선**: 신규 관리자 1시간 내 기본 기능 숙지

### 🔍 검증 방법론

#### 1. 단위 테스트 (Unit Tests)
```typescript
// 예시: commentService 테스트
describe('CommentService', () => {
  describe('bulkUpdateCommentStatus', () => {
    it('should update multiple comments status successfully', async () => {
      // Given
      const commentIds = ['id1', 'id2', 'id3']
      const status = 'hidden'
      const adminId = 1
      const reason = 'Inappropriate content'

      // When
      const result = await commentService.bulkUpdateCommentStatus(
        commentIds, status, adminId, reason
      )

      // Then
      expect(result.success).toBe(true)
      expect(result.updated_count).toBe(3)
      expect(result.failed_count).toBe(0)
    })
  })
})
```

#### 2. 통합 테스트 (Integration Tests)
```typescript
// 예시: 신고 처리 워크플로우 테스트
describe('Report Processing Workflow', () => {
  it('should complete full report processing cycle', async () => {
    // 1. 신고 생성
    const report = await createTestReport()

    // 2. 신고 처리 (승인)
    const result = await commentService.processCommentReport(
      report.id, 'approve', adminId, 'Valid report'
    )

    // 3. 자동 액션 확인
    expect(result.auto_action_executed).toBe('hide')

    // 4. 댓글 상태 확인
    const comment = await commentService.getCommentById(report.comment_id)
    expect(comment.status).toBe('hidden')

    // 5. 이력 기록 확인
    const actions = await commentService.getCommentAdminActions({
      commentId: report.comment_id
    })
    expect(actions).toHaveLength(1)
    expect(actions[0].action_type).toBe('hide')
  })
})
```

#### 3. E2E 테스트 (End-to-End Tests)
```typescript
// Playwright를 사용한 E2E 테스트 예시
test('Admin can bulk hide multiple comments', async ({ page }) => {
  // 1. 관리자 로그인
  await login(page, 'admin@test.com', 'password')

  // 2. 커뮤니티 관리 페이지 이동
  await page.goto('/community')

  // 3. 댓글 관리 탭 클릭
  await page.click('[data-testid="comments-tab"]')

  // 4. 여러 댓글 선택
  await page.check('[data-testid="comment-checkbox-1"]')
  await page.check('[data-testid="comment-checkbox-2"]')

  // 5. 일괄 숨기기 실행
  await page.click('[data-testid="bulk-hide-button"]')
  await page.fill('[data-testid="reason-input"]', 'Inappropriate content')
  await page.click('[data-testid="confirm-button"]')

  // 6. 성공 메시지 확인
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible()

  // 7. 댓글 상태 변경 확인
  await expect(page.locator('[data-testid="comment-1-status"]')).toHaveText('숨김')
  await expect(page.locator('[data-testid="comment-2-status"]')).toHaveText('숨김')
})
```

#### 4. 성능 테스트 (Performance Tests)
```typescript
// Jest를 사용한 성능 테스트 예시
describe('Performance Tests', () => {
  it('should handle bulk operations within time limit', async () => {
    // Given: 1000개 댓글 준비
    const commentIds = await createTestComments(1000)

    // When: 일괄 숨기기 실행
    const startTime = Date.now()
    await commentService.bulkUpdateCommentStatus(
      commentIds, 'hidden', adminId, 'Performance test'
    )
    const endTime = Date.now()

    // Then: 5초 이내 완료
    const processingTime = endTime - startTime
    expect(processingTime).toBeLessThan(5000)
  })

  it('should load dashboard within time limit', async () => {
    // Given: 1개월 치 데이터 준비
    await createTestDataForMonth()

    // When: 관리 이력 로드
    const startTime = Date.now()
    const actions = await commentService.getCommentAdminActions({
      dateRange: {
        start: '2025-01-01',
        end: '2025-01-31'
      }
    })
    const endTime = Date.now()

    // Then: 1초 이내 완료
    const loadTime = endTime - startTime
    expect(loadTime).toBeLessThan(1000
  })
})
```

#### 5. 사용자 테스트 (User Acceptance Tests)

**테스트 시나리오 예시:**

1. **시나리오 1: 일괄 댓글 관리**
   - 관리자가 문제 댓글 10개를 선택하여 한 번에 숨김 처리
   - 처리 시간 및 성공률 측정
   - 사용자 경험 피드백 수집

2. **시나리오 2: 신고 처리 워크플로우**
   - 신고된 댓글 검토 후 승인/반려 처리
   - 처리 과정의 직관성 평가
   - 필요한 정보 접근성 검증

3. **시나리오 3: 고급 검색 활용**
   - 특정 조건으로 문제 댓글 검색
   - 검색 결과의 정확성 및 유용성 평가
   - 필터 저장 및 재사용 기능 검증

### 📈 모니터링 및 추적

#### 실시간 모니터링 대시보드
```typescript
// 모니터링 지표 정의
interface MonitoringMetrics {
  // 성능 지표
  avg_response_time: number
  error_rate: number
  throughput: number

  // 비즈니스 지표
  daily_comments_processed: number
  daily_reports_resolved: number
  admin_productivity_score: number

  // 시스템 지표
  database_query_time: number
  cache_hit_rate: number
  memory_usage: number
}

// 알림 규칙
const alertRules = [
  {
    metric: 'avg_response_time',
    threshold: 1000, // 1초
    severity: 'warning'
  },
  {
    metric: 'error_rate',
    threshold: 1, // 1%
    severity: 'critical'
  },
  {
    metric: 'daily_reports_resolved',
    threshold: 10, // 최소 10건
    severity: 'info'
  }
]
```

---

## 🚀 즉시 실행 가능한 액션 아이템

### ⚡ Day 1 (2025-09-17, 오늘)
1. **데이터베이스 스키마 확장** (2시간)
   ```sql
   -- comment_admin_actions 테이블 생성
   -- community_comments_list 필드 추가
   -- 기본 인덱스 생성
   ```

2. **타입 정의 작성** (1시간)
   ```typescript
   // types/comment-management.types.ts 생성
   // 기본 인터페이스 정의
   ```

### ⚡ Day 2-3 (2025-09-18 ~ 2025-09-19)
1. **commentService 기본 메서드 구현** (1일)
   - `bulkUpdateCommentStatus`
   - `getCommentAdminActions`

2. **RLS 정책 업데이트** (0.5일)
   - 기존 정책 수정
   - 새 테이블 정책 생성

### ⚡ Day 4-5 (2025-09-20 ~ 2025-09-23)
1. **CommentList 일괄 선택 기능** (1일)
   - 체크박스 UI 추가
   - 선택 상태 관리

2. **CommentBulkActions 기본 버전** (1일)
   - 숨기기/복원 액션
   - 기본 UI 구현

### 📋 체크리스트 템플릿

```markdown
## Week 1 체크리스트 (2025-09-17 ~ 2025-09-23)

### 백엔드 (Day 1-2: 9/17-9/18)
- [ ] comment_admin_actions 테이블 생성
- [ ] community_comments_list 필드 추가
- [ ] 인덱스 생성 및 최적화
- [ ] RLS 정책 수정
- [ ] 타입 정의 작성

### 서비스 레이어 (Day 3-5: 9/19-9/23)
- [ ] bulkUpdateCommentStatus 구현
- [ ] updateCommentContent 구현
- [ ] getCommentAdminActions 구현
- [ ] 단위 테스트 작성
- [ ] API 문서 업데이트

### 프론트엔드 (Day 4-5: 9/20-9/23)
- [ ] CommentList 체크박스 추가
- [ ] CommentItem 관리 버튼 추가
- [ ] CommentBulkActions 기본 구현
- [ ] 선택 상태 관리 훅
- [ ] 에러 처리 및 피드백
```

---

## 📞 지원 및 리소스

### 👥 팀 구성 및 역할
- **백엔드 개발자**: 데이터베이스, API, RLS 정책
- **프론트엔드 개발자**: UI 컴포넌트, 상태 관리
- **QA 엔지니어**: 테스트 시나리오, 성능 검증
- **프로덕트 매니저**: 요구사항 검증, 우선순위 조정

### 📚 참고 문서
- [Supabase RLS 가이드](https://supabase.com/docs/guides/auth/row-level-security)
- [React Query 최적화](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)
- [Chakra UI 컴포넌트](https://chakra-ui.com/docs/components)
- [PostgreSQL 성능 튜닝](https://www.postgresql.org/docs/current/performance-tips.html)

### 🔗 관련 도구
- **디자인**: Figma (UI 목업)
- **API 테스트**: Postman/Insomnia
- **성능 모니터링**: Supabase Dashboard
- **에러 추적**: 브라우저 개발자 도구

### ⚠️ 위험 요소 및 대응 방안

| 위험 요소 | 확률 | 영향도 | 대응 방안 |
|-----------|------|--------|-----------|
| RLS 정책 복잡성 | 중간 | 높음 | 단계적 적용, 철저한 테스트 |
| 성능 저하 | 낮음 | 중간 | 인덱스 최적화, 캐싱 전략 |
| UI/UX 복잡성 | 높음 | 중간 | 프로토타입 먼저, 사용자 피드백 |
| 데이터 무결성 | 낮음 | 높음 | 트랜잭션 처리, 백업 전략 |

---

## 📋 마무리

이 계획서는 **6주간의 체계적인 개발 로드맵**을 제시합니다.

**핵심 목표:**
- 관리 효율성 **300% 향상**
- 신고 처리 시간 **80% 단축**
- 완전한 댓글 관리 생태계 구축

**성공 요인:**
1. **단계적 접근**: Phase별 점진적 구현
2. **사용자 중심**: 관리자 경험 최우선
3. **성능 보장**: 대용량 데이터 처리 최적화
4. **확장성**: 미래 요구사항 대응 가능

**다음 단계**: 이 계획에 대한 팀 검토 후 즉시 **Day 1 액션 아이템** 실행 🚀

---

> 📅 **정기 리뷰**: 매주 금요일 오후 3시
> 🔄 **계획 업데이트**: 격주 월요일
> 📊 **진행률 체크**: 매일 스탠드업 미팅
