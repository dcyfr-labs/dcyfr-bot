import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ThemeProvider } from '@/components/chrome/theme-provider';
import { SiteHeader, type HeaderNavItem } from '@/components/chrome/site-header';
import { SiteFooter, type FooterLink } from '@/components/chrome/site-footer';
import type { ChromeNavSection } from '@/components/chrome/nav-utils';
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

// The v1 nav list minus its "/" entry: SiteHeader skips "/" because the logo is
// the home link. v2 nav items carry no `external` flag; every off-site link
// opens in the same tab.
const NAV: HeaderNavItem[] = [
  { href: '/agents', label: 'Agents' },
  { href: '/leaderboard', label: 'Leaderboard' },
];

// The drawer is the only place every link is reachable below `md`: the header
// link row and the footer link row are both `hidden md:flex`. Agents and
// Ecosystem are the v1 footer's two columns; Legal is its legal row, which the
// one-line v2 footer keeps on desktop and drops below `md`.
//
// No item may carry `icon`. This file is a Server Component and SiteHeader is
// 'use client', so an ElementType cannot cross the boundary.
const SECTIONS: ChromeNavSection[] = [
  {
    id: 'agents',
    label: 'Agents',
    items: [
      { href: '/agents', label: 'Directory' },
      { href: '/leaderboard', label: 'Leaderboard' },
    ],
  },
  {
    id: 'ecosystem',
    label: 'Ecosystem',
    items: [
      { href: 'https://dcyfr.io', label: 'dcyfr.io' },
      { href: 'https://github.com/dcyfr', label: 'GitHub' },
    ],
  },
  {
    id: 'legal',
    label: 'Legal',
    items: [
      { href: '/privacy', label: 'Privacy' },
      { href: 'https://dcyfr.ai/terms', label: 'Terms' },
      { href: 'https://dcyfr.ai/security', label: 'Security' },
    ],
  },
];

// Flat, and short by design: the v2 footer link row sits on one line beside the
// copyright. The v1 footer's two link columns live in the drawer above.
//
// The v1 `copyright` prop is gone with it — v2 renders `© <year> <brand>` and
// takes no override. Both claims it carried survive elsewhere on the site:
// "MIT licensed" on app/page.tsx and app/agents/page.tsx, "Launching Q4 2026"
// in the home hero. Neither was load-bearing in a footer.
const FOOTER: FooterLink[] = [
  { href: '/privacy', label: 'Privacy' },
  { href: 'https://dcyfr.ai/terms', label: 'Terms' },
  { href: 'https://dcyfr.ai/security', label: 'Security' },
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
      <body className="flex min-h-dvh flex-col antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {/* focus:z-50 clears the fixed header, which is z-40. */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
          >
            Skip to content
          </a>
          <SiteHeader
            logo={DcyfrBotLogo}
            logoAriaLabel="dcyfr.bot home"
            links={NAV}
            mobileNavSections={SECTIONS}
          />
          {/* pt-18 clears the fixed h-18 header. */}
          <main id="main-content" className="flex-1 pt-18">
            {children}
          </main>
          <SiteFooter brand="DCYFR" links={FOOTER} />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
