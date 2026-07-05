/**
 * Services — Maven Clinic style deep-green section.
 * Featuring the centered introduction header, background SVG curves,
 * and dynamic accordion hover effects on both Row 1 and Row 2 card lists
 * to match the layout mockups and screenshots perfectly.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { IMG, cx } from '../lib';
import { Item, Stagger } from '../motion';

// Distinct dot colors for the top-left badges matching Maven Clinic screenshot
const CARD_DOT_COLORS = [
  '#00F2FE', // Cyan
  '#33F8B1', // Emerald
  '#8B5CF6', // Purple
  '#FAD961'  // Gold
];

export default function Services({ m }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [hoveredIdxRow2, setHoveredIdxRow2] = useState(null);

  // 4 cards exactly matching the screenshot images, copy, and expanded texts
  const row1Services = [
    {
      name: 'Fertility &\nFamily Building',
      description: 'Free, covered by employer or health plan',
      extraDesc: 'Guiding members on the quickest, safest, and most affordable path to bringing home a healthy baby.',
      img: '/card1.webp'
    },
    {
      name: 'Maternity &\nNewborn Care',
      description: 'Free, covered by employer or health plan',
      extraDesc: 'Support for every path to parenthood, from pregnancy planning through postpartum recovery.',
      img: '/card2.webp'
    },
    {
      name: 'Parenting &\nPediatrics',
      description: 'Free, covered by employer or health plan',
      extraDesc: 'Expert clinical guidance and support for parenting children from infancy through age 18.',
      img: '/card3.webp'
    },
    {
      name: 'Menopause &\nMidlife Health',
      description: 'Free, covered by employer or health plan',
      extraDesc: 'Holistic care plans and expert guidance for navigating menopause symptoms and midlife transitions.',
      img: '/card4.webp'
    }
  ];

  // 3 cards exactly matching the screenshot images, copy, and expanded texts for Row 2
  const row2Services = [
    {
      name: 'Explore GLP-1 Care',
      description: 'Maven Consumer, self pay',
      extraDesc: 'Access to brand-name GLP-1 prescriptions, on-demand visits with metabolic and hormone health specialists, plus nutrition and strength support.',
      img: '/row2_card1.png',
      badge: 'NEW'
    },
    {
      name: 'Explore Hormone Care',
      description: 'Maven Consumer, self pay',
      extraDesc: 'Personalized medical guidance for women navigating perimenopause, menopause, and midlife health transitions, with expert clinicians and hormone care plans.',
      img: '/row2_card2.png',
      badge: 'NEW'
    },
    {
      name: 'Explore Virtual Clinic',
      description: 'Maven Consumer, self pay',
      extraDesc: 'On-demand video appointments and messaging with a global network of over 30 specialties, spanning reproductive health, parenting, and family wellness.',
      img: '/row2_card3.png',
      badge: 'NEW'
    }
  ];

  return (
    <section id="services" className="relative scroll-mt-28 bg-[#012F24] pb-24 mt-0 select-none z-10" aria-label="Services">
      
      {/* ── Background Wave Curves (Thin Green Lines) ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <svg className="absolute w-full h-[600px] top-0 left-0" fill="none" viewBox="0 0 1440 600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M-100 80C250 150 500 50 850 250C1100 350 1250 220 1550 300"
            stroke="#10B981"
            strokeWidth="0.8"
            className="opacity-[0.18]"
          />
          <path
            d="M-100 200C200 130 450 350 780 180C1050 70 1200 250 1550 150"
            stroke="#10B981"
            strokeWidth="1.2"
            className="opacity-[0.12]"
          />
          <path
            d="M-100 320C350 250 600 450 950 250C1180 150 1300 320 1550 250"
            stroke="#10B981"
            strokeWidth="0.6"
            className="opacity-[0.15]"
          />
        </svg>
      </div>

      {/* Main container matching the width of the Hero card (1480px) for layout symmetry */}
      <div className="relative mx-auto max-w-[1480px] px-4 sm:px-8 z-10">
        
        {/* ── Centered Introduction Header (Matches Maven SS Exactly) ── */}
        <div className="pt-16 pb-20 text-center">
          <h2 className="pmx-display text-4xl sm:text-5xl lg:text-[56px] font-light leading-[1.18] tracking-[-0.03em] text-white max-w-4xl mx-auto">
            Healthcare designed <br />
            for women and families <br />
            that's personal <br />
            <span className="font-serif italic font-normal text-white">and proven</span>
          </h2>
          <p className="mt-8 text-white/80 text-base sm:text-lg max-w-2xl mx-auto font-light leading-relaxed">
            Trusted by 2,300+ employers to improve outcomes across every stage
          </p>
        </div>

        {/* ── Row 1 Accordion Grid: Dynamic width expanding cards on hover ── */}
        <Stagger 
          className="flex flex-col lg:flex-row gap-4 sm:gap-5 w-full" 
          gap={0.08}
          onMouseLeave={() => setHoveredIdx(null)}
        >
          {row1Services.map((s, i) => {
            const isHovered = hoveredIdx === i;
            return (
              <Item 
                key={s.name + i}
                className={cx(
                  'w-full transition-all duration-500 ease-out origin-center shrink-0 lg:shrink',
                  isHovered ? 'lg:flex-[2.4]' : 'lg:flex-1'
                )}
                onMouseEnter={() => setHoveredIdx(i)}
              >
                <Link
                  to={m.bookHref}
                  aria-label={`${s.name} — book a consultation`}
                  className={cx(
                    'group relative flex w-full h-[480px] sm:h-[515px] flex-col overflow-hidden rounded-[16px] shadow-lg border border-white/5 bg-[#012F24]/30',
                    'transition-shadow duration-300 hover:shadow-2xl',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#012F24]'
                  )}
                >
                  {/* Background Image with Zoom Effect */}
                  <img
                    src={s.img}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />

                  {/* Dark Vignette Overlay for Title/Subtitle readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>

                  {/* Top Section: Circular badge container holding the colored dot indicator (no glow) */}
                  <div className="absolute top-4 left-4 sm:top-5 sm:left-5 z-20">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black/25 border border-white/5 shadow-sm">
                      <span 
                        className="h-2.5 w-2.5 rounded-full" 
                        style={{ 
                          backgroundColor: CARD_DOT_COLORS[i % CARD_DOT_COLORS.length]
                        }} 
                      />
                    </div>
                  </div>

                  {/* Content Container aligned at the bottom */}
                  <div className="relative flex h-full flex-col justify-end p-6 sm:p-8 text-white">
                    <div className="space-y-1">
                      <h3 className="text-xl sm:text-[22px] font-normal leading-[1.2] text-white tracking-tight font-sans whitespace-pre-line">
                        {s.name}
                      </h3>
                      <p className="text-[13px] sm:text-[14px] text-white/80 font-normal leading-normal font-sans">
                        {s.description}
                      </p>
                      
                      {/* Smooth expanding extra copy and button block */}
                      <AnimatePresence initial={false}>
                        {isHovered && (
                          <motion.div
                            key="expanded-content"
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ 
                                opacity: 1, 
                                height: 'auto', 
                                marginTop: 14,
                                transition: { height: { duration: 0.35, ease: 'easeOut' }, opacity: { duration: 0.25, delay: 0.1 } }
                            }}
                            exit={{ 
                              opacity: 0, 
                              height: 0, 
                              marginTop: 0,
                              transition: { height: { duration: 0.3, ease: 'easeIn' }, opacity: { duration: 0.15 } }
                            }}
                            className="overflow-hidden"
                          >
                            <p className="text-[13.5px] sm:text-[14.5px] text-white font-light leading-relaxed font-sans pr-2">
                              {s.extraDesc}
                            </p>
                            <div className="mt-4">
                              <span 
                                className="inline-flex items-center justify-center bg-[#33F8B1] hover:bg-[#2ce6a4] text-[#012F24] px-5 py-2.5 rounded-[8px] text-[13.5px] font-semibold transition-all active:scale-[0.98] shadow-md cursor-pointer"
                              >
                                Learn more
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </Link>
              </Item>
            );
          })}
        </Stagger>

        {/* ── Divider Text: Maven Style Centered Subtitle ── */}
        <div className="relative mt-24 mb-16 text-center py-6">
          {/* Angled background line cutting through the text container */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <svg className="w-[1400px] h-[200px]" fill="none" viewBox="0 0 1440 200" preserveAspectRatio="none">
              <line x1="850" y1="-50" x2="550" y2="250" stroke="#10B981" strokeWidth="0.8" className="opacity-[0.18]" />
            </svg>
          </div>
          <h2 className="font-sans text-[17px] sm:text-[19px] lg:text-[21px] font-normal leading-relaxed text-white/95 max-w-none mx-auto lg:whitespace-nowrap z-10 relative tracking-wide">
            Direct access to weight loss and hormone health support, and 24/7 medical care
          </h2>
        </div>

        {/* ── Row 2 Accordion Grid: 3 Shorter Cards with "NEW" Badge and Dynamic Hover expansion ── */}
        <Stagger 
          className="flex flex-col lg:flex-row gap-4 sm:gap-5 w-full" 
          gap={0.1}
          onMouseLeave={() => setHoveredIdxRow2(null)}
        >
          {row2Services.map((s, i) => {
            const isHoveredRow2 = hoveredIdxRow2 === i;
            return (
              <Item 
                key={s.name + i}
                className={cx(
                  'w-full transition-all duration-500 ease-out origin-center shrink-0 lg:shrink',
                  isHoveredRow2 ? 'lg:flex-[1.8]' : 'lg:flex-1'
                )}
                onMouseEnter={() => setHoveredIdxRow2(i)}
              >
                <Link
                  to={m.bookHref}
                  aria-label={`${s.name} — view details`}
                  className={cx(
                    'group relative flex w-full h-[320px] sm:h-[350px] flex-col overflow-hidden rounded-[16px] shadow-lg border border-white/5 bg-[#012F24]/30',
                    'transition-shadow duration-300 hover:shadow-xl',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2'
                  )}
                >
                  {/* Background Image with Zoom */}
                  <img
                    src={s.img}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />

                  {/* Dark Vignette Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent"></div>

                  {/* Content Container */}
                  <div className="relative flex h-full flex-col justify-between p-6 sm:p-7 text-white">
                    {/* Top Section: "NEW" Capsule Badge */}
                    <div className="flex h-12 items-start">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] bg-[#002f23] border border-[#0f4b3a] text-[11px] font-bold text-[#33F8B1] tracking-wider uppercase">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#33F8B1]" />
                        {s.badge}
                      </div>
                    </div>

                    {/* Bottom Section: Title & Description */}
                    <div className="space-y-1 mt-auto">
                      <h3 className="text-xl sm:text-[22px] font-normal leading-[1.2] text-white tracking-tight font-sans">
                        {s.name}
                      </h3>
                      <p className="text-[13px] sm:text-[14px] text-white/80 font-normal leading-normal font-sans">
                        {s.description}
                      </p>

                      {/* Smooth expanding extra copy and button block */}
                      <AnimatePresence initial={false}>
                        {isHoveredRow2 && (
                          <motion.div
                            key="expanded-content-row2"
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ 
                              opacity: 1, 
                              height: 'auto', 
                              marginTop: 14,
                              transition: { height: { duration: 0.35, ease: 'easeOut' }, opacity: { duration: 0.25, delay: 0.1 } }
                            }}
                            exit={{ 
                              opacity: 0, 
                              height: 0, 
                              marginTop: 0,
                              transition: { height: { duration: 0.3, ease: 'easeIn' }, opacity: { duration: 0.15 } }
                            }}
                            className="overflow-hidden"
                          >
                            <p className="text-[13.5px] sm:text-[14.5px] text-white font-light leading-relaxed font-sans pr-2">
                              {s.extraDesc}
                            </p>
                            <div className="mt-4">
                              <span 
                                className="inline-flex items-center justify-center bg-[#33F8B1] hover:bg-[#2ce6a4] text-[#012F24] px-5 py-2.5 rounded-[8px] text-[13.5px] font-semibold transition-all active:scale-[0.98] shadow-md cursor-pointer"
                              >
                                Learn more
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </Link>
              </Item>
            );
          })}
        </Stagger>
        
      </div>
    </section>
  );
}
