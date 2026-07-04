/**
 * Premium Signature — shared scoped styles + font faces. Imported by the template root
 * AND by sibling public pages (booking) so the whole public journey shares one design
 * system. Everything is namespaced under .pmx.
 */
import '@fontsource-variable/inter';
import '@/fonts.css'; // self-hosted General Sans (display face)

export const PMX_STYLES = `
  html { scroll-behavior: smooth; }
  .pmx {
    font-family: 'Inter Variable', 'General Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
    font-feature-settings: 'cv11', 'ss01';
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }
  .pmx-display { font-family: 'General Sans', 'Inter Variable', ui-sans-serif, system-ui, sans-serif; }
  .pmx ::selection { background: rgba(16,185,129,0.22); color: #0B1220; }

  /* light dot-grid, faded at the edges */
  .pmx-grid {
    background-image: radial-gradient(circle, rgba(10,27,58,0.10) 1px, transparent 1.5px);
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
