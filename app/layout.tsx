import type { Metadata } from 'next';
import { Fraunces, Space_Grotesk } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import Link from 'next/link';
import NavAuth from './nav-auth';
import { clerkEnabled } from '@/lib/flags';
import {
  SITE_URL,
  SITE_NAME,
  TAGLINE,
  DESCRIPTION,
  jsonLd,
  websiteJsonLd,
  organizationJsonLd,
  softwareAppJsonLd,
} from '@/lib/seo';
import './globals.css';

const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces' });
const grotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-grotesk' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — AI Tattoo Generator. ${TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  keywords: [
    'AI tattoo generator', 'tattoo design', 'tattoo ideas', 'tattoo stencil',
    'custom tattoo design', 'tattoo styles', 'tattoo generator free',
  ],
  openGraph: { siteName: SITE_NAME, type: 'website' },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const shell = (
      <html lang="en" className={`${fraunces.variable} ${grotesk.variable}`}>
        <body>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: jsonLd(websiteJsonLd()) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: jsonLd(organizationJsonLd()) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: jsonLd(softwareAppJsonLd()) }}
          />
          <nav className="nav">
            <div className="nav-inner">
              <Link href="/" className="logo">Ink<b>Once</b></Link>
              <div className="nav-links">
                <Link href="/create">Design studio</Link>
                <Link href="/styles">Styles</Link>
                <Link href="/ideas">Ideas</Link>
                <Link href="/placements">Placements</Link>
                <Link href="/pricing">Pricing</Link>
              </div>
              {clerkEnabled ? <NavAuth /> : null}
              <Link href="/create" className="btn btn-blood btn-sm">Start free</Link>
            </div>
          </nav>
          {children}
          <footer className="footer">
            <div className="wrap footer-grid">
              <div>
                <div className="logo" style={{ marginBottom: 12 }}>Ink<b>Once</b></div>
                <p className="muted small" style={{ maxWidth: 300 }}>
                  {TAGLINE} AI tattoo design that respects the craft — and your
                  wallet. Your designs stay private and stay yours, forever.
                </p>
              </div>
              <div>
                <h4>Design</h4>
                <Link href="/create">Design studio</Link>
                <Link href="/styles">All 28 styles</Link>
                <Link href="/ideas">Tattoo ideas</Link>
                <Link href="/placements">Placements</Link>
              </div>
              <div>
                <h4>Product</h4>
                <Link href="/pricing">Pricing</Link>
                <Link href="/faq">FAQ</Link>
                <Link href="/account">My designs</Link>
              </div>
              <div>
                <h4>For machines</h4>
                <Link href="/llms.txt">llms.txt</Link>
                <Link href="/openapi.json">OpenAPI</Link>
                <Link href="/api/mcp">MCP server</Link>
              </div>
            </div>
            <div className="wrap small faint" style={{ marginTop: 40 }}>
              © {new Date().getFullYear()} InkOnce. AI-generated designs are concepts for you and
              your tattoo artist to refine — always consult a professional artist before inking.
            </div>
          </footer>
        </body>
      </html>
  );
  // Only mount ClerkProvider when configured — keeps the public site (and its
  // 1,476 SEO pages) rendering before auth keys are added. Sign-in-gated
  // surfaces (/create, /account) branch on clerkEnabled themselves.
  return clerkEnabled ? <ClerkProvider>{shell}</ClerkProvider> : shell;
}
