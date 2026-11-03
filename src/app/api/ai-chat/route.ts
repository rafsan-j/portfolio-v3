import { DEFAULT_AI_SYSTEM_PROMPT } from '@/lib/fallbackData';

export const runtime = 'edge';
export const maxDuration = 30;

const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash-latest',
];

const GROQ_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
];

type ChatMessage = { role: 'user' | 'assistant'; content: string };

// ── 1. Try Groq Streaming (OpenAI-compatible SSE) ─────────────────────────────
async function tryGroqStream(
  groqKey: string,
  systemPrompt: string,
  messages: ChatMessage[]
): Promise<ReadableStream<Uint8Array> | null> {
  for (const model of GROQ_MODELS) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model,
          stream: true,
          max_tokens: 450,
          temperature: 0.65,
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map(m => ({ role: m.role, content: m.content })),
          ],
        }),
      });

      if (!res.ok || !res.body) continue;

      return new ReadableStream({
        async start(controller) {
          const reader = res.body!.getReader();
          const decoder = new TextDecoder();
          let buffer = '';
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() ?? '';
              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed.startsWith('data:')) continue;
                const data = trimmed.slice(5).trim();
                if (data === '[DONE]') continue;
                try {
                  const parsed = JSON.parse(data);
                  const delta = parsed?.choices?.[0]?.delta?.content;
                  if (delta) controller.enqueue(new TextEncoder().encode(delta));
                } catch {
                  // skip partial JSON chunk
                }
              }
            }
          } finally {
            controller.close();
          }
        },
      });
    } catch {
      continue;
    }
  }
  return null;
}

// ── 2. Try Google Gemini Streaming (v1beta SSE) ───────────────────────────────
async function tryGeminiStream(
  geminiKey: string,
  systemPrompt: string,
  messages: ChatMessage[]
): Promise<ReadableStream<Uint8Array> | null> {
  const geminiHistory = messages.slice(0, -1).map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
  const lastMsg = messages[messages.length - 1]?.content ?? 'Tell me about Rafsan Jani.';

  const geminiBody = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [...geminiHistory, { role: 'user', parts: [{ text: lastMsg }] }],
    generationConfig: { maxOutputTokens: 450, temperature: 0.7, topP: 0.9 },
  };

  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${geminiKey}&alt=sse`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiBody),
      });

      if (!res.ok || !res.body) continue;

      return new ReadableStream({
        async start(controller) {
          const reader = res.body!.getReader();
          const decoder = new TextDecoder();
          let buffer = '';
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() ?? '';
              for (const line of lines) {
                if (!line.startsWith('data: ')) continue;
                const data = line.slice(6).trim();
                if (data === '[DONE]') continue;
                try {
                  const parsed = JSON.parse(data);
                  const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (text) controller.enqueue(new TextEncoder().encode(text));
                } catch {
                  // skip malformed chunk
                }
              }
            }
          } finally {
            controller.close();
          }
        },
      });
    } catch {
      continue;
    }
  }
  return null;
}

// ── 3. Smart Built-In Local Knowledge Responder (Zero-Downtime Fallback) ──────
function buildLocalSmartReply(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('kairyn') || q.includes('android') || q.includes('wallpaper') || q.includes('widget')) {
    return `Kairyn (v5.1) is Rafsan's flagship native Android habit & rhythm OS built in Kotlin and Jetpack Compose. It features a zero-allocation 60 FPS 3D perspective live wallpaper engine (3D Plexus geodesic sphere, 3D Lorenz chaotic attractor, 3D Flow Field), dynamic 30/60 FPS Choreographer frame throttling, WCAG 2.1 luminance adaptation, self-healing home screen widgets, selective Google Calendar lock-screen overlays, and 30-day OLS Rhythm Index forecasting.`;
  }
  if (q.includes('waffle') || q.includes('tworon') || q.includes('work') || q.includes('experience') || q.includes('role') || q.includes('job')) {
    return `Rafsan currently serves as AI & Automation Executive / Business Systems Strategist at Waffle Up (architecting AI workflow automations, supply-chain logistics, and modular franchise SOPs) and as a STEM & Programming Instructor at Tworon, where he teaches programming and creates 60 FPS mathematical animations with Python and Manim.`;
  }
  if (q.includes('sust') || q.includes('educat') || q.includes('university') || q.includes('college') || q.includes('study') || q.includes('gpa') || q.includes('merit')) {
    return `Rafsan is pursuing his B.Sc. (Engineering) in Computer Science & Engineering (CSE) at Shahjalal University of Science and Technology (SUST) in Sylhet. Previously, he graduated from Rajshahi Cadet College with a perfect GPA 5.00 in both HSC (17th on the National Merit List — Top 0.01% of 180,000+ students, Talentpool Merit Scholar) and SSC (18th nationally).`;
  }
  if (q.includes('leader') || q.includes('prefect') || q.includes('cadet') || q.includes('issb') || q.includes('award') || q.includes('achievement')) {
    return `At Rajshahi Cadet College, Rafsan was appointed College Prefect—the highest student leadership office—leading 297 cadets. He earned Best All-Round Cadet, Best Disciplined Cadet, and the ISSB Green Card (recommended as an Army Officer). His honors include the 2025 Talentpool Merit Scholarship, Innovation World Cup BD Bronze (AgriBase), IYMC Silver Honor (2024), and BdJSO National Winner.`;
  }
  if (q.includes('agribase') || q.includes('cern') || q.includes('project') || q.includes('build') || q.includes('lab')) {
    return `Rafsan's top engineering builds include:\n- Kairyn v5.1: Native Kotlin/Compose Android habit OS with a 60 FPS 3D shader live wallpaper engine.\n- S_Track: Next.js & Supabase modular academic OS for SUST CSE coursework.\n- ParallaxMascot3D: Gyroscope + spring-physics 5-plane 3D Android UI engine.\n- AgriBase: Flask + Bayesian Regression ecosystem on 50,000+ agricultural records (Innovation World Cup Bronze).\n- Punorabritti & Clinical Rx Suite: Python/Selenium transit ticketing monitor and offline clinical prescription app.\n- CERN Beamline & ClearRiver: Relativistic muon detector design and Arduino optical water turbidity analyzer.`;
  }
  if (q.includes('skill') || q.includes('stack') || q.includes('tech') || q.includes('language')) {
    return `Rafsan's core stack spans:\n- Languages: C, C++, Kotlin, Python, TypeScript, JavaScript, SQL\n- Mobile & Web: Jetpack Compose, Android SDK, Next.js 14, React, Three.js / React Three Fiber, Tailwind CSS\n- AI & Backend: Agentic AI Workflows, Gemini & Groq APIs, Supabase (PostgreSQL), Flask, Selenium, Bayesian ML, Manim & NumPy/SciPy DSP\n- Hardware & Security: Arduino Uno, ESP32, Raspberry Pi, SiPM/Optical Sensors, and OSINT/EXIF Digital Forensics.`;
  }
  if (q.includes('contact') || q.includes('hire') || q.includes('email') || q.includes('reach') || q.includes('opportunit')) {
    return `Rafsan is open to software engineering, AI automation, and research collaborations! You can reach him directly at rafsan2972jani@gmail.com, connect on GitHub (github.com/rafsan-j) or LinkedIn (linkedin.com/in/rafsan-jani72), or download his 1-page technical resume at /resume.pdf.`;
  }

  return `Rafsan Jani is a Computer Science & Engineering undergraduate at SUST (Sylhet), AI & Automation Executive at Waffle Up, and Instructor at Tworon. Ranked 17th nationally in HSC (Top 0.01%, Talentpool Scholar) and former College Prefect of 297 cadets at Rajshahi Cadet College, he builds native Android apps (Kairyn v5.1, ParallaxMascot3D), full-stack Next.js/Supabase platforms (S_Track), AI automations, and physics/IoT systems (AgriBase, CERN Beamline). Ask me about his projects, skills, leadership, or how to get in touch!`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages: ChatMessage[] = Array.isArray(body?.messages) ? body.messages : [];

    // 1. Load custom knowledge base from Supabase if configured, else use rich default profile
    let systemPrompt = DEFAULT_AI_SYSTEM_PROMPT;
    try {
      const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const sbKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (sbUrl && sbKey && !sbUrl.includes('your-project-id.supabase.co')) {
        const r = await fetch(
          `${sbUrl}/rest/v1/pf_ai_knowledge?id=eq.1&select=system_prompt_text`,
          { headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` } }
        );
        if (r.ok) {
          const d = await r.json();
          if (d?.[0]?.system_prompt_text) systemPrompt = d[0].system_prompt_text;
        }
      }
    } catch {
      // use DEFAULT_AI_SYSTEM_PROMPT
    }

    const groqKey = (process.env.GROQ_API_KEY ?? '').trim();
    const geminiKey = (process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? '').trim();

    const hasValidGroq = Boolean(groqKey && !groqKey.includes('your_groq_key_here'));
    const hasValidGemini = Boolean(geminiKey && !geminiKey.includes('your_gemini_key_here'));

    let stream: ReadableStream<Uint8Array> | null = null;

    // Try Groq first if available, then automatically fail over to Gemini (and vice versa)
    if (hasValidGroq) {
      stream = await tryGroqStream(groqKey, systemPrompt, messages);
    }
    if (!stream && hasValidGemini) {
      stream = await tryGeminiStream(geminiKey, systemPrompt, messages);
    }

    // If neither API key is configured or both are rate-limited, stream from local knowledge engine
    if (!stream) {
      const lastUserMessage = messages[messages.length - 1]?.content ?? '';
      const replyText = buildLocalSmartReply(lastUserMessage);
      stream = new ReadableStream({
        async start(controller) {
          const words = replyText.split(' ');
          const encoder = new TextEncoder();
          for (let i = 0; i < words.length; i++) {
            controller.enqueue(encoder.encode((i === 0 ? '' : ' ') + words[i]));
            await new Promise(r => setTimeout(r, 12));
          }
          controller.close();
        },
      });
    }

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err) {
    console.error('AI route error:', err);
    return new Response('Server error', { status: 500 });
  }
}
