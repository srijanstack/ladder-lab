import { LIVE, WIRE, INK, col, reduceMotion } from '../ui/theme.js';
import { REG, portAbs, portOffset } from '../engine/index.js';

const MONO = 'IBM Plex Mono, monospace';
const Dot = ({ x, y }) => <circle cx={x} cy={y} r="3.5" fill={INK} />;

function Pushbutton({ c, press }) {
  const normallyOpen = c.props.contact === 'NO';
  const momentary = c.props.mode === 'momentary';
  const r = c.state.pressed ? 10.5 : 13;
  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={c.label + ' pushbutton'}
      style={{ cursor: 'pointer', touchAction: 'none' }}
      onPointerDown={(e) => {
        e.preventDefault();
        press(c, true);
      }}
      onPointerUp={() => momentary && press(c, false)}
      onPointerLeave={() => momentary && c.state.pressed && press(c, false)}
      onPointerCancel={() => momentary && press(c, false)}
      onKeyDown={(e) => {
        if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
          e.preventDefault();
          press(c, true);
        }
      }}
      onKeyUp={(e) => {
        if (e.key === ' ' || e.key === 'Enter') press(c, false);
      }}
    >
      <line x1="0" y1="28" x2="22" y2="28" stroke={col(c.state.closed)} strokeWidth="3" />
      <line x1="70" y1="28" x2="92" y2="28" stroke={col(c.state.closed)} strokeWidth="3" />
      <rect x="22" y="6" width="48" height="44" rx="4" fill="var(--field)" stroke={INK} strokeWidth="1.5" />
      <circle
        cx="46"
        cy="28"
        r={r}
        fill={normallyOpen ? 'var(--live)' : 'var(--bad)'}
        stroke={INK}
        strokeWidth="1.5"
        opacity={c.state.pressed ? 0.75 : 1}
      />
      <text x="46" y="68" textAnchor="middle" fontSize="10" fill="var(--mute)" fontFamily={MONO}>
        {c.props.contact} {c.state.closed ? 'CLOSED' : 'OPEN'}
      </text>
      <Dot x={0} y={28} />
      <Dot x={92} y={28} />
    </g>
  );
}

function Motor({ c }) {
  const on = c.state.running;
  return (
    <g>
      <line x1="0" y1="32" x2="19" y2="32" stroke={col(c.state.powered)} strokeWidth="3" />
      <line x1="71" y1="32" x2="90" y2="32" stroke={col(c.state.powered)} strokeWidth="3" />
      <circle cx="45" cy="32" r="26" fill="var(--field)" stroke={INK} strokeWidth="1.5" />
      <g stroke={on ? LIVE : WIRE} strokeWidth="3" strokeLinecap="round">
        <line x1="29" y1="32" x2="61" y2="32" />
        <line x1="33.5" y1="20" x2="56.5" y2="44" />
        <line x1="33.5" y1="44" x2="56.5" y2="20" />
        <circle cx="58" cy="32" r="3" fill={on ? LIVE : WIRE} />
        {on && !reduceMotion() && (
          <animateTransform attributeName="transform" type="rotate" from="0 45 32" to="360 45 32" dur="0.7s" repeatCount="indefinite" />
        )}
      </g>
      <text x="45" y="76" textAnchor="middle" fontSize="10" fill="var(--mute)" fontFamily={MONO}>
        {on ? 'RUNNING' : 'STOPPED'}
      </text>
      <Dot x={0} y={32} />
      <Dot x={90} y={32} />
    </g>
  );
}

function Lamp({ c }) {
  const lit = c.state.lit;
  return (
    <g>
      <line x1="0" y1="32" x2="25" y2="32" stroke={col(c.state.powered)} strokeWidth="3" />
      <line x1="65" y1="32" x2="90" y2="32" stroke={col(c.state.powered)} strokeWidth="3" />
      {lit && <circle cx="45" cy="32" r="30" fill={LIVE} opacity="0.25" />}
      <circle cx="45" cy="32" r="20" fill={lit ? LIVE : 'var(--field)'} stroke={INK} strokeWidth="1.5" />
      <path d="M31 18 L59 46 M59 18 L31 46" stroke={lit ? 'var(--field)' : WIRE} strokeWidth="2" />
      <text x="45" y="76" textAnchor="middle" fontSize="10" fill="var(--mute)" fontFamily={MONO}>
        {lit ? 'ON' : 'OFF'}
      </text>
      <Dot x={0} y={32} />
      <Dot x={90} y={32} />
    </g>
  );
}

function Plc({ c, sim }) {
  const run = sim.mode === 'RUN';
  return (
    <g>
      <rect width="160" height="140" rx="3" fill="var(--panel)" stroke={INK} strokeWidth="1.5" />
      <rect width="160" height="22" rx="3" fill={INK} />
      <text x="8" y="15" fontSize="11" fontWeight="600" fill="var(--bg)" fontFamily={MONO}>{c.label}</text>
      <circle cx="140" cy="11" r="4.5" fill={run ? LIVE : 'var(--warn)'} />
      {c.ports.map((p) => {
        const [ox, oy] = portOffset(c, p);
        const on = sim.tags[p.tag] && sim.tags[p.tag].value === true;
        const left = p.side === 'l';
        return (
          <g key={p.id}>
            <Dot x={ox} y={oy} />
            <text x={left ? 10 : 150} y={oy - 8} textAnchor={left ? 'start' : 'end'} fontSize="8" fill="var(--mute)" fontFamily={MONO}>{p.name}</text>
            <circle cx={left ? 14 : 146} cy={oy + 1} r="3.5" fill={on ? LIVE : 'none'} stroke={on ? LIVE : WIRE} />
            <text x={left ? 22 : 138} y={oy + 4} textAnchor={left ? 'start' : 'end'} fontSize="10" fill={INK} fontFamily={MONO}>{p.tag}</text>
          </g>
        );
      })}
      <text x="80" y="132" textAnchor="middle" fontSize="9" fill="var(--mute)" fontFamily={MONO}>
        {run ? 'RUN MODE' : 'PROGRAM MODE'}
      </text>
    </g>
  );
}

function Terminal({ label, x, y, w, color }) {
  return (
    <g>
      <rect width={w} height="44" rx="3" fill="var(--field)" stroke={INK} strokeWidth="1.5" />
      <text x={w / 2} y="27" textAnchor="middle" fontSize="13" fontWeight="600" fill={color} fontFamily={MONO}>{label}</text>
      <Dot x={x} y={y} />
    </g>
  );
}

const BODIES = {
  source24: ({ c }) => <Terminal label="+24V" x={64} y={22} w={64} color={LIVE} />,
  common0v: ({ c }) => <Terminal label="0V" x={0} y={22} w={56} color={INK} />,
  pushbutton: Pushbutton,
  motor: Motor,
  lamp: Lamp,
  plc: Plc
};

/** The field wiring SVG. Wires are drawn first so terminals sit on top. */
export default function Diagram({ sim, force }) {
  const byId = new Map(sim.doc.components.map((c) => [c.id, c]));
  const endOf = (ref) => {
    const c = byId.get(ref.componentId);
    return portAbs(c, c.ports.find((p) => p.id === ref.portId));
  };
  const wirePath = (w) => {
    const [x1, y1] = endOf(w.from);
    const [x2, y2] = endOf(w.to);
    const xm = Math.round((x1 + x2) / 2);
    return `M${x1} ${y1} H${xm} V${y2} H${x2}`;
  };
  const press = (c, down) => {
    if (c.props.mode === 'momentary') c.state.pressed = down;
    else if (down) c.state.pressed = !c.state.pressed;
    force();
  };

  return (
    <svg
      viewBox="0 0 720 250"
      className="w-full h-auto block"
      role="img"
      aria-label="Field wiring diagram"
      style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}
    >
      {sim.doc.wires.map((w) => (
        <path
          key={w.id}
          d={wirePath(w)}
          fill="none"
          stroke={col(w.state.energized)}
          strokeWidth="3"
          strokeLinejoin="round"
          className={w.state.energized ? 'flow' : ''}
        />
      ))}
      {sim.doc.components.map((c) => {
        const Body = BODIES[c.type];
        return (
          <g key={c.id} transform={`translate(${c.position.x} ${c.position.y})`}>
            <text x={REG[c.type].size[0] / 2} y="-8" textAnchor="middle" fontSize="11" fontWeight="500" fill={INK}>
              {c.label}
            </text>
            <Body c={c} sim={sim} press={press} />
          </g>
        );
      })}
    </svg>
  );
}
