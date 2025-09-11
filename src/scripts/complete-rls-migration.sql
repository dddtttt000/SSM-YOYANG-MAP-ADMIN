-- 모든 테이블에 대한 RLS 정책 완전 마이그레이션
-- Phase 1 완료: Critical Database 스키마 + RLS 수정

-- 1. 시설 관련 테이블들에 RLS 설정
-- facilities_ssmn_basic_full 테이블
ALTER TABLE facilities_ssmn_basic_full ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "관리자는 모든 시설 조회 가능" ON facilities_ssmn_basic_full;
DROP POLICY IF EXISTS "관리자는 시설 수정 가능" ON facilities_ssmn_basic_full;

CREATE POLICY "관리자는 모든 시설 조회 가능" ON facilities_ssmn_basic_full
    FOR SELECT USING (is_authenticated_user());

CREATE POLICY "관리자는 시설 수정 가능" ON facilities_ssmn_basic_full
    FOR UPDATE USING (is_authenticated_user());

-- 2. 서비스 문의 테이블 (존재한다면)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'service_inquiries') THEN
        ALTER TABLE service_inquiries ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "관리자는 모든 문의 조회 가능" ON service_inquiries;
        DROP POLICY IF EXISTS "관리자는 문의 수정 가능" ON service_inquiries;
        
        CREATE POLICY "관리자는 모든 문의 조회 가능" ON service_inquiries
            FOR SELECT USING (is_authenticated_user());
            
        CREATE POLICY "관리자는 문의 수정 가능" ON service_inquiries
            FOR UPDATE USING (is_authenticated_user());
    END IF;
END $$;

-- 3. 모니터링 관련 테이블들 (동적으로 처리)
-- 모니터링 테이블들은 이름이 동적일 수 있으므로 필요시 개별 처리

-- 4. 공통 RLS 정책 템플릿 함수
CREATE OR REPLACE FUNCTION apply_admin_rls_policies(table_name TEXT, include_insert BOOLEAN DEFAULT false, include_delete BOOLEAN DEFAULT false)
RETURNS VOID AS $$
DECLARE
    policy_suffix TEXT;
BEGIN
    policy_suffix := replace(initcap(table_name), '_', ' ');
    
    -- RLS 활성화
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
    
    -- SELECT 정책
    EXECUTE format('DROP POLICY IF EXISTS "관리자는 모든 %s 조회 가능" ON %I', policy_suffix, table_name);
    EXECUTE format('CREATE POLICY "관리자는 모든 %s 조회 가능" ON %I FOR SELECT USING (is_authenticated_user())', policy_suffix, table_name);
    
    -- UPDATE 정책
    EXECUTE format('DROP POLICY IF EXISTS "관리자는 %s 수정 가능" ON %I', policy_suffix, table_name);
    EXECUTE format('CREATE POLICY "관리자는 %s 수정 가능" ON %I FOR UPDATE USING (is_authenticated_user())', policy_suffix, table_name);
    
    -- INSERT 정책 (선택적)
    IF include_insert THEN
        EXECUTE format('DROP POLICY IF EXISTS "관리자는 %s 생성 가능" ON %I', policy_suffix, table_name);
        EXECUTE format('CREATE POLICY "관리자는 %s 생성 가능" ON %I FOR INSERT WITH CHECK (is_authenticated_user())', policy_suffix, table_name);
    END IF;
    
    -- DELETE 정책 (선택적)
    IF include_delete THEN
        EXECUTE format('DROP POLICY IF EXISTS "관리자는 %s 삭제 가능" ON %I', policy_suffix, table_name);
        EXECUTE format('CREATE POLICY "관리자는 %s 삭제 가능" ON %I FOR DELETE USING (is_authenticated_user())', policy_suffix, table_name);
    END IF;
    
    RAISE NOTICE 'RLS policies applied to table: %', table_name;
END;
$$ LANGUAGE plpgsql;

-- 5. 필수 테이블들에 RLS 정책 적용
-- members 테이블 (이미 위에서 처리했지만 재확인)
SELECT apply_admin_rls_policies('members', false, false);

-- 시설 관련 테이블이 있다면 적용 (뷰는 제외하고 테이블만)
DO $$
DECLARE
    table_record RECORD;
BEGIN
    FOR table_record IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name LIKE 'facilities_%'
        AND table_type = 'BASE TABLE'  -- 뷰 제외, 테이블만 선택
    LOOP
        RAISE NOTICE 'Applying RLS to table: %', table_record.table_name;
        PERFORM apply_admin_rls_policies(table_record.table_name, false, false);
    END LOOP;
END $$;

-- 6. 뷰(View)에 대한 보안 정책 확인
-- 뷰는 RLS를 직접 적용할 수 없으므로, 기반이 되는 테이블의 RLS에 의존
DO $$
DECLARE
    view_record RECORD;
BEGIN
    RAISE NOTICE '=== Views found (RLS not applicable, depends on underlying tables) ===';
    FOR view_record IN 
        SELECT table_name 
        FROM information_schema.views 
        WHERE table_schema = 'public' 
        AND table_name LIKE 'facilities_%'
    LOOP
        RAISE NOTICE 'View found: % (security handled by underlying tables)', view_record.table_name;
    END LOOP;
END $$;

-- 7. 특별한 정책이 필요한 테이블들 개별 처리
-- announcements와 questions는 이미 처리됨
-- admin_users는 이미 처리됨

-- 7. 데이터베이스 세션을 위한 임시 함수들
-- 현재 JWT 상태를 확인하는 함수
CREATE OR REPLACE FUNCTION check_current_auth_state()
RETURNS TABLE (
    has_jwt BOOLEAN,
    auth_user_id UUID,
    email TEXT,
    admin_user_id INTEGER,
    is_authenticated BOOLEAN,
    can_access_members BOOLEAN,
    can_access_admin_users BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        auth.jwt() IS NOT NULL as has_jwt,
        (auth.jwt() ->> 'sub')::uuid as auth_user_id,
        auth.jwt() ->> 'email' as email,
        get_current_admin_user_id() as admin_user_id,
        is_authenticated_user() as is_authenticated,
        (
            SELECT CASE 
                WHEN is_authenticated_user() THEN 
                    EXISTS(SELECT 1 FROM members LIMIT 1)
                ELSE false 
            END
        ) as can_access_members,
        has_admin_permission('super_admin') as can_access_admin_users;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. RLS 정책 상태 확인 함수
CREATE OR REPLACE FUNCTION check_rls_status()
RETURNS TABLE (
    table_name TEXT,
    rls_enabled BOOLEAN,
    policy_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.tablename::TEXT,
        t.rowsecurity as rls_enabled,
        (
            SELECT COUNT(*)::INTEGER
            FROM pg_policies p
            WHERE p.tablename = t.tablename
        ) as policy_count
    FROM pg_tables t
    WHERE t.schemaname = 'public'
    AND t.tablename IN ('admin_users', 'members', 'announcements', 'questions', 'facilities_ssmn_basic_full')
    ORDER BY t.tablename;
END;
$$ LANGUAGE plpgsql;

-- 9. 마이그레이션 검증 쿼리들
-- 다음 쿼리들을 실행하여 마이그레이션 상태 확인:
--
-- 1. RLS 상태 확인:
--    SELECT * FROM check_rls_status();
--
-- 2. 인증 상태 확인 (JWT 토큰이 있을 때):
--    SELECT * FROM check_current_auth_state();
--
-- 3. 함수 존재 확인:
--    SELECT * FROM test_rls_functions();
--
-- 4. 컬럼 추가 확인:
--    SELECT column_name, data_type, is_nullable 
--    FROM information_schema.columns 
--    WHERE table_name = 'admin_users' AND column_name = 'supabase_user_id';

-- 10. 정책 정리 및 최적화
-- 중복된 정책들 정리
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- 동일한 테이블에 중복된 정책이 있는지 확인 후 정리
    FOR policy_record IN 
        SELECT tablename, COUNT(*) as policy_count
        FROM pg_policies 
        WHERE schemaname = 'public'
        GROUP BY tablename
        HAVING COUNT(*) > 10  -- 정책이 너무 많은 테이블들
    LOOP
        RAISE NOTICE 'Table % has % policies - review needed', policy_record.tablename, policy_record.policy_count;
    END LOOP;
END $$;

-- 11. 최종 검증 로그
SELECT 
    'RLS Migration Complete' as status,
    now() as completed_at,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'admin_users' AND column_name = 'supabase_user_id') as supabase_column_added,
    (SELECT EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'is_authenticated_user')) as auth_function_exists,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as total_policies_created;