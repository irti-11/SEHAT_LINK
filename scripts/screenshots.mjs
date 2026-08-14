import { spawn } from 'child_process'
import { chromium } from 'playwright-core'
import fs from 'fs'
import path from 'path'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const BASE = process.env.BASE_URL || 'http://localhost:3001'
const OUT = 'screenshots'

fs.mkdirSync(OUT, { recursive: true })

async function main() {
  const args = [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--remote-debugging-port=9334',
    `--user-data-dir=${process.env.TEMP}\\sehat-edge-shot`,
    'about:blank'
  ]
  const proc = spawn(EDGE, args, { stdio: 'ignore' })
  await new Promise((r) => setTimeout(r, 4000))

  let browser
  for (let i = 0; i < 20; i++) {
    try { browser = await chromium.connectOverCDP('http://localhost:9334'); break }
    catch { await new Promise((r) => setTimeout(r, 1000)) }
  }
  if (!browser) throw new Error('CDP connect failed')
  const ctx = browser.contexts()[0]
  const page = ctx.pages()[0] || (await ctx.newPage())
  await page.setViewportSize({ width: 1280, height: 860 })

  const snap = async (name) => {
    await page.screenshot({ path: path.join(OUT, name) })
    console.log('saved', name)
  }

  await page.goto(BASE + '/#/', { waitUntil: 'networkidle' })
  await page.waitForSelector('h1')
  await page.waitForTimeout(400)
  await snap('1-landing.png')

  await page.getByRole('button', { name: 'Explore Demo' }).click()
  await page.waitForURL(/#\/intake/)
  await page.waitForSelector('textarea.input')
  await page.waitForTimeout(300)
  await snap('2-intake.png')

  await page.getByRole('button', { name: 'Continue' }).click()
  await page.waitForURL(/#\/processing/)
  await page.waitForTimeout(1400)
  await snap('3-processing.png')

  await page.waitForURL(/#\/brief/, { timeout: 60000 })
  await page.waitForSelector('.brief-section')
  await page.waitForTimeout(300)
  await snap('4-health-brief.png')

  await page.getByRole('button', { name: 'Generate Doctor Brief' }).click()
  await page.waitForURL(/#\/doctor-brief/)
  await page.waitForSelector('.db-sheet')
  await page.waitForTimeout(300)
  await snap('5-doctor-brief.png')

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(BASE + '/#/', { waitUntil: 'networkidle' })
  await page.waitForSelector('h1')
  await page.waitForTimeout(300)
  await snap('6-landing-mobile.png')
  await page.getByRole('button', { name: 'Explore Demo' }).click()
  await page.waitForURL(/#\/intake/)
  await page.waitForSelector('textarea.input')
  await page.waitForTimeout(300)
  await snap('7-intake-mobile.png')

  await browser.close()
  proc.kill()
}
main().catch((e) => { console.error(e.message); process.exit(1) })