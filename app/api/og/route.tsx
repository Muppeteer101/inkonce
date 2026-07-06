import { ImageResponse } from 'next/og';

export const runtime = 'edge';

/** Dynamic OG images: /api/og?title=... — ink-black card, bone type, blood accent. */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get('title') ?? 'InkOnce — AI Tattoo Design Studio').slice(0, 90);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: 'linear-gradient(135deg, #0b0b0d 0%, #16161a 100%)',
          color: '#f2efe9',
          fontSize: 32,
        }}
      >
        <div style={{ display: 'flex', fontSize: 40, fontWeight: 700 }}>
          Ink<span style={{ color: '#e03e3e' }}>Once</span>
        </div>
        <div style={{ display: 'flex', fontSize: 72, fontWeight: 600, lineHeight: 1.05, letterSpacing: -2, maxWidth: 980 }}>
          {title}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: 28, color: '#b9b4ab' }}>
          <span>Design it right, once.</span>
          <span style={{ color: '#e03e3e' }}>inkonce.com</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
