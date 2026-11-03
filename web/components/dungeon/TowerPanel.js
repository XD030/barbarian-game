import { STAIRS } from '../../lib/dungeon';
import { monName } from '../../lib/monInfo';
import { FloorMasterBlock } from './EventPanel';

// 替代 MapGrid,放在跟樓層標題同一個 panel 裡。
export function TowerMap({ state }) {
  const t = state.run.tower;
  if (t.stage >= 100 && !t.guardDone) return <p className="mute">第 100 階。中心部的傳送門石碑前,站著必定出現的 5 級守衛。</p>;
  if (t.guardDone) return <p className="mute">守衛倒下了。傳送門石碑的門要照正確的順序打開。</p>;
  return (
    <>
      <div className="mrow" style={{ gridTemplateColumns: '60px 1fr 70px' }}>
        <span>攀登</span>
        <div className="meter xp"><i style={{ width: `${t.stage}%` }} /></div>
        <span className="num">{t.stage}/100</span>
      </div>
      <p className="mute" style={{ fontSize: 12.5 }}>天空之塔也叫修練之塔。選一道階梯往上爬,到第 100 階就能找到通往第 5 層的傳送門。</p>
    </>
  );
}

// 替代 EventPanel,放在下方的 event panel 裡。
export default function TowerPanel({ state, onCamp, onStair, onTowerBoss, onDescend, onFmaster }) {
  const t = state.run.tower;
  const camp = <button className="btn" onClick={onCamp}>紮營休息(8 小時)</button>;

  if (t.stage >= 100 && !t.guardDone) return (
    <>
      <h3>天空之塔・第 100 階</h3>
      <p className="desc">擋在傳送門前的守衛({monName('sky_sentinel')}、{monName('tower_guardian')} × 2)。</p>
      <div className="row"><button className="btn primary" onClick={onTowerBoss}>迎戰</button>{camp}</div>
    </>
  );

  if (t.guardDone) return (
    <>
      <h3>往大魔境的傳送門</h3>
      <p className="desc">第 5 層大魔境會在第 30 天關閉。</p>
      <div className="row"><button className="btn primary" onClick={() => onDescend()}>前往第 5 層</button>{camp}</div>
      <FloorMasterBlock fmKey={4} onFmaster={onFmaster} />
    </>
  );

  return (
    <>
      <h3>選擇階梯</h3>
      <div className="stairs">
        {t.choices.map((c, i) => (
          <button key={i} className={`stair ${c === 'fate' ? 'fate' : ''}`} onClick={() => onStair(i)}>
            <b>{STAIRS[c].n}</b><small>{STAIRS[c].d}</small>
          </button>
        ))}
      </div>
      <div className="row"><button className="btn" onClick={onCamp}>在平台紮營(8 小時)</button></div>
    </>
  );
}
