import { useReducer, useState } from 'react';
import { createSim, findList, removeById, ensureTag, uid } from './engine/index.js';
import { useScanLoop } from './hooks/useScanLoop.js';
import TopBar from './components/TopBar.jsx';
import Organizer from './components/Organizer.jsx';
import Toolbar from './components/Toolbar.jsx';
import Properties from './components/Properties.jsx';
import LadderView from './components/ladder/LadderView.jsx';
import TagTable from './components/TagTable.jsx';
import JsonView from './components/JsonView.jsx';
import Diagram from './components/Diagram.jsx';

export default function App() {
  const [sim] = useState(createSim);
  const [, force] = useReducer((x) => x + 1, 0);
  const [armed, setArmed] = useState(null); // instruction waiting to be placed
  const [sel, setSel] = useState(null); // { kind: 'rung' | 'el', id, rungId? }
  const [tab, setTab] = useState('tags');

  useScanLoop(sim, force);

  const rungs = sim.program.rungs;

  // Everything the ladder components need, passed down as one object.
  const ctx = {
    sim,
    rs: sim.rs,
    armed,
    sel,
    selectEl: (rungId, id) => {
      setArmed(null);
      setSel({ kind: 'el', rungId, id });
    },
    selectRung: (id) => {
      setArmed(null);
      setSel({ kind: 'rung', id });
    },
    setComment: (id, v) => {
      const r = rungs.find((x) => x.id === id);
      if (r) r.comment = v;
    },
    place: ({ rungId, listKey, index }) => {
      const rung = rungs.find((r) => r.id === rungId);
      const list = rung && findList(rung, listKey);
      if (!list) return;
      let item;
      if (armed === 'BRANCH') {
        item = { id: uid(), type: 'branch', lanes: [{ id: uid(), items: [] }, { id: uid(), items: [] }] };
      } else if (armed === 'TON') {
        let k = 1;
        while (sim.tags['Timer_' + k]) k++;
        ensureTag(sim, 'Timer_' + k, 'TIMER');
        item = { id: uid(), type: 'TON', tag: 'Timer_' + k };
      } else {
        item = { id: uid(), type: armed, tag: '' };
      }
      list.splice(index, 0, item);
      setArmed(null);
      setSel({ kind: 'el', rungId, id: item.id });
      force();
    }
  };

  const addRung = () => {
    const at = sel ? rungs.findIndex((r) => r.id === (sel.rungId || sel.id)) : rungs.length - 1;
    const rung = { id: uid(), comment: '', conditions: [], outputs: [] };
    rungs.splice(at + 1, 0, rung);
    setSel({ kind: 'rung', id: rung.id });
    force();
  };

  const deleteSelected = () => {
    if (!sel) return;
    if (sel.kind === 'rung') {
      if (rungs.length > 1) rungs.splice(rungs.findIndex((r) => r.id === sel.id), 1);
    } else {
      const rung = rungs.find((x) => x.id === sel.rungId);
      if (rung) removeById(rung.conditions, sel.id) || removeById(rung.outputs, sel.id);
    }
    setSel(null);
    force();
  };

  const tabButton = (id, label) => (
    <button
      type="button"
      role="tab"
      aria-selected={tab === id}
      onClick={() => setTab(id)}
      className={'px-3 py-1 border-0 border-r border-line ' + (tab === id ? 'bg-panel text-ink font-medium' : 'bg-chrome text-mute')}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-full lg:h-full flex flex-col">
      <TopBar sim={sim} force={force} />
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
        <Organizer sim={sim} />
        <main className="flex-1 min-w-0 min-h-0 flex flex-col">
          <Toolbar armed={armed} setArmed={setArmed} sel={sel} addRung={addRung} delSel={deleteSelected} />
          <Properties sim={sim} sel={sel} force={force} />
          <LadderView rungs={rungs} ctx={ctx} />
          <div className="shrink-0 h-[250px] flex flex-col border-t-2 border-line bg-panel">
            <div className="flex bg-chrome border-b border-line" role="tablist">
              {tabButton('tags', 'Controller Tags')}
              {tabButton('json', 'Circuit JSON')}
            </div>
            <div className="flex-1 min-h-0">
              {tab === 'tags' ? <TagTable sim={sim} force={force} /> : <JsonView sim={sim} />}
            </div>
          </div>
        </main>
        <aside
          className="lg:w-[340px] xl:w-[460px] shrink-0 bg-panel border-t lg:border-t-0 lg:border-l border-line flex flex-col"
          aria-label="Field wiring"
        >
          <div className="px-3 py-1.5 bg-chrome text-[11px] uppercase tracking-wider text-mute">Field wiring</div>
          <div className="px-3 pt-3">
            <Diagram sim={sim} force={force} />
          </div>
          <p className="px-3 pb-3 text-mute leading-snug">
            Hold <span className="font-medium text-ink">S1 Start</span> to start the motor. It seals in through its own
            contact. <span className="font-medium text-ink">S2 Stop</span> is normally closed, so pressing it breaks the
            input. Green wires are carrying current.
          </p>
        </aside>
      </div>
    </div>
  );
}
