import { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { SafeImg } from '../ui';

export default function Doctors({ m }) {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      name: 'Employers',
      desc: 'Partnering with employers to lower healthcare costs, improve return-to-work rates, and keep employees happy and healthy.',
      img: '/industry-1.webp',
      bullet: 'Lower NICU & maternity costs'
    },
    {
      name: 'Health Plans',
      desc: 'Aligning with plans to improve critical care outcomes, decrease C-sections, and manage high-cost specialty claims.',
      img: '/industry-2.webp',
      bullet: 'Claims-based validated outcomes'
    },
    {
      name: 'Consultants',
      desc: 'Delivering industry-leading clinical ROI, comprehensive benefits analysis, and deep data insights for consultants.',
      img: '/industry-3.webp',
      bullet: 'Milliman-validated research model'
    },
    {
      name: 'Employees',
      desc: 'Empowering employees and their partners with 24/7 virtual care, family planning support, and specialist access.',
      img: '/industry-4.webp',
      bullet: '24/7 advocate care guidance'
    },
    {
      name: 'Consumers',
      desc: 'Providing direct self-pay support for GLP-1 weight loss, hormone health, and expert virtual care consultations.',
      img: '/industry-5.webp',
      bullet: 'Direct-to-consumer expert care'
    }
  ];

  return (
    <section id="why-us" className="scroll-mt-28 bg-[#012F24] text-white py-16 sm:py-24 relative overflow-hidden" aria-label="Target Industries">
      {/* Wave lines for decorative background matching */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.08]">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 2160 2047" fill="none" className="w-full h-full object-cover">
          <path d="M1 1024.89C301.833 1105.72 1018 1094.99 1476 405.388C2048.5 -456.612 225 280.888 1010 587.888C1795 894.888 2279.5 1166.89 2131.5 971.888C1983.5 776.888 1435 476.388 207.5 2045.89" stroke="#58EDA2" strokeWidth="2" />
        </svg>
      </div>

      <div className="mx-auto max-w-7xl px-6 relative z-10">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16 items-center">
          
          {/* Left Column (span 6): Tab selector and copy */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-4">
                Our Solutions
              </span>
              <h2 className="pmx-display text-4xl sm:text-5xl font-light tracking-tight leading-tight mb-6">
                Making healthcare work <strong className="font-semibold text-emerald-400">for all of us</strong>
              </h2>
              <p className="text-emerald-100/60 text-base sm:text-lg leading-relaxed mb-10">
                Together, we’re reshaping the healthcare experience for working families—meeting them where care truly happens: at home, in the workplace, and throughout the community.
              </p>
            </div>

            {/* Vertically stacked custom tabs */}
            <div className="space-y-3">
              {tabs.map((tab, idx) => {
                const isActive = activeTab === idx;
                return (
                  <button
                    key={tab.name}
                    onMouseEnter={() => setActiveTab(idx)}
                    onClick={() => setActiveTab(idx)}
                    className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 flex items-start gap-4 outline-none focus:outline-none ${
                      isActive 
                        ? 'bg-emerald-950/40 border-emerald-500/30 shadow-md text-white' 
                        : 'bg-transparent border-transparent text-white/50 hover:text-white hover:bg-emerald-950/10'
                    }`}
                  >
                    <div className={`mt-1 flex-shrink-0 w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                      isActive ? 'border-emerald-400 bg-emerald-400' : 'border-white/30'
                    }`}>
                      {isActive && <div className="w-1.5 h-1.5 bg-[#012F24] rounded-full" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-medium">{tab.name}</span>
                        {isActive && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-300 font-semibold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-md">
                            {tab.bullet}
                          </span>
                        )}
                      </div>
                      {isActive && (
                        <p className="mt-2 text-sm text-emerald-100/60 leading-relaxed transition-all duration-300">
                          {tab.desc}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-8">
              <a 
                href={m.bookHref || "#"} 
                className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300 group"
              >
                See if Clynic offers your plan
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

          {/* Right Column (span 6): Full-bleed image with smooth fade transition */}
          <div className="lg:col-span-6 relative h-[450px] sm:h-[550px] w-full overflow-hidden rounded-[2.5rem] border border-white/10 shadow-2xl bg-emerald-950/40">
            {tabs.map((tab, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-700 ${
                  activeTab === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                <SafeImg
                  src={tab.img}
                  alt={tab.name}
                  className="w-full h-full object-cover select-none pointer-events-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#012F24]/40 to-transparent" />
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
