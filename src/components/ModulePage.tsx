import { Link, useParams } from 'react-router-dom'
import { features, modules, getFeaturesByModule } from '../data/features'
import { useProgress } from './HomePage'
import SetupBanner from './SetupBanner'
import InPageNav from './InPageNav'

export default function ModulePage() {
  const { moduleId } = useParams<{ moduleId: string }>()
  const module = modules.find(m => m.id === moduleId)
  const moduleFeatures = module ? getFeaturesByModule(module.id as 'foundations' | 'core' | 'advanced' | 'specialized') : []

  const { completed, toggle } = useProgress()

  if (!module) {
    return (
      <div className="feature-page">
        <SetupBanner />
        <section className="feature-page-hero">
          <h1>Module Not Found</h1>
          <p className="feature-page-endpoint">The requested learning module does not exist.</p>
        </section>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 'var(--space-6)' }}>
          ← Back to Home
        </Link>
      </div>
    )
  }

  const moduleCompletedCount = moduleFeatures.filter(f => completed.has(f.id)).length
  const modulePercent = moduleFeatures.length > 0
    ? Math.round((moduleCompletedCount / moduleFeatures.length) * 100)
    : 0

  return (
    <div className="feature-page">
      <SetupBanner />

      <section className="feature-page-hero" id="overview-top">
        <div className="feature-page-header">
          <span className="feature-page-number">{module.icon}</span>
          <h1>{module.title}</h1>
        </div>
        <p className="feature-page-endpoint">{module.description}</p>

        {/* Module progress bar */}
        <div className="module-progress" style={{ marginTop: 'var(--space-6)', padding: 'var(--space-4) var(--space-6)', background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--card-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
            <strong style={{ fontSize: '0.875rem' }}>Module Progress</strong>
            <span style={{ fontSize: '0.875rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
              {moduleCompletedCount} / {moduleFeatures.length} features
            </span>
          </div>
          <div className="progress-bar" style={{ height: '8px' }}>
            <div className="progress-fill" style={{ width: `${modulePercent}%` }} />
          </div>
          <p style={{ fontSize: '0.7rem', marginTop: 'var(--space-2)', color: 'var(--text-muted)' }}>
            {modulePercent}% complete
          </p>
        </div>
      </section>

      <InPageNav tabs={[
        { id: 'overview', label: 'Overview' },
        { id: 'features', label: 'Features' },
        { id: 'progress', label: 'Progress' },
      ]} />

      <section id="overview" className="feature-page-explanation">
        <h2>Overview</h2>
        <p>{module.description}</p>

        <h3>What you'll learn</h3>
        <ul style={{ lineHeight: 1.8, color: 'var(--text-secondary)' }}>
          {module.features.map((featureId) => {
            const feature = features.find(f => f.id === featureId)
            return feature ? (
              <li key={feature.id}>
                <Link to={`/feature/${feature.id}`} style={{ textDecoration: 'none', color: 'var(--accent-primary)' }}>
                  {feature.number}. {feature.title}
                </Link>
                <span style={{ color: 'var(--text-muted)', marginLeft: 'var(--space-2)' }}>
                  — {feature.summary}
                </span>
              </li>
            ) : null
          })}
        </ul>

        <div style={{ marginTop: 'var(--space-8)', padding: 'var(--space-4) var(--space-6)', background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--card-border)' }}>
          <h3 style={{ marginBottom: 'var(--space-3)' }}>Prerequisites</h3>
          <ul style={{ lineHeight: 1.8, color: 'var(--text-secondary)' }}>
            <li>Java 21+ and Spring Boot 4.1.x</li>
            <li>An OpenRouter API key (or any OpenAI-compatible provider)</li>
            <li>Basic familiarity with Spring Boot and REST APIs</li>
            {module.id === 'advanced' || module.id === 'specialized' ? (
              <li>Docker (for vector store demos in RAG/Embeddings)</li>
            ) : null}
            {module.id === 'specialized' ? (
              <li>Paid API key (for Moderation, some Evaluation features)</li>
            ) : null}
          </ul>
        </div>
      </section>

      <section id="features" className="feature-page-explanation">
        <h2>Features in this Module</h2>
        <div className="module-grid" style={{ marginTop: 'var(--space-6)' }}>
          {moduleFeatures.map((feature) => {
            const isCompleted = completed.has(feature.id)
            return (
              <Link
                key={feature.id}
                to={`/feature/${feature.id}`}
                className={`module-card ${isCompleted ? 'module-card--completed' : ''}`}
              >
                <div className="module-card-header">
                  <div className={`module-icon ${module.iconType}`}>{module.icon}</div>
                  <div>
                    <h3>{feature.number}. {feature.title}</h3>
                    <div className="module-card-badges">
                      <span className={`difficulty-badge ${feature.difficulty ? `badge-${feature.difficulty}` : 'badge-beginner'}`}>
                        {feature.difficulty || 'Beginner'}
                      </span>
                      <span className="time-badge">
                        {feature.estimatedTime || 10} min
                      </span>
                      {isCompleted && <span className="completion-badge">✓ Completed</span>}
                    </div>
                  </div>
                </div>
                <p>{feature.summary || feature.description.substring(0, 120)}...</p>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: isCompleted ? '100%' : '0%' }} />
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <section id="progress" className="feature-page-explanation">
        <h2>Your Progress</h2>
        <div style={{ display: 'grid', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
          {moduleFeatures.map((feature) => {
            const isCompleted = completed.has(feature.id)
            return (
              <div
                key={feature.id}
                className={`progress-item ${isCompleted ? 'progress-item--completed' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--space-4) var(--space-6)',
                  background: 'var(--card-bg)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--card-border)',
                  transition: 'all var(--duration-fast) var(--ease)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                  <label className="mark-complete-check" style={{ cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => toggle(feature.id)}
                      style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--spring-green)' }}
                    />
                  </label>
                  <div>
                    <strong style={{ color: isCompleted ? 'var(--spring-green)' : 'var(--text-primary)' }}>
                      {feature.number}. {feature.title}
                    </strong>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      {feature.summary}
                    </p>
                  </div>
                </div>
                <Link to={`/feature/${feature.id}`} className="btn btn-secondary btn-sm">
                  {isCompleted ? 'Review' : 'Start'}
                </Link>
              </div>
            )
          })}
        </div>

        {/* Navigation to next module */}
        <div style={{ marginTop: 'var(--space-8)', padding: 'var(--space-6)', background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--card-border)', textAlign: 'center' }}>
          {module.id !== 'specialized' && (
            <Link to={`/learning-path/${modules.find(m => m.id === getNextModule(module.id))?.id}`} className="btn btn-primary">
              Continue to Next Module →
            </Link>
          )}
          {module.id === 'specialized' && (
            <Link to="/completion" className="btn btn-primary">
              🎓 Go to Course Completion
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}

function getNextModule(currentId: string): string | undefined {
  const currentIndex = modules.findIndex(m => m.id === currentId)
  if (currentIndex === -1 || currentIndex === modules.length - 1) return undefined
  return modules[currentIndex + 1].id
}