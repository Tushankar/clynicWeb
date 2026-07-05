import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SafeImg } from '../ui';

function CircularGauge({ percentage, label, numberValue }) {
  const radius = 60;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex items-center gap-6 p-6 rounded-2xl bg-white/70 border border-[#012F24]/5 shadow-xs hover:shadow-md transition-all duration-300">
      <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="56"
            cy="56"
            r={radius}
            stroke="#EDE9E3"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated Foreground circle */}
          <motion.circle
            cx="56"
            cy="56"
            r={radius}
            stroke="#012F24"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            whileInView={{ strokeDashoffset }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            strokeLinecap="round"
          />
        </svg>
        {/* Metric value text */}
        <span className="absolute pmx-display text-2xl font-semibold text-[#012F24]">
          {numberValue}
        </span>
      </div>
      <div className="flex-1">
        <p className="text-sm sm:text-base leading-relaxed text-[#012F24]/80 font-medium">
          {label}
        </p>
      </div>
    </div>
  );
}

export default function Journey() {
  const stats = [
    {
      percentage: 27,
      numberValue: "27%",
      label: "Up to 27% lower NICU admissions"
    },
    {
      percentage: 40,
      numberValue: "40%",
      label: "Up to 40% of members report Maven helped them return to work after having a baby."
    },
    {
      percentage: 30,
      numberValue: "30%",
      label: "Among fertility members, 30% achieve pregnancy without Assisted Reproductive Technology"
    },
    {
      percentage: 21,
      numberValue: "21%",
      label: "Up to 21% of members reported an improved state of maternal mental health"
    }
  ];

  return (
    <section className="relative min-h-screen bg-[#F7F4EE] text-[#012F24] flex flex-col md:flex-row" aria-label="Clinical outcomes split section">
      
      {/* Left Column (Sticky Image Pane) */}
      <div className="relative w-full md:w-1/2 h-[60vh] md:h-screen md:sticky md:top-0 overflow-hidden bg-[#EDE9E3]">
        <SafeImg 
          src="/parallex-desktop.webp" 
          alt="Mother and baby silhouette" 
          className="w-full h-full object-cover select-none"
        />
        <div className="absolute inset-0 bg-[#012F24]/5" />
      </div>

      {/* Right Column (Scrolling Stat Cards) */}
      <div className="w-full md:w-1/2 px-6 sm:px-12 py-20 md:py-32 flex flex-col justify-center">
        <div className="max-w-xl mx-auto w-full">
          {/* Header block inside scrolling container */}
          <div className="mb-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#012F24]/5 border border-[#012F24]/10 text-[#012F24] text-xs font-semibold uppercase tracking-wider mb-4">
              Proven Outcomes
            </span>
            <h2 className="pmx-display text-4xl sm:text-5xl font-light tracking-tight leading-tight mb-6">
              Lowering costs by <strong className="font-semibold text-emerald-800">improving care</strong>
            </h2>
            <p className="text-slate-700 text-base sm:text-lg leading-relaxed">
              By guiding members through more intuitive paths to health, we help reduce costly interventions and improve outcomes.
            </p>
          </div>

          {/* List of circular stats */}
          <div className="space-y-6">
            {stats.map((stat, idx) => (
              <CircularGauge
                key={idx}
                percentage={stat.percentage}
                numberValue={stat.numberValue}
                label={stat.label}
              />
            ))}
          </div>
        </div>
      </div>

    </section>
  );
}
