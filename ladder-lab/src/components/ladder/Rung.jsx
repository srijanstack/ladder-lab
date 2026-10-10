import { Series, Filler } from './Series.jsx';

/** One rung: number box, comment, left rail, conditions, filler, outputs, right rail. */
export default function Rung({ rung, n, ctx }) {
  const s = ctx.rs[rung.id] || { in: true, out: false };
  const selected = !!(ctx.sel && ctx.sel.kind === 'rung' && ctx.sel.id === rung.id);
  return (
    <section className="flex border-b border-line bg-panel" aria-label={'Rung ' + n}>
      <button
        type="button"
        onClick={() => ctx.selectRung(rung.id)}
        aria-pressed={selected}
        className={
          'w-11 shrink-0 border-0 border-r border-line font-mono text-[12px] pt-2 ' +
          (selected ? 'bg-accent text-accentink' : 'bg-chrome text-ink')
        }
        style={{ alignSelf: 'stretch', textAlign: 'center' }}
      >
        {n}
      </button>
      <div className="flex-1 min-w-0 overflow-x-auto scroll-thin">
        <div className="px-3 pt-1.5">
          <input
            id={'cmt-' + rung.id}
            defaultValue={rung.comment}
            placeholder="Rung comment"
            aria-label={'Comment for rung ' + n}
            onInput={(e) => ctx.setComment(rung.id, e.target.value)}
            className="w-full max-w-[420px] bg-transparent border-0 border-b border-transparent hover:border-line text-mute italic text-[12px] py-0.5"
          />
        </div>
        <div className="flex items-stretch w-full min-w-max pb-2 pr-3 pl-3">
          <div className="w-[5px] bg-ink shrink-0" />
          <div className="flex items-start self-start">
            <Series items={rung.conditions} ctx={ctx} rungId={rung.id} listKey="conditions" />
          </div>
          <Filler on={s.out} min={24} />
          <div className="flex items-start self-start">
            <Series items={rung.outputs} ctx={ctx} rungId={rung.id} listKey="outputs" />
          </div>
          <div className="w-[5px] bg-ink shrink-0" />
        </div>
      </div>
    </section>
  );
}
