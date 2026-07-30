import type { Metadata } from "next";
import AmbientBackground from "@/components/AmbientBackground";
import "./globals.css";

export const metadata: Metadata = {
  title: "Autonomous Deep Learning Framework",
  description: "Upload a dataset. Everything else — architecture search, tuning, training, compression — runs on its own.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-ink text-white">
        <AmbientBackground />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
