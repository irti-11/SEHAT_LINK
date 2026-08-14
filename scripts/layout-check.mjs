import { spawn } from 'child_process'
import { chromium } from 'playwright-core'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const BASE = process.env.BASE_URL || 'http://localhost:3001'

async function main() {
  const proc = spawn(EDGE, [
    '--headless=new', '--disable-gpu', '--no-first-run',
    '--remote-debugging-port=9335',
    `--user-data-dir=${process.env.TEMP}\\sehat-edge-layout`, 'about:blank'
  ], { stdio: 'ignore' })
  await new Promise((r) => setTimeout(r, 4000))
  let browser
  for (let i = 0; i < 20; i++) {
    try { browser = await chromium.connectOverCDP('http://localhost:9335'); break }
    catch { await new Promise((r) => setTimeout(r, 1000)) }
  }
  const ctx = browser.contexts()[0]
  const page = ctx.pages()[0] || (await ctx.newPage())

  const check = async (label) => {
    const metrics = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth
    }))
    const overflow = metrics.scrollW > metrics.clientW + 1
    console.log(`${overflow ? 'OVERFLOW' : 'ok      '}  ${label}  scrollW=${metrics.scrollW} clientW=${metrics.clientW}`)
    if (overflow) process.exitCode = 1
  }

  // mobile checks
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(BASE + '/#/', { waitUntil: 'networkidle' })
  await page.waitForSelector('h1')
  await check('landing @390')
  await page.getByRole('button', { name: 'Explore Demo' }).click()
  await page.waitForURL(/#\/intake/)
  await page.waitForSelector('textarea.input')
  await check('intake @390')
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.waitForURL(/#\/brief/, { timeout: 60000 })
  await page.waitForSelector('.brief-section')
  await check('health-brief @390')
  await page.getByRole('button', { name: 'Generate Doctor Brief' }).click()
  await page.waitForURL(/#\/doctor-brief/)
  await page.waitForSelector('.db-sheet')
  await check('doctor-brief @390')

  // desktop check
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(BASE + '/#/', { waitUntil: 'networkidle' })
  await page.waitForSelector('h1')
  await check('landing @1440')

  await browser.close()
  proc.kill()
}
main().catch((e) => { console.error(e.message); process.exit(1) })