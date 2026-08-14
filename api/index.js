// Vercel serverless entry point. Vercel routes /api/* here and serves the
// static Vite build (dist/) for everything else. The app must NOT call
// app.listen() in this context (server/index.js guards on process.env.VERCEL).
import app from '../server/index.js'

export default app