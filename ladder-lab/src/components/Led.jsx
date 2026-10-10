import { LIVE, WIRE } from '../ui/theme.js';

/** Small round status light. */
export default function Led({ on, color }) {
  const c = color || LIVE;
  return (
    <span
      className="inline-block w-2.5 h-2.5 rounded-full align-middle"
      style={{ background: on ? c : 'transparent', border: '1.5px solid ' + (on ? c : WIRE) }}
    />
  );
}
