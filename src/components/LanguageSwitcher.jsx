import { LANGS } from '../i18n.js'
import { useApp } from '../store.jsx'

export default function LanguageSwitcher({ pills = false }) {
  const { lang, setLang } = useApp()
  if (pills) {
    return (
      <div className="lang-pills" role="group" aria-label="Language">
        {LANGS.map((l) => (
          <button
            key={l.code}
            type="button"
            className={`lang-pill ${lang === l.code ? 'active' : ''}`}
            onClick={() => setLang(l.code)}
          >
            {l.label}
          </button>
        ))}
      </div>
    )
  }
  return (
    <div className="lang" role="group" aria-label="Language">
      {LANGS.map((l) => (
        <button
          key={l.code}
          type="button"
          className={lang === l.code ? 'active' : ''}
          onClick={() => setLang(l.code)}
          aria-pressed={lang === l.code}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}