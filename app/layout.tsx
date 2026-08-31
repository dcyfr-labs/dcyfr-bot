import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ThemeProvider } from '@/components/theme-provider';
import { PageShell, SiteNav, SiteFooter } from '@/components/chrome';
import './globals.css';

// Named for the face, not the role. The theme engine binds <body> and headings
// to --font-body / --font-display, and the theme resolves each through a
// --font-<role>-loaded hook; globals.css points those hooks and the `font-sans`
// utility at this one variable. Naming it for the face means three roles can
// share it without any Tailwind theme key pointing at another, and swapping
// Inter out later is a one-line change here.
//
// The role name was also unavailable: v4 emits its theme keys as real custom
// properties, so a next/font variable called `--font-sans` collides with the
// theme's own --font-sans, and `--font-sans: var(--font-sans)` self-references.
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'DCYFR Agents — AI Agent Marketplace',
    template: '%s | dcyfr.bot',
  },
  description:
    'Browse, deploy, and chat with production-grade AI agents from the DCYFR workspace.',
  metadataBase: new URL('https://dcyfr.bot'),
  openGraph: {
    siteName: 'dcyfr.bot',
    type: 'website',
    url: 'https://dcyfr.bot',
  },
};

const DcyfrBotLogo = (
  <span className="inline-flex items-center gap-2 text-lg font-bold tracking-tight">
    <span className="text-muted-foreground">⬡</span>
    <span>
      dcyfr<span className="text-muted-foreground">.bot</span>
    </span>
  </span>
);

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/agents', label: 'Agents' },
  { href: '/leaderboard', label: 'Leaderboard' },
];

const FOOTER_COLUMNS = [
  {
    title: 'Agents',
    links: [
      { href: '/agents', label: 'Directory' },
      { href: '/leaderboard', label: 'Leaderboard' },
    ],
  },
  {
    title: 'Ecosystem',
    links: [
      { href: 'https://dcyfr.io', label: 'dcyfr.io', external: true },
      { href: 'https://github.com/dcyfr', label: 'GitHub', external: true },
    ],
  },
];

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // data-identity selects the theme package; the .dark class (added by
    // ThemeProvider) selects the scheme. They are orthogonal by construction —
    // the theme is scoped [data-identity="slate"] / [data-identity="slate"].dark
    // — so identity and scheme cannot tie on specificity the way two single
    // classes on this same element could. Stamped server-side, so it is present
    // in the first paint rather than after hydration.
    <html
      lang="en"
      suppressHydrationWarning
      data-identity="slate"
      className={`${inter.variable} theme-dcyfr-bot`}
    >
      {/* `font-sans` is gone from here. The utility sets font-family in
          @layer utilities, which outranks the engine's [data-identity] body
          binding in @layer base — so leaving it would have made the engine's
          type role dead while the source still looked wired. globals.css maps
          the utility at the same face, so nothing about the rendering changes. */}
      <body className="min-h-screen antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <PageShell
            nav={<SiteNav logo={DcyfrBotLogo} links={NAV_LINKS} />}
            footer={
              <SiteFooter
                brand={{
                  name: 'dcyfr.bot',
                  tagline: 'AI Agent Marketplace',
                }}
                columns={FOOTER_COLUMNS}
                copyright="© 2026 DCYFR. All agents MIT licensed. — launching Q4 2026"
              />
            }
            padding="none"
            maxWidth="full"
          >
            {children}
          </PageShell>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
