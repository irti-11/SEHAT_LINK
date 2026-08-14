import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../store.jsx'

export default function DoctorBrief() {
  const { t, brief, lastInput, startNew } = useApp()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!brief) navigate('/brief', { replace: true })
  }, [brief, navigate])

  if (!brief) return null

  const docs = (lastInput && lastInput.documents && lastInput.documents.length) || 0
  const na = 'Not provided'

  const asList = (arr) => (Array.isArray(arr) && arr.length ? arr : [na])

  const body = [
    `${t('dbTitle')} — SEHAT LINK`,
    '',
    `${t('dbConcern')}: ${brief.mainConcern}`,
    '',
    `${t('dbSymptoms')}:`,
    ...asList(brief.symptoms).map((s) => `  - ${s}`),
    '',
    `${t('dbHistory')}:`,
    ...asList(brief.medicalHistory).map((s) => `  - ${s}`),
    '',
    `${t('dbMeds')}:`,
    ...asList(brief.medications).map((s) => `  - ${s}`),
    '',
    `${t('dbDocs')}:`,
    ...asList(brief.documentFindings).map((s) => `  - ${s}`),
    '',
    `${t('dbQuestions')}:`,
    ...asList(brief.doctorQuestions).map((s) => `  - ${s}`),
    '',
    `${t('dbSource')}: ${t('dbSourceValue')}`,
    '',
    brief.safetyNote || ''
  ].join('\n')

  const copyBrief = async () => {
    try {
      await navigator.clipboard.writeText(body)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = body
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const downloadBrief = () => {
    const blob = new Blob([body], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sehat-link-doctor-brief.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const Row = ({ label, children }) => (
    <div className="db-row">
      <div className="db-label">{label}</div>
      <div className="db-value">{children}</div>
    </div>
  )

  return (
    <section className="db-page">
      <div className="container">
        <div className="db-sheet">
          <div className="db-head">
            <div className="db-brand">
              <img src="/mark.svg" alt="" width="26" height="26" />
              <span>SEHAT<em style={{ fontStyle: 'normal', color: 'var(--green-700)' }}> LINK</em></span>
            </div>
            <div className="db-title">{t('dbTitle')}</div>
            <div className="db-sub">{t('dbSub')}</div>
          </div>

          <Row label={t('dbConcern')}>{brief.mainConcern}</Row>

          <Row label={t('dbSymptoms')}>
            <ul>{asList(brief.symptoms).map((s, i) => <li key={i}>{s}</li>)}</ul>
          </Row>

          <Row label={t('dbHistory')}>
            <ul>{asList(brief.medicalHistory).map((s, i) => <li key={i}>{s}</li>)}</ul>
          </Row>

          <Row label={t('dbMeds')}>
            <ul>{asList(brief.medications).map((s, i) => <li key={i}>{s}</li>)}</ul>
          </Row>

          <Row label={t('dbDocs')}>
            {docs > 0 ? <span>{docs} {t(docs > 1 ? 'reportCountPlural' : 'reportCount')}</span> : <span>{na}</span>}
            {asList(brief.documentFindings).filter((f) => f !== na).length > 0 && (
              <ul style={{ marginTop: 6 }}>
                {asList(brief.documentFindings).filter((f) => f !== na).map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            )}
          </Row>

          <Row label={t('dbQuestions')}>
            <ul>{asList(brief.doctorQuestions).map((s, i) => <li key={i}>{s}</li>)}</ul>
          </Row>

          <Row label={t('dbSource')}>{t('dbSourceValue')}</Row>

          <div className="db-stamp">
            <span aria-hidden="true">◆</span> {brief.safetyNote}
          </div>
        </div>

        <div className="db-actions">
          <button type="button" className="btn btn-primary" onClick={copyBrief}>
            {copied ? t('copied') : t('copyBrief')}
          </button>
          <button type="button" className="btn btn-dark" onClick={downloadBrief}>
            {t('download')}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => window.print()}>
            {t('print')}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/brief')}>
            {t('backToBrief')}
          </button>
          <button type="button" className="btn btn-ghost" onClick={startNew}>
            {t('startNew')}
          </button>
        </div>
      </div>
    </section>
  )
}