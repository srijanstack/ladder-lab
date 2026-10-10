/** Unique id for components, ports, wires, rungs and instructions. */
export const uid = () =>
  globalThis.crypto && globalThis.crypto.randomUUID
    ? globalThis.crypto.randomUUID()
    : 'id-' + Math.random().toString(16).slice(2) + Date.now().toString(16);
