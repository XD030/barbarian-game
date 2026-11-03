import { healAllCost, removeCost, living } from '../../../lib/city';
import { CHURCHES } from '../../../lib/temple';
import { FAITH_BUFFS, faithCost } from '../../../lib/faith';
import { essInfo } from '../../../lib/essence';

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

export default function TempleTab({ state, onJoinChurch, onTempleHeal, onPray, onDonateFaith, onRemoveEss }) {
  if (!state.church) return <ChurchPicker onJoinChurch={onJoinChurch} />;
  const hc = healAllCost(state);
  const rc = removeCost(state);
  const haveEss = living(state).filter(m => m.ess.length);
  return (
    <>
      <div className="templeActions">
        <button className="btn" disabled={state.prayedToday} onClick={onPray}>祈禱</button>
        <button className="btn" disabled>解咒</button>
        <button className="btn" disabled={state.stone < hc || hc <= 0} onClick={onTempleHeal}>治療</button>
      </div>
      <div className="sub">信仰</div>
      {FAITH_BUFFS.length === 0 ? (
        <p className="mute" style={{ fontSize: 12 }}>信仰增益清單之後再依教團個別設計,這裡先空著。</p>
      ) : (
        <div className="faithlist">
          {FAITH_BUFFS.map(b => {
            const f = state.faith[b.key] || { lv: 0, prog: 0 };
            const cost = faithCost(b, f.lv);
            const maxed = f.lv >= b.maxLv;
            return (
              <div className="faithcard" key={b.key}>
                <div className="faithhead"><b>{b.n}</b><span>Lv.{f.lv}</span></div>
                <p className="mute" style={{ fontSize: 12 }}>{b.desc}</p>
                <div className="faithbar"><div style={{ width: `${maxed ? 100 : Math.min(100, f.prog / cost * 100)}%` }} /></div>
                <div className="faithfoot">
                  <span className="mute">{maxed ? '已滿級' : `${f.prog} / ${cost}`}</span>
                  <button className="btn sm" disabled={maxed || state.stone <= 0} onClick={() => onDonateFaith(b.key)}>捐款</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className="sub">移除精髓(本次 {rc} 石幣,每次翻倍)</div>
      {haveEss.length ? (
        <div className="list">
          {haveEss.map(m => (
            <div className="item" key={m.id}>
              <span><b>{m.name}</b></span>
              <span />
              <small className="row">
                {m.ess.map((it, j) => (
                  <button key={j} className="btn sm danger" disabled={state.stone < rc} onClick={() => onRemoveEss(m.id, j)}>移除 {essInfo(it).short}</button>
                ))}
              </small>
            </div>
          ))}
        </div>
      ) : <p className="mute">沒有人吸收過精髓。</p>}
    </>
  );
}
