/**
 * Component registry. Behaviour lives here in code; the circuit JSON only holds data.
 *
 *   kind     how the solver treats the type: source | common | contact | load | plc
 *   size     drawing size in diagram units
 *   port     port name -> [x, y] offset from the component's top-left corner
 *   update   (component) => void   derive state from props + user input, runs at the start of every scan
 *   conducts (component) => bool   contacts only: does current pass between in and out?
 *   apply    (component, powered)  loads only: copy the solver result into state
 *
 * To add a device, add an entry here, add a renderer in src/components/Diagram.jsx,
 * and create components of that type in src/engine/defaultCircuit.js.
 */
export const REG = {
  source24: { kind: 'source', size: [64, 44], port: { out: [64, 22] } },
  common0v: { kind: 'common', size: [56, 44], port: { in: [0, 22] } },
  pushbutton: {
    kind: 'contact',
    size: [92, 56],
    port: { in: [0, 28], out: [92, 28] },
    update(c) {
      c.state.closed = c.props.contact === 'NO' ? c.state.pressed : !c.state.pressed;
    },
    conducts: (c) => c.state.closed
  },
  motor: {
    kind: 'load',
    size: [90, 64],
    port: { in: [0, 32], out: [90, 32] },
    apply(c, powered) {
      c.state.powered = powered;
      c.state.running = powered;
    }
  },
  lamp: {
    kind: 'load',
    size: [90, 64],
    port: { in: [0, 32], out: [90, 32] },
    apply(c, powered) {
      c.state.powered = powered;
      c.state.lit = powered;
    }
  },
  plc: {
    kind: 'plc',
    size: [160, 200],
    // PLC terminals are placed by side ('l' or 'r') and index.
    portOffset: (c, p) => [p.side === 'l' ? 0 : 160, 56 + p.index * 34]
  }
};

export const portOffset = (c, p) => {
  const r = REG[c.type];
  return r.portOffset ? r.portOffset(c, p) : r.port[p.name];
};

export const portAbs = (c, p) => {
  const o = portOffset(c, p);
  return [c.position.x + o[0], c.position.y + o[1]];
};
