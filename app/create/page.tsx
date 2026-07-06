import { Suspense } from 'react';
import { pageMetadata } from '@/lib/seo';
import Studio from './studio';

export const metadata = pageMetadata({
  title: 'Design Studio — free AI tattoo generator',
  description:
    'Describe your tattoo idea, pick one of 28 real styles and a body placement, and generate custom designs in seconds. 3 free runs, private by default, no card required.',
  path: '/create',
});

export default async function CreatePage({
  searchParams,
}: {
  searchParams: Promise<{ idea?: string; style?: string }>;
}) {
  const { idea, style } = await searchParams;
  return (
    <main className="wrap section-tight">
      <p className="kicker">Design studio</p>
      <h1 className="title" style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', marginBottom: 8 }}>
        What are we putting on you?
      </h1>
      <p className="muted" style={{ marginBottom: 30 }}>
        Drafts are for exploring. When one clicks, refine it to studio quality and export
        the stencil.
      </p>
      <Suspense>
        <Studio initialIdea={idea} initialStyle={style} />
      </Suspense>
    </main>
  );
}
