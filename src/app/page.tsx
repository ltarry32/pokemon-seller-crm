import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Package, TrendingUp, BarChart3, Scan, Check, Zap, Star } from 'lucide-react';

// ─── Auth guard — send logged-in users straight to the app ────

export default async function RootPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect('/dashboard');

  return (
    <div className="min-h-screen bg-[#0f0f11] text-zinc-100">

      {/* ── Nav ─────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[#0f0f11]/80 backdrop-blur-md border-b border-zinc-800/60">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-zinc-100 text-lg tracking-tight">CollectorVault</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors font-medium px-3 py-1.5"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold px-4 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-14">

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-5 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-6 uppercase tracking-wide">
            <Zap className="w-3 h-3" />
            Built for Pokémon card sellers
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-100 leading-tight tracking-tight mb-5">
            Track your Pokémon card inventory, images, sales, and profit in one place.
          </h1>

          <p className="text-zinc-400 text-lg max-w-xl mx-auto leading-relaxed mb-8">
            CollectorVault helps collectors and sellers organize cards, log sales, view official card
            images, and track portfolio performance with less manual work.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-base transition-all shadow-glow-orange hover:shadow-glow-orange active:scale-95"
            >
              Start Free
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-base transition-colors border border-zinc-700"
            >
              Log In
            </Link>
          </div>

          <p className="text-xs text-zinc-600 mt-4">No credit card required. Start free with up to 25 cards.</p>
        </section>

        {/* ── Features ─────────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-5 pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {[
              {
                icon: Package,
                color: 'text-brand-400',
                bg:   'bg-brand-500/10',
                title: 'Inventory Tracking',
                body:  'Organize your collection with card details, images, condition, quantity, and cost basis.',
              },
              {
                icon: TrendingUp,
                color: 'text-profit',
                bg:   'bg-profit/10',
                title: 'P&L at a Glance',
                body:  'See portfolio value, unrealized gains, profit, and revenue from one dashboard.',
              },
              {
                icon: BarChart3,
                color: 'text-info',
                bg:   'bg-info/10',
                title: 'Sales Analytics',
                body:  'Log completed sales with fees and shipping to track real profit over time.',
              },
              {
                icon: Scan,
                color: 'text-purple-400',
                bg:   'bg-purple-500/10',
                title: 'Quick Card Entry',
                body:  'Find official card images and details faster with built-in lookup tools.',
              },
            ].map(({ icon: Icon, color, bg, title, body }) => (
              <div key={title} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="font-bold text-zinc-100 mb-1.5">{title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Pricing ──────────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-5 pb-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Simple pricing</h2>
            <p className="text-zinc-500 mt-2">Start free, then upgrade when you're ready to track more inventory.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* Free */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col">
              <p className="text-sm font-semibold text-zinc-400 mb-1">Free</p>
              <p className="text-3xl font-extrabold text-zinc-100 mb-1">$0</p>
              <p className="text-xs text-zinc-600 mb-6">Forever free</p>
              <ul className="space-y-2.5 flex-1 mb-6">
                {[
                  'Up to 25 inventory items',
                  'Inventory tracking',
                  'Card image lookup',
                  'Sales logging',
                  'Basic dashboard',
                ].map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-zinc-400">
                    <Check className="w-4 h-4 text-profit shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block text-center py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-sm transition-colors border border-zinc-700"
              >
                Start Free
              </Link>
            </div>

            {/* Pro — highlighted */}
            <div className="bg-zinc-900 border-2 border-brand-500 rounded-2xl p-6 flex flex-col relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="flex items-center gap-1 px-3 py-0.5 rounded-full bg-brand-500 text-white text-[11px] font-bold uppercase tracking-wide">
                  <Star className="w-3 h-3 fill-white" /> Most Popular
                </span>
              </div>
              <p className="text-sm font-semibold text-brand-400 mb-1">Pro</p>
              <p className="text-3xl font-extrabold text-zinc-100 mb-1">
                $9<span className="text-base font-medium text-zinc-500">/mo</span>
              </p>
              <p className="text-xs text-zinc-600 mb-6">Billed monthly</p>
              <ul className="space-y-2.5 flex-1 mb-6">
                {[
                  'Unlimited inventory items',
                  'Everything in Free',
                  'Live pricing',
                  'Advanced analytics',
                  'Fee calculator',
                  'CSV export',
                ].map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-zinc-400">
                    <Check className="w-4 h-4 text-profit shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block text-center py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm transition-colors"
              >
                Upgrade to Pro
              </Link>
            </div>

            {/* Early Access */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col">
              <p className="text-sm font-semibold text-zinc-400 mb-1">Early Access</p>
              <p className="text-3xl font-extrabold text-zinc-100 mb-1">
                Free<span className="text-base font-medium text-zinc-500"> during beta</span>
              </p>
              <p className="text-xs text-zinc-600 mb-6">Get Pro free during beta</p>
              <ul className="space-y-2.5 flex-1 mb-6">
                {[
                  'Full Pro access at no cost',
                  'Early feature access',
                  'Feedback channel',
                  'Limited-time beta access',
                ].map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-zinc-400">
                    <Check className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block text-center py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-sm transition-colors border border-zinc-700"
              >
                Join Early Access
              </Link>
            </div>

          </div>
        </section>

      </main>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-800 py-8 px-5">
  <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
    <div className="flex items-center gap-2">
      <div className="w-5 h-5 rounded-md bg-brand-500 flex items-center justify-center">
        <Package className="w-3 h-3 text-white" />
      </div>
      <span className="text-sm font-semibold text-zinc-400">CollectorVault</span>
    </div>

    <p className="text-xs text-zinc-600">
      © {new Date().getFullYear()} CollectorVault. Built for Pokémon collectors and sellers.
    </p>

    <div className="flex flex-col sm:flex-row gap-4 items-center">
      <div className="flex gap-4">
        <Link href="/login" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
          Log In
        </Link>
        <Link href="/register" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
          Sign Up
        </Link>
      </div>

      <div className="flex gap-4 text-xs text-zinc-600">
        <Link href="/privacy" className="hover:text-zinc-400">
          Privacy
        </Link>
        <Link href="/terms" className="hover:text-zinc-400">
          Terms
        </Link>
        <Link href="/contact" className="hover:text-zinc-400">
          Contact
        </Link>
      </div>
    </div>
  </div>
</footer>
</div>
)
}