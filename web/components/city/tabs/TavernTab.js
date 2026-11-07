import { RACE, WEAPON, TRAIT } from '../../../lib/data';
import { capacity, living, tavernUnlocked, TAVERN_TIERS, recruitCost } from '../../../lib/city';
import { essInfo } from '../../../lib/essence';

export default function TavernTab({ state, onRecruit }) {
  const full = living(state).length >= capacity(state);
  const unlocked = tavernUnlocked(state);
  const maxLv = unlocked[unlocked.length - 1].lv;
  const next = TAVERN_TIERS.find(t => !t.cond(state));
  return (
    <>
      <p className="mute">拉維吉恩區的酒館,角落貼著找隊伍的公告。願意跟陌生人出征的好手不多,等級越高的人開價越高,也越挑隊伍的名聲。</p>
      <div className="kv"><span>目前能招到</span><b>最高 Lv{maxLv}</b><span>名聲</span><b>{state.fame}</b><span>貢獻點</span><b>{state.contrib}</b></div>
      {next && <p className="notice" style={{ fontSize: 12 }}>更厲害的人(Lv{next.lv})要等到:{next.label}</p>}
      <div className="sub">今天在酒館(每月 1 日、15 日換人)</div>
      <div className="list">
        {state.tavern.length ? state.tavern.map(m => {
          const c = recruitCost(m);
          return (
            <div className="recruit" key={m.id}>
              <div className="spr">{RACE[m.race].n[0]}</div>
              <div className="mname">
                <b>{m.name} <em className="lv">Lv{m.lv}</em></b>
                <span>{RACE[m.race].n} · {WEAPON[m.weapon].n}</span>
                <div className="chips" style={{ marginTop: 3 }}>
                  {m.traits.map(t => <span key={t} className={`chip ${TRAIT[t].good ? 'good' : 'bad'}`} title={TRAIT[t].d}>{TRAIT[t].n}</span>)}
                  {m.ess.map((it, i) => <span key={i} className={`chip ess ${it.gd ? 'rb' : ''}`} style={{ '--c': essInfo(it).color }} title={essInfo(it).n}>{essInfo(it).n}</span>)}
                </div>
              </div>
              <button className="btn sm" disabled={full || state.stone < c} title={full ? '住處住不下了' : ''} onClick={() => onRecruit(m.id)}>{c}</button>
            </div>
          );
        }) : <p className="mute">今天沒有人在找隊伍。</p>}
      </div>
    </>
  );
}
