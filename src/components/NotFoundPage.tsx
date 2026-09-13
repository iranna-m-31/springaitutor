import { Link, useLocation } from 'react-router-dom'
import { useProgress } from './HomePage'

export default function NotFoundPage() {
  const location = useLocation()
  const { completed, percent, total } = useProgress()

  return (
    <div className="feature-page" style={{ maxWidth: '720px', margin: '0 auto' }}>
      <section className="feature-page-hero" style={{ textAlign: 'center', padding: 'var(--space-12) var(--space-6)' }}>
        <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>🔍</div>
        <h1 style={{ fontSize: '2.5rem', marginBottom: 'var(--space-3)' }}>Page Not Found</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
          The path <code style={{ background: 'var(--code-bg-inline)', padding: '2px 6px', borderRadius: 'var(--radius-sm)' }}>{location.pathname}</code> doesn't exist yet.
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          This route was reported as broken. It's been redirected to this friendly 404 page instead of the home page so you can see what happened.
        </p>
      </section>

      <section className="feature-page-explanation" style={{ marginTop: 'var(--space-8)' }}>
        <h2>Where to go from here</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
          The Spring AI Tutor has 16 interactive features across 4 learning modules. Pick a starting point:
        </p>
        <div className="module-grid">
          <Link to="/learning-path/foundations" className="module-card">
            <div className="module-card-header">
              <div className="module-icon foundations">🌱</div>
              <div>
                <h3>Foundations</h3>
                <div className="module-card-badges">
                  <span className="difficulty-badge badge-beginner">Beginner</span>
                  <span className="time-badge">60 min</span>
                </div>
              </div>
            </div>
            <p>Start with Plain Chat, prompts, streaming, and structured output.</p>
          </Link>
          <Link to="/learning-path/core" className="module-card">
            <div className="module-card-header">
              <div className="module-icon core">⚙️</div>
              <div>
                <h3>Core</h3>
                <div className="module-card-badges">
                  <span className="difficulty-badge badge-intermediate">Intermediate</span>
                  <span className="time-badge">75 min</span>
                </div>
              </div>
            </div>
            <p>Tool calling, chat memory, advisors, and multimodality.</p>
          </Link>
          <Link to="/learning-path/advanced" className="module-card">
            <div className="module-card-header">
              <div className="module-icon advanced">🚀</div>
              <div>
                <h3>Advanced</h3>
                <div className="module-card-badges">
                  <span className="difficulty-badge badge-advanced">Advanced</span>
                  <span className="time-badge">90 min</span>
                </div>
              </div>
            </div>
            <p>Embeddings, RAG, and moderation.</p>
          </Link>
          <Link to="/learning-path/specialized" className="module-card">
            <div className="module-card-header">
              <div className="module-icon specialized">🔬</div>
              <div>
                <h3>Specialized</h3>
                <div className="module-card-badges">
                  <span className="difficulty-badge badge-expert">Expert</span>
                  <span className="time-badge">120 min</span>
                </div>
              </div>
            </div>
            <p>MCP, observability, and evaluation.</p>
          </Link>
        </div>

        <div style={{ marginTop: 'var(--space-8)', display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/" className="btn btn-primary">← Back to Home</Link>
          <Link to="/feature/plain-chat" className="btn btn-secondary">Start Learning →</Link>
        </div>

        <div style={{ marginTop: 'var(--space-8)', padding: 'var(--space-4) var(--space-6)', background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--card-border)', textAlign: 'center' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
            Overall progress: <strong style={{ color: 'var(--spring-green)' }}>{percent}%</strong> — {completed.size}/{total} features completed
          </p>
        </div>
      </section>
    </div>
  )
}