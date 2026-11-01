import { useState } from 'react';
import { DT } from '../../../lib/data';
import { MON_INFO } from '../../../lib/monInfo';
import { RESEARCH_COST, monNote } from '../../../lib/library';

const ALL_MON = Object.keys(MON_INFO).sort((a, b) => MON_INFO[b].g - MON_INFO[a].g);
const GRADES = [...new Set(ALL_MON.map(k => MON_INFO[k].g))].sort((a, b) => b - a);

function MonRow({ k, known, canAfford, onResearch }) {
  const d = MON_INFO[k];
  if (!known) {
    return (
      <div className="monrow locked">
        <div className="micon">?</div>
        <div className="mname"><b>未知的存在</b><span className="mute" style={{ fontSize: 11.5 }}>{d.g} 級</span></div>
        <button className="btn sm" disabled={!canAfford} onClick={() => onResearch(k)}>解鎖・{RESEARCH_COST}</button>
      </div>
    );
  }
  return (
    <div className="monrow">
      <div className="micon">{d.g}</div>
      <div className="mname">
        <b>{d.n}</b>
        <div className="wk">
          {(d.weak || []).map(x => <span key={x}>{DT[x]}</span>)}
          {(d.resist || []).map(x => <span key={x} className="rs">{DT[x]}</span>)}
          {d.tags && d.tags.spirit && <span className="sp">靈體</span>}
        </div>
        <span className="mute" style={{ fontSize: 11.5 }}>{monNote(k)}</span>
      </div>
    </div>
  );
}

export default function LibraryTab({ state, onResearch }) {
  const [grade, setGrade] = useState('all');
  const known = new Set(state.known || []);
  const shown = grade === 'all' ? ALL_MON : ALL_MON.filter(k => MON_INFO[k].g === grade);

  return (
    <>
      <p className="mute" style={{ fontSize: 12.5 }}>花 {RESEARCH_COST} 石幣請圖書館的拉格納查資料,解鎖一筆怪物圖鑑。</p>
      <div className="pillbar">
        <button className={`pill ${grade === 'all' ? 'sel' : ''}`} onClick={() => setGrade('all')}>全部</button>
        {GRADES.map(g => (
          <button key={g} className={`pill ${grade === g ? 'sel' : ''}`} onClick={() => setGrade(g)}>{g} 級</button>
        ))}
      </div>
      <div className="list">
        {shown.map(k => (
          <MonRow key={k} k={k} known={known.has(k)} canAfford={state.stone >= RESEARCH_COST} onResearch={onResearch} />
        ))}
      </div>
    </>
  );
}
