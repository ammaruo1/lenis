/// <reference types="vite/client" />

declare module 'lenis' {
  export default class Lenis {
    constructor(options?: Record<string, unknown>);
    raf(time: number): void;
    on(event: string, callback: () => void): void;
    destroy(): void;
    start(): void;
    stop(): void;
    scrollTo(target: string | number | HTMLElement, options?: Record<string, unknown>): void;
  }
}
