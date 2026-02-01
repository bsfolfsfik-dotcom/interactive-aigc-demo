import axios from 'axios';

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Helper function for exponential backoff
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Generic retry wrapper
async function withRetry(fn, retries = MAX_RETRIES) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      const isLastAttempt = i === retries - 1;
      const isRetryable = error.response?.status >= 500 || error.code === 'ECONNABORTED';

      if (isLastAttempt || !isRetryable) {
        throw error;
      }

      const delay = RETRY_DELAY * Math.pow(2, i); // Exponential backoff
      console.log(`Retry attempt ${i + 1}/${retries} after ${delay}ms`);
      await sleep(delay);
    }
  }
}

// Metaso Search API
export const metasoSearch = {
  async search(query, options = {}) {
    return withRetry(async () => {
      const response = await axios.post(
        '/api/search/metaso',
        {
          query,
          limit: options.limit || 10,
          type: options.type || 'web'
        },
        {
          timeout: 15000 // 15 seconds
        }
      );
      return response.data;
    });
  },

  async getTrending(category = 'design') {
    return withRetry(async () => {
      const response = await axios.get('/api/search/trending', {
        params: { category },
        timeout: 10000
      });
      return response.data;
    });
  }
};

// Claude API
export const claudeAPI = {
  async analyzePrompt(prompt, context = {}) {
    return withRetry(async () => {
      const response = await axios.post(
        '/api/claude/analyze',
        {
          prompt,
          context
        },
        {
          timeout: 30000 // 30 seconds
        }
      );
      return response.data;
    });
  },

  async enhancePrompt(prompt, style, ragResults) {
    return withRetry(async () => {
      const response = await axios.post(
        '/api/claude/enhance',
        {
          prompt,
          style,
          ragResults
        },
        {
          timeout: 20000
        }
      );
      return response.data;
    });
  }
};

// TPU API
export const tpuAPI = {
  async generateImage(config) {
    return withRetry(async () => {
      const response = await axios.post(
        '/api/tpu/generate-image',
        config,
        {
          timeout: 120000 // 2 minutes
        }
      );
      return response.data;
    }, 2); // Only 2 retries for expensive operations
  },

  async generateVideo(imageUrl, config) {
    return withRetry(async () => {
      const response = await axios.post(
        '/api/tpu/generate-video',
        {
          imageUrl,
          ...config
        },
        {
          timeout: 180000 // 3 minutes
        }
      );
      return response.data;
    }, 2);
  },

  async checkStatus(jobId) {
    const response = await axios.get(`/api/tpu/status/${jobId}`, {
      timeout: 5000
    });
    return response.data;
  }
};

// Generation API (orchestrates the full pipeline)
export const generationAPI = {
  async create(userId, prompt, config = {}) {
    const response = await axios.post(
      '/api/generate',
      {
        userId,
        prompt,
        config
      },
      {
        timeout: 5000
      }
    );
    return response.data;
  },

  async getStatus(generationId) {
    const response = await axios.get(`/api/generate/${generationId}`, {
      timeout: 5000
    });
    return response.data;
  },

  async getHistory(userId, limit = 20, offset = 0) {
    const response = await axios.get('/api/history', {
      params: { userId, limit, offset },
      timeout: 10000
    });
    return response.data;
  },

  async export(generationId, format = 'mp4') {
    const response = await axios.post(
      '/api/export',
      {
        generationId,
        format
      },
      {
        timeout: 60000,
        responseType: 'blob'
      }
    );
    return response.data;
  }
};

// Config API
export const configAPI = {
  async save(userId, name, config, tags = []) {
    const response = await axios.post('/api/configs', {
      userId,
      name,
      config,
      tags
    });
    return response.data;
  },

  async list(userId) {
    const response = await axios.get('/api/configs', {
      params: { userId }
    });
    return response.data;
  },

  async delete(configId) {
    const response = await axios.delete(`/api/configs/${configId}`);
    return response.data;
  },

  async toggleFavorite(configId, isFavorite) {
    const response = await axios.patch(`/api/configs/${configId}`, {
      isFavorite
    });
    return response.data;
  }
};

// System health check
export const systemAPI = {
  async healthCheck() {
    try {
      const response = await axios.get('/api/health', {
        timeout: 5000
      });
      return response.data;
    } catch (error) {
      return {
        status: 'error',
        services: {
          database: false,
          metaso: false,
          claude: false,
          tpu: false
        }
      };
    }
  }
};

// Error handler
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error
    return {
      message: error.response.data.message || 'Server error',
      status: error.response.status,
      details: error.response.data
    };
  } else if (error.request) {
    // Request made but no response
    return {
      message: 'Network error - please check your connection',
      status: 0,
      details: { timeout: error.code === 'ECONNABORTED' }
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'Unknown error',
      status: -1,
      details: {}
    };
  }
};
