import { healAllCost, living } from '../../../lib/city';
import { ECON } from '../../../lib/data';
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

export default function TempleTab({ state, onJoinChurch, onTempleHeal, onPurify, onPray }) {
  if (!state.church) return <ChurchPicker onJoinChurch={onJoinChurch} />;
  const church = CHURCHES[state.church];
  const hc = healAllCost(state);
  const purifyCost = 40 * ECON;
  return (
    <>
      <p className="mute" style={{ fontSize: 12.5 }}>你是{church.n}的信徒,信奉{church.god}。</p>
      <div className="row">
        <button className="btn sm" disabled={state.stone < hc || hc <= 0} onClick={onTempleHeal}>治療全員({hc} 石幣)</button>
        <button className="btn sm" disabled title="解咒要等戰鬥引擎做完(詛咒是戰鬥裡的狀態效果,目前遊戲還沒有這個系統)">解咒・戰鬥系統還沒搬過來</button>
      </div>
      <div className="sub">祈禱(每人每天一次,免費:一半機率壓力 -15,一半機率攻擊 +5% 一天)</div>
      <div className="list">
        {living(state).map(m => (
          <div className="item" key={m.id}>
            <span><b>{m.name}</b> <span className="mute">壓力 {Math.round(m.stress)}{m.prayBuff ? ' · 祈禱增益中' : ''}</span></span>
            <button className="btn sm" disabled={m.prayedToday} onClick={() => onPray(m.id)}>{m.prayedToday ? '今天已祈禱' : '祈禱'}</button>
          </div>
        ))}
      </div>
      <div className="sub">安定心神(每人 {purifyCost} 石幣,壓力歸零)</div>
      <div className="list">
        {living(state).map(m => (
          <div className="item" key={m.id}>
            <span><b>{m.name}</b> <span className="mute">壓力 {Math.round(m.stress)}</span></span>
            <button className="btn sm" disabled={state.stone < purifyCost || m.stress <= 0} onClick={() => onPurify(m.id)}>安定心神</button>
          </div>
        ))}
      </div>
      <div className="sub">移除精髓</div>
      <p className="mute" style={{ fontSize: 12 }}>精髓系統還沒搬過來(迷宮/戰鬥階段會補),這裡先空著。每移除一次費用會往上漲。</p>
      <div className="sub">復活</div>
      <p className="mute" style={{ fontSize: 12 }}>復活不再是神殿服務,要用「蘇生之石」——迷宮戰鬥掉落的道具,戰鬥引擎做完才會有。</p>
    </>
  );
}
