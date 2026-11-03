export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { name, email, message, honeypot } = await req.json();

    if (honeypot) return new Response('OK', { status: 200 });
    if (!name || !email || !message) {
      return new Response('Missing fields', { status: 400 });
    }

    const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const sbKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // If Supabase is configured, store the message in pf_inbox_messages
    if (sbUrl && sbKey && !sbUrl.includes('your-project-id.supabase.co')) {
      const insertRes = await fetch(`${sbUrl}/rest/v1/pf_inbox_messages`, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          apikey:          sbKey,
          Authorization:   `Bearer ${sbKey}`,
          Prefer:          'return=minimal',
        },
        body: JSON.stringify({
          sender_name:  name,
          sender_email: email,
          message,
        }),
      });

      if (!insertRes.ok) {
        const errText = await insertRes.text();
        console.error('Supabase insert error:', errText);
      }
    }

    // Optional auto-reply via Resend (non-critical)
    const resendKey = process.env.RESEND_API_KEY;
    const resendFrom = process.env.RESEND_FROM_EMAIL || 'Rafsan Jani <onboarding@resend.dev>';
    if (resendKey && !resendKey.includes('your_resend_key_here')) {
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization:  `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from:    resendFrom,
          to:      [email],
          subject: 'Received your message — Rafsan Jani',
          html: `<p>Hi ${name},</p>
                 <p>Thanks for reaching out! I received your message and will reply soon.</p>
                 <p>— Rafsan Jani (CSE @ SUST)</p>`,
        }),
      }).catch(() => {});
    }

    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error('Contact route error:', err);
    return new Response('Server error', { status: 500 });
  }
}
