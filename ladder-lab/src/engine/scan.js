import { REG } from './registry.js';
import { solve } from './solver.js';
import { runProgram, writeBool } from './ladder.js';

/**
 * One controller scan:
 *   1. update device state (pushbutton contacts)
 *   2. solve the circuit and write PLC input tags
 *   3. run the ladder (Run mode) or force outputs off (Program mode)
 *   4. solve again with the new outputs, then update loads and wires
 */
export function scan(sim, dt) {
  for (const c of sim.doc.components) {
    const r = REG[c.type];
    if (r.update) r.update(c);
  }

  let sol = solve(sim);
  for (const [port, on] of sol.inputs) writeBool(sim.tags, port.tag, on);

  if (sim.mode === 'RUN') {
    runProgram(sim, dt);
  } else {
    for (const c of sim.doc.components) {
      if (c.type !== 'plc') continue;
      for (const p of c.ports) if (p.direction === 'out') writeBool(sim.tags, p.tag, false);
    }
    sim.rs = {};
  }

  sol = solve(sim);
  for (const c of sim.doc.components) {
    const r = REG[c.type];
    if (r.apply) r.apply(c, !!sol.powered.get(c.id));
  }
  for (const w of sim.doc.wires) w.state.energized = sol.energized.has(w.id);
}
