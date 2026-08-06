/**
 * Online Pharmacy — the storefront teaser on the clinic's home page.
 *
 * Data contract: when the clinic runs an Ultra Premium storefront AND has sellable medicines,
 * this section shows its REAL catalogue (live price, stock, Rx flag) and every control works —
 * search jumps to the store's search results, the category chips filter, "Add to Cart" writes to
 * the shared cart, and "See All" opens the full store. Until the clinic adds medicines, the same
 * layout renders the template's showcase cards so the section is never empty.
 */
import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, ChevronLeft, ChevronRight, ChevronDown, Check } from 'lucide-react';
import { useStoreHome } from '@/hooks/useStore';
import { useCart } from '@/hooks/useCart';
import { inr } from '@/lib/format';

const TEAL = '#0E8C72';
const TEAL_DARK = '#074C3D';

// Showcase cards — the template's default look, used until the clinic lists real medicines.
const SHOWCASE = [
  { id: 'demo-1', name: 'Amoxicillin Premium', type: 'Antibiotic', price: '$7.00', priceColor: TEAL, img: '/pharmacy_medicine_1.png', bgColor: 'rgba(11, 184, 159, 0.05)', badge: 'Discounted' },
  { id: 'demo-2', name: 'Ibuprofen Forte', type: 'Pain Relief', price: '$15.00', priceColor: '#EF4444', img: '/pharmacy_medicine_2.png', bgColor: 'rgba(239, 68, 68, 0.04)', badge: null },
  { id: 'demo-3', name: 'Multivitamin Complex', type: 'Supplement', price: '$3.90', priceColor: TEAL, img: '/pharmacy_medicine_3.png', bgColor: 'rgba(1, 47, 36, 0.05)', badge: null },
  { id: 'demo-4', name: 'Paracetamol Extra', type: 'Fever Reducer', price: '$18.00', priceColor: TEAL, img: '/pharmacy_medicine_4.png', bgColor: 'rgba(52, 211, 153, 0.10)', badge: 'Discounted' },
];

const TINTS = ['rgba(11, 184, 159, 0.05)', 'rgba(239, 68, 68, 0.04)', 'rgba(1, 47, 36, 0.05)', 'rgba(52, 211, 153, 0.10)'];
const ART = ['/pharmacy_medicine_1.png', '/pharmacy_medicine_2.png', '/pharmacy_medicine_3.png', '/pharmacy_medicine_4.png'];

/** Map a live store medicine onto the showcase card shape, so one card renders both. */
function toCard(med, i) {
  return {
    id: med.id,
    name: med.name,
    type: [med.brand, med.strength].filter(Boolean).join(' · ') || med.composition || med.form || 'Medicine',
    price: inr(med.price),
    priceColor: med.inStock ? TEAL : '#94A3B8',
    img: med.imageUrl || ART[i % ART.length],
    bgColor: TINTS[i % TINTS.length],
    badge: med.prescriptionRequired ? 'Rx only' : null,
    live: med,
  };
}

export default function Pharmacy({ m }) {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [q, setQ] = useState('');
  const [addedId, setAddedId] = useState(null);
  const [catOpen, setCatOpen] = useState(false);

  const { add } = useCart(m.slug);
  // Only query the storefront when the clinic's plan actually has one (otherwise it 404s).
  const { data: store } = useStoreHome(m.store ? m.slug : null);

  const featured = store?.featured || [];
  const categories = store?.categories || [];
  const isLive = featured.length > 0;
  const products = isLive ? featured.slice(0, 12).map(toCard) : SHOWCASE;

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const offset = direction === 'left' ? -clientWidth / 2 : clientWidth / 2;
      scrollRef.current.scrollTo({ left: scrollLeft + offset, behavior: 'smooth' });
    }
  };

  const submitSearch = (e) => {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    navigate(m.store ? `${m.storeHref}/search?q=${encodeURIComponent(term)}` : m.bookHref);
  };

  const quickAdd = (card) => {
    if (!card.live || !card.live.inStock) return;
    add({
      medicineId: card.live.id,
      name: card.live.name,
      price: card.live.price,
      prescriptionRequired: card.live.prescriptionRequired,
      unit: card.live.unit,
      imageUrl: card.live.imageUrl,
    });
    setAddedId(card.id);
    setTimeout(() => setAddedId((v) => (v === card.id ? null : v)), 1400);
  };

  return (
    <section id="pharmacy" className="relative scroll-mt-28 bg-transparent pb-24 pt-0 mt-0 overflow-x-clip select-none" aria-label="Online Pharmacy">

      {/* Ambient signature teal glow positioned at the top to blend with doctors above */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] sm:w-[850px] sm:h-[850px] lg:w-[1100px] lg:h-[1100px] rounded-full bg-[#0BB89F]/15 blur-[80px] sm:blur-[120px] lg:blur-[160px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-8 z-10">

        {/* Header Block */}
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="pmx-display text-3xl sm:text-[38px] font-extrabold leading-tight tracking-tight text-[#1A1A2E]">
              Online Pharmacy
            </h2>
            <p className="mt-2 text-slate-500 text-sm font-semibold max-w-xl">
              {isLive
                ? `Genuine medicines from ${m.name}, delivered to your door.`
                : 'Premium medicine product cards in this theme.'}
            </p>
          </div>

          {/* See All — opens the clinic's full, real catalogue */}
          {m.store ? (
            <Link
              to={m.storeHref}
              className="inline-flex shrink-0 items-center gap-1.5 px-3.5 py-1.5 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 bg-white/40 backdrop-blur-md hover:bg-white transition-all hover:border-slate-300"
            >
              See All <ChevronRight className="h-3 w-3" />
            </Link>
          ) : null}
        </div>

        {/* Filters and Search Bar Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          {/* Left: Tab Selectors */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Category Dropdown — the clinic's real store categories */}
            <div className="relative" onMouseLeave={() => setCatOpen(false)}>
              <button
                type="button"
                onClick={() => (categories.length ? setCatOpen((v) => !v) : navigate(m.store ? m.storeHref : m.bookHref))}
                aria-expanded={catOpen}
                aria-haspopup={categories.length ? 'true' : undefined}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0BB89F]/10 border border-[#0BB89F]/20 text-xs font-bold text-[#0E8C72] hover:bg-[#0BB89F]/15 transition-all"
              >
                Category <ChevronDown className={`h-3.5 w-3.5 transition-transform ${catOpen ? 'rotate-180' : ''}`} />
              </button>
              {catOpen && categories.length ? (
                <div className="absolute left-0 top-full z-30 mt-1 max-h-72 w-56 overflow-y-auto rounded-2xl border border-slate-100 bg-white p-2 shadow-xl">
                  {categories.map((c) => (
                    <Link
                      key={c.slug || c.name}
                      to={c.slug ? `${m.storeHref}/category/${c.slug}` : m.storeHref}
                      onClick={() => setCatOpen(false)}
                      className="block truncate rounded-lg px-3 py-2 text-[13px] font-semibold text-[#1A1A2E] transition-colors hover:bg-slate-50 hover:text-[#0E8C72]"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>

            {/* All medicines */}
            <Link
              to={m.store ? m.storeHref : m.bookHref}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/40 border border-slate-200/80 text-xs font-bold text-slate-700 hover:bg-white transition-all"
            >
              Medicine <ChevronRight className="h-3.5 w-3.5" />
            </Link>

            {/* Orders / prescriptions */}
            <Link
              to={m.store ? `${m.storeHref}/orders` : m.portalHref}
              className="px-3.5 py-2 text-xs font-bold text-slate-500 hover:text-[#0E8C72] transition-colors"
            >
              My orders
            </Link>
          </div>

          {/* Right: Search Bar */}
          <form onSubmit={submitSearch} role="search" className="relative w-full md:w-[260px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Medicine search"
              aria-label="Search medicines"
              className="w-full pl-10 pr-4 py-2 bg-white/40 backdrop-blur-md border border-slate-200/80 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0E8C72] placeholder-slate-400"
            />
          </form>
        </div>

        {/* Carousel Slider Wrapper */}
        <div className="relative group/slider">

          {/* Absolute Navigation Chevrons */}
          <button
            type="button"
            onClick={() => handleScroll('left')}
            aria-label="Scroll left"
            className="absolute left-[-16px] top-1/2 -translate-y-1/2 h-9 w-9 bg-white border border-slate-100 rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.05)] z-20 cursor-pointer hover:bg-slate-50 active:scale-95 transition-all opacity-0 group-hover/slider:opacity-100 hidden sm:flex"
          >
            <ChevronLeft className="h-4 w-4 text-slate-600" />
          </button>

          <button
            type="button"
            onClick={() => handleScroll('right')}
            aria-label="Scroll right"
            className="absolute right-[-16px] top-1/2 -translate-y-1/2 h-9 w-9 bg-white border border-slate-100 rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.05)] z-20 cursor-pointer hover:bg-slate-50 active:scale-95 transition-all opacity-0 group-hover/slider:opacity-100 hidden sm:flex"
          >
            <ChevronRight className="h-4 w-4 text-slate-600" />
          </button>

          {/* Scrollable Products Grid */}
          <div
            ref={scrollRef}
            className="flex gap-5 sm:gap-6 overflow-x-auto pb-4 pt-1 no-scrollbar snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {products.map((prod) => {
              const to = prod.live ? `${m.storeHref}/medicine/${prod.live.id}` : m.store ? m.storeHref : m.bookHref;
              const soldOut = prod.live ? !prod.live.inStock : false;
              const added = addedId === prod.id;
              return (
                <div
                  key={prod.id}
                  className="w-full min-w-[260px] sm:min-w-[270px] md:min-w-[280px] max-w-[290px] bg-white/40 backdrop-blur-md rounded-[24px] p-4 border border-white/50 shadow-[0_12px_32px_-8px_rgba(14,140,114,0.06),inset_0_1px_0_0_rgba(255,255,255,0.6)] hover:shadow-[0_20px_48px_-10px_rgba(14,140,114,0.18),inset_0_1px_0_0_rgba(255,255,255,0.7)] hover:-translate-y-1 transition-all duration-300 flex flex-col snap-start group"
                >
                  {/* Image Container - Bleeds to edges */}
                  <Link to={to} className="relative rounded-xl h-[170px] overflow-hidden flex items-center justify-center mb-4 transition-transform group-hover:scale-[1.01]" style={{ backgroundColor: prod.bgColor }}>
                    <img
                      src={prod.img}
                      alt={prod.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => { e.currentTarget.src = ART[0]; }}
                    />

                    {/* Rx / discount badge */}
                    {prod.badge && (
                      <span className="absolute top-3 left-3 bg-[#EF4444] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                        {prod.badge}
                      </span>
                    )}
                    {soldOut && (
                      <span className="absolute top-3 right-3 bg-slate-700/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                        Out of stock
                      </span>
                    )}
                  </Link>

                  {/* Content */}
                  <div className="flex-1 flex flex-col px-0.5">
                    <Link to={to} className="text-[16px] font-bold text-[#1A1A2E] leading-tight truncate hover:text-[#0E8C72] transition-colors" title={prod.name}>
                      {prod.name}
                    </Link>
                    <p className="text-[11.5px] text-slate-500 font-semibold mt-1 truncate">
                      {prod.type}
                    </p>

                    {/* Price + Wishlist Row */}
                    <div className="flex items-center justify-between mt-3.5 mb-5">
                      <span className="text-[17px] font-extrabold" style={{ color: prod.priceColor }}>
                        {prod.price}
                      </span>
                      <Link
                        to={to}
                        className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-[#0E8C72] transition-colors"
                      >
                        <Heart className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Details</span>
                      </Link>
                    </div>

                    {/* Premium Liquid Glass Add to Cart Button */}
                    {prod.live ? (
                      <button
                        type="button"
                        onClick={() => quickAdd(prod)}
                        disabled={soldOut}
                        aria-label={soldOut ? `${prod.name} is out of stock` : `Add ${prod.name} to cart`}
                        className={`group/btn relative block w-full text-center py-2.5 rounded-full text-[12.5px] font-bold transition-all duration-200 active:scale-[0.98] overflow-hidden ${
                          soldOut
                            ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                            : 'text-white shadow-[0_6px_16px_-4px_rgba(14,140,114,0.45)] hover:shadow-[0_10px_20px_-6px_rgba(14,140,114,0.55)]'
                        }`}
                        style={soldOut ? undefined : { background: `linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 100%), ${added ? TEAL_DARK : TEAL}` }}
                        onMouseEnter={(e) => { if (!soldOut) e.currentTarget.style.background = `linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 100%), ${TEAL_DARK}`; }}
                        onMouseLeave={(e) => { if (!soldOut) e.currentTarget.style.background = `linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 100%), ${added ? TEAL_DARK : TEAL}`; }}
                      >
                        {!soldOut && <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/btn:translate-x-full" />}
                        {!soldOut && <span className="absolute inset-0 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.45)] rounded-full pointer-events-none" />}
                        <span className="relative z-10 inline-flex items-center justify-center gap-1.5">
                          {soldOut ? 'Out of stock' : added ? <><Check className="h-3.5 w-3.5" aria-hidden="true" /> Added</> : 'Add to Cart'}
                        </span>
                      </button>
                    ) : (
                      <Link
                        to={to}
                        className="group/btn relative block w-full text-center py-2.5 rounded-full text-[12.5px] font-bold text-white transition-all duration-200 active:scale-[0.98] overflow-hidden shadow-[0_6px_16px_-4px_rgba(14,140,114,0.45)] hover:shadow-[0_10px_20px_-6px_rgba(14,140,114,0.55)]"
                        style={{ background: `linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 100%), ${TEAL}` }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = `linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 100%), ${TEAL_DARK}`; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = `linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 100%), ${TEAL}`; }}
                      >
                        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/btn:translate-x-full" />
                        <span className="absolute inset-0 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.45)] rounded-full pointer-events-none" />
                        <span className="relative z-10">Add to Cart</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Indicators */}
          <div className="flex items-center justify-center gap-1.5 mt-6">
            <span className="w-4 h-1.5 bg-[#0E8C72] rounded-full transition-all duration-300" />
            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
          </div>

        </div>

      </div>
    </section>
  );
}
