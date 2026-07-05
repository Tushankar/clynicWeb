import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail } from 'lucide-react';
import { SafeImg } from '../ui';

function Col({ title, children }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-emerald-300 uppercase tracking-widest">{title}</h3>
      <ul className="mt-5 space-y-3">{children}</ul>
    </div>
  );
}

function FootLink({ href, to, children, badge }) {
  const cls =
    'group inline-flex items-center gap-1.5 text-sm text-emerald-100/60 transition-colors duration-300 hover:text-white';
  const arrow = (
    <ArrowRight
      className="h-3 w-3 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 text-emerald-400"
      aria-hidden="true"
    />
  );
  
  const content = (
    <>
      <span>{children}</span>
      {badge && (
        <span className="text-[9px] font-bold text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-md ml-1 bg-emerald-500/5">
          {badge}
        </span>
      )}
      {arrow}
    </>
  );

  return (
    <li>
      {to ? (
        <Link to={to} className={cls}>
          {content}
        </Link>
      ) : (
        <a href={href || "#"} className={cls}>
          {content}
        </a>
      )}
    </li>
  );
}

export default function Footer({ m }) {
  const [subscribed, setSubscribed] = useState(false);
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-[#012F24] text-white rounded-t-[3rem] overflow-hidden pt-24 pb-12 select-none border-t border-white/5" aria-label="Footer">
      <div className="mx-auto max-w-7xl px-6">
        
        {/* Main Grid */}
        <div className="grid gap-12 lg:grid-cols-12 border-b border-white/10 pb-16">
          
          {/* Col 1: Join Clynic */}
          <div className="lg:col-span-2 sm:col-span-6">
            <Col title="Join Clynic">
              <FootLink href="/for-employers">Employers</FootLink>
              <FootLink href="/for-health-plans">Health Plans</FootLink>
              <FootLink href="/for-consultants">Consultants</FootLink>
              <FootLink href="/contact/partnerships">Ecosystem Partners</FootLink>
              <FootLink href="/for-individuals">Individuals</FootLink>
              <FootLink href="/practitioners">Become a Clynic Provider</FootLink>
            </Col>
          </div>

          {/* Col 2: Programs */}
          <div className="lg:col-span-3 sm:col-span-6">
            <Col title="Clynic Programs">
              <FootLink href="/programs/fertility-and-family-building">Fertility & Family Building</FootLink>
              <FootLink href="/programs/maternity-and-newborn-care">Maternity & Newborn Care</FootLink>
              <FootLink href="/programs/maven-milk">Clynic Milk</FootLink>
              <FootLink href="/programs/parenting-and-pediatrics">Parenting & Pediatrics</FootLink>
              <FootLink href="/programs/menopause">Menopause & Midlife Health</FootLink>
              <FootLink href="/programs/maven-wallet">Clynic Wallet</FootLink>
              <FootLink href="/maven-managed-benefit">Clynic Managed Benefit</FootLink>
            </Col>
          </div>

          {/* Col 3: Company */}
          <div className="lg:col-span-2 sm:col-span-6">
            <Col title="Company">
              <FootLink href="/about">About us</FootLink>
              <FootLink href="/careers" badge="HIRING">Careers</FootLink>
              <FootLink href="/press">Press</FootLink>
              <FootLink href="/solutions">Solutions</FootLink>
              <FootLink href="/pricing">Pricing</FootLink>
              <FootLink to={m.bookHref}>Book a demo</FootLink>
            </Col>
          </div>

          {/* Col 4: Resources */}
          <div className="lg:col-span-2 sm:col-span-6">
            <Col title="Resources">
              <FootLink href="/lp/maven-member-journey">Member Journey</FootLink>
              <FootLink href="/resource-center">Resource Center</FootLink>
              <FootLink href="/clinical-research-institute">Research Institute</FootLink>
              <FootLink href="/content/on-demand-webinars">Webinars</FootLink>
              <FootLink href="/blog">Blog</FootLink>
              <FootLink href="/client-stories">Case Studies</FootLink>
              <FootLink href="/lp/share-your-maven-moment">Share your moment</FootLink>
            </Col>
          </div>

          {/* Column 5: Stay in the loop form */}
          <div className="lg:col-span-3 sm:col-span-12">
            <div className="rounded-3xl bg-[#03231B] border border-emerald-500/10 p-8 flex flex-col justify-between h-full">
              <div>
                <h4 className="text-sm font-semibold text-white tracking-wide uppercase">Stay in the loop</h4>
                
                {subscribed ? (
                  <p className="mt-4 text-sm text-emerald-400 font-medium flex items-center gap-2">
                    ✓ Thank you for subscribing.
                  </p>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setSubscribed(true);
                    }}
                    className="mt-6 space-y-4"
                  >
                    <div className="flex border-b border-emerald-500/20 focus-within:border-emerald-400 pb-2">
                      <input
                        type="email"
                        required
                        placeholder="Enter your email*"
                        className="grow bg-transparent text-sm text-white placeholder:text-emerald-100/35 outline-none border-none pr-4"
                      />
                      <button
                        type="submit"
                        className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-wider"
                      >
                        Subscribe
                      </button>
                    </div>
                    <p className="text-[11px] text-emerald-100/40 leading-relaxed">
                      By signing up, I agree with the data protection policy of Clynic.
                    </p>
                  </form>
                )}
              </div>

              {/* Verified Badge / Review strip */}
              <div className="mt-8 border-t border-white/5 pt-6 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex text-amber-400 text-sm">★★★★★</div>
                  <span className="text-xs text-emerald-100/50">Based on 3,695 reviews</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Logo & Legal links */}
        <div className="pt-12 flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between text-emerald-100/40">
          <div>
            {/* Huge clean brand text */}
            <span className="pmx-display text-4xl font-semibold tracking-widest text-white select-none">
              CLYNIC
            </span>
            <p className="mt-2 text-xs">
              © {year} Clynic Inc. All rights reserved.
            </p>
          </div>

          {/* Social Links */}
          <div className="flex gap-6 text-sm text-emerald-100/60 font-medium">
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">LinkedIn</a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Facebook</a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Instagram</a>
          </div>

          {/* Legal choices */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Your Privacy Choices</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
