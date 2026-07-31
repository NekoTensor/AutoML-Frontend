import Image from "next/image";

// Renders the actual NekoCortex artwork (public/logo-nekocortex.png) —
// the original uploaded design, recolored to the site's exact
// cyan-to-magenta gradient with a transparent background, replacing
// the earlier hand-drawn SVG approximation.

interface LogoMarkProps {
  size?: number;
  className?: string;
  glow?: boolean;
}

export default function LogoMark({ size = 36, className = "", glow = true }: LogoMarkProps) {
  return (
    <Image
      src="/logo-original-artwork.jpg.png"
      alt="NekoCortex"
      width={size}
      height={size}
      priority
      className={`${glow ? "drop-shadow-[0_0_10px_rgba(232,121,249,0.55)]" : ""} ${className}`}
    />
  );
}
