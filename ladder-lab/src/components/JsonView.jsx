import { useState } from 'react';

/** The whole live document as JSON: components, wires, tags and the ladder program. */
export default function JsonView({ sim }) {
  const [copied, setCopied] = useState(false);
  const text = JSON.stringify(
    {
      schemaVersion: sim.doc.schemaVersion,
      components: sim.doc.components,
      wires: sim.doc.wires,
      tags: Object.values(sim.tags),
      program: sim.program
    },
    null,
    2
  );

  const copy = () => {
    const done = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    };
    try {
      navigator.clipboard.writeText(text).then(done, () => {});
    } catch (e) {
      /* clipboard not available */
    }
  };

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex items-center gap-3 px-3 py-1.5 border-b border-line bg-chrome">
        <span className="text-mute text-[12px]">Live document. Component state updates every scan.</span>
        <button type="button" className="btn ml-auto" onClick={copy}>{copied ? 'Copied' : 'Copy JSON'}</button>
      </div>
      <pre className="flex-1 min-h-0 overflow-auto scroll-thin m-0 px-3 py-2 font-mono text-[11px] leading-[1.45] text-ink bg-field">
        {text}
      </pre>
    </div>
  );
}
