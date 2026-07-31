// A reusable vector version of the NekoCortex mark — low-poly fox/cat
// silhouette with angular slit eyes, using the same cyan-to-magenta
// gradient as the rest of the site (Hero.tsx's edgeGradient, etc).
// Being an SVG rather than a raster image means it stays crisp at any
// size, from a 24px favicon up to a full hero-sized placement, with no
// separate asset files to manage.
//
// This is a hand-built vector approximation of the low-poly fox concept,
// not a traced copy of a specific piece of generated artwork — if you'd
// rather use your exact original image instead, see the note at the
// bottom of this file for how to swap it in.

interface LogoMarkProps {
  size?: number;
  className?: string;
  glow?: boolean;
}

export default function LogoMark({ size = 36, className = "", glow = true }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={`${glow ? "drop-shadow-[0_0_10px_rgba(232,121,249,0.55)]" : ""} ${className}`}
    >
      <defs>
        <linearGradient id="logoMarkGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#e879f9" />
        </linearGradient>
      </defs>

      {/* Outer fox-face silhouette */}
      <path
        d="M20,20 L70,110 L100,80 L130,110 L180,20 L170,140 L100,190 L30,140 Z"
        fill="none"
        stroke="url(#logoMarkGradient)"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* Inner facet lines echoing the low-poly construction */}
      <path
        d="M70,110 L100,140 L130,110"
        fill="none"
        stroke="url(#logoMarkGradient)"
        strokeWidth="2.5"
        opacity="0.7"
        strokeLinejoin="round"
      />
      {/* Angular slit eyes */}
      <path d="M75,124 L92,118 L86,136 Z" fill="url(#logoMarkGradient)" />
      <path d="M125,124 L108,118 L114,136 Z" fill="url(#logoMarkGradient)" />
    </svg>
  );
}

// --- Prefer your original generated artwork instead? ---
// 1. Export it as an SVG (a tool like vectorizer.ai can trace your JPG),
//    or keep it as a PNG with a transparent background.
// 2. Drop the file into automl-ui/public/, e.g. public/logo.svg
// 3. Replace this component's contents with:
//      import Image from "next/image";
//      export default function LogoMark({ size = 36, className = "" }: LogoMarkProps) {
//        return <Image src="/logo.svg" width={size} height={size} alt="NekoCortex" className={className} />;
//      }
