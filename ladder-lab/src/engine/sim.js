import { buildDefault } from './defaultCircuit.js';

/**
 * The simulator state. It is a plain mutable object so the scan loop can update it
 * quickly; React components re-render on a timer rather than on every mutation.
 *
 *   mode    'RUN' | 'PROG'
 *   doc     { schemaVersion, components[], wires[] }
 *   tags    { [name]: { name, dataType, description, io, value } }
 *   program { rungs[] }
 *   rs      per-element power flow from the last scan, used to colour the ladder
 *   scanMs  smoothed scan time
 */
export function createSim() {
  return { mode: 'RUN', ...buildDefault(), rs: {}, scanMs: 20 };
}
