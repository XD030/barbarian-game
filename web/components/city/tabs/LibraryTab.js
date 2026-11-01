import { DT } from '../../../lib/data';
import { MON_INFO } from '../../../lib/monInfo';
import { RESEARCH_COST, monNote } from '../../../lib/library';

const ALL_MON = Object.keys(MON_INFO).sort((a, b) => MON_INFO[b].g - MON_INFO[a].g);

function MonCard({ k, known, canAfford, onResearch }) {
  const d = MON_INFO[k];
  if (!known) {
    return (
      <div className="moncard locked">
        <div className="micon">?</div>
        <b>未知的存在</b>
        <button className="btn sm" disabled={!canAfford} onClick={() => onResearch(k)}>解鎖・{RESEARCH_COST}</button>
      </div>
    );
  }
  return (
    <div className="moncard">
      <div className="micon">{d.g}</div>
      <b>{d.n}</b>
      <span className="mute" style={{ fontSize: 11.5 }}>{d.g} 級</span>
      <div className="wk">
        {(d.weak || []).map(x => <span key={x}>{DT[x]}</span>)}
        {(d.resist || []).map(x => <span key={x} className="rs">{DT[x]}</span>)}
        {d.tags && d.tags.spirit && <span className="sp">靈體</span>}
      </div>
      <small className="mute" style={{ fontSize: 11.5 }}>{monNote(k)}</small>
    </div>
  );
}

export default function LibraryTab({ state, onResearch }) {
  const known = new Set(state.known || []);
  return (
    <>
      <p className="mute" style={{ fontSize: 12.5 }}>花 {RESEARCH_COST} 石幣請圖書館的拉格納查資料,解鎖一筆怪物圖鑑。</p>
      <div className="monGrid">
        {ALL_MON.map(k => (
          <MonCard key={k} k={k} known={known.has(k)} canAfford={state.stone >= RESEARCH_COST} onResearch={onResearch} />
        ))}
      </div>
    </>
  );
}
