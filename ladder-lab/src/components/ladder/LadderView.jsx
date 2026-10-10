import Rung from './Rung.jsx';

export default function LadderView({ rungs, ctx }) {
  return (
    <div className="flex-1 min-h-[260px] lg:min-h-0 overflow-auto scroll-thin bg-panel" aria-label="Ladder routine">
      {rungs.map((r, i) => (
        <Rung key={r.id} rung={r} n={i} ctx={ctx} />
      ))}
    </div>
  );
}
