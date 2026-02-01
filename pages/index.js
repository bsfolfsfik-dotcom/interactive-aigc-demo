import { useState, useEffect } from 'react';
import { db, supabase } from '../lib/supabase';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [generationId, setGenerationId] = useState(null);
  const [history, setHistory] = useState([]);
  const [generateVideo, setGenerateVideo] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Initialize anonymous user on mount
  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    try {
      // Check if user is already signed in
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        setUserId(session.user.id);
      } else {
        // Sign in anonymously
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) throw error;
        setUserId(data.user.id);
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('Failed to initialize user session');
    } finally {
      setAuthLoading(false);
    }
  };

  // Poll for generation status
  useEffect(() => {
    if (!generationId) return;

    const interval = setInterval(async () => {
      try {
        const generation = await db.getGeneration(generationId);

        if (generation.status === 'completed') {
          setResult(generation);
          setLoading(false);
          clearInterval(interval);
        } else if (generation.status === 'failed') {
          setError(generation.error_message || 'Generation failed');
          setLoading(false);
          clearInterval(interval);
        }

        // Fetch history
        const historyData = await db.getGenerationHistory(generationId);
        setHistory(historyData);
      } catch (err) {
        console.error('Error polling generation:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [generationId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setHistory([]);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          prompt,
          config: {
            generateVideo
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start generation');
      }

      setGenerationId(data.id);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1>Interactive AIGC Demo</h1>
      <p>Generate images and videos with AI using RAG-enhanced prompts</p>

      {authLoading ? (
        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <p>Initializing session...</p>
        </div>
      ) : (
        <>
          <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
            <small>Session ID: {userId?.substring(0, 8)}...</small>
          </div>

          <form onSubmit={handleSubmit} style={{ marginTop: '30px' }}>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="prompt" style={{ display: 'block', marginBottom: '5px' }}>
                Prompt (max 2000 characters):
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want to generate..."
                rows={5}
                maxLength={2000}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  resize: 'vertical'
                }}
              />
              <small style={{ color: '#666' }}>
                {prompt.length} / 2000 characters
              </small>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={generateVideo}
                  onChange={(e) => setGenerateVideo(e.target.checked)}
                  style={{ marginRight: '8px' }}
                />
                Generate video (takes longer)
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !prompt.trim() || !userId}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                backgroundColor: (loading || !userId) ? '#ccc' : '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: (loading || !userId) ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Generating...' : 'Generate'}
            </button>
          </form>
        </>
      )}

      {error && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: '4px',
          color: '#c00'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading && history.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h2>Generation Progress</h2>
          <div style={{ marginTop: '15px' }}>
            {history.map((step, index) => (
              <div
                key={step.id}
                style={{
                  padding: '10px',
                  marginBottom: '10px',
                  backgroundColor: step.status === 'completed' ? '#e8f5e9' : '#fff3e0',
                  border: '1px solid',
                  borderColor: step.status === 'completed' ? '#4caf50' : '#ff9800',
                  borderRadius: '4px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>Step {index + 1}: {step.step}</strong>
                  <span style={{
                    color: step.status === 'completed' ? '#4caf50' : '#ff9800'
                  }}>
                    {step.status === 'completed' ? '✓' : '⏳'} {step.status}
                  </span>
                </div>
                {step.duration_ms && (
                  <small style={{ color: '#666' }}>
                    Duration: {(step.duration_ms / 1000).toFixed(2)}s
                  </small>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {result && (
        <div style={{ marginTop: '30px' }}>
          <h2>Result</h2>
          <div style={{
            padding: '20px',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            marginTop: '15px'
          }}>
            <p><strong>Status:</strong> {result.status}</p>
            <p><strong>Total Duration:</strong> {(result.metadata?.totalDuration / 1000).toFixed(2)}s</p>

            {result.metadata?.enhancedPrompt && (
              <div style={{ marginTop: '15px' }}>
                <strong>Enhanced Prompt:</strong>
                <p style={{
                  padding: '10px',
                  backgroundColor: 'white',
                  borderRadius: '4px',
                  marginTop: '5px'
                }}>
                  {result.metadata.enhancedPrompt}
                </p>
              </div>
            )}

            {result.metadata?.imageUrl && (
              <div style={{ marginTop: '15px' }}>
                <strong>Generated Image:</strong>
                <div style={{ marginTop: '10px' }}>
                  <img
                    src={result.metadata.imageUrl}
                    alt="Generated"
                    style={{
                      maxWidth: '100%',
                      borderRadius: '4px',
                      border: '1px solid #ddd'
                    }}
                  />
                </div>
              </div>
            )}

            {result.metadata?.videoUrl && (
              <div style={{ marginTop: '15px' }}>
                <strong>Generated Video:</strong>
                <div style={{ marginTop: '10px' }}>
                  <video
                    src={result.metadata.videoUrl}
                    controls
                    style={{
                      maxWidth: '100%',
                      borderRadius: '4px',
                      border: '1px solid #ddd'
                    }}
                  />
                </div>
              </div>
            )}

            <div style={{ marginTop: '15px' }}>
              <a
                href={result.result_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  padding: '10px 20px',
                  backgroundColor: '#0070f3',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '4px'
                }}
              >
                View Full Result
              </a>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }
        body {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
}
