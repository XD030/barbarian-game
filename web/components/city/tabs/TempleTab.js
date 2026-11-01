import { healAllCost } from '../../../lib/city';
import { CHURCHES } from '../../../lib/temple';

function ChurchPicker({ onJoinChurch }) {
  return (
    <>
      <p className="mute" style={{ fontSize: 12.5 }}>三神教底下有三個教團,各自信奉不同的神。選一個加入——加入後就不能更換了。</p>
      <div className="opts">
        {Object.entries(CHURCHES).map(([k, c]) => (
          <button key={k} className="opt" onClick={() => { if (confirm(`確定要加入${c.n}嗎?加入後無法更換。`)) onJoinChurch(k); }}>
            <b>{c.n}</b>
            <small>信奉{c.god}</small>
            <small className="mute">{c.flavor}</small>
          </button>
        ))}
      </div>
    </>
  );
}

export default function TempleTab({ state, onJoinChurch, onTempleHeal, onPray }) {
  if (!state.church) return <ChurchPicker onJoinChurch={onJoinChurch} />;
  const hc = healAllCost(state);
  return (
    <>
      <div className="row">
        <button className="btn sm" disabled={state.stone < hc || hc <= 0} onClick={onTempleHeal}>治療全員({hc} 石幣)</button>
        <button className="btn sm" disabled>解咒・戰鬥系統還沒搬過來</button>
      </div>
      <div className="sub">祈禱(全隊一天一次,免費,壓力減半)</div>
      <div className="row">
        <button className="btn sm" disabled={state.prayedToday} onClick={onPray}>{state.prayedToday ? '今天已祈禱' : '祈禱'}</button>
      </div>
      <div className="sub">移除精髓</div>
    </>
  );
}
