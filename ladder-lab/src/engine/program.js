import { splitRef } from './ladder.js';

/* Helpers for editing the ladder program. They mutate in place; the caller re-renders. */

/** key is 'conditions', 'outputs' or 'lane:<laneId>' */
export function findList(rung, key) {
  if (key === 'conditions') return rung.conditions;
  if (key === 'outputs') return rung.outputs;
  const id = key.slice(5);
  let found = null;
  const walk = (items) =>
    items.forEach((it) => {
      if (it.type !== 'branch') return;
      it.lanes.forEach((lane) => {
        if (lane.id === id) found = lane.items;
        walk(lane.items);
      });
    });
  walk(rung.conditions);
  return found;
}

export function removeById(items, id) {
  const i = items.findIndex((x) => x.id === id);
  if (i >= 0) {
    items.splice(i, 1);
    return true;
  }
  for (const it of items) {
    if (it.type === 'branch') for (const lane of it.lanes) if (removeById(lane.items, id)) return true;
  }
  return false;
}

export function findById(items, id) {
  for (const it of items) {
    if (it.id === id) return it;
    if (it.type === 'branch') {
      for (const lane of it.lanes) {
        const f = findById(lane.items, id);
        if (f) return f;
      }
    }
  }
  return null;
}

/** Create the tag behind a reference if it does not exist yet. */
export function ensureTag(sim, ref, type) {
  const name = splitRef(ref)[0];
  if (!name || sim.tags[name]) return;
  sim.tags[name] = {
    name,
    dataType: type,
    description: '',
    io: '',
    value: type === 'TIMER' ? { PRE: 3000, ACC: 0, EN: false, TT: false, DN: false } : false
  };
}
