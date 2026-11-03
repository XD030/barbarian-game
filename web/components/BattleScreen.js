'use client';
import { DT } from '../lib/data';
import { SK } from '../lib/skills';
import { RIFTS, FLOORMASTER } from '../lib/rifts';
import { startBattle, setTarget, buildPlayerAct, submitAction, toggleAuto, skillCost, resolveBattle, isKnown, INTENT_LABEL } from '../lib/combat';

const meter = (v, max, cls) => <div className={`meter ${cls}`}><i style={{ width: `${Math.max(0, Math.min(100, v / max * 100))}%` }} /></div>;

export default function BattleScreen({ state, mutate }) {
  const B = state.battle;
  if (!B) return null;
  const a = B.actor;
  const canAct = B.waiting && a && a.side === 'p' && !B.over;
  const run = state.run;
  const noFlee = B.opt.exam || B.opt.rift || B.opt.fmaster || B.opt.collapse || B.opt.boss;
  const title = B.opt.exam ? '公會晉級考試'
    : B.opt.rift ? `裂縫・${RIFTS[B.opt.riftKey]?.n || ''}`
    : B.opt.fmaster ? `層主・${FLOORMASTER[B.opt.fmaster].n}`
    : B.opt.collapse ? `次元崩壞・第 ${(run?.collapse?.wave ?? 0) + 1} 波`
    : B.opt.ambush ? '遭到偷襲!'
    : B.opt.tower && B.opt.boss ? '天空之塔・第 100 階'
    : B.opt.tower ? '天空之塔'
    : `戰鬥 · 第 ${run?.floor ?? ''} 層`;

  const log = (s, msg) => { s.log.unshift({ d: `${s.month}/${s.day}`, m: msg }); s.log.length = Math.min(s.log.length, 60); };
  const onTarget = (idx) => mutate(s => setTarget(s, idx));
  const onAct = (kind, skillKey) => mutate(s => {
    const act = buildPlayerAct(s, kind, skillKey);
    if (!act) return;
    submitAction(s, act);
  });
  const onAuto = () => mutate(s => toggleAuto(s));
  const onContinue = () => mutate(s => resolveBattle(s, log));

  return (
    <div className="wrap">
      <section className="bt">
        <div className="bt-top">
          <h2>{title}</h2>
          <button className="btn sm" onClick={onAuto}>自動:{B.auto ? '開' : '關'}</button>
        </div>

        <div className="stage">
          {B.units.filter(u => u.side === 'e').map((u, i) => {
            const idx = B.units.indexOf(u);
            const known = isKnown(state, u.key);
            return (
              <button key={idx} className={`foeU ${u.dead ? 'dead' : ''} ${u.broken ? 'broken' : ''} ${B.target === u ? 'sel' : ''}`} disabled={!canAct || u.dead} onClick={() => onTarget(idx)}>
                {!u.dead && <span className="intent">{INTENT_LABEL[u.intent] || '攻擊'}</span>}
                <span className="fn">{u.name}</span>
                <span className="fg">{u.g}級 · {Math.max(0, Math.round(u.hp))}/{u.maxhp}</span>
                <div className="bars">{meter(u.hp, u.maxhp, 'hp')}{meter(u.tough, u.toughMax, 'tg')}</div>
                <div className="wk">{known ? u.weak.map(d => <span key={d}>{DT[d]}</span>) : <span className="uk">弱點?</span>}{known && u.resist.map(d => <span className="rs" key={d}>{DT[d]}</span>)}</div>
              </button>
            );
          })}
        </div>

        <div className="team">
          {B.units.filter(u => u.side === 'p').map((u, i) => (
            <div className={`pt ${u.down ? 'down' : ''} ${B.actor === u ? 'now' : ''}`} key={i}>
              <div className="pn">{u.name}</div>
              {meter(u.hp, u.maxhp, 'hp')}<div className="pv">{Math.max(0, Math.round(u.hp))}/{u.maxhp}</div>
              {meter(u.soul, u.soulMax, 'sl')}<div className="pv">魂 {Math.round(u.soul)}</div>
              <div className="sts">{u.defend && <span>防禦</span>}{u.buffs.filter(b => b.label).map((b, bi) => <span key={bi}>{b.label}</span>)}</div>
            </div>
          ))}
        </div>

        <div className="cmd">
          {B.over ? (
            <button className="btn primary" onClick={onContinue}>{B.fled ? '離開戰鬥' : B.win ? '結算戰利品' : '回到城市'}</button>
          ) : canAct ? (
            <div className="cmdg">
              <button className="cmdb" onClick={() => onAct('atk')}><b>普通攻擊</b><small>{DT[a.dt]}擊,魂力 +12</small></button>
              {a.skills.map(k => {
                const s = SK[k], c = skillCost(B, a, k), silenced = a.buffs.some(b => b.silence);
                return <button className="cmdb sk" key={k} disabled={silenced || a.soul < c} onClick={() => onAct('sk', k)}><b>{s.n}</b><span className="c">魂力 {c}</span><small>{s.d}</small></button>;
              })}
              <button className="cmdb" onClick={() => onAct('def')}><b>防禦</b><small>受到的傷害減半,魂力 +15</small></button>
              <button className="cmdb" disabled={!state.potions || B.opt.exam} onClick={() => onAct('pot')}><b>藥水({state.potions})</b><small>生命最低的隊友回復 40%</small></button>
              {!noFlee && <button className="cmdb" onClick={() => onAct('flee')}><b>逃跑</b><small>70% 機率成功,退回上一個房間</small></button>}
            </div>
          ) : <div className="wait">……</div>}
        </div>

        <div className="blog">
          {B.log.slice(-20).reverse().map((l, i) => <p key={i}>{l}</p>)}
        </div>
      </section>
    </div>
  );
}
