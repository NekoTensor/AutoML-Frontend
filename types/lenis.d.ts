declare module "lenis" {
     export interface LenisOptions {
       duration?: number;
       easing?: (t: number) => number;
       smoothWheel?: boolean;
       wheelMultiplier?: number;
       touchMultiplier?: number;
       infinite?: boolean;
     }

     export default class Lenis {
       constructor(options?: LenisOptions);
       raf(time: number): void;
       on(event: "scroll", callback: () => void): void;
       destroy(): void;
     }
   }
