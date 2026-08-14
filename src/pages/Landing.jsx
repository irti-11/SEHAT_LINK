import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../store.jsx'
import Footer from '../components/Footer.jsx'
import { DEMO_DESCRIPTION, makeDemoFile } from '../demo.js'

export default function Landing() {
  const { t, setLastInput } = useApp()
  const navigate = useNavigate()

  const exploreDemo = () => {
    setLastInput({ description: DEMO_DESCRIPTION, documents: [makeDemoFile()], isDemo: true })
    navigate('/intake')
  }

  const steps = [
    { n: '01', title: t('step1Title'), body: t('step1') },
    { n: '02', title: t('step2Title'), body: t('step2') },
    { n: '03', title: t('step3Title'), body: t('step3') }
  ]

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <span className="eyebrow eyebrow-lime">SEHAT LINK</span>
          <h1>{t('tagline')}</h1>
          <p className="lead">{t('landingSupport')}</p>
          <div className="hero-actions">
            <Link to="/intake" className="btn btn-primary">
              {t('ctaPrimary')}
            </Link>
            <button type="button" className="btn btn-ghost-dark" onClick={exploreDemo}>
              {t('ctaSecondary')}
            </button>
          </div>
          <p className="hero-hint">{t('langLabel')} · English · اردو · Roman Urdu</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">{t('howTitle')}</span>
            <h2>{t('howSub')}</h2>
          </div>
          <div className="steps">
            {steps.map((s) => (
              <div className="step" key={s.n}>
                <span className="num">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="safety-strip">
        <div className="inner">
          <span className="tag">{t('safetyTag')}</span>
          <p>{t('safetyText')}</p>
        </div>
      </section>

      <Footer />
    </>
  )
}