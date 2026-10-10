import { REG } from './registry.js';

/**
 * Circuit solver. Works out which ports are fed from +24V, which return to 0V,
 * which loads are powered and which wires are carrying current.
 *
 * Returns { energized: Set<wireId>, powered: Map<componentId, bool>, inputs: [[port, bool]] }
 */
export function solve(sim) {
  const { doc, tags } = sim;

  // Port graph. Wires always connect their two ends; a closed contact connects its in and out ports.
  const adj = new Map();
  const link = (a, b, wireId) => {
    if (!adj.has(a)) adj.set(a, []);
    if (!adj.has(b)) adj.set(b, []);
    adj.get(a).push({ to: b, wireId });
    adj.get(b).push({ to: a, wireId });
  };
  doc.wires.forEach((w) => link(w.from.portId, w.to.portId, w.id));

  const seedsA = []; // ports that source +24V
  const seedsB = []; // ports tied to 0V
  const loads = [];
  const plcIn = [];
  for (const c of doc.components) {
    const r = REG[c.type];
    if (r.kind === 'contact' && r.conducts(c)) link(c.ports[0].id, c.ports[1].id, null);
    if (r.kind === 'source') seedsA.push(c.ports[0].id);
    if (r.kind === 'common') seedsB.push(c.ports[0].id);
    if (r.kind === 'load') loads.push(c);
    if (r.kind === 'plc') {
      for (const p of c.ports) {
        if (p.direction === 'out' && sim.mode === 'RUN' && tags[p.tag] && tags[p.tag].value === true) seedsA.push(p.id);
        if (p.direction === 'in') plcIn.push(p);
      }
    }
  }

  // Breadth-first search that remembers how each port was reached, so wires on a live path can be traced back.
  const bfs = (seeds) => {
    const pred = new Map();
    const queue = [];
    seeds.forEach((s) => {
      pred.set(s, null);
      queue.push(s);
    });
    while (queue.length) {
      const cur = queue.shift();
      for (const e of adj.get(cur) || []) {
        if (!pred.has(e.to)) {
          pred.set(e.to, { from: cur, wireId: e.wireId });
          queue.push(e.to);
        }
      }
    }
    return pred;
  };
  const A = bfs(seedsA);
  const B = bfs(seedsB);

  const energized = new Set();
  const trace = (pred, port) => {
    let cur = port;
    while (pred.get(cur)) {
      const step = pred.get(cur);
      if (step.wireId) energized.add(step.wireId);
      cur = step.from;
    }
  };

  // A load is powered when its input is fed from +24V and its output reaches 0V.
  const powered = new Map();
  for (const c of loads) {
    const pin = c.ports.find((p) => p.name === 'in');
    const pout = c.ports.find((p) => p.name === 'out');
    const on = A.has(pin.id) && B.has(pout.id);
    powered.set(c.id, on);
    if (on) {
      trace(A, pin.id);
      trace(B, pout.id);
    }
  }

  // A PLC input reads true when its terminal is fed from +24V (the return path is internal).
  const inputs = [];
  for (const p of plcIn) {
    const on = A.has(p.id);
    inputs.push([p, on]);
    if (on) trace(A, p.id);
  }

  return { energized, powered, inputs };
}
