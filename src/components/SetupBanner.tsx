import { useEffect, useState } from 'react'
import { fetchHealth } from '../api/health'
import type { HealthStatus } from '../api/health'

interface SetupBannerProps {
  compact?: boolean
}

export default function SetupBanner({ compact = false }: SetupBannerProps) {
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHealth().then((h) => {
      setHealth(h)
      setLoading(false)
    })
  }, [])

  if (loading) return null
  if (!health) {
    return (
      <div className={`setup-banner setup-banner--warning${compact ? ' setup-banner--compact' : ''}`}>
        <div className="setup-banner-header">
          <span className="icon">⚠️</span>
          <strong>Backend unreachable</strong>
        </div>
        <p>
          The Spring AI backend is not running or cannot be reached. Check that the server is started and the API URL is correct.
        </p>
        <p className="setup-banner-detail">
          Current API URL: <code>{typeof import.meta.env !== 'undefined' && import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL : window.location.origin}</code>
        </p>
      </div>
    )
  }

  if (health.status === 'ready') return null

  return (
    <div className={`setup-banner${compact ? ' setup-banner--compact' : ''}`}>
      <div className="setup-banner-header">
        <span className="icon">⚠️</span>
        <strong>Setup required</strong>
      </div>
      <p>
        Your <code>OPENROUTER_API_KEY</code> is not configured. The server is
        running, but LLM calls will fail until you add a key.
      </p>
      <ol>
        <li>
          Get a free key at{' '}
          <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer">
            openrouter.ai/keys
          </a>
        </li>
        <li>
          Copy <code>.env.example</code> to <code>.env</code> and paste your key
        </li>
        <li>Restart the server: <code>./gradlew bootRun</code></li>
      </ol>
      {!health.apiKeyConfigured && (
        <p className="setup-banner-detail">
          API key: <strong>Missing</strong> — add <code>OPENROUTER_API_KEY</code> to <code>.env</code>
        </p>
      )}
      {health.apiKeyConfigured && (
        <p className="setup-banner-detail">
          API key: <strong>Configured</strong> — but the server still needs attention. Check the model and base URL.
        </p>
      )}
      <p className="setup-banner-detail">
        Current config: model = <code>{health.chatModel || 'not set'}</code>, base URL = <code>{health.baseUrl}</code>
      </p>
    </div>
  )
}
