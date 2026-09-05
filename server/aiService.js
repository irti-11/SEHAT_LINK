import "dotenv/config";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const NODE_MODULES = path.resolve(__dirname, "..", "node_modules");

/* Provider configuration — Groq is the active provider (key: console.groq.com).
   XAI_API_KEY / XAI_BASE_URL remain supported for xAI Grok; AI_BASE_URL is the
   generic OpenAI-compatible override. The key never leaves the server. */
const API_KEY =
  process.env.XAI_API_KEY ||
  process.env.GROQ_API_KEY ||
  process.env.OPENAI_API_KEY ||
  "";
const BASE_URL = (
  process.env.GROQ_BASE_URL ||
  process.env.XAI_BASE_URL ||
  process.env.AI_BASE_URL ||
  "https://api.groq.com/openai/v1"
).replace(/\/+$/, "");
const IS_GROQ = BASE_URL.includes("groq.com");
const IS_XAI = BASE_URL.includes("x.ai");
const MODEL =
  process.env.AI_MODEL ||
  (IS_GROQ
    ? "llama-3.3-70b-versatile"
    : IS_XAI
      ? "grok-4.5"
      : "llama-3.3-70b-versatile");
const PROVIDER_LABEL = IS_GROQ ? "Groq" : IS_XAI ? "xAI (Grok)" : BASE_URL;

/* Explicit opt-in only. With no API key the app fails loudly instead of
   silently serving mock data, unless the operator opts into the demo. */
const DEMO_ALLOWED = process.env.SEHAT_DEMO_MODE === "true";

const SAFETY_NOTE =
  "SEHAT LINK helps organize information for discussion with a qualified healthcare professional. It does not provide a medical diagnosis or replace a doctor.";

const SAFETY_LONG = `${SAFETY_NOTE} If you are experiencing a medical emergency, please contact your local emergency services immediately.`;

/* Output language support. The value sent by the frontend (en | ur | roman)
   drives the language of the ENTIRE AI response. */
const LANGUAGE_NAMES = {
  en: "English",
  ur: "Urdu (Urdu script)",
  roman: "Roman Urdu",
};

const LANGUAGE_HINT = {
  en: "Write naturally in English.",
  ur: "Write only in proper Urdu script. Never use Roman Urdu. Use natural Urdu wording that a Pakistani patient would use.",
  roman:
    "Write only in natural Roman Urdu. Never use Urdu script. Keep wording natural and readable in Roman Urdu.",
};

const LANGUAGE_MIX_RULE = {
  en: "",
  ur: 'SCRIPT RULE: in Urdu mode write EVERY word, number, and medical term in Urdu script (Unicode Arabic block U+0600–U+06FF). Never write any word in Latin/Roman letters — not even drug names. For example write "دوا" and "دوائیں", never "dawai" or "dawaiyon".',
  roman:
    "SCRIPT RULE: in Roman Urdu mode use only Latin letters for every word. Never use Arabic-script (Urdu) characters anywhere in the response.",
};

const QUESTION_EXAMPLE = {
  en: "What could be contributing to these symptoms?",
  ur: "میرے بار بار ہونے والے سر درد کی ممکنہ وجوہات کیا ہو سکتی ہیں؟",
  roman:
    "Mere baar baar honay walay sar dard ki mumkin wajah kya ho sakti hai?",
};

/* Full few-shot example of the JSON response in the selected language.
   "Not provided" / "No documents uploaded" stay Latin by design (missing markers). */
const EXAMPLE_RESPONSE = {
  en: '{"mainConcern":"Recurring headaches for the past 3 weeks","symptoms":["Headache, mostly in the evening","Occasional high blood pressure readings"],"medicalHistory":["Previously consulted a local doctor"],"medications":["Not provided"],"documentFindings":["No documents uploaded"],"specialistType":"Neurology","specialistReason":"The reported symptoms may be appropriate to discuss with a neurological specialist.","doctorQuestions":["What could be contributing to these headaches?","Should my blood pressure readings be reviewed?","Are additional tests appropriate?"],"doctorBrief":"Recurring headaches for 3 weeks with occasional high BP readings. Patient was previously given medication by a local doctor."}',
  ur: '{"mainConcern":"پچھلے تین ہفتوں سے سر درد ہو رہا ہے","symptoms":["سر درد، زیادہ تر شام کے وقت","کبھی کبھی بلڈ پریشر بڑھ جاتا ہے"],"medicalHistory":["پہلے ایک مقامی ڈاکٹر سے رجوع کیا گیا تھا"],"medications":["Not provided"],"documentFindings":["No documents uploaded"],"specialistType":"نورولوجی","specialistReason":"بیان کردہ علامات کے حوالے سے اعصابی ماہر سے گفتگو مناسب ہو سکتی ہے۔","doctorQuestions":["میرے بار بار ہونے والے سر درد کی ممکنہ وجوہات کیا ہو سکتی ہیں؟","کیا میرے بلڈ پریشر کی ریڈنگز کا ڈاکٹر سے جائزہ کروانا چاہیے؟","کیا مزید ٹیسٹ مناسب ہوں گے؟"],"doctorBrief":"مریض کو پچھلے تین ہفتوں سے بار بار سر درد ہو رہا ہے اور کبھی کبھی بلڈ پریشر بھی بڑھ جاتا ہے۔ پہلے ایک مقامی ڈاکٹر سے رجوع کیا گیا تھا۔"}',
  roman:
    '{"mainConcern":"Pichlay teen hafton se sar dard ho raha hai","symptoms":["Sar dard, zyada tar shaam ko","Kabhi kabhi blood pressure barh jata hai"],"medicalHistory":["Pehle ek local doctor se rabta kiya gaya tha"],"medications":["Not provided"],"documentFindings":["No documents uploaded"],"specialistType":"Neurology","specialistReason":"Bayan ki gayi alamaat ke hawale se aasabi maahir se baat karna munasib ho sakta hai.","doctorQuestions":["Mere baar baar honay walay sar dard ki mumkin wajah kya ho sakti hai?","Kya mere blood pressure readings ka doctor se jaiza karwana chahiye?","Kya mazeed tests munasib honge?"],"doctorBrief":"Mareez ko pichlay teen hafton se baar baar sar dard ho raha hai aur kabhi kabhi blood pressure barh jata hai."}',
};

const SAFETY_BY_LANG = {
  en: SAFETY_LONG,
  ur: "سیہت لنک معلومات کو کسی مستند طبی پیشہ ور کے ساتھ گفتگو کے لیے منظم کرنے میں مدد کرتا ہے۔ یہ طبی تشخیص فراہم نہیں کرتا اور نہ ہی ڈاکٹر کی جگہ لیتا ہے۔ اگر آپ کو طبی ایمرجنسی کا سامنا ہے تو فوراً اپنی مقامی ایمرجنسی خدمات سے رابطہ کریں۔",
  roman:
    "SEHAT LINK aap ki maloomat ko kisi qualified healthcare professional se baat karne ke liye munazzam karne mein madad karta hai. Yeh medical diagnosis nahi deta aur na hi daktar ki jagah leta hai. Agar aap ko medical emergency hai to foran apni local emergency services se raabta karein.",
};

function languageOf(payload) {
  const code = payload.language || "en";
  return {
    code,
    name: LANGUAGE_NAMES[code] || "English",
    hint: LANGUAGE_HINT[code] || LANGUAGE_HINT.en,
    mixRule: LANGUAGE_MIX_RULE[code] || "",
    question: QUESTION_EXAMPLE[code] || QUESTION_EXAMPLE.en,
    example: EXAMPLE_RESPONSE[code] || EXAMPLE_RESPONSE.en,
  };
}

export class ProviderError extends Error {
  constructor(message, { status = 502, code = "AI_PROVIDER_ERROR" } = {}) {
    super(message);
    this.name = "ProviderError";
    this.status = status;
    this.code = code;
  }
}

export function describeService() {
  return {
    mode: API_KEY ? "live" : "not-configured",
    provider: PROVIDER_LABEL,
    baseUrl: BASE_URL,
    model: MODEL,
  };
}

/* ------------------------------------------------------------------ */
/* PDF text extraction (best-effort — never blocks the core flow)      */
/* ------------------------------------------------------------------ */
async function extractPdfText(buffer) {
  try {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(
      path.join(
        NODE_MODULES,
        "pdfjs-dist",
        "legacy",
        "build",
        "pdf.worker.mjs",
      ),
    ).toString();
    const stdUrl = pathToFileURL(
      path.join(NODE_MODULES, "pdfjs-dist", "standard_fonts") + path.sep,
    ).toString();
    const doc = await pdfjs.getDocument({
      data: new Uint8Array(buffer),
      isEvalSupported: false,
      standardFontDataUrl: stdUrl,
    }).promise;
    let text = "";
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const tc = await page.getTextContent();
      text += tc.items.map((it) => it.str).join(" ") + "\n";
      page.cleanup();
    }
    await doc.destroy();
    const out = text.trim();
    return out ? out.slice(0, 6000) : null;
  } catch (err) {
    console.warn(
      "[sehat-link] pdf text extraction skipped:",
      err.message.slice(0, 160),
    );
    return null;
  }
}

async function prepareDocuments(documents) {
  const out = [];
  for (const doc of documents) {
    const base = {
      name: String(doc.name || "document").slice(0, 120),
      type: String(doc.type || "application/octet-stream"),
    };
    if (doc.type === "application/pdf") {
      try {
        if (doc.base64 && typeof doc.base64 === "string") {
          const buf = Buffer.from(doc.base64, "base64");
          const text = await extractPdfText(buf);
          if (text) base.text = text;
        }
      } catch {
        /* ignore */
      }
    } else if (doc.dataUrl && typeof doc.dataUrl === "string") {
      base.dataUrl = doc.dataUrl;
    }
    out.push(base);
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* AI provider call — xAI/Grok (OpenAI-compatible)                     */
/* ------------------------------------------------------------------ */
function visionCapable() {
  const m = MODEL.toLowerCase();
  return (
    m.includes("vision") ||
    m.includes("4o") ||
    m.includes("o3") ||
    m.includes("o4") ||
    m.includes("gemini") ||
    m.includes("grok")
  );
}

async function chat(messages, { json = true } = {}) {
  const body = {
    model: MODEL,
    messages,
    temperature: 0.2,
    max_tokens: 950,
  };
  if (json) body.response_format = { type: "json_object" };

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `HTTP ${res.status} from ${PROVIDER_LABEL} (${BASE_URL}/chat/completions): ${text.slice(0, 400)}`,
    );
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error(`Empty response from ${PROVIDER_LABEL}`);
  return content;
}

function buildMessages(payload, documents, withImages) {
  const lang = languageOf(payload);
  const safetyText = SAFETY_BY_LANG[lang.code] || SAFETY_LONG;

  const system = [
    "You are SEHAT LINK, a medical information organization assistant for patients in Pakistan. ",
    "You help patients prepare for a consultation with a qualified healthcare professional.",
    "You are NOT a doctor. You MUST NEVER diagnose a condition, prescribe medication, recommend changing medication dosage, advise stopping a medication, claim certainty about a medical condition, or invent medical facts.",
    "You understand English, Urdu, and Roman Urdu input.",
    "",
    `OUTPUT LANGUAGE — CRITICAL. The patient selected: ${lang.name}.`,
    `Write EVERY field of your JSON response in that language — mainConcern, every item in symptoms, medicalHistory, medications, documentFindings, specialistType, specialistReason, doctorQuestions, and doctorBrief.`,
    lang.hint,
    lang.mixRule,
    "Do not mix languages. Keep medical terms understandable for a normal Pakistani patient, but keep the surrounding text in the selected language.",
    'The only exception: if a field has no known information, use the exact English phrase "Not provided".',
    "Never invent facts. Only use information the patient explicitly provided or information you actually read from the uploaded documents.",
    "When suggesting a specialist, frame it only as a type of specialist the patient may consider discussing their concern with (in the selected language). Never present it as a diagnosis.",
    `Generate 3 to 6 concise questions the patient could discuss with their doctor, all in the selected language. Example (use the same language register): "${lang.question}"`,
    "Respond with ONLY valid JSON (no markdown) matching exactly this schema:",
    '{"mainConcern":"string","symptoms":["string"],"medicalHistory":["string"],"medications":["string"],"documentFindings":["string"],"specialistType":"string","specialistReason":"string","doctorQuestions":["string"],"doctorBrief":"string","safetyNote":"string"}',
    `doctorBrief must be a concise professional handoff (4 to 6 short lines) in the selected language, that a specialist could read in seconds.`,
    `safetyNote must be exactly, in the selected language: "${safetyText}"`,
    "Follow this exact JSON structure and style, fully in the selected language:",
    lang.example,
  ].join(" ");

  const docLines = documents.length
    ? documents.map((d, i) => {
        const lines = [`Document ${i + 1}: ${d.name} (${d.type})`];
        if (d.text) lines.push(`Extracted text: ${d.text}`);
        if (withImages && d.dataUrl) lines.push("(image included for reading)");
        return lines.join("\n");
      })
    : ["No documents uploaded."];

  const user = [
    `Patient selected language: ${lang.name}`,
    `Patient description:\n${payload.description}`,
    `Uploaded documents:\n${docLines.join("\n---\n")}`,
    "Prepare the structured patient brief now, entirely in the selected language.",
  ].join("\n\n");

  const messages = [{ role: "system", content: system }];
  const imageDocs = withImages ? documents.filter((d) => d.dataUrl) : [];
  if (imageDocs.length) {
    messages.push({
      role: "user",
      content: [
        { type: "text", text: user },
        ...imageDocs.map((d) => ({
          type: "image_url",
          image_url: { url: d.dataUrl, detail: "low" },
        })),
      ],
    });
  } else {
    messages.push({ role: "user", content: user });
  }
  return messages;
}

/* ------------------------------------------------------------------ */
/* Response validation                                                 */
/* ------------------------------------------------------------------ */
function extractJson(content) {
  const cleaned = content.replace(/```(?:json)?/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end <= start) throw new Error("No JSON object found");
    return JSON.parse(cleaned.slice(start, end + 1));
  }
}

function asString(v) {
  return typeof v === "string" && v.trim() ? v.trim() : "Not provided";
}
function asList(v) {
  if (Array.isArray(v)) {
    const items = v
      .map((x) => asString(x))
      .filter((x) => x && x !== "Not provided");
    return items.length ? items : ["Not provided"];
  }
  return ["Not provided"];
}

const EMPTY = {
  mainConcern: "Not provided",
  symptoms: ["Not provided"],
  medicalHistory: ["Not provided"],
  medications: ["Not provided"],
  documentFindings: ["Not provided"],
  specialistType: "Not provided",
  specialistReason: "Not provided",
  doctorQuestions: ["Not provided"],
  doctorBrief: "Not provided",
  safetyNote: SAFETY_LONG,
};

function normalize(raw, lang) {
  const r = raw && typeof raw === "object" ? raw : {};
  const safetyText = SAFETY_BY_LANG[lang] || SAFETY_LONG;
  const out = {
    mainConcern: asString(r.mainConcern),
    symptoms: asList(r.symptoms),
    medicalHistory: asList(r.medicalHistory),
    medications: asList(r.medications),
    documentFindings: asList(r.documentFindings),
    specialistType: asString(r.specialistType),
    specialistReason: asString(r.specialistReason),
    doctorQuestions: asList(r.doctorQuestions),
    doctorBrief: asString(r.doctorBrief),
    safetyNote: safetyText,
  };
  if (out.doctorBrief === "Not provided") {
    out.doctorBrief = buildDoctorBrief(out);
  }
  return out;
}

function buildDoctorBrief(b) {
  const lines = [
    `Patient concern: ${b.mainConcern}`,
    `Reported symptoms: ${b.symptoms.join(", ")}`,
    `Relevant history: ${b.medicalHistory.join(", ")}`,
    `Medications: ${b.medications.join(", ")}`,
    `Available documentation: ${b.documentFindings.join("; ")}`,
    `Patient questions: ${b.doctorQuestions.join(" | ")}`,
    "Source: patient-provided information and uploaded documents",
  ];
  return lines.join("\n");
}

/* ------------------------------------------------------------------ */
/* Demo fallback — works with zero configuration                       */
/* ------------------------------------------------------------------ */
const SPECIALISTS = [
  {
    keys: ["headache", "sar dard", "سر", "migraine", "dizziness", "چکر"],
    name: "Neurology",
    why: "Your reported symptoms may be appropriate to discuss with a neurological specialist.",
  },
  {
    keys: [
      "bp",
      "blood pressure",
      "pressure",
      "دباو",
      "heart",
      "دل",
      "chest pain",
      "palpitation",
    ],
    name: "Cardiology",
    why: "Your reported symptoms may be appropriate to discuss with a cardiology specialist.",
  },
  {
    keys: ["sugar", "diabetes", "diabetic", "شوگر", "ذیابیطس"],
    name: "Endocrinology",
    why: "Your reported symptoms may be appropriate to discuss with an endocrinology specialist.",
  },
  {
    keys: [
      "cough",
      "khaansi",
      "کھانسی",
      "breath",
      "saans",
      "دم",
      "chest",
      "phlegm",
      "baalgham",
    ],
    name: "Pulmonology",
    why: "Your reported symptoms may be appropriate to discuss with a pulmonology specialist.",
  },
  {
    keys: [
      "joint",
      "jor",
      "جوڑ",
      "knee",
      "ghutna",
      "گھٹنا",
      "back pain",
      "kamr",
    ],
    name: "Orthopedics",
    why: "Your reported symptoms may be appropriate to discuss with an orthopedics specialist.",
  },
  {
    keys: ["skin", "جلد", "rash", "khujli", "خارش", "itching"],
    name: "Dermatology",
    why: "Your reported symptoms may be appropriate to discuss with a dermatology specialist.",
  },
  {
    keys: [
      "stomach",
      "pet",
      "پیٹ",
      "acid",
      "گیس",
      "gas",
      "diarrhea",
      "dast",
      "اسہال",
      "vomit",
      "qay",
    ],
    name: "Gastroenterology",
    why: "Your reported symptoms may be appropriate to discuss with a gastroenterology specialist.",
  },
  {
    keys: ["eye", "ankh", "آنکھ", "vision", "nazar"],
    name: "Ophthalmology",
    why: "Your reported symptoms may be appropriate to discuss with an ophthalmology specialist.",
  },
  {
    keys: ["ear", "kan", "کان", "hearing", "sunai"],
    name: "ENT (Ear, Nose & Throat)",
    why: "Your reported symptoms may be appropriate to discuss with an ENT specialist.",
  },
  {
    keys: [
      "fever",
      "bukhar",
      "بخار",
      "malaria",
      "ملیریا",
      "typhoid",
      "ٹائیفائیڈ",
    ],
    name: "General Medicine",
    why: "Your reported symptoms may be appropriate to discuss with a general medicine physician.",
  },
];

function detectSpecialist(description) {
  const d = description.toLowerCase();
  for (const s of SPECIALISTS) {
    if (s.keys.some((k) => d.includes(k))) return { name: s.name, why: s.why };
  }
  return {
    name: "General Medicine",
    why: "Based on the information provided, a general medicine physician may be a relevant type of specialist to discuss this with.",
  };
}

function demoBrief(payload, documents) {
  const description = payload.description;
  const specialist = detectSpecialist(description);
  const sentences = description
    .split(/[.,،۔!?\n;]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);
  const symptoms = sentences.length
    ? sentences.slice(0, 6)
    : ["Reported concern as described by the patient."];
  const mainConcern = sentences[0] || "Reported health concern.";
  const docFindings = documents.length
    ? documents.map((d, i) => `Uploaded report ${i + 1}: ${d.name}`)
    : ["Not provided"];
  const medications =
    /medication|medicines|dawa|دوا|tablet|insulin|metformin|atorvastatin|amlodipine/i.test(
      description,
    )
      ? [
          "Referenced in the patient description — please confirm exact list with the patient.",
        ]
      : ["Not provided"];
  const questions = [
    "What could be contributing to these symptoms?",
    "Should any of my current readings or test results be reviewed?",
    "Are additional investigations or tests appropriate for me?",
  ];
  const brief = {
    mainConcern,
    symptoms,
    medicalHistory: ["Not provided"],
    medications,
    documentFindings: docFindings,
    specialistType: specialist.name,
    specialistReason: specialist.why,
    doctorQuestions: questions,
    doctorBrief: [
      `Patient concern: ${mainConcern}`,
      `Reported symptoms: ${symptoms.join(", ")}`,
      "Relevant history: Information provided by patient.",
      "Available documentation: " +
        (documents.length
          ? `${documents.length} uploaded report${documents.length > 1 ? "s" : ""}`
          : "Not provided"),
      "Current medications: " +
        (medications[0] === "Not provided"
          ? "Not provided"
          : "Referenced — confirm list with patient."),
      `Patient questions: ${questions.join(" | ")}`,
      "Source: patient-provided information",
    ].join("\n"),
    safetyNote: SAFETY_LONG,
  };
  return normalize(brief, payload.language);
}

/* ------------------------------------------------------------------ */
/* Script-purity gate for Urdu / Roman Urdu output                     */
/* Returns a corrective instruction if the model mixed scripts, else null */
/* ------------------------------------------------------------------ */
function languageIssue(brief, lang) {
  const fields = [
    brief.mainConcern,
    ...(brief.symptoms || []),
    ...(brief.medicalHistory || []),
    ...(brief.medications || []),
    ...(brief.documentFindings || []),
    brief.specialistType,
    brief.specialistReason,
    ...(brief.doctorQuestions || []),
    brief.doctorBrief,
  ];
  const text = fields
    .filter((x) => typeof x === "string")
    .join(" ")
    .replace(/Not provided/gi, "")
    .replace(/No documents uploaded/gi, "");

  if (lang === "ur" && /[a-zA-Z]/.test(text)) {
    return 'Your previous response mixed Latin letters into Urdu text. Rewrite the ENTIRE JSON in pure Urdu script. Write every word in Urdu script; never use Latin letters for any word (write "کیا" not "Kya", "دوا" not "dawai"). Numbers may stay as digits. Return only the corrected JSON.';
  }
  if (lang === "roman" && /[\u0600-\u06FF]/.test(text)) {
    return "Your previous response used Arabic/Urdu script characters. Rewrite the ENTIRE JSON in Roman Urdu using Latin letters only; never use Arabic-script characters. Return only the corrected JSON.";
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Public entry point                                                  */
/* ------------------------------------------------------------------ */
export async function generateBrief(payload) {
  const documents = await prepareDocuments(payload.documents || []);

  if (!API_KEY) {
    if (DEMO_ALLOWED) {
      console.log(
        "[sehat-link] SEHAT_DEMO_MODE=true — returning offline demo brief (no API key).",
      );
      return demoBrief(payload, documents);
    }
    throw new ProviderError(
      "AI provider is not configured. Add GROQ_API_KEY=<your key> (or reuse OPENAI_API_KEY) to the .env file with AI_BASE_URL and AI_MODEL, then restart the server. Or set SEHAT_DEMO_MODE=true for the offline demo.",
      { status: 503, code: "AI_NOT_CONFIGURED" },
    );
  }

  try {
    const withImages = visionCapable() && documents.some((d) => d.dataUrl);
    const messages = buildMessages(payload, documents, withImages);

    const content = await chat(messages, { json: true });
    let brief = normalize(extractJson(content), payload.language);

    // Script-purity gate: retry up to 2 times if the model mixes scripts
    for (let i = 0; i < 2; i++) {
      const issue = languageIssue(brief, payload.language);
      if (!issue) break;
      console.warn(
        `[sehat-link] script purity issue (${payload.language}), corrective retry ${i + 1}/2.`,
      );
      const corrected = await chat(
        [...messages, { role: "user", content: issue }],
        { json: true },
      );
      brief = normalize(extractJson(corrected), payload.language);
    }

    return brief;
  } catch (err) {
    console.error(
      `[sehat-link] AI API call failed (${PROVIDER_LABEL}, model=${MODEL}):`,
      err.message,
    );

    if (err instanceof ProviderError) {
      throw err;
    }

    throw new ProviderError(
      "Sorry, we couldn't generate your health report right now. Please try again.",
      {
        status: 502,
        code: "AI_PROVIDER_ERROR",
      },
    );
  }
}
