import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { t as translate, LANGS } from './i18n.js'

const Ctx = createContext(null)

const BRIEF_KEY = 'sehat_link_brief_v1'
const INPUT_KEY = 'sehat_link_input_v1'

export function AppProvider({ children }) {
  const [lang, setLang] = useState('en')
  const [brief, setBrief] = useState(null)
  const [lastInput, setLastInput] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const info = LANGS.find((l) => l.code === lang) || LANGS[0]
    document.documentElement.lang = lang
    document.documentElement.dir = info.dir
  }, [lang])

  useEffect(() => {
    try {
      const b = sessionStorage.getItem(BRIEF_KEY)
      if (b) setBrief(JSON.parse(b))
      const i = sessionStorage.getItem(INPUT_KEY)
      if (i) setLastInput(JSON.parse(i))
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    try {
      if (brief) sessionStorage.setItem(BRIEF_KEY, JSON.stringify(brief))
      else sessionStorage.removeItem(BRIEF_KEY)
    } catch { /* ignore */ }
  }, [brief])

  useEffect(() => {
    try {
      if (lastInput) sessionStorage.setItem(INPUT_KEY, JSON.stringify(lastInput))
      else sessionStorage.removeItem(INPUT_KEY)
    } catch { /* ignore */ }
  }, [lastInput])

  const t = (key) => translate(lang, key)

  const startNew = () => {
    setBrief(null)
    setLastInput(null)
    navigate('/intake')
  }

  const value = { lang, setLang, t, brief, setBrief, lastInput, setLastInput, startNew }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}