"use client"

import * as React from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const Testimonial = React.forwardRef(
  ({ name, role, company, testimonial, rating = 5, image, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-[24px] border border-white/50 bg-white/40 backdrop-blur-md p-6 sm:p-8 shadow-[0_12px_32px_-8px_rgba(14,140,114,0.06),inset_0_1px_0_0_rgba(255,255,255,0.6)] hover:shadow-[0_20px_48px_-10px_rgba(14,140,114,0.15),inset_0_1px_0_0_rgba(255,255,255,0.7)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between h-full group",
          className
        )}
        {...props}
      >
        {/* Large glassmorphic background quote symbol */}
        <div className="absolute right-6 top-4 text-7xl font-serif text-[#0E8C72]/10 select-none pointer-events-none group-hover:scale-110 transition-transform duration-300">
          ”
        </div>

        <div className="flex flex-col gap-5 justify-between h-full relative z-10">
          {/* Star Rating */}
          {rating > 0 && (
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  size={16}
                  className={cn(
                    "transition-all duration-300 group-hover:scale-110",
                    index < rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-slate-200 text-slate-200"
                  )}
                  style={{ transitionDelay: `${index * 50}ms` }}
                />
              ))}
            </div>
          )}

          {/* Testimonial Quote Body */}
          <p className="text-slate-600 font-semibold text-sm sm:text-[14.5px] leading-relaxed flex-1">
            {testimonial}
          </p>

          {/* User Profile Footer */}
          <div className="flex items-center gap-4 pt-4 border-t border-slate-200/40 mt-2">
            {image && (
              <Avatar className="h-11 w-11 border border-white/80 shadow-xs">
                <AvatarImage src={image} alt={name} className="object-cover" />
                <AvatarFallback className="bg-[#0BB89F]/10 text-[#0E8C72] font-bold text-sm">
                  {name[0]}
                </AvatarFallback>
              </Avatar>
            )}

            <div className="flex flex-col">
              <h4 className="font-extrabold text-[#1A1A2E] text-sm sm:text-[14.5px]">
                {name}
              </h4>
              <p className="text-[11.5px] text-slate-500 font-semibold mt-0.5">
                {role}
                {company && (
                  <span className="text-[#0E8C72] font-bold"> @ {company}</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }
)
Testimonial.displayName = "Testimonial"

export { Testimonial }
