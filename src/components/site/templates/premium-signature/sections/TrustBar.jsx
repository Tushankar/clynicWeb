import { Reveal } from '../motion';
import { SafeImg } from '../ui';

const TEAL = '#0E8C72';

export default function TrustBar({ m }) {
  const logos = [
    '/logo1.svg',
    '/logo3.svg',
    '/logo4.svg',
    '/logo5.svg',
    '/logo6.svg',
    '/logo7.svg',
    '/logo8.svg'
  ];

  // Duplicate logos list to ensure smooth seamless marquee flow
  const marqueeLogos = [...logos, ...logos, ...logos, ...logos];

  return (
    <section className="relative border-y border-slate-100 bg-white py-12 overflow-hidden" aria-label="Why families trust us">
      {/* Self-contained CSS for the marquee scrolling */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scroll-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: scroll-marquee 25s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}} />

      <div className="mx-auto max-w-7xl px-6 relative z-10 flex flex-col items-center">
        {/* Subtle eyebrow header */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: TEAL }} />
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Trusted by</span>
        </div>

        {/* Marquee container */}
        <Reveal className="w-full relative overflow-hidden" delay={0.1}>
          {/* Gradient fade borders on left and right */}
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          {/* Scrolling Track */}
          <div className="marquee-track flex items-center gap-16 py-2">
            {marqueeLogos.map((logo, idx) => (
              <div 
                key={idx} 
                className="h-10 w-32 flex items-center justify-center filter opacity-30 hover:opacity-70 transition-opacity duration-300"
              >
                <SafeImg 
                  src={logo} 
                  alt="Partner logo" 
                  className="max-h-full max-w-full object-contain pointer-events-none select-none"
                />
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
