import { uid } from './uid.js';

const newTimer = () => ({ PRE: 3000, ACC: 0, EN: false, TT: false, DN: false });

/** Start/stop motor circuit with a lamp that comes on 3 s after the motor starts. */
export function buildDefault() {
  const comp = (type, label, x, y, ports, props = {}, state = {}) => ({
    id: uid(),
    type,
    label,
    position: { x, y },
    rotation: 0,
    ports: ports.map((p) => ({ id: uid(), ...p })),
    props,
    state
  });
  const IO = [
    { name: 'in', direction: 'in' },
    { name: 'out', direction: 'out' }
  ];

  const src = comp('source24', '+24V', 8, 110, [{ name: 'out', direction: 'out' }], { volts: 24 }, { energized: true });
  const start = comp('pushbutton', 'S1 Start', 120, 36, IO, { contact: 'NO', mode: 'momentary' }, { pressed: false, closed: false });
  const stop = comp('pushbutton', 'S2 Stop', 120, 150, IO, { contact: 'NC', mode: 'momentary' }, { pressed: false, closed: true });
  const plc = comp(
    'plc',
    'PLC-1',
    290,
    24,
    [
      { name: 'I0', direction: 'in', side: 'l', index: 0, tag: 'Start_PB', address: 'Local:1:I.Data.0' },
      { name: 'I1', direction: 'in', side: 'l', index: 1, tag: 'Stop_PB', address: 'Local:1:I.Data.1' },
      { name: 'O0', direction: 'out', side: 'r', index: 0, tag: 'Motor_Run', address: 'Local:2:O.Data.0' },
      { name: 'O1', direction: 'out', side: 'r', index: 1, tag: 'Run_Lamp', address: 'Local:2:O.Data.1' }
    ],
    { mode: 'RUN' },
    {}
  );
  const motor = comp('motor', 'M1', 520, 30, IO, { ratedVoltage: 24 }, { powered: false, running: false });
  const lamp = comp('lamp', 'H1', 520, 120, IO, { colour: 'green' }, { powered: false, lit: false });
  const com = comp('common0v', '0V', 650, 90, [{ name: 'in', direction: 'in' }], {}, {});

  const port = (c, name) => c.ports.find((p) => p.name === name);
  const wire = (a, an, b, bn) => ({
    id: uid(),
    type: 'wire',
    from: { componentId: a.id, portId: port(a, an).id },
    to: { componentId: b.id, portId: port(b, bn).id },
    state: { energized: false }
  });

  const components = [src, start, stop, plc, motor, lamp, com];
  const wires = [
    wire(src, 'out', start, 'in'),
    wire(src, 'out', stop, 'in'),
    wire(start, 'out', plc, 'I0'),
    wire(stop, 'out', plc, 'I1'),
    wire(plc, 'O0', motor, 'in'),
    wire(plc, 'O1', lamp, 'in'),
    wire(motor, 'out', com, 'in'),
    wire(lamp, 'out', com, 'in')
  ];

  const tags = {};
  const addTag = (name, dataType, description, io) => {
    tags[name] = { name, dataType, description, io: io || '', value: dataType === 'TIMER' ? newTimer() : false };
  };
  addTag('Start_PB', 'BOOL', 'Start pushbutton (NO)', 'Local:1:I.Data.0');
  addTag('Stop_PB', 'BOOL', 'Stop pushbutton (NC, true when healthy)', 'Local:1:I.Data.1');
  addTag('Motor_Run', 'BOOL', 'Motor contactor output', 'Local:2:O.Data.0');
  addTag('Run_Lamp', 'BOOL', 'Run lamp output', 'Local:2:O.Data.1');
  addTag('Lamp_Delay', 'TIMER', 'Lamp comes on 3 s after motor starts');

  const el = (type, tag) => ({ id: uid(), type, tag });
  const lane = (items) => ({ id: uid(), items });
  const rungs = [
    {
      id: uid(),
      comment: 'Start / stop with seal-in',
      conditions: [
        { id: uid(), type: 'branch', lanes: [lane([el('XIC', 'Start_PB')]), lane([el('XIC', 'Motor_Run')])] },
        el('XIC', 'Stop_PB')
      ],
      outputs: [el('OTE', 'Motor_Run')]
    },
    { id: uid(), comment: 'Delay the run lamp', conditions: [el('XIC', 'Motor_Run')], outputs: [el('TON', 'Lamp_Delay')] },
    { id: uid(), comment: '', conditions: [el('XIC', 'Lamp_Delay.DN')], outputs: [el('OTE', 'Run_Lamp')] }
  ];

  return { doc: { schemaVersion: 1, components, wires }, tags, program: { rungs } };
}
