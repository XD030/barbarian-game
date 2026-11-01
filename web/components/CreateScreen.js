'use client';
import { useState } from 'react';
import { RACE, WEAPON, TRAIT, HAIR, DT } from '../lib/data';
import { stats } from '../lib/stats';

function OptButton({ active, label, desc, onClick }) {
  return (
    <button className="opt" aria-pressed={active} title={desc} onClick={onClick}>
      <b>{label}</b>
      <small>{desc}</small>
    </button>
  );
}

export default function CreateScreen({ onConfirm }) {
  const [draft, setDraft] = useState({ name: '', race: 'human', weapon: 'sword', bg: 'bg_merc', look: 0 });
  const w = WEAPON[draft.weapon];
  const previewStats = stats({ race: draft.race, weapon: draft.weapon, lv: 1, wpn: 0, arm: 0, ess: [], traits: [draft.bg] });

  const setField = (field, value) => setDraft(d => ({ ...d, [field]: value }));

  return (
    <section className="intro" style={{ maxWidth: 1000, marginTop: '2vh' }}>
      <div>
        <h1 style={{ fontSize: 'clamp(28px,6vw,40px)' }}>登記探險者</h1>
        <p className="mute">公會的登記員抬頭看了你一眼,等你報上名字。</p>
      </div>
      <div className="create">
        <div className="panel preview">
          <div className="ph">{RACE[draft.race].n[0]}</div>
          <div className="mname" style={{ alignItems: 'center' }}>
            <b>{draft.name || '(未命名)'}</b>
            <span>{RACE[draft.race].n} · {w.n} · {TRAIT[draft.bg].n}</span>
          </div>
          <div className="statline" style={{ justifyContent: 'center' }}>
            <span>生命<b>{previewStats.maxhp}</b></span>
            <span>攻擊<b>{previewStats.atk}</b></span>
            <span>防禦<b>{previewStats.def}</b></span>
            <span>速度<b>{previewStats.spd}</b></span>
            <span>魂力<b>{previewStats.soul}</b></span>
            <span>魔抗<b>{previewStats.mres}</b></span>
          </div>
          <p className="mute" style={{ fontSize: 12.5 }}>攻擊類型:{DT[w.dt]}。{w.pass}</p>
        </div>
        <div className="panel">
          <label className="field">
            <span>名字</span>
            <input
              maxLength={8}
              placeholder="最多 8 個字"
              value={draft.name}
              autoComplete="off"
              onChange={e => setField('name', e.target.value.replace(/[<>&"'`]/g, '').slice(0, 8))}
            />
          </label>
          <div className="field">
            <span>髮色</span>
            <div className="row">
              {HAIR.map((h, i) => (
                <button key={i} className="swatch" style={{ '--c': h }} aria-pressed={draft.look === i} aria-label={`髮色 ${i + 1}`} onClick={() => setField('look', i)} />
              ))}
            </div>
          </div>
          <div className="field">
            <span>種族</span>
            <div className="opts">
              {Object.entries(RACE).map(([k, r]) => (
                <OptButton key={k} active={draft.race === k} label={r.n} desc={r.d} onClick={() => setField('race', k)} />
              ))}
            </div>
          </div>
          <div className="field">
            <span>初始武器</span>
            <div className="opts">
              {Object.entries(WEAPON).map(([k, x]) => (
                <OptButton key={k} active={draft.weapon === k} label={x.n} desc={`${DT[x.dt]}擊。${x.pass}`} onClick={() => setField('weapon', k)} />
              ))}
            </div>
          </div>
          <div className="field">
            <span>出身</span>
            <div className="opts">
              {Object.entries(TRAIT).filter(([, t]) => t.bg).map(([k, t]) => (
                <OptButton key={k} active={draft.bg === k} label={t.n} desc={t.d} onClick={() => setField('bg', k)} />
              ))}
            </div>
          </div>
          <div className="row">
            <button className="btn primary" onClick={() => onConfirm(draft)}>登記,獨自出發</button>
            <span className="mute" style={{ fontSize: 12.5 }}>剛登記的探險者都是 9 級,沒有任何精髓。之後能到酒館招募同伴。</span>
          </div>
        </div>
      </div>
    </section>
  );
}
