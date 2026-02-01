-- ============================================
-- 修复 RLS 策略 - 允许匿名用户访问
-- 在 Supabase SQL Editor 中执行此脚本
-- ============================================

-- 删除旧的严格 RLS 策略
DROP POLICY IF EXISTS "Users can view their own generations" ON generations;
DROP POLICY IF EXISTS "Users can insert their own generations" ON generations;
DROP POLICY IF EXISTS "Users can update their own generations" ON generations;
DROP POLICY IF EXISTS "Users can delete their own generations" ON generations;

-- 创建新的宽松策略（允许匿名用户访问）
CREATE POLICY "Allow anonymous insert on generations"
    ON generations FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow anonymous select on generations"
    ON generations FOR SELECT
    USING (true);

CREATE POLICY "Allow anonymous update on generations"
    ON generations FOR UPDATE
    USING (true);

CREATE POLICY "Allow anonymous delete on generations"
    ON generations FOR DELETE
    USING (true);

-- 更新 generation_history 策略
DROP POLICY IF EXISTS "Users can view history of their generations" ON generation_history;
DROP POLICY IF EXISTS "System can insert generation history" ON generation_history;
DROP POLICY IF EXISTS "System can update generation history" ON generation_history;

CREATE POLICY "Allow all on generation_history"
    ON generation_history FOR ALL
    USING (true);

-- 更新 user_configs 策略
DROP POLICY IF EXISTS "Users can view their own configs" ON user_configs;
DROP POLICY IF EXISTS "Users can insert their own configs" ON user_configs;
DROP POLICY IF EXISTS "Users can update their own configs" ON user_configs;
DROP POLICY IF EXISTS "Users can delete their own configs" ON user_configs;

CREATE POLICY "Allow all on user_configs"
    ON user_configs FOR ALL
    USING (true);

-- 成功消息
DO $$
BEGIN
    RAISE NOTICE '✅ RLS policies updated successfully!';
    RAISE NOTICE '🔓 Anonymous access enabled for development';
    RAISE NOTICE '⚠️  Remember to tighten security for production!';
END $$;
