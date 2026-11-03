export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    const expected =
      process.env.ADMIN_PASSWORD ||
      process.env.NEXT_PUBLIC_ADMIN_PASS ||
      'rafsan2972';

    if (password && password === expected) {
      return Response.json({ ok: true });
    }
    return Response.json({ ok: false, error: 'Invalid access code' }, { status: 401 });
  } catch {
    return Response.json({ ok: false, error: 'Bad request' }, { status: 400 });
  }
}
