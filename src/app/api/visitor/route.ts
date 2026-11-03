export const runtime = 'edge';

const isConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  return Boolean(url && key && !url.includes('your-project-id.supabase.co'));
};

const sbUrl = () => process.env.NEXT_PUBLIC_SUPABASE_URL!;
const sbKey = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const headers = () => ({
  'Content-Type': 'application/json',
  apikey:         sbKey(),
  Authorization:  `Bearer ${sbKey()}`,
});

export async function GET() {
  if (!isConfigured()) {
    return Response.json({ count: 128 });
  }
  try {
    const res = await fetch(
      `${sbUrl()}/rest/v1/pf_visitor_counter?id=eq.1&select=count`,
      { headers: headers() }
    );
    const data = await res.json();
    return Response.json({ count: data?.[0]?.count ?? 128 });
  } catch {
    return Response.json({ count: 128 });
  }
}

export async function POST() {
  if (!isConfigured()) {
    return Response.json({ count: 129 });
  }
  try {
    const res = await fetch(`${sbUrl()}/rest/v1/rpc/increment_visitor_count`, {
      method:  'POST',
      headers: headers(),
      body:    JSON.stringify({}),
    });

    if (res.ok) {
      const count = await res.json();
      return Response.json({ count: count ?? 129 });
    }

    const getRes = await fetch(
      `${sbUrl()}/rest/v1/pf_visitor_counter?id=eq.1&select=count`,
      { headers: headers() }
    );
    const current = await getRes.json();
    const newCount = (current?.[0]?.count ?? 128) + 1;

    await fetch(`${sbUrl()}/rest/v1/pf_visitor_counter?id=eq.1`, {
      method:  'PATCH',
      headers: { ...headers(), Prefer: 'return=minimal' },
      body:    JSON.stringify({ count: newCount }),
    });

    return Response.json({ count: newCount });
  } catch {
    return Response.json({ count: 129 });
  }
}
