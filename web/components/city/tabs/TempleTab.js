import { reviveCost, healAllCost, living } from '../../../lib/city';
import { ECON } from '../../../lib/data';

export default function TempleTab({ state, onRevive, onTempleHeal, onPurify }) {
  const h = state.members.find(m => m.hero);
  const hc = healAllCost(state);
  const rc = reviveCost(state);
  const purifyCost = 40 * ECON;
  return (
    <>
      <p className="mute">三神教的大神殿。能治療傷勢、淨化心神,也是唯一能移除精髓的地方。</p>
      {h && h.dead ? (
        <>
          <p className="notice bad">{h.name} 的遺體安置在這裡。</p>
          <button className="btn primary" disabled={state.stone < rc} onClick={onRevive}>復活 {h.name}({rc ? rc + ' 石幣' : '第一次免費'})</button>
        </>
      ) : (
        <p className="mute">主角下次復活:{rc ? rc + ' 石幣' : '免費'}</p>
      )}
      <div className="row">
        <button className="btn sm" disabled={state.stone < hc || hc <= 0} onClick={onTempleHeal}>治療全員({hc} 石幣)</button>
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
      <p className="mute" style={{ fontSize: 12 }}>精髓系統還沒搬過來(迷宮/戰鬥階段會補),這裡先空著。</p>
    </>
  );
}
