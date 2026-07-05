/**
 * Journey — Rebuilt to be Maven Clinic style Clinical Outcomes circular progress section.
 * Renders 4 columns of responsive SVG percentage progress gauges with clean captions.
 */
import { motion } from 'framer-motion';
import { SectionHead } from '../ui';
import { Item, Stagger } from '../motion';

function CircularGauge({ value, label, percentage, i }) {
  // SVG circular properties
  const radius = 64;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center text-center p-6 bg-white/60 rounded-[2rem] border border-slate-200/50 shadow-xs">
      <div className="relative w-36 h-36 flex items-center justify-center">
        {/* SVG gauge */}
        <svg className="w-full h-full transform -rotate-95">
          {/* Background circle */}
          <circle
            cx="72"
            cy="72"
            r={radius}
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated Foreground circle */}
          <motion.circle
            cx="72"
            cy="72"
            r={radius}
            stroke="#005A36"
            strokeWidth={strokeWidth + 1}
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            whileInView={{ strokeDashoffset }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: i * 0.15, ease: 'easeOut' }}
            strokeLinecap="round"
          />
        </svg>
        {/* Metric value text */}
        <span className="absolute pmx-display text-3xl font-semibold text-[#0A1C14]">
          {value}
        </span>
      </div>
      <p className="mt-5 text-[14.5px] leading-relaxed text-slate-600 max-w-[220px]">
        {label}
      </p>
    </div>
  );
}

export default function Journey() {
  const metrics = [
    {
      value: '27%',
      percentage: 27,
      label: 'Up to 27% lower treatment discomfort using our laser-assisted procedures.'
    },
    {
      value: '98%',
      percentage: 98,
      label: '98% of patients report absolute satisfaction with their restorative treatments.'
    },
    {
      value: '4x',
      percentage: 92, // Fill gauge mostly for text value representation
      label: '4x faster healing time using computer-guided dental implants.'
    },
    {
      value: '0%',
      percentage: 0.1, // Near zero stroke to represent 0% complications
      label: '0% post-procedure complication rates under strict sterile guidelines.'
    }
  ];

  return (
    <section className="relative overflow-hidden bg-white py-24 sm:py-32" aria-label="Clinical outcomes">
      <div aria-hidden="true" className="pmx-grid absolute inset-0 opacity-[0.2]" />
      
      <div className="relative mx-auto max-w-7xl px-6">
        <SectionHead
          align="center"
          eyebrow="Clinical standards"
          title="Clinical excellence you can measure"
          sub="We hold our treatments to rigorous outcomes so you know your health is in safe hands."
        />

        <Stagger className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" gap={0.1}>
          {metrics.map((m, i) => (
            <Item key={m.value + i}>
              <CircularGauge
                value={m.value}
                percentage={m.percentage}
                label={m.label}
                i={i}
              />
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
