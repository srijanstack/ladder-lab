export const OUTPUT_TYPES = ['OTE', 'OTL', 'OTU', 'TON'];

/** 'Lamp_Delay.DN' -> ['Lamp_Delay', 'DN'];  'Motor_Run' -> ['Motor_Run', null] */
export const splitRef = (ref) => {
  const i = (ref || '').indexOf('.');
  return i < 0 ? [ref || '', null] : [ref.slice(0, i), ref.slice(i + 1)];
};

export function readBool(tags, ref) {
  const [name, member] = splitRef(ref);
  const t = tags[name];
  if (!t) return false;
  return member ? !!(t.value && t.value[member]) : t.value === true;
}

export function writeBool(tags, ref, v) {
  const t = tags[splitRef(ref)[0]];
  if (t && t.dataType === 'BOOL') t.value = v;
}

/** Evaluate a series of instructions. Branch lanes are ORed. Records power in/out per element id in rs. */
export function evalList(tags, items, powerIn, rs) {
  let p = powerIn;
  for (const it of items) {
    if (it.type === 'branch') {
      let any = false;
      for (const lane of it.lanes) {
        const o = evalList(tags, lane.items, p, rs);
        rs[lane.id] = { in: p, out: o };
        if (o) any = true;
      }
      rs[it.id] = { in: p, out: any };
      p = any;
    } else {
      const v = readBool(tags, it.tag);
      const truth = it.type === 'XIC' ? v : !v;
      const out = p && truth;
      rs[it.id] = { in: p, out, truth };
      p = out;
    }
  }
  return p;
}

/** Run every rung once, top to bottom. dt is the scan time in ms (used by timers). */
export function runProgram(sim, dt) {
  const rs = {};
  for (const rung of sim.program.rungs) {
    const c = evalList(sim.tags, rung.conditions, true, rs);
    rs[rung.id] = { in: true, out: c };
    for (const o of rung.outputs) {
      rs[o.id] = { in: c, out: c };
      if (o.type === 'OTE') writeBool(sim.tags, o.tag, c);
      else if (o.type === 'OTL') {
        if (c) writeBool(sim.tags, o.tag, true);
      } else if (o.type === 'OTU') {
        if (c) writeBool(sim.tags, o.tag, false);
      } else if (o.type === 'TON') {
        const t = sim.tags[splitRef(o.tag)[0]];
        if (t && t.dataType === 'TIMER') {
          const v = t.value;
          if (c) {
            v.EN = true;
            if (!v.DN) v.ACC = Math.min(v.PRE, v.ACC + dt);
            v.DN = v.ACC >= v.PRE;
            v.TT = !v.DN;
          } else {
            v.EN = false;
            v.TT = false;
            v.DN = false;
            v.ACC = 0;
          }
        }
      }
    }
  }
  sim.rs = rs;
}
