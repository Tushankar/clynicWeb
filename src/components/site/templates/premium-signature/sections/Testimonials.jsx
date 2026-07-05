import { useState, useEffect, useRef } from 'react';
import { Quote, ArrowRight } from 'lucide-react';
import { SafeImg } from '../ui';

export default function Testimonials({ m }) {
  const [activeTab, setActiveTab] = useState(0);
  const [progress, setProgress] = useState(0);
  const isPaused = useRef(false);

  const stories = [
    {
      name: 'Microsoft',
      logo: '/testimonials-logo2.webp',
      img: '/stories-1.webp',
      quote: '“We had amazing emotional support and saved around £30,000 that we were going to spend on IVF. The only difference was Maven. We didn’t do anything else, and now we’re pregnant.”',
      bio: 'Han — Maven member, Microsoft'
    },
    {
      name: 'Amazon',
      logo: '/testimonials-logo1.webp',
      img: '/stories-2.webp',
      quote: '“This is by far the easiest access to services and specialists that I\'ve experienced in the seven years of my family-building journey. It feels so safe to know that I can talk to someone when I need to and not have to wait weeks or months for a next appointment to come around. I feel very supported.”',
      bio: 'Sarah — Maven member, Amazon'
    },
    {
      name: 'Vynamic',
      logo: '/testimonials-logo3.webp',
      img: '/stories-3.webp',
      quote: '“Maven is deeply personal to me. As the head of talent, I was thrilled to bring Maven to Vynamic, but I couldn’t have predicted just how much I’d come to rely on their support personally. From second opinions on fertility treatment to nutrition advice during IVF, and most recently childbirth education and newborn care 101, Maven has been the constant and trusted companion through a turbulent and challenging time.”',
      bio: 'Mairead — Maven member, Head of Talent, Vynamic'
    }
  ];

  const current = stories[activeTab];

  useEffect(() => {
    const intervalTime = 50; // update progress every 50ms
    const totalDuration = 7000; // 7 seconds per slide
    const increment = (intervalTime / totalDuration) * 100;

    const timer = setInterval(() => {
      if (!isPaused.current) {
        setProgress((prev) => {
          if (prev >= 100) {
            setActiveTab((currentTab) => (currentTab + 1) % stories.length);
            return 0;
          }
          return prev + increment;
        });
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [stories.length]);

  const handleTabClick = (idx) => {
    setActiveTab(idx);
    setProgress(0);
  };

  return (
    <section id="stories" className="scroll-mt-28 bg-[#012F24] text-white py-16 sm:py-24 relative overflow-hidden" aria-label="Patient stories">
      {/* Background overlay circles for editorial styling */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-radial from-emerald-500/20 to-transparent blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 z-10">
        
        {/* Section Head */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-4">
            Member Stories
          </span>
          <h2 className="pmx-display text-4xl sm:text-5xl font-light leading-tight tracking-tight text-white">
            Real <strong className="font-semibold text-emerald-400">stories</strong> from Maven members
          </h2>
          <p className="mt-4 text-emerald-100/60 text-base sm:text-lg">
            Discover how our personalized healthcare platform has transformed the lives of women and families worldwide.
          </p>
        </div>

        {/* Stories Tab Selectors with Auto-advancing Indicator lines */}
        <div className="flex justify-center gap-4 sm:gap-8 mb-16 border-b border-white/5 pb-8 max-w-2xl mx-auto">
          {stories.map((story, idx) => {
            const isActive = activeTab === idx;
            return (
              <button
                key={story.name}
                onClick={() => handleTabClick(idx)}
                onMouseEnter={() => { isPaused.current = true; }}
                onMouseLeave={() => { isPaused.current = false; }}
                className="flex flex-col items-center gap-2 group outline-none focus:outline-none relative pb-3 w-1/3"
              >
                <div className="h-8 flex items-center justify-center filter brightness-0 invert opacity-45 group-hover:opacity-100 transition-opacity duration-300">
                  <SafeImg 
                    src={story.logo} 
                    alt={story.name} 
                    className="max-h-full max-w-full object-contain pointer-events-none select-none"
                  />
                </div>

                {/* Progress bar line under tab */}
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white/10 overflow-hidden rounded-full">
                  <div 
                    className="h-full bg-emerald-400 transition-all duration-75"
                    style={{
                      width: isActive ? `${progress}%` : '0%'
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Testimonial Active Card (Side-by-Side Split) */}
        <div className="max-w-5xl mx-auto rounded-[2.5rem] bg-[#FAF8F5] overflow-hidden shadow-2xl border border-white/5 text-[#012F24] grid md:grid-cols-12 min-h-[450px]">
          {/* Left Column: Image (span 5) */}
          <div className="md:col-span-5 h-[320px] md:h-auto relative overflow-hidden bg-slate-200">
            {stories.map((story, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  activeTab === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                <SafeImg
                  src={story.img}
                  alt={story.name}
                  className="w-full h-full object-cover select-none pointer-events-none"
                />
              </div>
            ))}
          </div>

          {/* Right Column: Quote & Bio details (span 7) */}
          <div className="md:col-span-7 p-8 sm:p-14 flex flex-col justify-between relative bg-[#FAF8F5]">
            <Quote
              aria-hidden="true"
              className="absolute right-8 top-8 h-20 w-20 -scale-x-100 text-[#012F24]/[0.03] pointer-events-none"
              fill="currentColor"
              strokeWidth={0}
            />
            
            <div className="grow flex items-center">
              <blockquote className="pmx-display text-xl sm:text-2xl font-light leading-relaxed tracking-tight text-[#012F24]">
                {current.quote}
              </blockquote>
            </div>

            <div className="mt-8 border-t border-[#012F24]/10 pt-6 flex items-center justify-between">
              <div>
                <cite className="not-italic block text-base font-semibold text-[#012F24]">
                  {current.bio.split(' — ')[0]}
                </cite>
                <span className="text-xs font-medium text-[#012F24]/60 mt-0.5 block">
                  {current.bio.split(' — ')[1]}
                </span>
              </div>
              
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                ✓ Verified Story
              </span>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <a 
            href="/lp/maven-member-journey" 
            className="inline-flex items-center justify-center bg-emerald-400 hover:bg-emerald-300 text-[#012F24] font-semibold rounded-full px-8 py-4 text-sm transition-all duration-300 shadow-md"
          >
            Meet our members
          </a>
        </div>
      </div>
    </section>
  );
}
