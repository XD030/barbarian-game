import MemberCard from './MemberCard';

export default function RosterPanel({ state, handlers }) {
  return (
    <section className="panel">
      <div className="panel-h"><h2>探險者</h2><span className="mute">勾選「出征」組隊,最多 5 人</span></div>
      <div className="roster">
        {state.members.map(m => (
          <MemberCard key={m.id} state={state} m={m} selected={state.sel.includes(m.id)} {...handlers} />
        ))}
      </div>
    </section>
  );
}
