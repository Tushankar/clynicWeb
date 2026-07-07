import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cx } from '../lib';
import { Item, Stagger } from '../motion';

const CARD_DOT_COLORS = [
  '#0BB89F', // Teal
  '#33F8B1', // Emerald
  '#8B5CF6', // Purple
  '#FAD961'  // Gold
];

export default function Services({ m }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [hoveredIdxRow2, setHoveredIdxRow2] = useState(null);

  const row1Services = [
    {
      name: 'Book\nAppointment',
      description: 'Book appointments, consult expert doctors.',
      extraDesc: 'Schedule visits with our top-rated medical professionals for personalized medicine and care.',
      img: '/service_book_appointment.png' // Premium 3D abstract fluid
    },
    {
      name: 'Online\nConsultation',
      description: 'Online medicines or online consultation.',
      extraDesc: 'Get medical advice from the comfort of your home through our seamless video consultation platform.',
      img: '/service_online_consultation.png' // 3D smooth glass waves
    },
    {
      name: 'Buy\nMedicines',
      description: 'Order rare medicines pay cash.',
      extraDesc: 'Order your prescribed medicines directly to your door with easy cash or online payment options.',
      img: '/service_buy_medicines.png' // Literal 3D pill/capsule render
    },
    {
      name: 'Lab\nTests',
      description: 'Combine care with home lab tests.',
      extraDesc: 'Book comprehensive health checkups and get lab samples collected right from your home.',
      img: '/service_lab_tests.png' // 3D abstract spheres / cells
    }
  ];

  const row2Services = [
    {
      name: 'Health\nRecords',
      description: 'Combine health health records.',
      extraDesc: 'Keep all your vital health records organized and securely accessible in one digital place.',
      img: '/service_health_records.png', // Soft 3D floating blocks
      badge: 'SECURE'
    },
    {
      name: 'Emergency\nSupport',
      description: 'Emergency and open support.',
      extraDesc: 'Immediate emergency response and open access to comprehensive 24/7 medical support.',
      img: '/service_emergency_support.png', // 3D dynamic kinetic shapes
      badge: '24/7'
    },
    {
      name: 'Health\nInsurance',
      description: 'Saved source in up to installation.',
      extraDesc: 'Seamlessly verify your insurance coverage and process your medical claims without hassle.',
      img: '/service_health_insurance.png', // 3D glossy connected spheres
      badge: 'EASY'
    },
    {
      name: 'Prescription\nUpload',
      description: 'Upload prescription details.',
      extraDesc: 'Easily upload your doctor\'s prescription to instantly order medicines for home delivery.',
      img: '/service_prescription_upload.png', // Premium abstract teal fluid
      badge: 'FAST'
    }
  ];

  return (
    <section id="services" className="relative scroll-mt-28 bg-transparent pb-24 pt-4 mt-0 select-none z-10 overflow-x-clip" aria-label="Services">
      
      {/* Ambient signature teal glow for consistency - matching Hero section exact styling */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] sm:w-[850px] sm:h-[850px] lg:w-[1100px] lg:h-[1100px] rounded-full bg-[#0BB89F]/15 blur-[80px] sm:blur-[120px] lg:blur-[160px] pointer-events-none" />

      {/* Main container */}
      <div className="relative mx-auto max-w-[1480px] px-4 sm:px-8 z-10">
        
        {/* ── Centered Introduction Header ── */}
        <div className="pt-10 pb-16 text-center">
          <h2 className="pmx-display text-4xl sm:text-5xl lg:text-[56px] font-extrabold leading-[1.18] tracking-tight text-[#1A1A2E] max-w-4xl mx-auto">
            Comprehensive healthcare <br />
            services designed <br />
            for <span className="text-[#0BB89F]">you & your family</span>
          </h2>
          <p className="mt-6 text-slate-500 text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            Everything you need for your health, from expert consultations to home medicine delivery.
          </p>
        </div>

        {/* ── Row 1 Accordion Grid ── */}
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
                  className={cx(
                    'group relative flex w-full h-[400px] sm:h-[480px] flex-col overflow-hidden rounded-[20px] shadow-sm border border-slate-200/50 bg-white',
                    'transition-shadow duration-300 hover:shadow-2xl',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400'
                  )}
                >
                  <img
                    src={s.img}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A2E]/95 via-[#1A1A2E]/40 to-transparent"></div>

                  <div className="absolute top-4 left-4 sm:top-5 sm:left-5 z-20">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/20 shadow-sm">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CARD_DOT_COLORS[i % CARD_DOT_COLORS.length] }} />
                    </div>
                  </div>

                  <div className="relative flex h-full flex-col justify-end p-6 sm:p-8 text-white">
                    <div className="space-y-2">
                      <h3 className="text-xl sm:text-[22px] font-bold leading-[1.2] text-white tracking-tight whitespace-pre-line">
                        {s.name}
                      </h3>
                      <p className="text-[13px] sm:text-[14px] text-white/90 font-medium leading-relaxed">
                        {s.description}
                      </p>
                      
                      <AnimatePresence initial={false}>
                        {isHovered && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginTop: 14, transition: { height: { duration: 0.35, ease: 'easeOut' }, opacity: { duration: 0.25, delay: 0.1 } } }}
                            exit={{ opacity: 0, height: 0, marginTop: 0, transition: { height: { duration: 0.3, ease: 'easeIn' }, opacity: { duration: 0.15 } } }}
                            className="overflow-hidden"
                          >
                            <p className="text-[13.5px] sm:text-[14px] text-white/80 font-normal leading-relaxed pr-2">
                              {s.extraDesc}
                            </p>
                            <div className="mt-5">
                              <span 
                                className="group/btn relative inline-flex items-center justify-center rounded-full px-5 py-2.5 text-[13px] font-bold text-white transition-all duration-300 active:scale-[0.98] shadow-[0_8px_16px_-6px_rgba(14,140,114,0.4)] hover:shadow-[0_12px_20px_-8px_rgba(14,140,114,0.5)] overflow-hidden"
                                style={{ background: '#0E8C72' }}
                              >
                                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.25)_0%,rgba(255,255,255,0)_100%)] pointer-events-none" />
                                <div className="absolute inset-0 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.45)] rounded-full pointer-events-none" />
                                <span className="relative z-10">Learn more</span>
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

        {/* ── Divider Text ── */}
        <div className="relative mt-16 mb-12 text-center py-6 border-y border-slate-200">
          <h2 className="text-[17px] sm:text-[19px] lg:text-[21px] font-bold leading-relaxed text-slate-700 max-w-none mx-auto tracking-tight">
            Direct access to expert doctors, lab tests, and 24/7 medical support
          </h2>
        </div>

        {/* ── Row 2 Accordion Grid ── */}
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
                  isHoveredRow2 ? 'lg:flex-[2.4]' : 'lg:flex-1'
                )}
                onMouseEnter={() => setHoveredIdxRow2(i)}
              >
                <Link
                  to={m.bookHref}
                  className={cx(
                    'group relative flex w-full h-[400px] sm:h-[450px] flex-col overflow-hidden rounded-[20px] shadow-sm border border-slate-200/50 bg-white',
                    'transition-shadow duration-300 hover:shadow-2xl',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400'
                  )}
                >
                  <img
                    src={s.img}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A2E]/95 via-[#1A1A2E]/40 to-transparent"></div>

                  <div className="relative flex h-full flex-col justify-between p-6 sm:p-8 text-white z-20">
                    <div className="flex items-start">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/20 backdrop-blur-md border border-white/20 text-[11px] font-bold text-white tracking-wider uppercase shadow-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#0BB89F]" />
                        {s.badge}
                      </div>
                    </div>

                    <div className="space-y-2 mt-auto">
                      <h3 className="text-xl sm:text-[22px] font-bold leading-[1.2] text-white tracking-tight whitespace-pre-line">
                        {s.name}
                      </h3>
                      <p className="text-[13px] sm:text-[14px] text-white/90 font-medium leading-relaxed">
                        {s.description}
                      </p>

                      <AnimatePresence initial={false}>
                        {isHoveredRow2 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginTop: 14, transition: { height: { duration: 0.35, ease: 'easeOut' }, opacity: { duration: 0.25, delay: 0.1 } } }}
                            exit={{ opacity: 0, height: 0, marginTop: 0, transition: { height: { duration: 0.3, ease: 'easeIn' }, opacity: { duration: 0.15 } } }}
                            className="overflow-hidden"
                          >
                            <p className="text-[13.5px] sm:text-[14px] text-white/80 font-normal leading-relaxed pr-2">
                              {s.extraDesc}
                            </p>
                            <div className="mt-5">
                              <span 
                                className="group/btn relative inline-flex items-center justify-center rounded-full px-5 py-2.5 text-[13px] font-bold text-white transition-all duration-300 active:scale-[0.98] shadow-[0_8px_16px_-6px_rgba(14,140,114,0.4)] hover:shadow-[0_12px_20px_-8px_rgba(14,140,114,0.5)] overflow-hidden"
                                style={{ background: '#0E8C72' }}
                              >
                                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.25)_0%,rgba(255,255,255,0)_100%)] pointer-events-none" />
                                <div className="absolute inset-0 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.45)] rounded-full pointer-events-none" />
                                <span className="relative z-10">Learn more</span>
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
