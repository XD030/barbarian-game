'use client';
import { useState } from 'react';
import TopBar from './city/TopBar';
import MapGrid from './dungeon/MapGrid';
import EventPanel from './dungeon/EventPanel';
import TowerPanel, { TowerMap } from './dungeon/TowerPanel';
import CollapsePanel, { CollapseMap } from './dungeon/CollapsePanel';
import AbsorbModal from './AbsorbModal';
import { FIELDS, curField, stayLimit, fmtH, fieldNotes, partyMembers, moveTo, camp, campSafe, waitClose, openChest, gather, drink, buyAtMerchant, sneak, offerAltar, descend, stair, collapseFight, collapseRest, lightTorch } from '../lib/dungeon';
import { FLOORMASTER } from '../lib/rifts';
import { startBattle } from '../lib/combat';
import { absorbEss } from '../lib/bag';
import { essInfo } from '../lib/essence';
import { stats } from '../lib/stats';
import { WEAPON } from '../lib/data';

export default function DungeonScreen({ state, mutate }) {
  const [absorbIdx, setAbsorbIdx] = useState(null);
  const run = state.run;
  const map = run.map;
  const cur = map ? map.rooms[map.cur] : null;
  const left = stayLimit(run) - run.h;
  const party = partyMembers(state);

  const log = (s, msg) => { s.log.unshift({ d: `${s.month}/${s.day}`, m: msg }); s.log.length = Math.min(s.log.length, 60); };

  const onMove = (i) => mutate(s => moveTo(s, log, i));
  const onCamp = () => mutate(s => {
    const amb = camp(s);
    if (amb) startBattle(s, s.run.party, amb, { ambush: 1 });
  });
  const onCampSafe = () => mutate(s => campSafe(s));
  const onWaitClose = () => mutate(s => waitClose(s, log));
  const onOpenChest = () => mutate(s => {
    const r = openChest(s);
    if (!r) return;
    if (r.msg) log(s, r.msg);
    if (r.ambush) startBattle(s, s.run.party, r.ambush, {});
  });
  const onGather = () => mutate(s => {
    const r = gather(s);
    if (!r) return;
    if (r.msg) log(s, r.msg);
    if (r.ambush) startBattle(s, s.run.party, r.ambush, {});
  });
  const onDrink = () => mutate(s => drink(s));
  const onBuy = (key) => mutate(s => buyAtMerchant(s, key));
  const onFight = () => mutate(s => {
    const r = s.run.map.rooms[s.run.map.cur];
    if (!r.enemies || !r.enemies.length) return;
    startBattle(s, s.run.party, r.enemies, { rift: r.type === 'rift', riftKey: r.rift });
  });
  const onSneak = () => mutate(s => sneak(s));
  const onOffer = () => mutate(s => offerAltar(s));
  const onDescend = (field) => mutate(s => {
    const r = descend(s, log, field);
    if (Array.isArray(r)) startBattle(s, s.run.party, r, { tower: 1 });
  });
  const onFmaster = (fmKey) => mutate(s => {
    const fm = FLOORMASTER[fmKey];
    if (!fm) return;
    startBattle(s, s.run.party, [fm.key, ...fm.minions], { fmaster: fmKey });
  });
  const onStair = (idx) => mutate(s => {
    const r = stair(s, idx);
    if (!r) return;
    if (r.msg) log(s, r.msg);
    if (r.enemies) startBattle(s, s.run.party, r.enemies, { tower: 1 });
  });
  const onAbsorb = (i, memberId) => mutate(s => absorbEss(s, 'run', i, memberId, (msg) => log(s, msg)));
  const onTowerBoss = () => mutate(s => {
    s.run.tower.pending = 0;
    startBattle(s, s.run.party, ['sky_sentinel', 'tower_guardian', 'tower_guardian'], { tower: 1, boss: 1 });
  });
  const onCollapseFight = () => mutate(s => startBattle(s, s.run.party, collapseFight(s), { collapse: 1 }));
  const onCollapseRest = () => mutate(s => { if (collapseRest(s)) log(s, '稍微喘了口氣'); });
  const onLightTorch = () => mutate(s => lightTorch(s));
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
                <h2>第 {run.floor} 層 · {FIELDS[curField(run)]?.n}</h2>
                <span className="mute" style={{ fontSize: 12.5 }}>關閉倒數 <span className="num" style={{ color: left < 24 ? 'var(--blood)' : 'var(--ink)' }}>{fmtH(Math.max(0, left))}</span></span>
              </div>
              {fieldNotes(run).map((n, i) => <p className={`notice ${n.bad ? 'bad' : ''}`} key={i}>{n.text}</p>)}
              {run.collapse ? <CollapseMap /> : run.tower ? <TowerMap state={state} /> : <MapGrid state={state} map={map} prev={run.prev} onMove={onMove} />}
            </section>
            <section className="panel event" style={{ marginTop: 16 }}>
              {run.collapse
                ? <CollapsePanel state={state} onCollapseFight={onCollapseFight} onCollapseRest={onCollapseRest} />
                : run.tower
                  ? <TowerPanel state={state} onCamp={onCamp} onStair={onStair} onTowerBoss={onTowerBoss} onDescend={onDescend} onFmaster={onFmaster} />
                  : <EventPanel state={state} r={cur} onCamp={onCamp} onCampSafe={onCampSafe} onWaitClose={onWaitClose} onOpenChest={onOpenChest} onGather={onGather} onDrink={onDrink} onBuy={onBuy} onMove={onMove} onFight={onFight} onSneak={onSneak} onOffer={onOffer} onDescend={onDescend} onFmaster={onFmaster} />}
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
              <div className="row">
                <button className="btn sm" disabled={!state.potions} onClick={onUsePotion}>用藥水({state.potions})</button>
                {run.torchH > 0
                  ? <span className="mute" style={{ fontSize: 12 }}>火把剩 {Math.ceil(run.torchH)} 小時</span>
                  : <button className="btn sm" disabled={!state.torches} onClick={onLightTorch}>點火把({state.torches})</button>}
              </div>
            </section>
            <section className="panel">
              <h2>身上的戰利品</h2>
              <div className="loot"><span>魔石(換算石幣)<b>{run.loot.stone}</b></span><span>精髓<b>{run.loot.ess.length}</b></span><span>物品<b>{run.loot.items.length}</b></span></div>
              {run.loot.ess.length > 0 && (
                <div className="list">
                  {run.loot.ess.map((it, i) => (
                    <div className="item" key={i}>
                      <span className="chip ess" style={{ '--c': essInfo(it).color }}>{essInfo(it).n}</span>
                      <button className="btn sm" onClick={() => setAbsorbIdx(i)}>吸收</button>
                    </div>
                  ))}
                </div>
              )}
              <p className="mute" style={{ fontSize: 12 }}>物品的裝備要回城到中央交易所處理。帶回城會進背包。全滅會全部失去。</p>
            </section>
          </aside>
        </div>
      </div>
      {absorbIdx != null && run.loot.ess[absorbIdx] && (
        <AbsorbModal
          who={party}
          it={run.loot.ess[absorbIdx]}
          onAbsorb={(memberId) => onAbsorb(absorbIdx, memberId)}
          onClose={() => setAbsorbIdx(null)}
        />
      )}
    </>
  );
}
