/**
 * Footer — Rebuilt to Maven Clinic's exact footer layout.
 * Features a solid dark green background (#0A1C14), rounded-t-[3rem] top corners,
 * multi-column layout, custom green newsletter form box, and a bottom row
 * with legal links and large brand typography.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail } from 'lucide-react';

function Col({ title, children }) {
  return (
    <div>
      <h3 className="pmx-display text-[14px] font-semibold text-white tracking-wide">{title}</h3>
      <ul className="mt-5 space-y-3">{children}</ul>
    </div>
  );
}

function FootLink({ href, to, children, external }) {
  const cls =
    'group inline-flex items-center gap-1 text-[13.5px] text-emerald-100/60 transition-colors duration-300 hover:text-white';
  const arrow = (
    <ArrowRight
      className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
      aria-hidden="true"
    />
  );
  if (to)
    return (
      <li>
        <Link to={to} className={cls}>
          {children}
          {arrow}
        </Link>
      </li>
    );
  return (
    <li>
      <a href={href} className={cls} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {children}
        {arrow}
      </a>
    </li>
  );
}

export default function Footer({ m, basePath = '' }) {
  const [subscribed, setSubscribed] = useState(false);
  const year = new Date().getFullYear();
  const anchor = (hash) => (basePath ? { to: `${basePath}${hash}` } : { href: hash });

  return (
    <footer className="relative bg-[#0A1C14] text-white rounded-t-[3rem] overflow-hidden pt-20 pb-12 select-none" aria-label="Footer">
      <div className="mx-auto max-w-7xl px-6">
        
        {/* Main Columns Grid */}
        <div className="grid gap-12 lg:grid-cols-12 border-b border-white/10 pb-16">
          {/* Column 1 (span 2.5): Services Links */}
          <div className="lg:col-span-3">
            <Col title="Clynic Programs">
              {(m.services.length ? m.services : [{ name: 'General consultation' }]).slice(0, 6).map((s) => (
                <FootLink key={s.name} {...anchor('#services')}>
                  {s.name}
                </FootLink>
              ))}
            </Col>
          </div>

          {/* Column 2 (span 2): Company Links */}
          <div className="lg:col-span-2">
            <Col title="Company">
              <FootLink {...anchor('#about')}>About us</FootLink>
              {m.doctors.length ? <FootLink {...anchor('#doctors')}>Doctors</FootLink> : null}
              {m.reviews.length ? <FootLink {...anchor('#stories')}>Patient stories</FootLink> : null}
              <FootLink {...anchor('#faq')}>FAQ</FootLink>
            </Col>
          </div>

          {/* Column 3 (span 2.5): Resources */}
          <div className="lg:col-span-3">
            <Col title="Resources">
              <FootLink to={m.bookHref}>Book appointment</FootLink>
              <FootLink to={m.portalHref}>Patient portal</FootLink>
              <FootLink {...anchor('#technology')}>Our technology</FootLink>
              {(m.pages || []).map((p) => (
                <FootLink key={p.slug} to={`/c/${m.clinic.slug}/p/${p.slug}`}>
                  {p.title}
                </FootLink>
              ))}
            </Col>
          </div>

          {/* Column 4 (span 4): Stay In the Loop Newsletter Form (Maven Box Style) */}
          <div className="lg:col-span-4">
            <div className="rounded-2xl bg-[#005A36]/40 border border-emerald-500/20 p-6">
              <h4 className="text-[14px] font-semibold text-white tracking-wide">Stay in the loop</h4>
              
              {subscribed ? (
                <p className="mt-4 text-sm text-emerald-300 font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Thank you for subscribing.
                </p>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSubscribed(true);
                  }}
                  className="mt-4"
                >
                  <div className="flex border-b border-emerald-400/30 focus-within:border-emerald-300 pb-2">
                    <input
                      type="email"
                      required
                      placeholder="Enter your email*"
                      className="grow bg-transparent text-sm text-white placeholder:text-emerald-100/30 outline-none border-none pr-4"
                    />
                    <button
                      type="submit"
                      className="text-sm font-semibold text-white hover:text-emerald-300 transition-colors"
                    >
                      Subscribe
                    </button>
                  </div>
                  <p className="mt-3.5 text-[11px] text-emerald-100/50 leading-relaxed">
                    By signing up, I agree with the data protection policy of Clynic.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar: Logo & Legal Links */}
        <div className="pt-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between text-white/50">
          <div>
            {/* Huge clean brand text */}
            <span className="pmx-display text-4xl font-semibold tracking-wider text-white select-none">
              CLYNIC
            </span>
            <p className="mt-2 text-[12px] text-emerald-100/40">
              © {year} {m.name}. All rights reserved.
            </p>
          </div>

          {/* Inline legal list */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[12px] font-medium text-emerald-100/50">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Security</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            <a href="#" className="hover:text-white transition-colors">Your Privacy Choices</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
