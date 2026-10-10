import { useEffect } from 'react';
import { scan } from '../engine/index.js';

const SCAN_MS = 20; // controller scan period
const RENDER_EVERY = 3; // re-render the UI every 3rd scan (about 16 fps)

/** Runs the controller scan on a timer and asks React to re-render now and then. */
export function useScanLoop(sim, requestRender) {
  useEffect(() => {
    let last = performance.now();
    let n = 0;
    const id = setInterval(() => {
      const now = performance.now();
      const dt = Math.min(now - last, 100); // cap so a background tab does not jump the timers
      last = now;
      scan(sim, dt);
      sim.scanMs = sim.scanMs * 0.92 + dt * 0.08;
      if (++n % RENDER_EVERY === 0) requestRender();
    }, SCAN_MS);
    return () => clearInterval(id);
  }, [sim, requestRender]);
}
