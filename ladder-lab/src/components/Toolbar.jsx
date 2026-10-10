const TOOLS = [
  ['XIC', 'Examine if closed'],
  ['XIO', 'Examine if open'],
  ['BRANCH', 'Parallel branch'],
  ['OTE', 'Output energize'],
  ['OTL', 'Output latch'],
  ['OTU', 'Output unlatch'],
  ['TON', 'Timer on delay']
];

/** Instruction palette plus rung actions. Arm an instruction, then click a + on the ladder. */
export default function Toolbar({ armed, setArmed, sel, addRung, delSel }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 px-3 py-1.5 bg-chrome border-b border-line" role="toolbar" aria-label="Instruction palette">
      <span className="text-[11px] uppercase tracking-wider text-mute mr-1">Instructions</span>
      {TOOLS.map(([t, tip]) => (
        <button
          key={t}
          type="button"
          className="btn font-mono text-[12px]"
          title={tip}
          aria-pressed={armed === t}
          onClick={() => setArmed(armed === t ? null : t)}
        >
          {t === 'BRANCH' ? 'Branch' : t}
        </button>
      ))}
      <span className="mx-1 h-5 w-px bg-line" />
      <button type="button" className="btn" onClick={addRung}>New rung</button>
      <button type="button" className="btn" disabled={!sel} style={{ opacity: sel ? 1 : 0.45 }} onClick={delSel}>
        Delete
      </button>
      {armed && (
        <span className="text-accent text-[12px] ml-1">
          Click a + on the ladder to place {armed === 'BRANCH' ? 'a branch' : armed}. Press the button again to cancel.
        </span>
      )}
    </div>
  );
}
