import { useState } from 'react';
import { DT } from '../../../lib/data';
import { MON_INFO } from '../../../lib/monInfo';
import { monNote, nextGuessCost } from '../../../lib/library';

const ALL_MON = Object.keys(MON_INFO).sort((a, b) => MON_INFO[b].g - MON_INFO[a].g);
const GRADES = [...new Set(ALL_MON.map(k => MON_INFO[k].g))].sort((a, b) => b - a);
const DT_KEYS = Object.keys(DT);

function GuessForm({ k, state, onGuess, onCancel }) {
  const [weak, setWeak] = useState([]);
  const [resist, setResist] = useState([]);
  const cost = nextGuessCost(state);
  const toggle = (arr, setArr, x) => setArr(arr.includes(x) ? arr.filter(v => v !== x) : [...arr, x]);
  return (
    <div className="notice" style={{ marginTop: 6 }}>
      <p className="mute" style={{ fontSize: 12 }}>猜猜牠的弱點(吃更多傷害)跟抗性(吃比較少傷害)屬性,可以不選(猜「沒有」)。{cost > 0 ? `這次猜測要花 ${cost} 石幣。` : '今天的免費猜測機會還沒用掉。'}</p>
      <div className="row" style={{ flexWrap: 'wrap', marginTop: 4 }}>
        <span className="mute" style={{ fontSize: 12 }}>弱點</span>
        {DT_KEYS.map(d => (
          <button key={d} className={`pill ${weak.includes(d) ? 'sel' : ''}`} onClick={() => toggle(weak, setWeak, d)}>{DT[d]}</button>
        ))}
      </div>
      <div className="row" style={{ flexWrap: 'wrap', marginTop: 4 }}>
        <span className="mute" style={{ fontSize: 12 }}>抗性</span>
        {DT_KEYS.map(d => (
          <button key={d} className={`pill ${resist.includes(d) ? 'sel' : ''}`} onClick={() => toggle(resist, setResist, d)}>{DT[d]}</button>
        ))}
      </div>
      <div className="row" style={{ marginTop: 6 }}>
        <button className="btn sm primary" disabled={state.stone < cost} onClick={() => onGuess(k, weak, resist)}>提交猜測</button>
        <button className="btn sm" onClick={onCancel}>取消</button>
      </div>
    </div>
  );
}

function MonRow({ k, state, status, onGuess }) {
  const d = MON_INFO[k];
  const [guessing, setGuessing] = useState(false);
  if (status === 'unseen') {
    return (
      <div className="monrow locked">
        <div className="micon">?</div>
        <div className="mname"><b>未知的存在</b><span className="mute" style={{ fontSize: 11.5 }}>{d.g} 級・還沒遇過</span></div>
      </div>
    );
  }
  if (status === 'encountered') {
    return (
      <div className="monrow locked">
        <div className="micon">?</div>
        <div className="mname">
          <b>{d.n}</b><span className="mute" style={{ fontSize: 11.5 }}>{d.g} 級・遇過,還沒記錄弱點/抗性</span>
          {guessing && <GuessForm k={k} state={state} onGuess={(k, w, r) => { onGuess(k, w, r); setGuessing(false); }} onCancel={() => setGuessing(false)} />}
        </div>
        {!guessing && <button className="btn sm" onClick={() => setGuessing(true)}>猜猜看</button>}
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

export default function LibraryTab({ state, onGuess }) {
  const [grade, setGrade] = useState('all');
  const known = new Set(state.known || []);
  const encountered = new Set(state.encountered || []);
  const shown = grade === 'all' ? ALL_MON : ALL_MON.filter(k => MON_INFO[k].g === grade);

  return (
    <>
      <p className="mute" style={{ fontSize: 12.5 }}>遇到的怪物會自動記進圖鑑,但弱點/抗性要自己猜——猜對才會正式記錄下來,猜錯了今天還有一次免費重試,之後每次都要收費,而且會翻倍。</p>
      <div className="pillbar">
        <button className={`pill ${grade === 'all' ? 'sel' : ''}`} onClick={() => setGrade('all')}>全部</button>
        {GRADES.map(g => (
          <button key={g} className={`pill ${grade === g ? 'sel' : ''}`} onClick={() => setGrade(g)}>{g} 級</button>
        ))}
      </div>
      <div className="list">
        {shown.map(k => (
          <MonRow key={k} k={k} state={state} status={known.has(k) ? 'known' : encountered.has(k) ? 'encountered' : 'unseen'} onGuess={onGuess} />
        ))}
      </div>
    </>
  );
}
