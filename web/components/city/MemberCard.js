import { RACE, WEAPON, TRAIT, DT, LV_XP, MAXLV } from '../../lib/data';
import { stats } from '../../lib/stats';
import { DISPATCH_MISSIONS, dispatchSlots, activeDispatches, TATTOO_PATH, TATTOO_COST, BEASTPACT, SPIRIT, SPIRIT_STONE_COST, SPIRIT_STONE_RATE } from '../../lib/city';
import { essInfo, essDesc, essSlots, essGrade } from '../../lib/essence';
import { NUM } from '../../lib/num';
import { rankCap } from '../../lib/guild';

function EssChips({ m }) {
  const slots = Array.from({ length: essSlots(m) }, (_, i) => m.ess[i]);
  return (
    <>
      {slots.map((it, i) => it
        ? <span key={i} className={`chip ess ${it.gd ? 'rb' : ''}`} style={{ '--c': essInfo(it).color }} title={essDesc(it)}>{essInfo(it).n}</span>
        : <span key={i} className="chip empty">空精髓槽</span>)}
      {m.num && <span className="chip item" title={NUM[m.num.id].d}><img className="numicon" src={NUM[m.num.id].icon} alt="" />{NUM[m.num.id].n}</span>}
    </>
  );
}

function Meter({ v, max, cls }) {
  const pct = Math.max(0, Math.min(100, (v / max) * 100));
  return <div className={`meter ${cls}`}><i style={{ width: `${pct}%` }} /></div>;
}
function MRow({ label, v, max, cls }) {
  return (
    <div className="mrow">
      <span>{label}</span>
      <Meter v={v} max={max} cls={cls} />
      <span className="num">{Math.round(v)}/{Math.round(max)}</span>
    </div>
  );
}

function DispatchPanel({ state, m, onDispatch }) {
  if (m.hero) return null;
  if (m.dispatch) {
    const ms = DISPATCH_MISSIONS[m.dispatch.key];
    return <div className="notice">派遣中:{ms.n}(剩 {m.dispatch.left} 天)</div>;
  }
  const full = activeDispatches(state) >= dispatchSlots(state);
  return (
    <div className="notice">
      派遣:外出賺石幣,派遣中無法出戰(名額 {activeDispatches(state)}/{dispatchSlots(state)})
      <div className="row" style={{ marginTop: 6 }}>
        {Object.entries(DISPATCH_MISSIONS).map(([k, ms]) => (
          <button key={k} className="btn sm" disabled={full} title={`${ms.days} 天後回來,帶回石幣`} onClick={() => onDispatch(m.id, k)}>
            {ms.n}({ms.days}天)
          </button>
        ))}
      </div>
    </div>
  );
}

function TattooPanel({ state, m, onTattooUp, onTattooPath }) {
  if (m.race !== 'barb') return null;
  const t = m.tattoo || { stage: 0, path: null };
  if (t.stage >= 5) {
    return <div className="notice">靈魂刻印:第 5 階 · <b>{TATTOO_PATH[t.path].n}</b><br /><span className="mute" style={{ fontSize: 12 }}>{TATTOO_PATH[t.path].d}</span></div>;
  }
  if (t.stage === 2 && !t.path) {
    const cost = TATTOO_COST[2];
    return (
      <div className="notice">
        靈魂刻印:第 2 階。選擇一條路線進入第 3 階(花費 {cost} 石幣,路線選定後不能更改)
        <div className="row" style={{ marginTop: 6 }}>
          {Object.entries(TATTOO_PATH).map(([k, p]) => (
            <button key={k} className="btn sm" title={p.d} disabled={state.stone < cost} onClick={() => onTattooPath(m.id, k)}>{p.n}</button>
          ))}
        </div>
      </div>
    );
  }
  const cost = TATTOO_COST[t.stage];
  const label = t.stage === 0 ? '尚未刻印' : `第 ${t.stage} 階${t.path ? ' · ' + TATTOO_PATH[t.path].n : ''}`;
  return (
    <div className="notice">
      靈魂刻印:{label}{t.path && <><br /><span className="mute" style={{ fontSize: 12 }}>{TATTOO_PATH[t.path].d}</span></>}
      <div className="row" style={{ marginTop: 6 }}>
        <button className="btn sm" disabled={state.stone < cost} onClick={() => onTattooUp(m.id)}>刻印升級至第 {t.stage + 1} 階({cost} 石幣)</button>
      </div>
    </div>
  );
}

function BeastPactPanel({ m, onSetPact }) {
  if (m.race !== 'beast') return null;
  if (m.beastPact) {
    return <div className="notice">靈魂獸契約:<b>{BEASTPACT[m.beastPact].n}</b><br /><span className="mute" style={{ fontSize: 12 }}>{BEASTPACT[m.beastPact].d}</span></div>;
  }
  if (m.lv < 2) return <p className="mute" style={{ fontSize: 12 }}>獸人在 Lv2 能與靈魂獸締結契約(目前 Lv{m.lv})。</p>;
  return (
    <div className="notice">
      尚未締結靈魂獸契約
      <div className="row" style={{ marginTop: 6 }}>
        {Object.entries(BEASTPACT).map(([k, p]) => (
          <button key={k} className="btn sm" title={p.d} onClick={() => onSetPact(m.id, k)}>{p.n}</button>
        ))}
      </div>
    </div>
  );
}

function FairyPanel({ state, m, onSpiritStone }) {
  if (m.race !== 'fairy') return null;
  const held = m.spirits || [];
  return (
    <div className="notice">
      精靈契約:{held.length ? held.map(k => SPIRIT[k].n).join('、') : '尚未締結'}
      <div className="row" style={{ marginTop: 6 }}>
        {Object.entries(SPIRIT).filter(([k]) => !held.includes(k)).map(([k, p]) => (
          <button key={k} className="btn sm" disabled={state.stone < SPIRIT_STONE_COST} title={`${p.d};使用精靈石嘗試契約,花費 ${SPIRIT_STONE_COST} 石幣,成功率 ${SPIRIT_STONE_RATE * 100}%`} onClick={() => onSpiritStone(m.id, k)}>
            精靈石:{p.n}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function MemberCard({ state, m, selected, mini, onToggleSel, onDispatch, onTattooUp, onTattooPath, onSetPact, onSpiritStone, onUnequip }) {
  if (m.dead) {
    return (
      <article className="mcard dead">
        <div className="mhead">
          <div className="spr">{RACE[m.race].n[0]}</div>
          <div className="mname"><b>{m.name}</b><span>已死亡,要用「蘇生之石」才能復活</span></div>
        </div>
      </article>
    );
  }
  const st = stats(m);
  const next = m.lv < MAXLV ? LV_XP[m.lv + 1] : LV_XP[MAXLV];
  const prev = LV_XP[m.lv];
  return (
    <article className={`mcard ${selected ? 'is-sel' : ''}`}>
      <div className="mhead">
        <div className="spr">{RACE[m.race].n[0]}</div>
        <div className="mname"><b>{m.name}</b><span>{RACE[m.race].n} · {WEAPON[m.weapon].n}<em className="lv"> Lv{m.lv}</em></span></div>
        {!mini && (
          <label className="go">
            <input type="checkbox" checked={selected} disabled={!!m.dispatch} onChange={e => onToggleSel(m.id, e.target.checked)} />出征
          </label>
        )}
      </div>
      <div>
        <MRow label="生命" v={m.hp} max={st.maxhp} cls="hp" />
        <MRow label="壓力" v={m.stress} max={100} cls="st" />
        <MRow label="經驗" v={m.xp - prev} max={Math.max(1, next - prev)} cls="xp" />
      </div>
      <div className="statline">
        <span><img className="sic" src="/ui/icons/stat/patk.png" alt="" />攻擊<b>{st.atk}</b></span>
        <span><img className="sic" src="/ui/icons/stat/pdef.png" alt="" />防禦<b>{st.def}</b></span>
        <span><img className="sic" src="/ui/icons/stat/dex.png" alt="" />速度<b>{st.spd}</b></span>
        <span><img className="sic" src="/ui/icons/stat/mp.png" alt="" />魂力<b>{st.soul}</b></span>
        <span><img className="sic" src="/ui/icons/stat/mdef.png" alt="" />魔抗<b>{st.mres}</b></span>
        <span>{DT[WEAPON[m.weapon].dt]}擊</span>
      </div>
      <DispatchPanel state={state} m={m} onDispatch={onDispatch} />
      {m.race === 'beast' && <BeastPactPanel m={m} onSetPact={onSetPact} />}
      {m.race === 'barb' && <TattooPanel state={state} m={m} onTattooUp={onTattooUp} onTattooPath={onTattooPath} />}
      {m.race === 'fairy' && <FairyPanel state={state} m={m} onSpiritStone={onSpiritStone} />}
      <div className="chips">
        {m.hero && <span className="chip hero" title="你自己。死亡後要用「蘇生之石」復活">主角</span>}
        <span className="chip grade" title="精髓總價值決定,上限受公會認證影響">{Math.max(essGrade(m), rankCap(state))}級</span>
        {m.traits.map(t => <span key={t} className={`chip ${TRAIT[t].good ? 'good' : 'bad'}`} title={TRAIT[t].d}>{TRAIT[t].n}</span>)}
        <EssChips m={m} />
      </div>
      {m.num && <div className="row" style={{ marginTop: 6 }}><button className="btn sm" onClick={() => onUnequip(m.id)}>卸下編號物品</button></div>}
    </article>
  );
}
