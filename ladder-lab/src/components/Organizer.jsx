import Led from './Led.jsx';

const Row = ({ depth = 0, strong, children }) => (
  <div className={'py-[3px] truncate ' + (strong ? 'font-medium' : 'text-ink')} style={{ paddingLeft: 10 + depth * 14 + 'px' }}>
    {children}
  </div>
);

/** Controller organizer tree. The structure is static; the field device lights are live. */
export default function Organizer({ sim }) {
  const devices = sim.doc.components.filter((c) => !['plc', 'common0v', 'source24'].includes(c.type));
  return (
    <nav
      className="lg:w-52 shrink-0 bg-panel border-b lg:border-b-0 lg:border-r border-line overflow-auto scroll-thin"
      aria-label="Controller organizer"
    >
      <div className="px-2.5 py-1.5 bg-chrome text-[11px] uppercase tracking-wider text-mute">Controller Organizer</div>
      <Row strong>Simulated_PLC</Row>
      <Row depth={1}>Controller Tags</Row>
      <Row depth={1}>Tasks</Row>
      <Row depth={2}>MainTask</Row>
      <Row depth={3}>MainProgram</Row>
      <div className="py-[3px] bg-accent text-accentink font-medium" style={{ paddingLeft: 10 + 4 * 14 + 'px' }}>
        MainRoutine
      </div>
      <Row depth={1}>I/O Configuration</Row>
      <Row depth={2}>Local:1 (inputs)</Row>
      <Row depth={2}>Local:2 (outputs)</Row>
      <Row depth={1}>Field Devices</Row>
      {devices.map((c) => (
        <div key={c.id} className="py-[3px] flex items-center gap-1.5 truncate" style={{ paddingLeft: 10 + 2 * 14 + 'px' }}>
          <Led on={!!(c.state.closed && c.type === 'pushbutton') || !!c.state.running || !!c.state.lit} />
          {c.label}
        </div>
      ))}
    </nav>
  );
}
