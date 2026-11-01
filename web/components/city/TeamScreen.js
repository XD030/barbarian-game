'use client';
import { useState } from 'react';
import MemberCard from './MemberCard';

export default function TeamScreen({ state, handlers, onDone, onGoTavern }) {
  const [focus, setFocus] = useState(state.sel[0] || (state.members[0] && state.members[0].id) || null);
  const [sub, setSub] = useState('detail');
  const fm = focus != null ? state.members.find(m => m.id === focus) : null;
  const slots = state.members.map(m => {
    const inParty = state.sel.includes(m.id), foc = m.id === focus;
    return (
      <button key={m.id} className={`tslot ${inParty ? 'in' : ''} ${foc ? 'foc' : ''} ${m.dead ? 'dead' : ''}`} onClick={() => setFocus(m.id)} aria-label={m.name}>
        <div className="spr" style={{ width: '72%', maxWidth: 46 }}>{m.name[0]}</div>
        <span className="lv">{m.dead ? '歿' : 'Lv' + m.lv}</span>
        {inParty && <span className="chk">✓</span>}
      </button>
    );
  });
  for (let i = state.members.length; i < 5; i++) {
    slots.push(
      <button key={`empty${i}`} className="tslot empty" onClick={onGoTavern} aria-label="空位,去酒館招募">
        <span className="plus">+</span><span className="lv">招募</span>
      </button>
    );
  }
  return (
    <>
      <div className="teamhead"><h2>隊伍 {state.sel.length}/5</h2><button className="btn sm primary" onClick={onDone}>確定</button></div>
      <div className="teamslots">{slots}</div>
      <div className="tabpanel">
        <div className="subtabs" style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
          <button className={`btn sm ${sub === 'detail' ? 'primary' : ''}`} onClick={() => setSub('detail')}>角色詳情</button>
          <button className={`btn sm ${sub === 'ess' ? 'primary' : ''}`} onClick={() => setSub('ess')}>精髓詳情</button>
        </div>
        <div className="tabbody">
          {!fm ? (
            <p className="mute">還沒有任何人</p>
          ) : sub === 'ess' ? (
            <p className="mute" style={{ fontSize: 12.5 }}>精髓系統還沒搬過來(戰鬥階段一起處理)。</p>
          ) : (
            <MemberCard state={state} m={fm} selected={state.sel.includes(fm.id)} mini {...handlers} />
          )}
        </div>
      </div>
    </>
  );
}
