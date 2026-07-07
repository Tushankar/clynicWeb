import { Testimonial } from '@/components/ui/testimonial-card';
import { Item, Stagger } from '../motion';

export default function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Product Manager",
      company: "Amazun",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
      testimonial: "This library has completely transformed how we build our UI components. The attention to detail and smooth animations make our application stand out. Highly recommended!"
    },
    {
      name: "John Doe",
      role: "Software Engineer",
      company: "Goggle",
      rating: 4,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
      testimonial: "The components are well documented and easy to customize. The code quality is top-notch and the support is excellent. I'm very happy with my purchase."
    },
    {
      name: "Emily Chen",
      role: "UX Designer",
      company: "Microsift",
      rating: 5,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80",
      testimonial: "The accessibility features and design system consistency are impressive. It's saved us countless hours in development time."
    }
  ];

  return (
    <section id="stories" className="relative scroll-mt-28 bg-transparent pb-24 pt-0 mt-0 overflow-x-clip select-none" aria-label="Member testimonials">
      
      {/* Ambient signature teal glow positioned at the top boundary to blend seamlessly with the section above */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] sm:w-[850px] sm:h-[850px] lg:w-[1100px] lg:h-[1100px] rounded-full bg-[#0BB89F]/15 blur-[80px] sm:blur-[120px] lg:blur-[160px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-8 z-10">
        
        {/* Section Header */}
        <div className="mb-12 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0BB89F]/10 border border-[#0BB89F]/20 text-[#0E8C72] text-xs font-bold uppercase tracking-wider mb-3">
            Member Stories
          </span>
          <h2 className="pmx-display text-3xl sm:text-[38px] font-extrabold leading-tight tracking-tight text-[#1A1A2E]">
            Real stories from Clynic members
          </h2>
        </div>

        {/* Testimonials Grid */}
        <Stagger className="grid gap-6 grid-cols-1 md:grid-cols-3" gap={0.08}>
          {testimonials.map((testimonial) => (
            <Item key={testimonial.name} className="h-full">
              <Testimonial {...testimonial} className="h-full" />
            </Item>
          ))}
        </Stagger>

      </div>
    </section>
  );
}
