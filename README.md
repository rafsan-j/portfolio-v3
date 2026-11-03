# Rafsan Jani — Portfolio v2.0 (4-Mode 3D Cyber-Defense & Engineering Edition)

Built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, **Three.js / React Three Fiber**, **Framer Motion**, **Supabase**, and a **Dual-Engine AI Assistant (Groq Llama 3.3 + Google Gemini)**.

---

## ✨ What's New in v2.0

1. **4 Complete Portfolio Personas (Visitor Modes)**:
   - **Developer Mode**: Brutalist cyberpunk command matrix with an interactive 3D geodesic & gyroscopic core (`WebGLScene`), 3D perspective mouse-tilt Bento cards, scroll-triggered animations, live Sylhet clock, UNIX terminal (`` ` ``), and Command Palette (`⌘K`).
   - **Recruiter Mode**: Clean editorial serif/sans executive brief (with Light & Dark toggle), 4 key career/academic metric cards, timeline, 6 flagship engineering projects, and 1-page PDF resume download (`/resume.pdf`).
   - **Friend Mode**: Warm, casual card layout (with Light & Dark toggle) highlighting CSE life at SUST in Sylhet, Waffle Up, Tworon, and book writing.
   - **Cyber Lab 3D (Game Mode — Concept B + Cybersecurity)**: Full-screen interactive **3D Security Operations Center (SOC) & Hardware Lab** built with React Three Fiber featuring:
     - **Station 01 — Firewall Core & OSINT Defense Game**: Playable real-time packet interception radar defense (with Combo Multipliers & EMP Burst) + 4 interactive **OSINT & Cryptography Forensics Challenges** to level up your Security Clearance (`Level 1: Cadet Operator` → `Level 4: Root Architect`).
     - **Station 02 — Dual Holo-Monitors (`// THE LAB`)**: Inspect all 11 engineering projects in 3D space.
     - **Station 03 — CERN Scintillator & IoT Rig (`// THE ARCHIVE`)**: Fire relativistic muon test pulses and read research abstracts.
     - **Station 04 — Tactical Radar Globe (`// COORDINATES`)**: Sylhet (SUST), Dinajpur, Rajshahi (RCC), and Dhaka coordinates.
     - **Station 05 — Neural Core (`// RJ.AI`)**: Launch the live AI assistant and UNIX terminal.

2. **Zero-Downtime Fallback Architecture (`src/lib/fallbackData.ts`)**:
   - Even if you deploy to Vercel **before** setting up Supabase or AI API keys, all **11 projects**, **6 research archive entries**, **3 full Inkwell articles**, **7 Bangladesh map pins**, **4 visual schematics**, and the **RJ.AI Assistant** work 100% out of the box!

3. **Dual AI Provider Failover (`/api/ai-chat`)**:
   - Supports **both** `GROQ_API_KEY` (`llama-3.3-70b-versatile`) and `GOOGLE_GENERATIVE_AI_API_KEY` (`gemini-2.5-flash` / `gemini-2.0-flash`). If both keys are added, it automatically fails over if one hits a rate limit; if neither key is set yet, it streams responses from the built-in local knowledge engine.

4. **Included 1-Page Technical Resume (`public/resume.pdf`)**:
   - Your tailored 1-page technical resume PDF is pre-installed at `public/resume.pdf` so every "Download Resume" button works immediately.

---

## 🚀 Deploy to Vercel (Step-by-Step)

1. Push the contents of this folder to the **root** of your GitHub repository (so `package.json` is at the top level of the repo).
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → Import your GitHub repository.
3. *(Optional but recommended)* Under **Environment Variables**, add the keys below (see table).
4. Click **Deploy**!

---

## 🔑 Environment Variables (`/.env.local`)

| Variable | Required? | Where to Get It | Purpose |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Optional (Fallback built-in) | [supabase.com](https://supabase.com) → Project Settings → API | Connects live PostgreSQL DB for `/admin` edits, contact inbox, and visitor counter |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional (Fallback built-in) | [supabase.com](https://supabase.com) → Project Settings → API | Public anon key for Supabase client queries |
| `GROQ_API_KEY` | Provide Groq **or** Gemini | [console.groq.com/keys](https://console.groq.com/keys) (Free) | Streams ultra-fast Llama 3.3 70B responses in RJ.AI |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Provide Groq **or** Gemini | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) (Free) | Streams Gemini 2.5 / 2.0 Flash responses in RJ.AI |
| `NEXT_PUBLIC_ADMIN_PASS` | Optional | Choose any secret password | Unlocks `/admin` Control Center (defaults to `rafsan2972`) |
| `RESEND_API_KEY` | Optional | [resend.com](https://resend.com) → API Keys | Sends automatic confirmation emails when someone uses `/contact` |

---

## 🗄️ Setting Up Supabase (5 Minutes)

1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor → New Query**, paste the entire contents of `supabase/migration.sql`, and click **Run**.
3. *(Optional for `/admin` Gallery uploads)* Go to **Storage → New Bucket**, name it `portfolio_media`, and toggle **Public bucket** to `ON`.
4. Copy your **Project URL** (`NEXT_PUBLIC_SUPABASE_URL`) and **anon public key** (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) into `.env.local` and Vercel.
