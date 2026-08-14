import { spawn } from 'child_process'
import { chromium } from 'playwright-core'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const BASE = process.env.BASE_URL || 'http://localhost:5173'
const SCENARIO =
  'Mujhe pichlay 3 hafton se sar dard ho raha hai. Kabhi kabhi mera blood pressure bhi high aa jata hai. Sar dard zyada tar shaam ko hota hai. Main ne pehle ek local doctor ko dikhaya tha aur unhon ne kuch medicines di thin, lekin mujhe abhi bhi problem hoti hai.'

const hasUrdu = (s) => /[\u0600-\u06FF]/.test(s)
const hasLatin = (s) => /[a-zA-Z]/.test(s)

async function main() {
  const proc = spawn(EDGE, [
    '--headless=new', '--disable-gpu', '--no-first-run',
    '--remote-debugging-port=9337',
    `--user-data-dir=${process.env.TEMP}\\sehat-edge-lang`, 'about:blank'
  ], { stdio: 'ignore' })
  await new Promise((r) => setTimeout(r, 4000))
  let browser
  for (let i = 0; i < 20; i++) {
    try { browser = await chromium.connectOverCDP('http://localhost:9337'); break }
    catch { await new Promise((r) => setTimeout(r, 1000)) }
  }
  const ctx = browser.contexts()[0]
  const page = ctx.pages()[0] || (await ctx.newPage())
  const consoleErrors = []
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()) })
  page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + e.message))

  let failed = 0
  const modes = [
    { lang: 'en', pill: 'English', continue: 'Continue', expectUrdu: false, expectLatin: true },
    { lang: 'ur', pill: 'اردو', continue: 'جاری رکھیں', expectUrdu: true, expectLatin: false },
    { lang: 'roman', pill: 'Roman Urdu', continue: 'Jari rakhein', expectUrdu: false, expectLatin: true }
  ]

  for (const m of modes) {
    await page.goto(BASE + '/#/intake', { waitUntil: 'networkidle' })
    await page.waitForSelector('textarea.input')
    await page.locator('.intake-card .lang-pill', { hasText: m.pill }).click()
    await page.waitForTimeout(250)
    await page.locator('textarea.input').fill(SCENARIO)
    await page.getByRole('button', { name: m.continue }).click()
    await page.waitForURL(/#\/brief/, { timeout: 60000 })
    await page.waitForSelector('.brief-col')
    await page.waitForTimeout(400)

    const questionsText = await page.locator('.brief-col .brief-section').last().innerText()
    const wholeText = await page.locator('.brief-col').innerText()
    const qUrdu = hasUrdu(questionsText)
    const qLatin = hasLatin(questionsText)
    const safetyUrdu = hasUrdu(wholeText)

    const ok = (m.expectUrdu ? qUrdu : !qUrdu) && (m.expectLatin ? qLatin : !qLatin)
    console.log(`\n=== ${m.lang.toUpperCase()} ===`)
    console.log('questions section:', questionsText.replace(/\n/g, ' | ').slice(0, 220))
    console.log(`questions: Urdu=${qUrdu} Latin=${qLatin}  safety: Urdu=${safetyUrdu}`)
    console.log(ok ? `PASS ${m.lang}` : `FAIL ${m.lang}`)
    if (!ok) failed++

    // Doctor Brief page must also be in the selected language
    await page.getByRole('button', { name: { en: 'Generate Doctor Brief', ur: 'ڈاکٹر بریف تیار کریں', roman: 'Doctor Brief tayyar karein' }[m.lang] }).click()
    await page.waitForURL(/#\/doctor-brief/, { timeout: 10000 })
    await page.waitForSelector('.db-sheet')
    await page.waitForTimeout(300)
    const dbText = await page.locator('.db-sheet').innerText()
    // Strip the brand wordmark "SEHAT LINK" and the documented "Not provided" marker
    // (both are intentionally Latin in every language) — remaining Latin would be a bug.
    const dbGenerated = dbText.replace(/SEHAT\s*LINK/gi, '').replace(/Not provided/gi, '')
    const dbUrdu = hasUrdu(dbText)
    const dbLatin = hasLatin(dbGenerated)
    const dbOk = (m.expectUrdu ? dbUrdu : !dbUrdu) && (m.expectLatin ? dbLatin : !dbLatin)
    console.log(`doctor-brief: Urdu=${dbUrdu} Latin(ex-brand)=${dbLatin}  -> ${dbOk ? 'PASS' : 'FAIL'}`)
    if (!dbOk) failed++
    await page.screenshot({ path: `screenshots/lang-doctor-brief-${m.lang}.png` })
  }

  console.log(`\nConsole errors: ${consoleErrors.length}`)
  consoleErrors.slice(0, 5).forEach((e) => console.log('  -', e.slice(0, 120)))
  console.log(failed === 0 ? '\nALL LANGUAGE TESTS PASSED' : `\n${failed} LANGUAGE TEST(S) FAILED`)
  await browser.close()
  proc.kill()
  process.exit(failed === 0 ? 0 : 1)
}
main().catch((e) => { console.error('FATAL', e.message); process.exit(1) })