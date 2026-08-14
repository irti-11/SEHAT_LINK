# SEHAT LINK 🇵🇰

**Specialist healthcare, without the distance.**

SEHAT LINK is an AI-powered healthcare access platform that helps patients in rural and underserved areas of Pakistan organize their health information — natural-language descriptions, old reports, prescriptions — into a clear, structured brief they can share with a qualified healthcare professional.

> SEHAT LINK helps organize information for discussion with a qualified healthcare professional. It does not provide a medical diagnosis or replace a doctor.

## Stack

- **Frontend** — React 18 + Vite (custom design system, no UI framework)
- **Backend** — Express (Node 22)
- **AI layer** — clean service abstraction (`server/aiService.js`) over any OpenAI-compatible provider
- **PDF text extraction** — `pdfjs-dist` (legacy build, Node-safe)
- **Routing** — HashRouter (works from any static host)

## Architecture

```
React UI  →  Server / API layer  →  AI Service  →  AI Model Provider (OpenAI-compatible)
```

API keys live only in the server via environment variables. Never exposed to the browser.

## Getting started

```bash
npm install

# Run in development (Vite on :5173, API on :3001, proxied)
npm run dev

# Production
npm run build
npm start        # serves built app + API on :3001
```

### AI configuration

Copy `.env.example` to `.env` and set your key. The app reads the key server-side only — never from the browser.

```env
# Active provider: Groq (OpenAI-compatible)
GROQ_API_KEY=                          # or reuse OPENAI_API_KEY
OPENAI_API_KEY=gsk_...
AI_BASE_URL=https://api.groq.com/openai/v1
AI_MODEL=llama-3.3-70b-versatile
```

Alternative xAI/Grok config (use an `xai-...` key from console.x.ai):

```env
XAI_API_KEY=xai-...
XAI_BASE_URL=https://api.x.ai/v1
AI_MODEL=grok-4.5
```

If no key is present the API returns a clear `503` error telling you what to configure — failures are never silently hidden. Set `SEHAT_DEMO_MODE=true` only to opt in to the offline heuristic demo. `.env` is git-ignored.

## The flow

1. **Landing** — clear value prop, multilingual
2. **Intake** — free-text in English / Urdu / Roman Urdu + PDF/JPG/PNG uploads
3. **Processing** — staged AI progress animation
4. **Health Brief** — structured main concern, symptoms, history, medications, reports, possible specialist (framed as "may consider discussing with", never a diagnosis), questions for the doctor
5. **Doctor Brief** — professional handoff with **Copy**, **Download**, **Print**

## Safety boundaries

The AI never diagnoses, prescribes, changes dosages, or invents history/tests/medications. Missing information is reported as **Not provided**. Everything shown is traceable to patient input or uploaded documents. The brief includes a fixed medical-disclaimer note.

## Demo

"Explore Demo" loads the demo scenario:

> "3 haftay se sar dard hai, kabhi BP high hota hai aur ye meri purani report hai."

plus a generated sample lab report, runs the full pipeline, and produces a professional doctor brief.

## Testing

```bash
node scripts/e2e-test.mjs     # full user flow against the running app (uses installed Edge via CDP)
node scripts/layout-check.mjs # overflow checks at mobile + desktop widths
```

## Project structure

```
server/index.js         Express app + static serving
server/aiService.js     AI abstraction, prompt, JSON validation, demo fallback
src/                    React app (pages, components, i18n, design system)
scripts/                E2E + layout verification
```