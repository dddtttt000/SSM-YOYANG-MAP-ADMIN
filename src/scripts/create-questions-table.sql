-- 자주 묻는 질문(FAQ) 테이블 생성
CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NULL
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at);

-- updated_at 자동 업데이트를 위한 트리거 (이미 존재하는 함수 재사용)
DROP TRIGGER IF EXISTS update_questions_updated_at ON questions;
CREATE TRIGGER update_questions_updated_at
    BEFORE UPDATE ON questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 기존 정책들 삭제 (있을 경우)
DROP POLICY IF EXISTS "관리자는 모든 FAQ 조회 가능" ON questions;
DROP POLICY IF EXISTS "관리자는 FAQ 생성 가능" ON questions;
DROP POLICY IF EXISTS "관리자는 FAQ 수정 가능" ON questions;
DROP POLICY IF EXISTS "관리자는 FAQ 삭제 가능" ON questions;
DROP POLICY IF EXISTS "활성 사용자는 모든 FAQ 조회 가능" ON questions;

-- RLS (Row Level Security) 정책 설정
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- 관리자만 모든 FAQ를 볼 수 있도록 정책 설정
CREATE POLICY "관리자는 모든 FAQ 조회 가능" ON questions
    FOR SELECT USING (is_authenticated_user());

-- 관리자만 FAQ 생성 가능
CREATE POLICY "관리자는 FAQ 생성 가능" ON questions
    FOR INSERT WITH CHECK (is_authenticated_user());

-- 관리자만 FAQ 수정 가능
CREATE POLICY "관리자는 FAQ 수정 가능" ON questions
    FOR UPDATE USING (is_authenticated_user());

-- 관리자만 FAQ 삭제 가능
CREATE POLICY "관리자는 FAQ 삭제 가능" ON questions
    FOR DELETE USING (is_authenticated_user());

-- 일반 사용자도 FAQ를 조회할 수 있도록 정책 설정 (사용자 앱용)
CREATE POLICY "활성 사용자는 모든 FAQ 조회 가능" ON questions
    FOR SELECT USING (true);

-- 카테고리 체크 제약 조건 (선택사항)
ALTER TABLE questions 
ADD CONSTRAINT check_questions_category 
CHECK (category IN ('회원', '서비스', 'AI추천', '시설정보', '기타'));