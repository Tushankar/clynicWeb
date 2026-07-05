import { Button } from '../ui';

export default function FinalCta({ m }) {
  return (
    <section id="contact" className="scroll-mt-28 bg-white py-16" aria-label="Bring benefits to future">
      <div className="mx-auto max-w-7xl px-6">
        <div
          className="relative overflow-hidden rounded-[2.5rem] bg-[#FAF8F5] px-6 py-20 text-center sm:px-16 sm:py-24 border border-slate-200/50 shadow-md"
        >
          {/* Centered Green Glow Ball */}
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.14] blur-3xl pointer-events-none"
            style={{
              background: 'radial-gradient(circle, #58EDA2 0%, transparent 70%)',
            }}
          />
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none opacity-[0.15]">
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 2163 1144" fill="none" className="w-full h-full object-cover">
              <path d="M1 418.74C301.79 465.754 922.869 648.755 1380.8 247.677C1953.22 -253.672 91.988 138.624 876.875 317.179C1661.76 495.733 2287.17 591.924 2139.19 478.51C1991.22 365.096 1845.32 229.162 618 1142" stroke="#86D2BC" strokeWidth="2" opacity="0.25"></path>
            </svg>
          </div>

          <div className="relative max-w-3xl mx-auto z-10">
            <h2 className="pmx-display text-4xl sm:text-5xl lg:text-[4.5rem] font-light leading-none tracking-tight text-[#012F24]">
              Bring your benefits <br className="hidden sm:inline" />
              into <span className="font-serif italic text-[#012F24]">the future</span>
            </h2>
            
            <p className="mt-8 text-[#012F24]/80 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Connect with our team and discover how our women's and family health benefits can work for you.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Button to="/for-employers" size="lg" className="px-8 bg-[#012F24] text-white hover:bg-[#001f18] shadow-md border-transparent">
                For businesses
              </Button>
              <Button to="/for-individuals" variant="outline" size="lg" className="px-8 border-[#012F24] text-[#012F24] hover:bg-[#012F24] hover:text-white">
                For employees
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
