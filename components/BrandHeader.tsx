"use client";

import LogoMark from "./LogoMark";


export default function BrandHeader() {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 pointer-events-none select-none">
      <LogoMark size={36} />

      <p className="text-sm md:text-base font-display font-semibold whitespace-nowrap">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent2 to-accent">
          NekoCortex
        </span>
      </p>
    </div>
  );
}
