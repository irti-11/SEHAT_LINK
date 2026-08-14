import { Link } from 'react-router-dom'
import { useApp } from '../store.jsx'
import LanguageSwitcher from './LanguageSwitcher.jsx'

export default function TopBar() {
  const { t } = useApp()
  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <Link to="/" className="logo" aria-label="SEHAT LINK home">
          <img src="/mark.svg" alt="" width="34" height="34" />
          <span className="logo-name">
            SEHAT<em> LINK</em>
          </span>
        </Link>
        <LanguageSwitcher />
      </div>
    </header>
  )
}