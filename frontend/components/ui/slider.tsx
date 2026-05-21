"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn("relative flex w-full touch-none select-none items-center", className)}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-[3px] w-full grow overflow-hidden rounded-full bg-white/[0.08]">
      <SliderPrimitive.Range className="absolute h-full rounded-full bg-gradient-to-r from-accent-purple to-accent-blue" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      className="block h-4 w-4 rounded-full border border-accent-purple/60 bg-bg-elevated shadow-sm
        ring-offset-bg-base transition-all duration-150
        hover:border-accent-purple hover:scale-110
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple/40 focus-visible:ring-offset-2
        disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
    />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
