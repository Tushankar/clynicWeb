/**
 * Premium Signature — the flagship template. A luxury, editorial, technology-first
 * landing experience: deep navy + modern emerald on porcelain, General Sans display over
 * Inter body, glassmorphism, ambient gradient lighting and buttery framer-motion.
 *
 * Contract: receives the same `{ site, slug }` props as every template in the registry.
 * All CMS content wins; curated defaults only fill gaps so the page never looks empty.
 */
import { useEffect, useMemo } from 'react';
import { PmxStyles } from './styles';
import { deriveModel } from './lib';
import Navbar from './sections/Navbar';
import Hero from './sections/Hero';
import TrustBar from './sections/TrustBar';
import Services from './sections/Services';
import WhyUs from './sections/WhyUs';
import Journey from './sections/Journey';
import Doctors from './sections/Doctors';
import Testimonials from './sections/Testimonials';
import Gallery from './sections/Gallery';
import Technology from './sections/Technology';
import Faq from './sections/Faq';
import FinalCta from './sections/FinalCta';
import Footer from './sections/Footer';
import MobileBar from './sections/MobileBar';

export default function PremiumSignature({ site, slug }) {
  const m = useMemo(() => deriveModel(site, slug), [site, slug]);

  // Deep links from sibling pages (e.g. /c/:slug#services from the booking navbar):
  // client-side routing doesn't auto-scroll to hashes, so do it after first paint.
  useEffect(() => {
    const { hash } = window.location;
    if (!hash) return undefined;
    const t = setTimeout(() => {
      try {
        document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch {
        /* invalid selector in hash — ignore */
      }
    }, 80);
    return () => clearTimeout(t);
  }, []);

  // Structured data — search engines see the clinic exactly as configured.
  const jsonLd = useMemo(() => {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'MedicalClinic',
      name: m.name,
      description: m.seo.description || m.hero.tagline,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      telephone: m.contact.phone || undefined,
      address: m.contact.address || undefined,
      image: m.hero.imageUrl || undefined,
    };
    if (m.reviews.length) {
      data.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: m.rating,
        reviewCount: m.reviews.length,
        bestRating: 5,
      };
    }
    return JSON.stringify(data);
  }, [m]);

  return (
    <div className="pmx min-h-screen overflow-x-clip bg-[#012F24] text-[#0B1220] antialiased">
      <PmxStyles />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

      <Navbar m={m} />

      <main id="top">
        <Hero m={m} />
        <TrustBar m={m} />
        <Services m={m} />
        <WhyUs m={m} />
        <Journey />
        <Doctors m={m} />
        <Technology m={m} />
        <Testimonials m={m} />
        <Faq m={m} />
        <FinalCta m={m} />
      </main>

      <Footer m={m} />
      <MobileBar m={m} />
    </div>
  );
}
