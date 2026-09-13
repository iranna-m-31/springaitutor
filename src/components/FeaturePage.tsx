import { useRef, useState, useEffect, useCallback } from 'react'
import { fetchSource, type SourceResponse } from '../api/source'
import CodeView from './CodeView'
import DemoPanel from './DemoPanel'
import SetupBanner from './SetupBanner'
import InPageNav from './InPageNav'
import Skeleton from './Skeleton'
import CodeDiff from './CodeDiff'
import Checkpoint from './Checkpoint'
import PrerequisitePanel from './PrerequisitePanel'
import { features, modules } from '../data/features'
import type { Feature } from '../data/features'
import { useProgress } from './HomePage'

interface FeaturePageProps {
  feature: Feature
}

/** Parse a flow line like "**User** → `GET /ai` → **ChatClient** → **LLM** into styled segments */
function parseFlowLine(line: string): React.ReactNode[] {
  const parts = line.split(/(→)/g)
  return parts.map((part, i) => {
    const trimmed = part.trim()
    if (!trimmed) return null
    if (trimmed === '→') {
      return <span key={i} style={{ color: 'var(--accent-primary)', margin: '0 4px', fontWeight: 700 }}>→</span>
    }
    const boldMatch = trimmed.match(/^\*\*(.+?)\*\*$/)
    if (boldMatch) {
      return <strong key={i} style={{ color: 'var(--accent-primary)' }}>{boldMatch[1]}</strong>
    }
    const codeMatch = trimmed.match(/^`(.+?)`$/)
    if (codeMatch) {
      return <code key={i} style={{ background: 'var(--code-bg-inline)', padding: '2px 6px', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>{codeMatch[1]}</code>
    }
    return <span key={i}>{trimmed}</span>
  }).filter(Boolean)
}

/** Render architecture markdown as a visual flow diagram */
function ArchitectureDiagram({ text }: { text: string }) {
  const lines = text.split('\n')
  return (
    <div className="architecture-diagram">
      {lines.map((line, i) => {
        if (line.startsWith('### ')) {
          return <h3 key={i} style={{ marginTop: 'var(--space-6)', marginBottom: 'var(--space-3)', color: 'var(--accent-primary)', fontSize: '1.125rem' }}>{line.replace('### ', '')}</h3>
        }
        if (line.startsWith('**Flow:**') || line.startsWith('- **Flow:**')) {
          const flowText = line.replace(/[-*]\s*\*\*Flow:\*\*/g, '').trim()
          return (
            <div key={i} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-4)', background: 'var(--content-bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--card-border)', marginTop: 'var(--space-4)' }}>
              {parseFlowLine(flowText)}
            </div>
          )
        }
        if (line.startsWith('- **') && line.includes('→')) {
          return (
            <div key={i} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-3) var(--space-4)', background: 'var(--content-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)', marginTop: 'var(--space-2)' }}>
              {parseFlowLine(line.replace(/^-\s*/, ''))}
            </div>
          )
        }
        if (line.startsWith('**') && line.includes('→')) {
          return (
            <div key={i} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-3) var(--space-4)', background: 'var(--content-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)', marginTop: 'var(--space-2)' }}>
              {parseFlowLine(line)}
            </div>
          )
        }
        if (line.trim().startsWith('**') && line.includes('**') && !line.includes('→')) {
          const match = line.match(/^\*\*(.+?)\*\*:\s*(.+)$/)
          if (match) {
            return <p key={i} style={{ marginTop: 'var(--space-4)', color: 'var(--text-secondary)', fontWeight: 600 }}><strong>{match[1]}:</strong> {match[2]}</p>
          }
        }
        if (line.trim() && !line.startsWith('#') && !line.startsWith('**') && !line.startsWith('-') && !line.startsWith('See [') && !line.startsWith('*')) {
          return <p key={i} style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>{line}</p>
        }
        if (line.trim().startsWith('See [')) {
          return <p key={i} style={{ marginTop: 'var(--space-4)' }}><a href={line.match(/https?:\/\/[^\s)]+/)?.[0]} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)' }}>{line}</a></p>
        }
        return null
      })}
    </div>
  )
}

export default function FeaturePage({ feature }: FeaturePageProps) {
  const [source, setSource] = useState<SourceResponse | null>(null)
  const [sourceLoading, setSourceLoading] = useState(false)
  const [sourceError, setSourceError] = useState<string | null>(null)
  const [sourceLoaded, setSourceLoaded] = useState(false)
  const [showCode, setShowCode] = useState(true)
  const [nextLoading, setNextLoading] = useState(false)
  const [completeToast, setCompleteToast] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'source', label: 'Source' },
    { id: 'demo', label: 'Try It' },
    { id: 'docs', label: 'Docs' },
  ]

  const isFirstFeature = feature.number === 1
  const isLastFeature = feature.number === 16
  const module = modules.find(m => m.id === feature.module)

  // Progress tracking + adjacent feature navigation
  const { completed, toggle, percent, total } = useProgress()

  // Keep a ref to the latest completed set so the observer doesn't re-run on every toggle.
  const completedRef = useRef(completed)
  useEffect(() => {
    completedRef.current = completed
  }, [completed])

  const allFeatures = features
  const prevFeature = allFeatures.find(f => f.number === feature.number - 1)
  const nextFeature = allFeatures.find(f => f.number === feature.number + 1)
  const isCompleted = completed.has(feature.id)

  // Fetch source code from GitHub (via backend proxy)
  const loadSource = useCallback(async () => {
    setSourceLoading(true)
    setSourceError(null)
    try {
      const data = await fetchSource(feature.id)
      // API returns an array — use the first file if multiple are returned
      setSource(data.length > 0 ? data[0] : null)
    } catch {
      setSourceError('Could not load source code')
    } finally {
      setSourceLoading(false)
      setSourceLoaded(true)
    }
  }, [feature.id])

  // Auto-complete: detect when the feature section is fully visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.8) {
            if (!completedRef.current.has(feature.id)) {
              toggle(feature.id)
              setCompleteToast(true)
              if (toastTimer.current) clearTimeout(toastTimer.current)
              toastTimer.current = setTimeout(() => setCompleteToast(false), 3000)
            }
          }
        })
      },
      { threshold: 0.8 }
    )

    if (contentRef.current) {
      observer.observe(contentRef.current)
    }
    return () => {
      observer.disconnect()
      if (toastTimer.current) clearTimeout(toastTimer.current)
    }
  }, [feature.id, toggle])

  // Load source on mount if not already loaded
  useEffect(() => {
    if (!sourceLoaded && !sourceError) {
      loadSource()
    }
  }, [sourceLoaded, sourceError, loadSource])

  // Handle Next with loading state
  const handleNext = () => {
    if (isLastFeature) {
      toggle(feature.id)
      window.location.href = '/completion'
      return
    }
    if (!nextFeature) return
    setNextLoading(true)
    toggle(feature.id)
    setTimeout(() => {
      window.location.href = `/feature/${nextFeature.id}`
    }, 300)
  }

  return (
    <div className="feature-page" ref={contentRef}>
      <SetupBanner />

      {/* Prerequisite awareness panel - shows before starting if prerequisites not met */}
      <PrerequisitePanel lessonId={feature.id} prerequisites={[]} />

      <section className="feature-page-hero" id="overview-top">
        <div className="feature-page-header">
          <span className="feature-page-number">{feature.number}</span>
          <h1>{feature.title}</h1>
        </div>
        <p className="feature-page-endpoint">{feature.endpoint}</p>
      </section>

      <InPageNav tabs={tabs} />

      <section id="overview" className="feature-page-explanation">
        <h2>What is this?</h2>
        <p>{feature.description}</p>
        {feature.concepts && feature.concepts.length > 0 && (
          <div className="concept-tag-list">
            {feature.concepts.map((c) => (
              <span key={c} className="concept-tag">{c}</span>
            ))}
          </div>
        )}

        {/* Architecture */}
        {feature.architecture && (
          <section className="architecture-section" style={{ marginTop: 'var(--space-8)' }}>
            <h2>Architecture</h2>
            <ArchitectureDiagram text={feature.architecture} />
          </section>
        )}

        {/* Code Diff: Before Spring AI vs With Spring AI */}
        {feature.codeDiff && (
          <section className="code-diff-section" style={{ marginTop: 'var(--space-8)' }}>
            <h2>Before Spring AI vs With Spring AI</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
              See how Spring AI simplifies the implementation compared to manual HTTP calls.
            </p>
            <CodeDiff
              before={feature.codeDiff.before}
              after={feature.codeDiff.after}
              beforeTitle={feature.codeDiff.beforeTitle}
              afterTitle={feature.codeDiff.afterTitle}
              language="java"
            />
          </section>
        )}

        {/* Module context if this has one */}
        {module && (
          <div className="module-context">
            <span className="feature-page-endpoint" style={{ marginTop: 'var(--space-3)' }}>
              <strong>Module:</strong> {module.title}
            </span>
          </div>
        )}
      </section>

      <section id="source" className="feature-page-source">
        <h2>Implementation (with Line Numbers)</h2>
        <p className="feature-page-source-desc">
          View the actual Spring AI source code behind this feature.
          Key implementation lines are highlighted in blue.
        </p>
        <div className="code-toggle-wrapper">
          <button
            type="button"
            className={`code-toggle-btn${source ? '' : ' code-toggle-hide'}`}
            onClick={() => setShowCode(!showCode)}
            aria-label={showCode ? 'Hide code' : 'Show code'}
            title={showCode ? 'Hide code' : 'Show code'}
          >
            {showCode ? '◀ Hide Code' : '▶ Show Code'}
          </button>
        </div>
        {showCode && source ? (
          <CodeView code={source.content} filename={source.file} />
        ) : source && (
          <p className="code-preview">{source.content?.split('\n').slice(0, 10).join('\n') || 'No source loaded'}{source.content?.split('\n').length > 10 ? `... (+${source.content.split('\n').length - 10} more lines)` : ''}</p>
        )}
        {sourceError && <p className="error-box">{sourceError}</p>}
        {sourceLoading && !source && <Skeleton lines={8} />}
        {sourceLoading && source && (
          <CodeView code={source.content} filename={source.file} collapsed />
        )}
      </section>

      <section id="demo" className="feature-page-demo">
        <h2>Try It Live</h2>
        <p>Configure the parameters below and click "Try It" to call the real Spring AI backend.</p>
        <DemoPanel key={feature.id} feature={feature} />
      </section>

      <section id="docs" className="feature-page-docs">
        <h2>Official Documentation</h2>
        <ul className="docs-list">
          <li>
            <a href="https://docs.spring.io/spring-ai/reference/index.html" target="_blank" rel="noreferrer">
              Spring AI 2.0.1 Reference Documentation →
            </a>
          </li>
          <li>
            <a href="https://docs.spring.io/spring-ai/reference/api/chatclient.html" target="_blank" rel="noreferrer">
              ChatClient API →
            </a>
          </li>
          <li>
            <a href="https://docs.spring.io/spring-ai/reference/concepts.html" target="_blank" rel="noreferrer">
              AI Concepts Overview →
            </a>
          </li>
        </ul>
        <p className="docs-note">
          The official Spring AI documentation provides comprehensive guides, configuration options,
          and detailed examples. Use the links above to dive deeper into each topic.
        </p>
      </section>

      {/* Progress indicator at bottom if not first feature */}
      {!isFirstFeature && feature.module && (
        <section className="module-progress" style={{ marginTop: 'var(--space-8)', padding: 'var(--space-6) var(--space-4)', background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--card-border)', marginBottom: 'var(--space-8)' }}>
          <h3 style={{ fontSize: '0.875rem', marginBottom: 'var(--space-3)', color: 'var(--text-secondary)' }}>
            Learning Progress
          </h3>
          <p style={{ fontSize: '0.75rem', marginBottom: 'var(--space-3)', color: 'var(--text-muted)' }}>
            Move through the modules:
            <span style={{ color: 'var(--spring-green)', fontWeight: 500 }}>
              {module?.id === 'foundations' ? 'Foundations → Core → Advanced → Specialized' : ''}
            </span>
          </p>
          <div className="progress-bar" style={{ height: '6px' }}>
            <div className="progress-fill" style={{ width: `${percent}%` }} />
          </div>
          <p style={{ fontSize: '0.7rem', marginTop: 'var(--space-2)', color: 'var(--text-muted)' }}>
            {completed.size} / {total} features completed
          </p>
        </section>
      )}

      {/* Checkpoint - Test understanding at the end of each feature */}
      {feature.checkpoint && (
        <section className="checkpoint-section" style={{ marginTop: 'var(--space-8)', padding: 'var(--space-4) var(--space-6)', background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--card-border)', maxWidth: '800px' }}>
          <h2>Check Your Understanding</h2>
          <Checkpoint
            type={feature.checkpoint.type}
            question={feature.checkpoint.question}
            options={feature.checkpoint.options?.map(opt => ({ label: opt, value: opt })) ?? []}
            answer={feature.checkpoint.answer}
            explanation={feature.checkpoint.explanation}
          />
        </section>
      )}

      {/* Auto-complete toast */}
      {completeToast && (
        <div className="auto-complete-toast" role="status" aria-live="polite">
          ✓ Feature marked complete
        </div>
      )}

      {/* Bottom navigation bar */}
      <nav className="feature-nav-bottom" aria-label="Feature navigation">
        <div className="feature-nav-bottom-left">
          <label className="mark-complete-check">
            <input
              type="checkbox"
              checked={isCompleted}
              onChange={() => toggle(feature.id)}
            />
            <span>Mark as complete</span>
          </label>
        </div>
        <div className="feature-nav-bottom-right">
          <button
            type="button"
            className="nav-prev"
            disabled={isFirstFeature}
            onClick={() => { if (prevFeature) window.location.href = `/feature/${prevFeature.id}` }}
          >
            ← {isFirstFeature ? 'Start' : 'Previous'}
          </button>
          {!isLastFeature ? (
            <button
              type="button"
              className={`nav-next${nextLoading ? ' nav-next--loading' : ''}`}
              onClick={handleNext}
              disabled={nextLoading}
              data-loading={nextLoading}
              aria-busy={nextLoading}
              aria-label="Next feature"
            >
              {nextLoading ? <span className="spinner" aria-hidden="true" /> : 'Next →'}
            </button>
          ) : (
            <button
              type="button"
              className="nav-next nav-next--completed"
              onClick={() => { toggle(feature.id); window.location.href = '/completion' }}
            >
              🎓 Go to Completion
            </button>
          )}
        </div>
      </nav>
    </div>
  )
}
