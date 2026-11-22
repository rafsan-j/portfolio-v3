import { NextResponse } from 'next/server';
import { PROFILE } from '@/content/profile';

interface ContactPayload {
  name: string;
  email: string;
  subject?: string;
  message: string;
  website?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parsePayload(body: unknown): ContactPayload | null {
  if (typeof body !== 'object' || body === null) return null;
  const record = body as Record<string, unknown>;

  const name = typeof record.name === 'string' ? record.name.trim() : '';
  const email = typeof record.email === 'string' ? record.email.trim() : '';
  const subject =
    typeof record.subject === 'string' ? record.subject.trim() : undefined;
  const message =
    typeof record.message === 'string' ? record.message.trim() : '';
  const website =
    typeof record.website === 'string' ? record.website.trim() : undefined;

  return { name, email, subject, message, website };
}

export async function POST(request: Request) {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid JSON request body.' },
      { status: 400 }
    );
  }

  const payload = parsePayload(rawBody);
  if (!payload) {
    return NextResponse.json(
      { ok: false, error: 'Invalid contact payload.' },
      { status: 400 }
    );
  }

  // Silent honeypot check
  if (payload.website && payload.website.length > 0) {
    return NextResponse.json({ ok: true, mode: 'accepted' }, { status: 200 });
  }

  if (payload.name.length < 2 || payload.name.length > 120) {
    return NextResponse.json(
      { ok: false, error: 'Please provide your name (2–120 characters).' },
      { status: 400 }
    );
  }

  if (!EMAIL_PATTERN.test(payload.email) || payload.email.length > 254) {
    return NextResponse.json(
      { ok: false, error: 'Please provide a valid email address.' },
      { status: 400 }
    );
  }

  if (payload.message.length < 10) {
    return NextResponse.json(
      { ok: false, error: 'Message must be at least 10 characters long.' },
      { status: 400 }
    );
  }

  if (payload.message.length > 5000) {
    return NextResponse.json(
      { ok: false, error: 'Message must be 5,000 characters or fewer.' },
      { status: 400 }
    );
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return NextResponse.json(
      { ok: true, mode: 'mailto_fallback' },
      { status: 200 }
    );
  }

  const subjectLine =
    payload.subject && payload.subject.length > 0
      ? `[Portfolio] ${payload.subject.slice(0, 140)}`
      : `[Portfolio] Message from ${payload.name}`;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:
          process.env.CONTACT_FROM_EMAIL ||
          'Portfolio Contact <onboarding@resend.dev>',
        to: [PROFILE.email],
        reply_to: payload.email,
        subject: subjectLine,
        text: `Name: ${payload.name}\nEmail: ${payload.email}\n\n${payload.message}`,
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { ok: true, mode: 'mailto_fallback' },
        { status: 200 }
      );
    }

    return NextResponse.json({ ok: true, mode: 'sent' }, { status: 200 });
  } catch {
    return NextResponse.json(
      { ok: true, mode: 'mailto_fallback' },
      { status: 200 }
    );
  }
}
