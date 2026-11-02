'use client';
import TopBar from './city/TopBar';
import MapGrid from './dungeon/MapGrid';
import EventPanel from './dungeon/EventPanel';
import { FIELDS, stayLimit, fmtH, partyMembers, moveTo, camp, campSafe, waitClose, openChest, gather, drink, buyAtMerchant } from '../lib/dungeon';
import { startBattle } from '../lib/combat';
import { stats } from '../lib/stats';
import { WEAPON } from '../lib/data';

export default function DungeonScreen({ state, mutate }) {
  const run = state.run;
  const map = run.map;
  const cur = map.rooms[map.cur];
  const left = stayLimit(run) - run.h;
  const party = partyMembers(state);

  const log = (s, msg) => { s.log.unshift({ d: `${s.month}/${s.day}`, m: msg }); s.log.length = Math.min(s.log.length, 60); };

  const onMove = (i) => mutate(s => moveTo(s, log, i));
  const onCamp = () => mutate(s => camp(s));
  const onCampSafe = () => mutate(s => campSafe(s));
  const onWaitClose = () => mutate(s => waitClose(s, log));
  const onOpenChest = () => mutate(s => { const msg = openChest(s); if (msg) log(s, msg); });
  const onGather = () => mutate(s => { const msg = gather(s); if (msg) log(s, msg); });
  const onDrink = () => mutate(s => drink(s));
  const onBuy = (key) => mutate(s => buyAtMerchant(s, key));
  const onFight = () => mutate(s => {
    const r = s.run.map.rooms[s.run.map.cur];
    if (!r.enemies || !r.enemies.length) return;
    startBattle(s, r.enemies, {});
  });
  const onUsePotion = () => mutate(s => {
    if (!s.potions) return;
    const p = partyMembers(s); if (!p.length) return;
    const m = p.reduce((a, b) => a.hp / stats(a).maxhp < b.hp / stats(b).maxhp ? a : b);
    const st = stats(m); m.hp = Math.min(st.maxhp, m.hp + st.maxhp * .4); s.potions--;
  });

  return (
    <>
      <TopBar state={state} />
      <div className="wrap">
        <div className="dun">
          <div className="dmain">
            <section className="panel">
              <div className="panel-h">
                <h2>第 {run.floor} 層 · {FIELDS[cur.field]?.n}</h2>
                <span className="mute" style={{ fontSize: 12.5 }}>關閉倒數 <span className="num" style={{ color: left < 24 ? 'var(--blood)' : 'var(--ink)' }}>{fmtH(Math.max(0, left))}</span></span>
              </div>
              <MapGrid map={map} prev={run.prev} onMove={onMove} />
            </section>
            <section className="panel event" style={{ marginTop: 16 }}>
              <EventPanel state={state} r={cur} onCamp={onCamp} onCampSafe={onCampSafe} onWaitClose={onWaitClose} onOpenChest={onOpenChest} onGather={onGather} onDrink={onDrink} onBuy={onBuy} onMove={onMove} onFight={onFight} />
            </section>
          </div>
          <aside className="side">
            <section className="panel">
              <h2>隊伍</h2>
              <div>
                {party.map(m => {
                  const st = stats(m);
                  return (
                    <div className="mini" key={m.id}>
                      <div className="spr">{m.name[0]}</div>
                      <div className="mname">
                        <b>{m.name} <em className="lv">Lv{m.lv}</em></b>
                        <span>{WEAPON[m.weapon].n}</span>
                        <div className="mrow"><span>生命</span><div className="meter hp"><i style={{ width: `${Math.max(0, Math.min(100, m.hp / st.maxhp * 100))}%` }} /></div><span className="num">{Math.round(m.hp)}/{st.maxhp}</span></div>
                        <div className="mrow"><span>壓力</span><div className="meter st"><i style={{ width: `${Math.max(0, Math.min(100, m.stress))}%` }} /></div><span className="num">{Math.round(m.stress)}/100</span></div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="row"><button className="btn sm" disabled={!state.potions} onClick={onUsePotion}>用藥水({state.potions})</button></div>
            </section>
            <section className="panel">
              <h2>身上的戰利品</h2>
              <div className="loot"><span>魔石(換算石幣)<b>{run.loot.stone}</b></span></div>
              <p className="mute" style={{ fontSize: 12 }}>只能帶出魔石(精髓/物品系統還沒搬過來)。全滅會全部失去。</p>
            </section>
          </aside>
        </div>
      </div>
    </>
  );
}
