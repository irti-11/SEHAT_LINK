import { spawn } from 'child_process'
import { chromium } from 'playwright-core'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const BASE = process.env.BASE_URL || 'http://localhost:3001'

async function main() {
  const proc = spawn(EDGE, [
    '--headless=new', '--disable-gpu', '--no-first-run',
    '--remote-debugging-port=9336',
    `--user-data-dir=${process.env.TEMP}\\sehat-edge-brief`, 'about:blank'
  ], { stdio: 'ignore' })
  await new Promise((r) => setTimeout(r, 4000))
  let browser
  for (let i = 0; i < 20; i++) {
    try { browser = await chromium.connectOverCDP('http://localhost:9336'); break }
    catch { await new Promise((r) => setTimeout(r, 1000)) }
  }
  const ctx = browser.contexts()[0]
  const page = ctx.pages()[0] || (await ctx.newPage())
  const consoleErrors = []
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()) })
  page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + e.message))

  const requests = []
  page.on('request', (req) => { if (req.url().includes('/api/brief')) requests.push(req) })
  page.on('response', (res) => { if (res.url().includes('/api/brief')) requests.push({ url: res.url(), status: res.status() }) })

  await page.goto(BASE + '/#/', { waitUntil: 'networkidle' })
  await page.waitForSelector('h1')
  await page.getByRole('button', { name: 'Explore Demo' }).click()
  await page.waitForURL(/#\/intake/)
  await page.waitForSelector('textarea.input')
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.waitForURL(/#\/processing/)

  await page.waitForSelector('.error-card', { timeout: 60000 })
  const errText = await page.locator('.error-card p.small').innerText()
  console.log('ERROR CARD SHOWS:', errText.slice(0, 200))
  console.log('NETWORK:', JSON.stringify(requests))

  console.log('console errors:', consoleErrors.length)
  consoleErrors.slice(0, 5).forEach((e) => console.log('  -', e.slice(0, 150)))

  await browser.close()
  proc.kill()
}
main().catch((e) => { console.error('FATAL', e.message); process.exit(1) })