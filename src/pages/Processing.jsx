import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../store.jsx'

export default function Processing() {
  const { t, lang, lastInput, setBrief, startNew } = useApp()
  const navigate = useNavigate()
  const [stage, setStage] = useState(0)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    if (!lastInput) {
      navigate('/intake', { replace: true })
      return
    }
    setStage(0)
    setError('')

    const timers = [700, 1500, 2300].map((ms, i) =>
      setTimeout(() => mounted.current && setStage(i + 1), ms)
    )

    ;(async () => {
      try {
        const res = await fetch('/api/brief', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            description: lastInput.description,
            documents: lastInput.documents || [],
            language: lang
          })
        })
        if (!mounted.current) return
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || 'request failed')
        }
        const data = await res.json()
        if (!mounted.current) return
        setBrief(data.brief)
        setTimeout(() => mounted.current && navigate('/brief'), 600)
      } catch (err) {
        if (mounted.current) setError(err.message || 'request failed')
      }
    })()

    return () => {
      mounted.current = false
      timers.forEach(clearTimeout)
    }
  }, [attempt]) // eslint-disable-line react-hooks/exhaustive-deps

  const stages = [t('stage1'), t('stage2'), t('stage3')]

  if (error) {
    return (
      <section className="error-page">
        <div className="container">
          <div className="error-card">
            <div className="err-icon" aria-hidden="true">⚠</div>
            <h1>{t('errorTitle')}</h1>
            <p>{t('errorMsg')}</p>
            {error && (
              <p className="small" style={{ color: 'var(--danger)', background: 'rgba(161,54,31,0.07)', borderRadius: 8, padding: '10px 12px', marginBottom: 22, wordBreak: 'break-word' }}>
                {error}
              </p>
            )}
            <div className="actions">
              <button type="button" className="btn btn-primary" onClick={() => setAttempt((a) => a + 1)}>
                {t('tryAgain')}
              </button>
              <button type="button" className="btn btn-ghost" onClick={startNew}>
                {t('startNew')}
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="processing">
      <div className="processing-card">
        <div className="spinner" aria-hidden="true" />
        <h2>{t('processingTitle')}</h2>
        <div className="stages">
          {stages.map((label, i) => {
            const cls = i < stage ? 'done' : i === stage ? 'active' : 'pending'
            return (
              <div className={`stage ${cls}`} key={i}>
                <span className="dot">{i < stage ? '✓' : ''}</span>
                <span>{label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}