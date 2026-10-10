import Led from './Led.jsx';

/** Title, controller mode switch and scan time. */
export default function TopBar({ sim, force }) {
  const run = sim.mode === 'RUN';
  const setMode = (m) => {
    sim.mode = m;
    force();
  };
  return (
    <header
      className="flex flex-wrap items-center gap-x-5 gap-y-1.5 px-3 py-1.5"
      style={{ background: 'var(--ink)', color: 'var(--bg)' }}
    >
      <div className="flex items-baseline gap-2">
        <span className="font-semibold tracking-tight text-[15px]">Ladder Lab</span>
        <span className="font-mono text-[11px] opacity-70">Controller Simulated_PLC</span>
      </div>
      <div className="flex items-center gap-3 ml-auto">
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <Led on={run} color="#3fd07f" /> RUN <Led on={!run} color="#e0b24f" /> PROG
        </div>
        <div className="flex" role="group" aria-label="Controller mode">
          <button type="button" className="btn" style={{ borderRadius: '2px 0 0 2px' }} aria-pressed={run} onClick={() => setMode('RUN')}>
            Run
          </button>
          <button type="button" className="btn" style={{ borderRadius: '0 2px 2px 0', marginLeft: '-1px' }} aria-pressed={!run} onClick={() => setMode('PROG')}>
            Program
          </button>
        </div>
        <span className="font-mono text-[11px] tabnum opacity-70">Scan {sim.scanMs.toFixed(0)} ms</span>
      </div>
    </header>
  );
}
