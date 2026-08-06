/**
 * Footer — shared by the website, booking, portal, custom pages and the store, so every link
 * here must resolve. Columns are built from the clinic's live data: the sections that actually
 * render, its published CMS pages, its services, and its real contact channels. Nothing is
 * hardcoded to a route that doesn't exist.
 *
 * `basePath` is passed by sibling pages (/c/:slug/book, /p/:slug, /store/…) so in-page anchors
 * route back to the home page's section instead of resolving against the current URL.
 */
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarPlus, Mail, MapPin, MessageCircle, Phone, ShoppingBag } from 'lucide-react';
import { buildNavLinks, telHref } from '../lib';

function Col({ title, children }) {
  return (
    <div className="min-w-0">
      <h3 className="text-xs font-semibold text-emerald-300 uppercase tracking-widest">{title}</h3>
      <ul className="mt-5 space-y-3">{children}</ul>
    </div>
  );
}

function FootLink({ href, to, children, badge, external }) {
  // `flex` + `min-w-0` (not inline-flex) so a long CMS page title truncates inside its column
  // instead of pushing the grid wider and colliding with the next one.
  // `flex` + `min-w-0` (not inline-flex) so long CMS page titles stay inside their column.
  // They WRAP to two lines rather than truncate — a half-shown page name is useless to a patient.
  const cls =
    'group flex w-full min-w-0 items-start gap-1.5 text-sm text-emerald-100/60 transition-colors duration-300 hover:text-white';
  const arrow = (
    <ArrowRight
      className="mt-1 h-3 w-3 shrink-0 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 text-emerald-400"
      aria-hidden="true"
    />
  );

  const content = (
    <>
      <span className="min-w-0 line-clamp-2 break-words">{children}</span>
      {badge && (
        <span className="mt-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-md ml-1 bg-emerald-500/5 shrink-0">
          {badge}
        </span>
      )}
      {arrow}
    </>
  );

  return (
    <li className="min-w-0">
      {to ? (
        <Link to={to} className={cls} title={typeof children === 'string' ? children : undefined}>
          {content}
        </Link>
      ) : (
        <a href={href} className={cls} title={typeof children === 'string' ? children : undefined} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
          {content}
        </a>
      )}
    </li>
  );
}

export default function Footer({ m, basePath = '' }) {
  const year = new Date().getFullYear();
  const { phone, whatsapp, email, address } = m.contact;
  const pages = m.pages || [];
  const services = (m.services || []).slice(0, 6);
  // On sibling pages an in-page anchor must route back to the home page first.
  const anchor = (href) => (basePath ? `${basePath}${href}` : href);
  const navLinks = buildNavLinks(m).filter((l) => l.href !== '#top');

  // Extra bottom padding leaves room for the floating "Shop medicines" / mobile action bar,
  // which is fixed above the fold and would otherwise sit on top of the legal row.
  return (
    <footer className="relative bg-[#012F24] text-white rounded-t-[3rem] overflow-hidden pt-24 pb-28 sm:pb-20 select-none border-t border-white/5" aria-label="Footer">
      <div className="mx-auto max-w-7xl px-6">

        {/* Main Grid */}
        <div className="grid gap-12 lg:grid-cols-12 sm:grid-cols-2 border-b border-white/10 pb-16">

          {/* Col 1: the clinic itself */}
          <div className="min-w-0 lg:col-span-3 sm:col-span-2">
            {m.theme?.logoUrl ? (
              <img src={m.theme.logoUrl} alt={`${m.name} logo`} className="h-10 w-auto max-w-[180px] object-contain brightness-0 invert" />
            ) : (
              <span className="pmx-display text-2xl font-semibold tracking-tight text-white">{m.name}</span>
            )}
            {m.about ? (
              <p className="mt-5 text-sm leading-relaxed text-emerald-100/55 line-clamp-5">{m.about}</p>
            ) : (
              <p className="mt-5 text-sm leading-relaxed text-emerald-100/55">
                Modern, patient-first care with online booking, digital prescriptions and reports on your phone.
              </p>
            )}
            <Link
              to={m.bookHref}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[13px] font-semibold text-[#012F24] transition-transform hover:-translate-y-0.5"
            >
              <CalendarPlus className="h-4 w-4" aria-hidden="true" /> Book appointment
            </Link>
          </div>

          {/* Col 2: explore — only sections that actually render */}
          <div className="min-w-0 lg:col-span-2 sm:col-span-1">
            <Col title="Explore">
              {navLinks.map((l) => (
                <FootLink key={l.label} href={anchor(l.href)}>{l.label}</FootLink>
              ))}
            </Col>
          </div>

          {/* Col 3: services the clinic actually lists (falls back to patient shortcuts) */}
          <div className="min-w-0 lg:col-span-2 sm:col-span-1">
            <Col title={services.length ? 'Services' : 'Patients'}>
              {services.length
                ? services.map((s) => (
                    <FootLink key={s.name} href={anchor('#services')}>{s.name}</FootLink>
                  ))
                : (
                  <>
                    <FootLink to={m.bookHref}>Book an appointment</FootLink>
                    <FootLink to={m.portalHref}>Patient portal</FootLink>
                    <FootLink href={anchor('#how-it-works')}>How it works</FootLink>
                  </>
                )}
            </Col>
          </div>

          {/* Col 4: quick links + the clinic's own published pages */}
          <div className="min-w-0 lg:col-span-2 sm:col-span-1">
            <Col title="Quick links">
              <FootLink to={m.bookHref}>Book appointment</FootLink>
              <FootLink to={m.portalHref}>Patient login</FootLink>
              {m.store ? <FootLink to={m.storeHref} badge="NEW">Online pharmacy</FootLink> : null}
              {pages.map((p) => (
                <FootLink key={p.slug} to={m.pageHref(p.slug)}>{p.title}</FootLink>
              ))}
            </Col>
          </div>

          {/* Col 5: real contact details */}
          <div className="min-w-0 lg:col-span-3 sm:col-span-1">
            <div className="rounded-3xl bg-[#03231B] border border-emerald-500/10 p-8 flex flex-col justify-between h-full">
              <div>
                <h4 className="text-sm font-semibold text-white tracking-wide uppercase">Get in touch</h4>
                <ul className="mt-6 space-y-4">
                  {phone ? (
                    <li>
                      <a href={telHref(phone)} className="group flex items-start gap-3 text-sm text-emerald-100/70 transition-colors hover:text-white">
                        <Phone className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                        <span className="min-w-0 break-words">{phone}</span>
                      </a>
                    </li>
                  ) : null}
                  {whatsapp ? (
                    <li>
                      <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="group flex items-start gap-3 text-sm text-emerald-100/70 transition-colors hover:text-white">
                        <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                        <span>Chat on WhatsApp</span>
                      </a>
                    </li>
                  ) : null}
                  {email ? (
                    <li>
                      <a href={`mailto:${email}`} className="group flex items-start gap-3 text-sm text-emerald-100/70 transition-colors hover:text-white">
                        <Mail className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                        <span className="min-w-0 break-words">{email}</span>
                      </a>
                    </li>
                  ) : null}
                  {address ? (
                    <li>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-start gap-3 text-sm text-emerald-100/70 transition-colors hover:text-white"
                      >
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                        <span className="min-w-0">{address}</span>
                      </a>
                    </li>
                  ) : null}
                  {m.store ? (
                    <li>
                      <Link to={m.storeHref} className="group flex items-start gap-3 text-sm text-emerald-100/70 transition-colors hover:text-white">
                        <ShoppingBag className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                        <span>Order medicines online</span>
                      </Link>
                    </li>
                  ) : null}
                </ul>
              </div>

              {/* Rating strip — only when the clinic has approved reviews to back it up */}
              {m.reviews.length ? (
                <div className="mt-8 border-t border-white/5 pt-6 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="flex text-amber-400 text-sm" aria-hidden="true">★★★★★</div>
                    <span className="text-xs text-emerald-100/50">
                      {m.rating} from {m.reviews.length} {m.reviews.length === 1 ? 'review' : 'reviews'}
                    </span>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Bottom Bar: brand & legal */}
        <div className="pt-12 flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between text-emerald-100/40">
          <div className="min-w-0">
            <span className="pmx-display block truncate text-3xl sm:text-4xl font-semibold tracking-widest text-white select-none uppercase">
              {m.name}
            </span>
            <p className="mt-2 text-xs">
              © {year} {m.name}. All rights reserved.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs sm:max-w-[60%] sm:justify-end">
            {pages.map((p) => (
              <Link key={p.slug} to={m.pageHref(p.slug)} className="hover:text-white transition-colors">
                {p.title}
              </Link>
            ))}
            <span className="text-emerald-100/30">Powered by Clynic</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
