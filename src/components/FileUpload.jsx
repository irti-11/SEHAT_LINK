import { useRef, useState } from 'react'
import { useApp } from '../store.jsx'

const MAX_FILES = 4
const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED = ['application/pdf', 'image/jpeg', 'image/png']

export default function FileUpload({ value, onChange }) {
  const { t } = useApp()
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')

  const toPayload = async (file) => {
    if (file.type === 'application/pdf') {
      const buf = await file.arrayBuffer()
      const bytes = new Uint8Array(buf)
      let bin = ''
      const chunk = 0x8000
      for (let i = 0; i < bytes.length; i += chunk) {
        bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk))
      }
      return { name: file.name, type: file.type, size: file.size, base64: btoa(bin) }
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () =>
        resolve({ name: file.name, type: file.type, size: file.size, dataUrl: reader.result })
      reader.onerror = () => reject(new Error('read failed'))
      reader.readAsDataURL(file)
    })
  }

  const handleFiles = async (list) => {
    setError('')
    const files = Array.from(list)
    if (files.some((f) => !ALLOWED.includes(f.type))) {
      setError(t('uploadError'))
      return
    }
    if (files.some((f) => f.size > MAX_SIZE)) {
      setError(t('uploadError'))
      return
    }
    if (value.length + files.length > MAX_FILES) {
      setError(t('fileTooMany'))
      return
    }
    const docs = []
    for (const f of files) {
      try {
        docs.push(await toPayload(f))
      } catch { /* skip unreadable file */ }
    }
    onChange([...value, ...docs])
  }

  const shortName = (name) => (name.length > 42 ? name.slice(0, 39) + '…' : name)

  return (
    <div>
      <div
        className={`dropzone ${dragging ? 'dragging' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
      >
        <p className="dz-title">{t('uploadTitle')}</p>
        <p className="dz-sub">{t('uploadHint')}</p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          multiple
          hidden
          onChange={(e) => { handleFiles(e.target.files); e.target.value = '' }}
        />
        <button type="button" className="dz-btn" onClick={() => inputRef.current?.click()}>
          {t('uploadBtn')}
        </button>
      </div>

      {error && <p className="muted small" style={{ color: 'var(--danger)', marginTop: 10 }}>{error}</p>}

      {value.length > 0 && (
        <div className="dz-list">
          {value.map((doc, i) => (
            <div className="file-chip" key={`${doc.name}-${i}`}>
              <span className="fc-icon">{doc.type === 'application/pdf' ? 'PDF' : 'IMG'}</span>
              <div>
                <div className="fc-name">{shortName(doc.name)}</div>
                <div className="fc-meta">{(doc.size / 1024).toFixed(0)} KB</div>
              </div>
              <span className="fc-status ok">
                <span aria-hidden="true">✓</span> {t('ready')}
              </span>
              <button
                type="button"
                className="fc-remove"
                aria-label={`Remove ${doc.name}`}
                onClick={() => onChange(value.filter((_, j) => j !== i))}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}