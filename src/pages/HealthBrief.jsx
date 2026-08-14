import { Navigate, useNavigate } from 'react-router-dom'
import { useApp } from '../store.jsx'

function Section({ title, children }) {
  return (
    <div className="brief-section">
      <div className="bs-title">{title}</div>
      {children}
    </div>
  )
}

function List({ items, muted }) {
  return (
    <ul className="clean">
      {items.map((item, i) => (
        <li key={i} className={muted ? 'muted-italic' : ''}>{item}</li>
      ))}
    </ul>
  )
}

const NA = 'Not provided'

export default function HealthBrief() {
  const { t, brief } = useApp()
  const navigate = useNavigate()

  if (!brief) return <Navigate to="/intake" replace />

  const list = (arr) => (Array.isArray(arr) && arr.length ? arr : [NA])

  return (
    <section className="brief">
      <div className="container">
        <div className="brief-head">
          <span className="eyebrow">SEHAT LINK</span>
          <h1>{t('briefTitle')}</h1>
          <p>{t('briefSub')}</p>
        </div>

        <div className="brief-col">
          <Section title={t('sMainConcern')}>
            <p className="big">{brief.mainConcern}</p>
          </Section>

          <Section title={t('sSymptoms')}>
            <List items={list(brief.symptoms)} muted={brief.symptoms?.[0] === NA} />
          </Section>

          <Section title={t('sHistory')}>
            <List items={list(brief.medicalHistory)} muted={brief.medicalHistory?.[0] === NA} />
          </Section>

          <Section title={t('sMedications')}>
            <List items={list(brief.medications)} muted={brief.medications?.[0] === NA} />
          </Section>

          <Section title={t('sReports')}>
            <List items={list(brief.documentFindings)} muted={brief.documentFindings?.[0] === NA} />
          </Section>

          <div className="specialist-card">
            <span className="sc-tag">{t('sSpecialist')}</span>
            <h3>{brief.specialistType}</h3>
            <p className="sc-why">
              <strong>{t('sSpecialistWhy')} — </strong>
              {brief.specialistReason}
            </p>
          </div>

          <Section title={t('sQuestions')}>
            <List items={list(brief.doctorQuestions)} />
          </Section>

          <div className="safety-box">
            <span className="sb-tag">{t('safetyTag')}</span>
            <p>{brief.safetyNote}</p>
          </div>

          <div className="spacer-16" />
          <button type="button" className="btn btn-primary btn-block" onClick={() => navigate('/doctor-brief')}>
            {t('genDoctorBrief')}
          </button>
          <div className="spacer-16" />
          <button type="button" className="btn btn-ghost btn-block" onClick={() => navigate('/intake')}>
            {t('backIntake')}
          </button>
        </div>
      </div>
    </section>
  )
}