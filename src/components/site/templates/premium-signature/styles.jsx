/**
 * Premium Signature — shared scoped styles + font faces. Imported by the template root
 * AND by sibling public pages (booking) so the whole public journey shares one design
 * system. Everything is namespaced under .pmx.
 */
import '@fontsource-variable/inter';
import '@/fonts.css'; // self-hosted General Sans (display face)

export const PMX_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400..700;1,400..700&family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&display=swap');

  html { scroll-behavior: smooth; }
  .pmx {
    font-family: 'Plus Jakarta Sans', 'Inter Variable', ui-sans-serif, system-ui, sans-serif;
    font-feature-settings: 'cv11', 'ss01';
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }
  .pmx-display {
    font-family: 'Lora', Georgia, serif;
    font-weight: 500;
  }
  .pmx ::selection { background: rgba(0,90,54,0.18); color: #0B1220; }

  /* ── Maven Clinic Forest Green Overrides ── */
  .pmx .text-emerald-700 { color: #005A36 !important; }
  .pmx .text-emerald-600 { color: #005A36 !important; }
  .pmx .text-emerald-800 { color: #004225 !important; }
  .pmx .text-emerald-400 { color: #008f56 !important; }
  .pmx .bg-emerald-600 { background-color: #005A36 !important; }
  .pmx .bg-emerald-500 { background-color: #005A36 !important; }
  .pmx .bg-emerald-750 { background-color: #004225 !important; }
  .pmx .bg-emerald-50\/80 { background-color: rgba(250, 248, 245, 0.85) !important; }
  .pmx .hover\:bg-emerald-600:hover { background-color: #004225 !important; }
  .pmx .hover\:text-emerald-600:hover { color: #004225 !important; }
  .pmx .border-emerald-600\/15 { border-color: rgba(0, 90, 54, 0.15) !important; }
  .pmx .bg-emerald-500\/10 { background-color: rgba(0, 90, 54, 0.1) !important; }
  .pmx .border-emerald-500\/25 { border-color: rgba(0, 90, 54, 0.2) !important; }

  /* Gradient overrides for emerald elements */
  .pmx .from-emerald-600 { --tw-gradient-from: #005A36 !important; --tw-gradient-to: rgba(0, 90, 54, 0) !important; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important; }
  .pmx .via-emerald-500 { --tw-gradient-to: rgba(0, 90, 54, 0) !important; --tw-gradient-stops: var(--tw-gradient-from), #007d4c !important, var(--tw-gradient-to) !important; }
  .pmx .to-emerald-500 { --tw-gradient-to: #007d4c !important; }

  /* light dot-grid, faded at the edges */
  .pmx-grid {
    background-image: radial-gradient(circle, rgba(0,90,54,0.06) 1px, transparent 1.5px);
    background-size: 26px 26px;
    -webkit-mask-image: radial-gradient(ellipse 90% 70% at 50% 35%, black 25%, transparent 78%);
    mask-image: radial-gradient(ellipse 90% 70% at 50% 35%, black 25%, transparent 78%);
  }
  /* fine line-grid for dark sections */
  .pmx-grid-dark {
    background-image:
      linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
    background-size: 56px 56px;
    -webkit-mask-image: radial-gradient(ellipse 85% 80% at 50% 20%, black 30%, transparent 80%);
    mask-image: radial-gradient(ellipse 85% 80% at 50% 20%, black 30%, transparent 80%);
  }
  /* soft plus/dot texture used on dark banners */
  .pmx-plus {
    background-image: radial-gradient(circle, rgba(255,255,255,0.35) 1px, transparent 1.6px);
    background-size: 20px 20px;
  }

  /* capability marquee */
  @keyframes pmx-marquee { to { transform: translateX(-50%); } }
  .pmx-marquee { animation: pmx-marquee 36s linear infinite; }
  .pmx-marquee:hover { animation-play-state: paused; }
  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
    .pmx-marquee { animation: none; flex-wrap: wrap; width: 100% !important; justify-content: center; }
  }
`;

export function PmxStyles() {
  return <style>{PMX_STYLES}</style>;
}
