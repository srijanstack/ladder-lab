import { useState } from 'react';
import Led from './Led.jsx';
import { ensureTag } from '../engine/index.js';

/** Controller tags with live values, editable timer presets and an add-tag form. */
export default function TagTable({ sim, force }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('BOOL');

  const add = () => {
    const n = name.trim().replace(/[^A-Za-z0-9_]/g, '_');
    if (!n || sim.tags[n]) return;
    ensureTag(sim, n, type);
    setName('');
    force();
  };

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="overflow-auto flex-1 min-h-0 scroll-thin">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-chrome">
            <tr className="text-[11px] uppercase tracking-wider text-mute">
              <th className="px-3 py-1.5 font-medium">Name</th>
              <th className="px-2 py-1.5 font-medium">Type</th>
              <th className="px-2 py-1.5 font-medium">Value</th>
              <th className="px-2 py-1.5 font-medium">Address</th>
              <th className="px-2 py-1.5 font-medium">Description</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(sim.tags).map((t) => (
              <tr key={t.name} className="border-t border-line">
                <td className="px-3 py-1 font-mono">{t.name}</td>
                <td className="px-2 py-1 font-mono text-mute">{t.dataType}</td>
                <td className="px-2 py-1 font-mono tabnum whitespace-nowrap">
                  {t.dataType === 'BOOL' ? (
                    <>
                      <Led on={t.value} /> <span className="ml-1">{t.value ? 1 : 0}</span>
                    </>
                  ) : (
                    <>
                      <span className="mr-2">
                        PRE{' '}
                        <input
                          id={'pre-' + t.name}
                          type="number"
                          min="0"
                          step="500"
                          value={t.value.PRE}
                          aria-label={t.name + ' preset in ms'}
                          onChange={(e) => {
                            t.value.PRE = Math.max(0, +e.target.value || 0);
                            force();
                          }}
                          className="w-16 bg-field border border-line px-1 text-[12px]"
                        />
                      </span>
                      <span className="mr-2">ACC {Math.round(t.value.ACC)}</span>
                      DN <Led on={t.value.DN} />
                    </>
                  )}
                </td>
                <td className="px-2 py-1 font-mono text-mute text-[11px] whitespace-nowrap">{t.io}</td>
                <td className="px-2 py-1 text-mute">{t.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center gap-2 px-3 py-1.5 border-t border-line bg-chrome">
        <label htmlFor="new-tag" className="text-mute text-[12px]">New tag</label>
        <input
          id="new-tag"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="Tag_Name"
          className="bg-field border border-line px-1.5 py-0.5 font-mono w-36"
        />
        <select
          id="new-tag-type"
          aria-label="Data type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="bg-field border border-line px-1 py-0.5"
        >
          <option>BOOL</option>
          <option>TIMER</option>
        </select>
        <button type="button" className="btn" onClick={add}>Add</button>
      </div>
    </div>
  );
}
