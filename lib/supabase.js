import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client-side Supabase client (with RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client (bypasses RLS)
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase; // Fallback to regular client if no service key

// Helper function to set user context for RLS
export const setUserContext = async (userId) => {
  const { error } = await supabaseAdmin.rpc('set_config', {
    setting: 'app.user_id',
    value: userId
  });

  if (error) {
    console.error('Error setting user context:', error);
  }
};

// Database operations (using admin client for server-side operations)
export const db = {
  // Generations
  async createGeneration(userId, prompt, config) {
    const { data, error } = await supabaseAdmin
      .from('generations')
      .insert({
        user_id: userId,
        prompt,
        config,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateGeneration(id, updates) {
    const { data, error } = await supabaseAdmin
      .from('generations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getGeneration(id) {
    const { data, error } = await supabaseAdmin
      .from('generations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async getUserGenerations(userId, limit = 20, offset = 0) {
    const { data, error } = await supabaseAdmin
      .from('generations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  },

  // Generation History
  async addHistoryStep(generationId, step, phase, metadata = {}) {
    const { data, error } = await supabaseAdmin
      .from('generation_history')
      .insert({
        generation_id: generationId,
        step,
        phase,
        status: 'processing',
        metadata
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateHistoryStep(id, status, durationMs, metadata = {}) {
    const { data, error } = await supabaseAdmin
      .from('generation_history')
      .update({
        status,
        duration_ms: durationMs,
        metadata
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getGenerationHistory(generationId) {
    const { data, error } = await supabaseAdmin
      .from('generation_history')
      .select('*')
      .eq('generation_id', generationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  // User Configs
  async saveConfig(userId, name, config, tags = []) {
    const { data, error } = await supabaseAdmin
      .from('user_configs')
      .insert({
        user_id: userId,
        name,
        config,
        tags
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserConfigs(userId) {
    const { data, error } = await supabaseAdmin
      .from('user_configs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async toggleFavorite(id, isFavorite) {
    const { data, error } = await supabaseAdmin
      .from('user_configs')
      .update({ is_favorite: isFavorite })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteConfig(id) {
    const { error } = await supabaseAdmin
      .from('user_configs')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Knowledge Base
  async searchKnowledgeBase(query, limit = 10) {
    const { data, error } = await supabaseAdmin
      .from('knowledge_base')
      .select('*')
      .or(`style_name.ilike.%${query}%,category.ilike.%${query}%`)
      .limit(limit);

    if (error) throw error;
    return data;
  },

  async getKnowledgeByStyle(styleName) {
    const { data, error } = await supabaseAdmin
      .from('knowledge_base')
      .select('*')
      .eq('style_name', styleName)
      .single();

    if (error) throw error;
    return data;
  },

  // Search Cache
  async getCachedSearch(query, source) {
    const { data, error } = await supabaseAdmin
      .from('search_cache')
      .select('*')
      .eq('query', query)
      .eq('source', source)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error && error.code !== 'PGRST116') throw error; // Ignore not found
    return data;
  },

  async setCachedSearch(query, results, source, expiresInMinutes = 30) {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);

    const { data, error } = await supabaseAdmin
      .from('search_cache')
      .insert({
        query,
        results,
        source,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
