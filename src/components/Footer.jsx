import { useApp } from '../store.jsx'

export default function Footer() {
  const { t } = useApp()
  return (
    <footer className="footer">
      <div className="inner">
        <p className="message">
          {t('footerMessage1')}
          <br />
          <em>{t('footerMessage2')}</em>
        </p>
        <div className="footer-bottom">
          <span>SEHAT LINK · 2026</span>
          <span>{t('footerTag')}</span>
        </div>
      </div>
    </footer>
  )
}