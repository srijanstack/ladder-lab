import { WIRE, LABEL_H, RAIL_Y } from '../../ui/theme.js';
import { OUTPUT_TYPES } from '../../engine/index.js';

/** A "+" drop target shown while an instruction is armed. Only appears where that instruction is valid. */
export default function Slot({ ctx, rungId, listKey, index }) {
  if (!ctx.armed) return null;
  const wantsOutput = OUTPUT_TYPES.includes(ctx.armed);
  if ((listKey === 'outputs') !== wantsOutput) return null;

  const h = LABEL_H + 40;
  const y = LABEL_H + RAIL_Y;
  return (
    <button
      type="button"
      onClick={() => ctx.place({ rungId, listKey, index })}
      className="armed-slot relative block w-7 p-0 border-0 bg-transparent"
      style={{ height: h + 'px' }}
      aria-label={'Place ' + ctx.armed + ' here'}
    >
      <svg width="28" height={h} viewBox={'0 0 28 ' + h} aria-hidden="true">
        <line x1="0" y1={y} x2="28" y2={y} stroke={WIRE} strokeWidth="2.5" />
        <circle cx="14" cy={y} r="9" fill="var(--accent)" />
        <path d={'M10 ' + y + ' H18 M14 ' + (y - 4) + ' V' + (y + 4)} stroke="var(--accentink)" strokeWidth="2" />
      </svg>
    </button>
  );
}
