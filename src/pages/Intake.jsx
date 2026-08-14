import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../store.jsx'
import FileUpload from '../components/FileUpload.jsx'
import LanguageSwitcher from '../components/LanguageSwitcher.jsx'
import Footer from '../components/Footer.jsx'
import { DEMO_DESCRIPTION, makeDemoFile } from '../demo.js'

export default function Intake() {
  const { t, lastInput, setLastInput } = useApp()
  const navigate = useNavigate()
  const [description, setDescription] = useState('')
  const [documents, setDocuments] = useState([])
  const [showDemoHint, setShowDemoHint] = useState(false)

  useEffect(() => {
    if (lastInput) {
      setDescription(lastInput.description || '')
      setDocuments(lastInput.documents || [])
      setShowDemoHint(!!lastInput.isDemo)
    }
  }, [lastInput])

  const canContinue = description.trim().length > 0

  const onContinue = () => {
    if (!canContinue) return
    setLastInput({ description: description.trim(), documents, isDemo: !!showDemoHint })
    navigate('/processing')
  }

  const loadDemo = () => {
    setDescription(DEMO_DESCRIPTION)
    setDocuments([makeDemoFile()])
    setShowDemoHint(true)
  }

  const clearAll = () => {
    setDescription('')
    setDocuments([])
    setShowDemoHint(false)
  }

  return (
    <>
      <section className="intake">
        <div className="container">
          <div className="intake-card">
            <span className="eyebrow">SEHAT LINK</span>
            <h1>{t('intakeTitle')}</h1>
            <p className="sub">{t('intakeSub')}</p>

            {showDemoHint && (
              <div className="safety-box" style={{ marginBottom: 28 }}>
                <span className="sb-tag">Demo</span>
                <p>{t('demoBanner')}</p>
              </div>
            )}

            <div className="field">
              <label className="field-label" htmlFor="concern">{t('descLabel')}</label>
              <textarea
                id="concern"
                className="input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('descPlaceholder')}
              />
            </div>

            <div className="field">
              <FileUpload value={documents} onChange={setDocuments} />
            </div>

            <div className="field">
              <span className="field-label">{t('langLabel')}</span>
              <LanguageSwitcher pills />
            </div>

            <div className="field" style={{ marginBottom: 8 }}>
              <button type="button" className="btn btn-primary btn-block" disabled={!canContinue} onClick={onContinue}>
                {t('continueBtn')}
              </button>
            </div>

            <div className="center" style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              {!showDemoHint && (
                <button type="button" className="small muted" style={{ background: 'none', border: 0, textDecoration: 'underline' }} onClick={loadDemo}>
                  {t('loadDemo')}
                </button>
              )}
              <button type="button" className="small muted" style={{ background: 'none', border: 0, textDecoration: 'underline' }} onClick={clearAll}>
                {t('clear')}
              </button>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}