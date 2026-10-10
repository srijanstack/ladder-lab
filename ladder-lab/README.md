# Ladder Lab

A browser-based PLC simulator with a Studio 5000 style layout: a ladder editor, a tag database, and a live field wiring diagram. Built with React, Vite and Tailwind CSS. There is no backend.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # engine tests (Node 18+)
npm run build    # production build in dist/
```

The fonts (IBM Plex) load from Google Fonts, so the first run needs an internet connection.

## What you can do

- Hold **S1 Start** in the wiring panel. The motor starts and seals in through its own contact.
- Press **S2 Stop** (normally closed) to drop it out. The run lamp comes on 3 seconds after the motor starts.
- Switch the controller between **Run** and **Program** in the top bar.
- Edit the ladder: pick an instruction in the toolbar, then click a **+** on a rung. Click any instruction to change its tag. Typing a new tag name creates the tag.
- Watch tags update in **Controller Tags**, and inspect the whole model in **Circuit JSON**.

Instructions: `XIC`, `XIO`, `OTE`, `OTL`, `OTU`, `TON`, and parallel branches.

## How it works

### The JSON model

Every device is a plain object with the same base shape:

```json
{
  "id": "uuid",
  "type": "pushbutton",
  "label": "S1 Start",
  "position": { "x": 120, "y": 36 },
  "rotation": 0,
  "ports": [{ "id": "uuid", "name": "in", "direction": "in" }, { "id": "uuid", "name": "out", "direction": "out" }],
  "props": { "contact": "NO", "mode": "momentary" },
  "state": { "pressed": false, "closed": false }
}
```

- `props` is configuration the user edits. `state` is runtime values the simulator updates.
- Wires are `{ id, type: "wire", from: { componentId, portId }, to: { componentId, portId }, state: { energized } }`.
- The document is `{ schemaVersion, components, wires }`, plus `tags` and the ladder `program`.

JSON cannot hold behaviour, so each `type` maps to code in `src/engine/registry.js`.

### The scan cycle (`src/engine/scan.js`)

Every 20 ms:

1. Update device state, for example a pushbutton's `closed` from `pressed` and its `NO` or `NC` prop.
2. Solve the circuit and write the PLC input tags.
3. Run the ladder, or force outputs off in Program mode.
4. Solve again with the new outputs, then update loads and wires.

### The circuit solver (`src/engine/solver.js`)

A breadth-first search from the +24V sources (and from PLC outputs whose tag is true) finds every port fed from +24V. A second search from 0V finds return paths. A load is powered when its input is fed and its output returns. Wires on a live path get `state.energized = true`.

This is a boolean model: powered or not, with no voltage or current values.

## Project layout

```
src/
  engine/            plain JS, no React
    registry.js        device types: geometry and behaviour
    defaultCircuit.js  the starting circuit, tags and program
    solver.js          what is energized
    ladder.js          instruction evaluation and timers
    scan.js            one controller scan
    program.js         helpers for editing rungs and tags
    sim.js             createSim()
  components/        React UI
    ladder/            Cell, Slot, Series (+ Branch), Rung, LadderView
    Diagram.jsx        field wiring SVG
    TagTable.jsx  JsonView.jsx  TopBar.jsx  Organizer.jsx  Toolbar.jsx  Properties.jsx
  hooks/useScanLoop.js   the scan timer
  App.jsx
test/engine.test.js
```

The simulator state is one mutable object created by `createSim()`. The scan loop mutates it directly, and React re-renders on a timer (about 16 fps) instead of on every change.

## Adding a device

1. Add an entry to `REG` in `src/engine/registry.js` with its `kind`, `size`, `port` offsets, and any `update`, `conducts` or `apply` behaviour.
2. Add a renderer to the `BODIES` map in `src/components/Diagram.jsx`.
3. Create components of that type in `src/engine/defaultCircuit.js` and wire them up.

## Known limits

- Components cannot be dragged or added from the UI yet.
- Outputs go at the end of a rung, not inside branches. No nested branch editing beyond what the palette places.
- No counters, compare or math instructions.
- Nothing is saved: a refresh resets the program. There is no JSON import.
- Boolean power flow only.

## Ideas for next steps

Drag-to-place devices and a wire tool, saving and loading the JSON (localStorage or a file), counters and comparisons, forcing tags, and a TypeScript migration with types for the component and program model.
