'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useUser, SignInButton } from '@clerk/nextjs';
import Link from 'next/link';
import { STYLES } from '@/lib/content/styles';
import { PLACEMENTS } from '@/lib/content/placements';

type Allowance = {
  plan: string;
  remaining: { draftRuns: number; refineRuns: number; hiResExports: number; stencilExports: number };
};

type Gen = {
  id: string;
  kind: 'draft' | 'refine' | 'stencil' | 'hires';
  status: 'pending' | 'completed' | 'failed' | 'nsfw';
  subject: string;
  styleSlug: string;
  images: string[];
  error?: string;
};

const COMPLEXITIES = ['simple', 'balanced', 'detailed'] as const;
const COLORS = [
  ['blackwork', 'Black'],
  ['black-and-grey', 'Black & grey'],
  ['color', 'Colour'],
] as const;

export default function Studio({ initialIdea, initialStyle }: { initialIdea?: string; initialStyle?: string }) {
  const { isSignedIn } = useUser();
  const [subject, setSubject] = useState(initialIdea ?? '');
  const [styleSlug, setStyleSlug] = useState(initialStyle && STYLES.some((s) => s.slug === initialStyle) ? initialStyle : 'fine-line');
  const [placementSlug, setPlacementSlug] = useState('forearm');
  const [complexity, setComplexity] = useState<(typeof COMPLEXITIES)[number]>('balanced');
  const [colorMode, setColorMode] = useState<string>('');
  const [runs, setRuns] = useState<Gen[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allowance, setAllowance] = useState<Allowance | null>(null);
  const [upsell, setUpsell] = useState<string | null>(null);
  const pollers = useRef<Set<string>>(new Set());

  const refreshAllowance = useCallback(async () => {
    if (!isSignedIn) return;
    try {
      const res = await fetch('/api/credits');
      if (res.ok) setAllowance(await res.json());
    } catch { /* non-fatal */ }
  }, [isSignedIn]);

  useEffect(() => { refreshAllowance(); }, [refreshAllowance]);

  const poll = useCallback((genId: string) => {
    if (pollers.current.has(genId)) return;
    pollers.current.add(genId);
    const tick = async () => {
      try {
        const res = await fetch(`/api/generate/${genId}`);
        if (res.ok) {
          const gen: Gen = await res.json();
          setRuns((prev) => prev.map((r) => (r.id === genId ? gen : r)));
          if (gen.status !== 'pending') {
            pollers.current.delete(genId);
            refreshAllowance();
            return;
          }
        }
      } catch { /* retry */ }
      setTimeout(tick, 2500);
    };
    setTimeout(tick, 2500);
  }, [refreshAllowance]);

  async function start(body: Record<string, unknown>, endpoint = '/api/generate') {
    setBusy(true);
    setError(null);
    setUpsell(null);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 402) {
        setUpsell(data.error ?? 'You’ve used your free runs.');
        return;
      }
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Try again.');
        return;
      }
      const gen: Gen = data;
      setRuns((prev) => [gen, ...prev]);
      poll(gen.id);
      refreshAllowance();
    } catch {
      setError('Network hiccup — try again.');
    } finally {
      setBusy(false);
    }
  }

  const generate = () =>
    start({
      subject,
      styleSlug,
      placementSlug,
      complexity,
      colorMode: colorMode || undefined,
      kind: 'draft',
    });

  const refine = (parentId: string) =>
    start({ subject, styleSlug, placementSlug, complexity, colorMode: colorMode || undefined, kind: 'refine', parentId });

  const exportRun = (parentId: string, imageIndex: number, kind: 'stencil' | 'hires') =>
    start({ parentId, imageIndex, kind }, '/api/export');

  const remainingDrafts = allowance?.remaining.draftRuns;
  const style = STYLES.find((s) => s.slug === styleSlug)!;

  return (
    <div className="studio">
      <aside className="panel">
        <div className="field">
          <label htmlFor="idea">Your idea</label>
          <textarea
            id="idea"
            value={subject}
            maxLength={300}
            placeholder="e.g. a snake coiled around a dagger, with a single peony"
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="style">Style</label>
          <select id="style" className="chip-select" value={styleSlug} onChange={(e) => setStyleSlug(e.target.value)}>
            {STYLES.map((s) => (
              <option key={s.slug} value={s.slug}>{s.name}</option>
            ))}
          </select>
          <p className="small faint" style={{ marginTop: 6 }}>{style.tagline}</p>
        </div>

        <div className="field">
          <label htmlFor="placement">Placement</label>
          <select id="placement" className="chip-select" value={placementSlug} onChange={(e) => setPlacementSlug(e.target.value)}>
            {PLACEMENTS.map((p) => (
              <option key={p.slug} value={p.slug}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Detail</label>
          <div className="chip-row">
            {COMPLEXITIES.map((c) => (
              <button key={c} className={`chip ${complexity === c ? 'on' : ''}`} onClick={() => setComplexity(c)}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>Ink</label>
          <div className="chip-row">
            <button className={`chip ${colorMode === '' ? 'on' : ''}`} onClick={() => setColorMode('')} title="Let the style decide">
              Style default
            </button>
            {COLORS.map(([val, label]) => (
              <button key={val} className={`chip ${colorMode === val ? 'on' : ''}`} onClick={() => setColorMode(val)}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {isSignedIn ? (
          <>
            <button className="btn btn-blood" style={{ width: '100%' }} disabled={busy || !subject.trim()} onClick={generate}>
              {busy ? 'Working…' : 'Generate designs'}
            </button>
            {allowance && (
              <div className="meter" style={{ marginTop: 14 }}>
                {allowance.plan === 'free' ? (
                  <span>{remainingDrafts} free {remainingDrafts === 1 ? 'run' : 'runs'} left — private &amp; yours forever</span>
                ) : (
                  <span>
                    {allowance.plan === 'pass' ? 'Design Pass' : 'Ink Studio'} · {remainingDrafts} runs · {allowance.remaining.refineRuns} refines ·{' '}
                    {allowance.remaining.hiResExports} hi-res · {allowance.remaining.stencilExports} stencils
                  </span>
                )}
              </div>
            )}
          </>
        ) : (
          <SignInButton mode="modal">
            <button className="btn btn-blood" style={{ width: '100%' }}>
              Sign in to design free — no card
            </button>
          </SignInButton>
        )}

        {error && <div className="notice" style={{ marginTop: 14 }}>{error}</div>}
        {upsell && (
          <div className="notice" style={{ marginTop: 14 }}>
            <p style={{ marginBottom: 10 }}>{upsell}</p>
            <Link href="/pricing" className="btn btn-bone btn-sm">Get the Design Pass — $19.99 once</Link>
          </div>
        )}
      </aside>

      <section>
        {runs.length === 0 ? (
          <div className="panel pending-tile" style={{ minHeight: 380 }}>
            <p className="lede" style={{ textAlign: 'center' }}>
              Your designs land here.<br />
              <span className="small faint">Drafts explore the idea; refine the winner for studio quality.</span>
            </p>
          </div>
        ) : (
          runs.map((run) => (
            <div key={run.id} className="panel" style={{ marginBottom: 18 }}>
              <p className="small faint" style={{ marginBottom: 12 }}>
                {run.kind === 'draft' ? 'Draft run' : run.kind === 'refine' ? 'Refined render' : run.kind === 'stencil' ? 'Stencil' : 'Hi-res render'}
                {' · '}{run.subject}
              </p>
              {run.status === 'pending' && (
                <div className="pending-tile" style={{ padding: '48px 0' }}>
                  <div className="spinner" />
                  <span>Inking… usually under 30 seconds</span>
                </div>
              )}
              {(run.status === 'failed' || run.status === 'nsfw') && (
                <div className="notice">{run.error ?? 'Generation failed — the run was not counted.'}</div>
              )}
              {run.status === 'completed' && (
                <div className="results-grid">
                  {run.images.map((url, i) => (
                    <figure key={url} className="design-tile">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`${run.subject} — ${run.styleSlug} tattoo design, option ${i + 1}`} loading="lazy" />
                      <figcaption className="design-actions">
                        {run.kind === 'draft' && (
                          <button className="btn btn-bone btn-sm" disabled={busy} onClick={() => refine(run.id)}>
                            ✦ Refine
                          </button>
                        )}
                        {(run.kind === 'refine' || run.kind === 'hires') && (
                          <button className="btn btn-bone btn-sm" disabled={busy} onClick={() => exportRun(run.id, i, 'stencil')}>
                            Stencil
                          </button>
                        )}
                        {run.kind === 'refine' && (
                          <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => exportRun(run.id, i, 'hires')}>
                            Hi-res
                          </button>
                        )}
                        <a className="btn btn-ghost btn-sm" href={url} download target="_blank" rel="noreferrer">
                          Save
                        </a>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </section>
    </div>
  );
}
