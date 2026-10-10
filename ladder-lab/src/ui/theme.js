/* Shared drawing constants. Colours are CSS variables so both themes work. */
export const LIVE = 'var(--live)';
export const WIRE = 'var(--wire)';
export const INK = 'var(--ink)';
export const col = (on) => (on ? LIVE : WIRE);

export const LABEL_H = 18; // tag label row above every ladder instruction
export const RAIL_Y = 24; // rail height inside an instruction's symbol box

export const reduceMotion = () =>
  typeof window !== 'undefined' &&
  !!window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
