import test from 'node:test';
import assert from 'node:assert/strict';
import { createSim, scan, findById, removeById, ensureTag, readBool } from '../src/engine/index.js';

const part = (sim, label) => sim.doc.components.find((c) => c.label === label);
const run = (sim, ms) => {
  for (let t = 0; t < ms; t += 20) scan(sim, 20);
};
const snapshot = (sim) => ({
  motor: part(sim, 'M1').state.running,
  lamp: part(sim, 'H1').state.lit,
  start: sim.tags.Start_PB.value,
  stop: sim.tags.Stop_PB.value
});

test('idle: nothing runs and the NC stop input reads healthy', () => {
  const sim = createSim();
  run(sim, 100);
  assert.deepEqual(snapshot(sim), { motor: false, lamp: false, start: false, stop: true });
});

test('start button starts the motor and the rung seals in after release', () => {
  const sim = createSim();
  part(sim, 'S1 Start').state.pressed = true;
  run(sim, 100);
  assert.equal(part(sim, 'M1').state.running, true);
  part(sim, 'S1 Start').state.pressed = false;
  run(sim, 100);
  assert.equal(snapshot(sim).start, false);
  assert.equal(part(sim, 'M1').state.running, true);
});

test('run lamp comes on after the 3 s timer', () => {
  const sim = createSim();
  part(sim, 'S1 Start').state.pressed = true;
  run(sim, 100);
  part(sim, 'S1 Start').state.pressed = false;
  run(sim, 2500);
  assert.equal(part(sim, 'H1').state.lit, false);
  run(sim, 800);
  assert.equal(part(sim, 'H1').state.lit, true);
  assert.equal(sim.tags.Lamp_Delay.value.DN, true);
});

test('stop button drops the motor, resets the timer and clears the lamp', () => {
  const sim = createSim();
  part(sim, 'S1 Start').state.pressed = true;
  run(sim, 100);
  part(sim, 'S1 Start').state.pressed = false;
  run(sim, 3300);
  part(sim, 'S2 Stop').state.pressed = true;
  run(sim, 100);
  assert.equal(snapshot(sim).motor, false);
  assert.equal(snapshot(sim).lamp, false);
  assert.equal(sim.tags.Lamp_Delay.value.ACC, 0);
  part(sim, 'S2 Stop').state.pressed = false;
  run(sim, 100);
  assert.equal(snapshot(sim).motor, false, 'releasing stop must not restart the motor');
});

test('wires report current only on live paths', () => {
  const sim = createSim();
  run(sim, 100);
  assert.equal(sim.doc.wires.filter((w) => w.state.energized).length, 2, 'stop path only');
  part(sim, 'S1 Start').state.pressed = true;
  run(sim, 100);
  assert.equal(sim.doc.wires.filter((w) => w.state.energized).length, 6);
});

test('program mode ignores the logic and holds outputs off', () => {
  const sim = createSim();
  sim.mode = 'PROG';
  part(sim, 'S1 Start').state.pressed = true;
  run(sim, 100);
  assert.equal(snapshot(sim).motor, false);
  assert.equal(snapshot(sim).start, true, 'inputs still update');
});

test('editing helpers find, remove and create things', () => {
  const sim = createSim();
  const rung = sim.program.rungs[0];
  const branch = rung.conditions[0];
  const inner = branch.lanes[1].items[0];
  assert.equal(findById(rung.conditions, inner.id), inner);
  assert.equal(removeById(rung.conditions, inner.id), true);
  assert.equal(branch.lanes[1].items.length, 0);

  ensureTag(sim, 'Pump_Run', 'BOOL');
  assert.equal(sim.tags.Pump_Run.value, false);
  ensureTag(sim, 'Fill_Timer.DN', 'TIMER');
  assert.equal(sim.tags.Fill_Timer.dataType, 'TIMER');
  assert.equal(readBool(sim.tags, 'Fill_Timer.DN'), false);
});

test('every component, port and wire has a unique uuid', () => {
  const sim = createSim();
  const ids = [
    ...sim.doc.components.map((c) => c.id),
    ...sim.doc.components.flatMap((c) => c.ports.map((p) => p.id)),
    ...sim.doc.wires.map((w) => w.id)
  ];
  assert.equal(new Set(ids).size, ids.length);
});
