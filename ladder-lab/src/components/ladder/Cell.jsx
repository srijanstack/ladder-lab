import { LIVE, WIRE, INK, col, LABEL_H, RAIL_Y } from '../../ui/theme.js';
import { splitRef } from '../../engine/index.js';

const MONO = 'IBM Plex Mono, monospace';

/** One instruction: XIC, XIO, OTE, OTL, OTU or TON. */
export default function Cell({ it, ctx, rungId }) {
  const s = ctx.rs[it.id] || { in: false, out: false, truth: false };
  const selected = ctx.sel && ctx.sel.id === it.id;
  const tag = ctx.sim.tags[splitRef(it.tag)[0]];
  const run = ctx.sim.mode === 'RUN';
  const sym = run && s.truth ? LIVE : INK;
  const label = it.tag || '???';

  let body;
  if (it.type === 'XIC' || it.type === 'XIO') {
    body = (
      <svg width="96" height="40" viewBox="0 0 96 40" aria-hidden="true">
        <line x1="0" y1={RAIL_Y} x2="40" y2={RAIL_Y} stroke={col(s.in)} strokeWidth="2.5" />
        <line x1="56" y1={RAIL_Y} x2="96" y2={RAIL_Y} stroke={col(s.out)} strokeWidth="2.5" />
        <line x1="40" y1="9" x2="40" y2="39" stroke={sym} strokeWidth="3" />
        <line x1="56" y1="9" x2="56" y2="39" stroke={sym} strokeWidth="3" />
        {it.type === 'XIO' && <line x1="34" y1="38" x2="62" y2="10" stroke={sym} strokeWidth="2.5" />}
      </svg>
    );
  } else if (it.type === 'TON') {
    const v = tag && tag.dataType === 'TIMER' ? tag.value : { PRE: 0, ACC: 0, DN: false, EN: false, TT: false };
    body = (
      <svg width="120" height="92" viewBox="0 0 120 92" aria-hidden="true">
        <line x1="0" y1={RAIL_Y} x2="18" y2={RAIL_Y} stroke={col(s.in)} strokeWidth="2.5" />
        <line x1="102" y1={RAIL_Y} x2="120" y2={RAIL_Y} stroke={col(v.DN && s.out)} strokeWidth="2.5" />
        <rect x="18" y="4" width="84" height="84" fill="var(--field)" stroke={INK} strokeWidth="1.5" />
        <text x="60" y="19" textAnchor="middle" fontSize="11" fontWeight="600" fill={INK} fontFamily={MONO}>TON</text>
        <line x1="18" y1="26" x2="102" y2="26" stroke="var(--line)" />
        <g fontFamily={MONO} fontSize="10" fill={INK}>
          <text x="24" y="42">PRE</text>
          <text x="96" y="42" textAnchor="end">{v.PRE}</text>
          <text x="24" y="57">ACC</text>
          <text x="96" y="57" textAnchor="end">{Math.round(v.ACC)}</text>
          <text x="24" y="72">EN</text>
          <circle cx="90" cy="69" r="4" fill={v.EN ? LIVE : 'none'} stroke={v.EN ? LIVE : WIRE} />
          <text x="24" y="85">DN</text>
          <circle cx="90" cy="82" r="4" fill={v.DN ? LIVE : 'none'} stroke={v.DN ? LIVE : WIRE} />
        </g>
      </svg>
    );
  } else {
    const on = run && s.out;
    body = (
      <svg width="96" height="40" viewBox="0 0 96 40" aria-hidden="true">
        <line x1="0" y1={RAIL_Y} x2="36" y2={RAIL_Y} stroke={col(s.in)} strokeWidth="2.5" />
        <line x1="60" y1={RAIL_Y} x2="96" y2={RAIL_Y} stroke={col(s.out)} strokeWidth="2.5" />
        <path d="M42 9 Q31 24 42 39" fill="none" stroke={on ? LIVE : INK} strokeWidth="3" />
        <path d="M54 9 Q65 24 54 39" fill="none" stroke={on ? LIVE : INK} strokeWidth="3" />
        {it.type !== 'OTE' && (
          <text x="48" y="29" textAnchor="middle" fontSize="12" fontWeight="600" fill={on ? LIVE : INK} fontFamily={MONO}>
            {it.type === 'OTL' ? 'L' : 'U'}
          </text>
        )}
      </svg>
    );
  }

  return (
    <button
      type="button"
      onClick={() => ctx.selectEl(rungId, it.id)}
      className={'block text-left p-0 border-0 bg-transparent ' + (it.type === 'TON' ? 'w-[120px]' : 'w-[96px]')}
      style={{
        outline: selected ? '2px solid var(--accent)' : 'none',
        outlineOffset: '-1px',
        background: selected ? 'color-mix(in srgb, var(--accent) 14%, transparent)' : 'transparent'
      }}
      aria-label={it.type + ' ' + label}
      title={it.type + ' ' + label}
    >
      <div
        className={'font-mono text-[11px] text-center truncate px-1 ' + (it.tag ? 'text-ink' : 'text-bad')}
        style={{ height: LABEL_H + 'px', lineHeight: LABEL_H + 'px' }}
      >
        {label}
      </div>
      {body}
    </button>
  );
}
