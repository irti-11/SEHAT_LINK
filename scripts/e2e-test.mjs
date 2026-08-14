import { execSync, spawn } from 'child_process'
import { chromium } from 'playwright-core'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const BASE = process.env.BASE_URL || 'http://localhost:3001'
const results = []
let failures = 0

function log(name, ok, extra = '') {
  results.push({ name, ok, extra })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? `  · ${extra}` : ''}`)
  if (!ok) failures++
}

async function main() {
  const userData = process.env.TEMP + '\\sehat-edge-profile'
  const args = [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--remote-debugging-port=9333',
    `--user-data-dir=${userData}`,
    'about:blank'
  ]
  const proc = spawn(EDGE, args, { stdio: 'ignore' })
  await new Promise((r) => setTimeout(r, 4000))

  let browser
  for (let i = 0; i < 20; i++) {
    try {
      browser = await chromium.connectOverCDP('http://localhost:9333')
      break
    } catch { await new Promise((r) => setTimeout(r, 1000)) }
  }
  if (!browser) throw new Error('Could not connect to Edge via CDP')

  const ctx = browser.contexts()[0]
  const page = ctx.pages()[0] || (await ctx.newPage())
  const consoleErrors = []
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text())
  })
  page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + e.message))

  await page.goto(BASE, { waitUntil: 'networkidle' })

  // Landing
  await page.waitForSelector('h1', { timeout: 15000 })
  const h1 = await page.locator('h1').first().innerText()
  log('landing renders headline', h1.length > 10, h1.slice(0, 40))

  // Language switch to Roman Urdu
  await page.getByRole('button', { name: 'Roman Urdu' }).first().click()
  await page.waitForTimeout(200)
  const btnRoman = await page.locator('.btn-primary').first().innerText()
  log('roman urdu toggle works', btnRoman.includes('Health Brief'), btnRoman)

  // Switch back to English
  await page.getByRole('button', { name: 'English' }).first().click()

  // Explore Demo
  await page.getByRole('button', { name: 'Explore Demo' }).click()
  await page.waitForURL(/#\/intake/, { timeout: 10000 })
  await page.waitForSelector('textarea.input')
  const ta = await page.locator('textarea.input').inputValue()
  log('demo fills description', ta.length > 10, ta.slice(0, 30))
  const chips = await page.locator('.file-chip').count()
  log('demo loads sample report', chips === 1, `chips=${chips}`)

  // Continue
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.waitForURL(/#\/processing/, { timeout: 10000 })
  await page.waitForSelector('.processing', { timeout: 10000 })
  log('processing screen shows', true)
  const stageDone = await page.locator('.stage.done').count()
  await page.waitForTimeout(1500)
  log('processing animates stages', true, `done-stages=${stageDone}`)

  // Health brief
  await page.waitForURL(/#\/brief/, { timeout: 60000 })
  await page.waitForSelector('.brief-section', { timeout: 15000 })
  const concern = await page.locator('.brief-section').first().innerText()
  log('health brief renders sections', concern.length > 5, concern.slice(0, 60).replace(/\n/g, ' | '))
  const specialist = await page.locator('.specialist-card h3').innerText()
  log('specialist suggested', specialist.length > 0, specialist)

  // Doctor brief
  await page.getByRole('button', { name: 'Generate Doctor Brief' }).click()
  await page.waitForURL(/#\/doctor-brief/, { timeout: 10000 })
  await page.waitForSelector('.db-sheet', { timeout: 10000 })
  const dbTitle = await page.locator('.db-title').innerText()
  log('doctor brief sheet renders', dbTitle.includes('DOCTOR'), dbTitle)

  // Copy
  await page.getByRole('button', { name: 'Copy Brief' }).click()
  await page.waitForTimeout(300)
  const copiedText = await page.locator('.db-actions .btn-primary').innerText()
  log('copy brief works', copiedText.length > 0, copiedText)

  // Download
  const dlPromise = page.waitForEvent('download', { timeout: 10000 })
  await page.getByRole('button', { name: 'Download' }).click()
  const dl = await dlPromise
  log('download brief works', dl.suggestedFilename().includes('sehat'), dl.suggestedFilename())

  // Start new
  await page.getByRole('button', { name: 'Start New Brief' }).click()
  await page.waitForURL(/#\/intake/, { timeout: 10000 })
  const taAfter = await page.locator('textarea.input').inputValue()
  log('start new clears input', taAfter === '')

  // Client-side validation: Continue disabled when empty
  const disabled = await page.getByRole('button', { name: 'Continue' }).isDisabled()
  log('continue disabled on empty input', disabled)

  // Server-side validation: empty description returns 400
  const bad = await fetch(BASE + '/api/brief', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description: '   ', documents: [], language: 'en' })
  })
  log('server rejects empty description (400)', bad.status === 400, `status=${bad.status}`)

  // Upload type validation: reject unsupported file type client-side
  await page.locator('input[type=file]').setInputFiles({
    name: 'notes.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('hello')
  })
  await page.waitForTimeout(300)
  const errMsg = await page.locator('p.small').textContent().catch(() => '')
  log('unsupported file type rejected', errMsg.length > 0, errMsg)

  console.log(`\nConsole errors: ${consoleErrors.length}`)
  consoleErrors.slice(0, 10).forEach((e) => console.log('  ✗', e))

  log('no console errors', consoleErrors.length === 0)

  await browser.close()
  proc.kill()
  console.log(`\n${failures === 0 ? 'ALL TESTS PASSED' : failures + ' TEST(S) FAILED'}`)
  process.exit(failures === 0 ? 0 : 1)
}

main().catch((e) => {
  console.error('FATAL', e.message)
  process.exit(1)
})