import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Item, Stagger } from '../motion';

export default function HowItWorks() {
  const steps = [
    {
      num: 1,
      title: 'Choose Doctor',
      desc: 'Select from our highly qualified dental experts.',
      img: '/doctor_avatar_1.png',
      bgColor: 'rgba(11, 184, 159, 0.06)' // Teal tint
    },
    {
      num: 2,
      title: 'Book Appointment',
      desc: 'Schedule a slot that fits your timeline.',
      img: '/service_book_appointment.png',
      bgColor: 'rgba(245, 158, 11, 0.05)' // Amber tint
    },
    {
      num: 3,
      title: 'Consult',
      desc: 'Connect virtually or visit our clinic directly.',
      img: '/service_online_consultation.png',
      bgColor: 'rgba(37, 99, 235, 0.05)' // Blue tint
    },
    {
      num: 4,
      title: 'Get Prescription',
      desc: 'Receive your verified digital prescription instantly.',
      img: '/service_prescription_upload.png',
      bgColor: 'rgba(99, 102, 241, 0.05)' // Indigo tint
    },
    {
      num: 5,
      title: 'Get Medicine',
      desc: 'Get your prescribed medicines delivered home.',
      img: '/pharmacy_medicine_1.png',
      bgColor: 'rgba(236, 72, 153, 0.05)' // Pink tint
    }
  ];

  return (
    <section id="how-it-works" className="relative scroll-mt-28 bg-transparent pb-24 pt-0 mt-0 overflow-x-clip select-none" aria-label="How It Works">
      
      {/* Ambient signature teal glow positioned at the top boundary to blend seamlessly with the Pharmacy section above */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] sm:w-[850px] sm:h-[850px] lg:w-[1100px] lg:h-[1100px] rounded-full bg-[#0BB89F]/15 blur-[80px] sm:blur-[120px] lg:blur-[160px] pointer-events-none" />

      <div className="relative mx-auto max-w-[1480px] px-4 sm:px-8 z-10">
        
        {/* Header Block */}
        <div className="mb-12 text-center">
          <h2 className="pmx-display text-3xl sm:text-[38px] font-extrabold leading-tight tracking-tight text-[#1A1A2E]">
            How It Works
          </h2>
        </div>

        {/* Steps Grid */}
        <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-8 relative" gap={0.08}>
          {steps.map((step, idx) => (
            <div key={idx} className="relative w-full h-full">
              <Item className="w-full h-full">
                {/* Liquid Glass Step Card */}
                <div className="bg-white/40 backdrop-blur-md rounded-[24px] p-6 sm:p-7 border border-white/50 shadow-[0_12px_32px_-8px_rgba(14,140,114,0.06),inset_0_1px_0_0_rgba(255,255,255,0.6)] hover:shadow-[0_20px_48px_-10px_rgba(14,140,114,0.15),inset_0_1px_0_0_rgba(255,255,255,0.7)] hover:-translate-y-1.5 transition-all duration-300 text-center flex flex-col items-center h-full group">
                  
                  {/* 3D Illustration Container - Full cover to remove borders */}
                  <div className="w-20 h-20 rounded-[20px] overflow-hidden flex items-center justify-center mb-5 transition-transform group-hover:scale-105 shadow-sm">
                    <img 
                      src={step.img} 
                      alt={step.title} 
                      className="w-full h-full object-cover select-none pointer-events-none" 
                    />
                  </div>

                  {/* Step Label */}
                  <span className="text-[11px] sm:text-xs font-extrabold text-[#0E8C72] uppercase tracking-wider block mb-1.5">
                    Step {step.num}
                  </span>

                  {/* Title */}
                  <h3 className="text-[16px] sm:text-[17px] font-extrabold text-[#1A1A2E] leading-snug">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-[12px] sm:text-[13px] text-slate-500 font-semibold mt-2 leading-relaxed max-w-[180px] mx-auto">
                    {step.desc}
                  </p>
                </div>
              </Item>

              {/* Connecting Arrow (Desktop only - floating absolutely in the gap) */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:flex items-center justify-center absolute right-[-20px] top-1/2 -translate-y-1/2 text-slate-300 w-8 z-20 pointer-events-none">
                  <ArrowRight className="h-5 w-5" />
                </div>
              )}
            </div>
          ))}
        </Stagger>

      </div>
    </section>
  );
}
