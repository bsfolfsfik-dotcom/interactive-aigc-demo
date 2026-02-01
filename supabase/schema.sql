-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create generations table
CREATE TABLE IF NOT EXISTS generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    prompt TEXT NOT NULL,
    config JSONB NOT NULL DEFAULT '{}',
    result_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create generation_history table
CREATE TABLE IF NOT EXISTS generation_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    generation_id UUID NOT NULL REFERENCES generations(id) ON DELETE CASCADE,
    step TEXT NOT NULL,
    phase TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    duration_ms INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_configs table
CREATE TABLE IF NOT EXISTS user_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    config JSONB NOT NULL DEFAULT '{}',
    is_favorite BOOLEAN DEFAULT FALSE,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create knowledge_base table for RAG
CREATE TABLE IF NOT EXISTS knowledge_base (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    style_name TEXT NOT NULL,
    category TEXT NOT NULL,
    prompt_template TEXT NOT NULL,
    sd_params JSONB NOT NULL DEFAULT '{}',
    lora_configs JSONB DEFAULT '[]',
    example_images TEXT[] DEFAULT '{}',
    embedding VECTOR(1536), -- For vector similarity search
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create search_cache table
CREATE TABLE IF NOT EXISTS search_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query TEXT NOT NULL,
    results JSONB NOT NULL,
    source TEXT NOT NULL, -- 'metaso', 'pinterest', etc.
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_status ON generations(status);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON generations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generation_history_generation_id ON generation_history(generation_id);
CREATE INDEX IF NOT EXISTS idx_user_configs_user_id ON user_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_configs_is_favorite ON user_configs(is_favorite);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_style_name ON knowledge_base(style_name);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_search_cache_query ON search_cache(query);
CREATE INDEX IF NOT EXISTS idx_search_cache_expires_at ON search_cache(expires_at);

-- Enable Row Level Security
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies for generations
CREATE POLICY "Users can view their own generations"
    ON generations FOR SELECT
    USING (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can insert their own generations"
    ON generations FOR INSERT
    WITH CHECK (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can update their own generations"
    ON generations FOR UPDATE
    USING (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can delete their own generations"
    ON generations FOR DELETE
    USING (user_id = current_setting('app.user_id', true));

-- RLS Policies for generation_history
CREATE POLICY "Users can view history of their generations"
    ON generation_history FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM generations
            WHERE generations.id = generation_history.generation_id
            AND generations.user_id = current_setting('app.user_id', true)
        )
    );

CREATE POLICY "System can insert generation history"
    ON generation_history FOR INSERT
    WITH CHECK (true);

-- RLS Policies for user_configs
CREATE POLICY "Users can view their own configs"
    ON user_configs FOR SELECT
    USING (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can insert their own configs"
    ON user_configs FOR INSERT
    WITH CHECK (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can update their own configs"
    ON user_configs FOR UPDATE
    USING (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can delete their own configs"
    ON user_configs FOR DELETE
    USING (user_id = current_setting('app.user_id', true));

-- RLS Policies for knowledge_base (read-only for all users)
CREATE POLICY "Anyone can read knowledge base"
    ON knowledge_base FOR SELECT
    USING (true);

-- RLS Policies for search_cache (read-only for all users)
CREATE POLICY "Anyone can read search cache"
    ON search_cache FOR SELECT
    USING (true);

CREATE POLICY "System can manage search cache"
    ON search_cache FOR ALL
    USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_generations_updated_at
    BEFORE UPDATE ON generations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_configs_updated_at
    BEFORE UPDATE ON user_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_base_updated_at
    BEFORE UPDATE ON knowledge_base
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample knowledge base data
INSERT INTO knowledge_base (style_name, category, prompt_template, sd_params, lora_configs, metadata) VALUES
(
    'Cyberpunk',
    'sci-fi',
    'cyberpunk style, neon lights, futuristic, dark atmosphere, high contrast, {subject}',
    '{"cfg_scale": 7.5, "steps": 30, "sampler": "DPM++ 2M Karras", "width": 1024, "height": 576}',
    '[{"name": "Cyberpunk Edgerunners", "weight": 0.8}]',
    '{"tags": ["sci-fi", "neon", "dark"], "popularity": 95}'
),
(
    'Anime',
    'illustration',
    'anime style, detailed, vibrant colors, {subject}',
    '{"cfg_scale": 7.0, "steps": 28, "sampler": "Euler a", "width": 768, "height": 1024}',
    '[{"name": "Anime Lineart", "weight": 0.7}]',
    '{"tags": ["anime", "illustration", "colorful"], "popularity": 90}'
),
(
    'Photorealistic',
    'photography',
    'photorealistic, highly detailed, professional photography, {subject}',
    '{"cfg_scale": 6.5, "steps": 35, "sampler": "DPM++ SDE Karras", "width": 1024, "height": 768}',
    '[]',
    '{"tags": ["realistic", "photography", "detailed"], "popularity": 88}'
),
(
    'Minimalist',
    'design',
    'minimalist style, clean, simple, modern, {subject}',
    '{"cfg_scale": 6.0, "steps": 25, "sampler": "Euler", "width": 1024, "height": 1024}',
    '[]',
    '{"tags": ["minimalist", "clean", "modern"], "popularity": 75}'
),
(
    'Fantasy',
    'art',
    'fantasy art, magical, ethereal, detailed, {subject}',
    '{"cfg_scale": 8.0, "steps": 32, "sampler": "DPM++ 2M", "width": 896, "height": 1152}',
    '[{"name": "Fantasy Diffusion", "weight": 0.75}]',
    '{"tags": ["fantasy", "magical", "art"], "popularity": 85}'
);

-- Create function to clean expired cache
CREATE OR REPLACE FUNCTION clean_expired_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM search_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE generations IS 'Stores all generation requests and results';
COMMENT ON TABLE generation_history IS 'Tracks execution steps for each generation';
COMMENT ON TABLE user_configs IS 'User-saved configuration presets';
COMMENT ON TABLE knowledge_base IS 'RAG knowledge base for style parameters';
COMMENT ON TABLE search_cache IS 'Cache for external search API results';
