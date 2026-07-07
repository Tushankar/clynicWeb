import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, Heart, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { Item, Stagger } from '../motion';

export default function Pharmacy({ m }) {
  const TEAL = '#0E8C72';
  const TEAL_DARK = '#074C3D';

  const [activeCategory, setActiveCategory] = useState('all');
  const scrollRef = useRef(null);

  const products = [
    {
      name: 'Amoxicillin Premium',
      category: 'prescription',
      type: 'Antibiotic',
      price: '$7.00',
      priceColor: '#0E8C72', // Teal
      img: '/pharmacy_medicine_1.png',
      bgColor: 'rgba(11, 184, 159, 0.05)',
      badge: 'Discounted',
      btnType: 'outline',
      btnText: 'Add to Cart'
    },
    {
      name: 'Ibuprofen Forte',
      category: 'otc',
      type: 'Pain Relief',
      price: '$15.00',
      priceColor: '#EF4444', // Red
      img: '/pharmacy_medicine_2.png',
      bgColor: 'rgba(239, 68, 68, 0.04)',
      badge: null,
      btnType: 'solid',
      btnText: 'Add to Cart'
    },
    {
      name: 'Multivitamin Complex',
      category: 'wellness',
      type: 'Supplement',
      price: '$3.90',
      priceColor: '#0E8C72', // Teal
      img: '/pharmacy_medicine_3.png',
      bgColor: 'rgba(37, 99, 235, 0.04)',
      badge: null,
      btnType: 'outline',
      btnText: 'Wishlist'
    },
    {
      name: 'Paracetamol Extra',
      category: 'otc',
      type: 'Fever Reducer',
      price: '$18.00',
      priceColor: '#0E8C72', // Teal
      img: '/pharmacy_medicine_4.png',
      bgColor: 'rgba(99, 102, 241, 0.04)',
      badge: 'Discounted',
      btnType: 'outline',
      btnText: 'Add to Cart'
    }
  ];

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const offset = direction === 'left' ? -clientWidth / 2 : clientWidth / 2;
      scrollRef.current.scrollTo({ left: scrollLeft + offset, behavior: 'smooth' });
    }
  };

  return (
    <section id="pharmacy" className="relative scroll-mt-28 bg-transparent pb-24 pt-0 mt-0 overflow-x-clip select-none" aria-label="Online Pharmacy">
      
      {/* Ambient signature teal glow positioned at the top to blend with doctors above */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] sm:w-[850px] sm:h-[850px] lg:w-[1100px] lg:h-[1100px] rounded-full bg-[#0BB89F]/15 blur-[80px] sm:blur-[120px] lg:blur-[160px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-8 z-10">
        
        {/* Header Block */}
        <div className="mb-8">
          <h2 className="pmx-display text-3xl sm:text-[38px] font-extrabold leading-tight tracking-tight text-[#1A1A2E]">
            Online Pharmacy
          </h2>
          <p className="mt-2 text-slate-500 text-sm font-semibold max-w-xl">
            Premium medicine product cards in this theme.
          </p>
        </div>

        {/* Filters and Search Bar Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          {/* Left: Tab Selectors */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Category Dropdown */}
            <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0BB89F]/10 border border-[#0BB89F]/20 text-xs font-bold text-[#0E8C72] hover:bg-[#0BB89F]/15 transition-all">
              Category <ChevronDown className="h-3.5 w-3.5" />
            </button>
            
            {/* Medicine Dropdown */}
            <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/40 border border-slate-200/80 text-xs font-bold text-slate-700 hover:bg-white transition-all">
              Medicine <ChevronDown className="h-3.5 w-3.5" />
            </button>

            {/* Wishlist Button */}
            <button className="px-3.5 py-2 text-xs font-bold text-slate-500 hover:text-[#0E8C72] transition-colors">
              Wishlist
            </button>
          </div>

          {/* Right: Search Bar */}
          <div className="relative w-full md:w-[260px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Medicine search" 
              className="w-full pl-10 pr-4 py-2 bg-white/40 backdrop-blur-md border border-slate-200/80 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0E8C72] placeholder-slate-400" 
            />
          </div>
        </div>

        {/* Carousel Slider Wrapper */}
        <div className="relative group/slider">
          
          {/* Absolute Navigation Chevrons */}
          <button 
            onClick={() => handleScroll('left')}
            className="absolute left-[-16px] top-1/2 -translate-y-1/2 h-9 w-9 bg-white border border-slate-100 rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.05)] z-20 cursor-pointer hover:bg-slate-50 active:scale-95 transition-all opacity-0 group-hover/slider:opacity-100 hidden sm:flex"
          >
            <ChevronLeft className="h-4 w-4 text-slate-600" />
          </button>
          
          <button 
            onClick={() => handleScroll('right')}
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
            {products.map((prod, i) => (
              <div 
                key={i}
                className="w-full min-w-[260px] sm:min-w-[270px] md:min-w-[280px] max-w-[290px] bg-white/40 backdrop-blur-md rounded-[24px] p-4 border border-white/50 shadow-[0_12px_32px_-8px_rgba(14,140,114,0.06),inset_0_1px_0_0_rgba(255,255,255,0.6)] hover:shadow-[0_20px_48px_-10px_rgba(14,140,114,0.18),inset_0_1px_0_0_rgba(255,255,255,0.7)] hover:-translate-y-1 transition-all duration-300 flex flex-col snap-start group"
              >
                {/* Image Container - Bleeds to edges */}
                <div className="relative rounded-xl h-[170px] overflow-hidden flex items-center justify-center mb-4 transition-transform group-hover:scale-[1.01]" style={{ backgroundColor: prod.bgColor }}>
                  <img 
                    src={prod.img} 
                    alt={prod.name} 
                    className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-500 group-hover:scale-105" 
                  />
                  
                  {/* Discount Badge */}
                  {prod.badge && (
                    <span className="absolute top-3 left-3 bg-[#EF4444] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                      {prod.badge}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col px-0.5">
                  <h3 className="text-[16px] font-bold text-[#1A1A2E] leading-tight truncate">
                    {prod.name}
                  </h3>
                  <p className="text-[11.5px] text-slate-500 font-semibold mt-1">
                    {prod.type}
                  </p>

                  {/* Price + Wishlist Row */}
                  <div className="flex items-center justify-between mt-3.5 mb-5">
                    <span className="text-[17px] font-extrabold" style={{ color: prod.priceColor }}>
                      {prod.price}
                    </span>
                    <button className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-red-500 transition-colors">
                      <Heart className="h-3.5 w-3.5" />
                      <span>Wishlist</span>
                    </button>
                  </div>

                  {/* Premium Liquid Glass Add to Cart Button */}
                  <button 
                    className="group/btn relative block w-full text-center py-2.5 rounded-full text-[12.5px] font-bold text-white transition-all duration-200 active:scale-[0.98] overflow-hidden shadow-[0_6px_16px_-4px_rgba(14,140,114,0.45)] hover:shadow-[0_10px_20px_-6px_rgba(14,140,114,0.55)]"
                    style={{ background: `linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 100%), ${TEAL}` }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = `linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 100%), ${TEAL_DARK}`; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = `linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 100%), ${TEAL}`; }}
                  >
                    <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/btn:translate-x-full" />
                    <span className="absolute inset-0 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.45)] rounded-full pointer-events-none" />
                    <span className="relative z-10">Add to Cart</span>
                  </button>
                </div>
              </div>
            ))}
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
