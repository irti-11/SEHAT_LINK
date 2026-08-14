import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { generateBrief, describeService } from './aiService.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()

app.use(express.json({ limit: '12mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, ...describeService() })
})

app.post('/api/brief', async (req, res) => {
  try {
    const { description, documents = [], language = 'en' } = req.body || {}
    if (!description || typeof description !== 'string' || !description.trim()) {
      return res.status(400).json({ error: 'Please describe your health concern before continuing.' })
    }
    if (documents.length > 4) {
      return res.status(400).json({ error: 'Please upload a maximum of 4 documents.' })
    }
    const brief = await generateBrief({ description: description.trim(), documents, language })
    res.json({ brief })
  } catch (err) {
    console.error('[sehat-link] /api/brief failed:', err.message)
    const status = typeof err.status === 'number' ? err.status : 500
    const code = err.code || 'INTERNAL_ERROR'
    const message = err.message || 'Something went wrong while preparing your brief. Please try again.'
    res.status(status).json({ error: message, code })
  }
})

const dist = path.join(__dirname, '..', 'dist')
app.use(express.static(dist))
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next()
  res.sendFile(path.join(dist, 'index.html'), (err) => (err ? next() : null))
})

const port = process.env.PORT || 3001
app.listen(port, () => {
  console.log(`\n  SEHAT LINK server ready`)
  console.log(`  API:      http://localhost:${port}/api`)
  console.log(`  AI mode:  ${describeService().mode}\n`)
})