import { findById, ensureTag, splitRef, uid } from '../engine/index.js';

/** Edit the selected instruction, branch or rung. */
export default function Properties({ sim, sel, force }) {
  const rung = sel && sim.program.rungs.find((r) => r.id === sel.rungId || r.id === sel.id);
  const item = sel && sel.kind === 'el' && rung ? findById([...rung.conditions, ...rung.outputs], sel.id) : null;

  let inner;
  if (!sel || !rung) {
    inner = (
      <span className="text-mute">
        Pick an instruction to arm it, then click a + on a rung. Click any instruction to edit its tag.
      </span>
    );
  } else if (sel.kind === 'rung') {
    inner = (
      <>
        <span className="font-medium">Rung {sim.program.rungs.indexOf(rung)}</span>
        <span className="text-mute">Use Delete to remove it. New rung adds one below.</span>
      </>
    );
  } else if (item && item.type === 'branch') {
    inner = (
      <>
        <span className="font-medium">Branch</span>
        <span className="text-mute">{item.lanes.length} parallel lanes</span>
        <button
          type="button"
          className="btn"
          onClick={() => {
            item.lanes.push({ id: uid(), items: [] });
            force();
          }}
        >
          Add lane
        </button>
      </>
    );
  } else if (item) {
    const commit = (value) => {
      const v = value.trim().replace(/[^A-Za-z0-9_.]/g, '_');
      item.tag = v;
      ensureTag(sim, v, item.type === 'TON' ? 'TIMER' : 'BOOL');
      force();
    };
    const tag = sim.tags[splitRef(item.tag)[0]];
    const options = Object.values(sim.tags).flatMap((x) =>
      x.dataType === 'TIMER' ? [x.name, x.name + '.DN', x.name + '.TT', x.name + '.EN'] : [x.name]
    );
    inner = (
      <>
        <span className="font-medium font-mono">{item.type}</span>
        <label htmlFor="prop-tag" className="text-mute">Tag</label>
        <input
          id="prop-tag"
          key={item.id + ':' + item.tag}
          list="tag-options"
          defaultValue={item.tag}
          placeholder="Tag_Name"
          className="bg-field border border-line px-1.5 py-0.5 font-mono w-44"
          onBlur={(e) => commit(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
        />
        <datalist id="tag-options">
          {options.map((n) => (
            <option key={n} value={n} />
          ))}
        </datalist>
        {item.type === 'TON' && tag && tag.dataType === 'TIMER' && (
          <>
            <label htmlFor="prop-pre" className="text-mute">Preset (ms)</label>
            <input
              id="prop-pre"
              type="number"
              min="0"
              step="500"
              value={tag.value.PRE}
              onChange={(e) => {
                tag.value.PRE = Math.max(0, +e.target.value || 0);
                force();
              }}
              className="bg-field border border-line px-1.5 py-0.5 font-mono w-24"
            />
          </>
        )}
      </>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-1.5 border-b border-line bg-panel min-h-[34px]">
      {inner}
    </div>
  );
}
