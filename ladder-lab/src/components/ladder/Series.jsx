import { Fragment } from 'react';
import { col, LABEL_H, RAIL_Y } from '../../ui/theme.js';
import Cell from './Cell.jsx';
import Slot from './Slot.jsx';

/** A stretchy piece of rail that fills spare width in a rung or branch lane. */
export function Filler({ on, min = 8 }) {
  return (
    <div
      className="flex-1"
      style={{
        minWidth: min + 'px',
        alignSelf: 'flex-start',
        marginTop: LABEL_H + RAIL_Y - 1 + 'px',
        height: '2.5px',
        background: col(on)
      }}
    />
  );
}

/** Instructions in series, with a Slot before and after each one. Branch and Series call each other. */
export function Series({ items, ctx, rungId, listKey }) {
  return (
    <>
      <Slot ctx={ctx} rungId={rungId} listKey={listKey} index={0} />
      {items.map((it, i) => (
        <Fragment key={it.id}>
          {it.type === 'branch' ? (
            <Branch br={it} ctx={ctx} rungId={rungId} />
          ) : (
            <Cell it={it} ctx={ctx} rungId={rungId} />
          )}
          <Slot ctx={ctx} rungId={rungId} listKey={listKey} index={i + 1} />
        </Fragment>
      ))}
    </>
  );
}

function BranchBar({ on, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Select branch"
      className="shrink-0 p-0 border-0 bg-transparent flex justify-center"
      style={{ width: '10px', cursor: 'pointer' }}
    >
      <span style={{ width: '3px', background: col(on), boxShadow: selected ? '0 0 0 2px var(--accent)' : 'none' }} />
    </button>
  );
}

/** Parallel lanes, ORed together. */
export function Branch({ br, ctx, rungId }) {
  const s = ctx.rs[br.id] || { in: false, out: false };
  const selected = !!(ctx.sel && ctx.sel.id === br.id);
  const select = () => ctx.selectEl(rungId, br.id);
  return (
    <div className="flex items-stretch self-start">
      <BranchBar on={s.in} selected={selected} onClick={select} />
      <div className="flex flex-col">
        {br.lanes.map((lane) => {
          const ls = ctx.rs[lane.id] || { in: false, out: false };
          return (
            <div key={lane.id} className="flex items-start w-full">
              <Series items={lane.items} ctx={ctx} rungId={rungId} listKey={'lane:' + lane.id} />
              <Filler on={ls.out} />
            </div>
          );
        })}
      </div>
      <BranchBar on={s.out} selected={selected} onClick={select} />
    </div>
  );
}
