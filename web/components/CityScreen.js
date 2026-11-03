'use client';
import { useState, useEffect } from 'react';
import RosterPanel from './city/RosterPanel';
import TopBar from './city/TopBar';
import CityMap from './city/CityMap';
import TeamScreen from './city/TeamScreen';
import BagScreen from './city/BagScreen';
import MobileTabBar from './city/MobileTabBar';
import BuildingHeader from './city/BuildingHeader';
import { BUILDINGS } from './city/buildings';
import HomeTab from './city/tabs/HomeTab';
import TavernTab from './city/tabs/TavernTab';
import SmithTab from './city/tabs/SmithTab';
import StoreTab from './city/tabs/StoreTab';
import TempleTab from './city/tabs/TempleTab';
import GuildTab from './city/tabs/GuildTab';
import LibraryTab from './city/tabs/LibraryTab';
import PlaceholderTab from './city/tabs/PlaceholderTab';
import { WEAPON, TATTOO_COST, TATTOO_PATH, BEASTPACT, SPIRIT, SPIRIT_STONE_COST, SPIRIT_STONE_RATE, ECON } from '../lib/data';
import { getM } from '../lib/getM';
import { stats } from '../lib/stats';
import { gearCost, shipCost, healAllCost, processDays } from '../lib/city';
import { genFloor1, portalXp, FLOORS, autoTorch } from '../lib/dungeon';
import { tickRequests, claimReq } from '../lib/guild';
import { research } from '../lib/library';
import { joinChurch, pray } from '../lib/temple';
import { donateFaith } from '../lib/faith';
import { startBattle } from '../lib/combat';
import { useIsMobile } from '../lib/useIsMobile';

export default function CityScreen({ state, mutate, onResetSave }) {
  const [tab, setTab] = useState('home');
  const [mobileView, setMobileView] = useState('map');
  const mobile = useIsMobile();

  // 委託每 4 小時補一個,畫面開著的時候每分鐘追一次進度(也會在下面的倒數顯示用到)。
  useEffect(() => {
    const id = setInterval(() => mutate(s => tickRequests(s)), 60000);
    return () => clearInterval(id);
  }, [mutate]);
  const party = state.sel.map(id => getM(state, id)).filter(m => m && !m.dead);
  const open = state.day === 1, until = 30 - state.day + 1;

  const log = (s, msg) => { s.log.unshift({ d: `${s.month}/${s.day}`, m: msg }); s.log.length = Math.min(s.log.length, 60); };

  const onToggleSel = (id, checked) => mutate(s => {
    const m = getM(s, id);
    if (checked) { if (m?.dispatch || s.sel.length >= 5) return; s.sel.push(id); }
    else s.sel = s.sel.filter(x => x !== id);
  });

  const onDispatch = (id, key) => mutate(s => {
    const m = getM(s, id);
    if (!m || m.hero || m.dispatch) return;
    m.dispatch = { key, left: { short: 1, mid: 3, long: 7 }[key] };
    s.sel = s.sel.filter(x => x !== id);
    log(s, `${m.name}出發去${{ short: '短程派遣', mid: '中程派遣', long: '長程派遣' }[key]}了`);
  });

  const onTattooUp = (id) => mutate(s => {
    const m = getM(s, id); if (!m || m.race !== 'barb') return;
    const t = m.tattoo || (m.tattoo = { stage: 0, path: null });
    if (t.stage >= 5 || t.stage === 2) return;
    const cost = TATTOO_COST[t.stage]; if (s.stone < cost) return;
    s.stone -= cost; t.stage++;
    log(s, `${m.name}的靈魂刻印進展到第 ${t.stage} 階`);
  });
  const onTattooPath = (id, key) => mutate(s => {
    const m = getM(s, id); if (!m || m.race !== 'barb' || !TATTOO_PATH[key]) return;
    const t = m.tattoo || (m.tattoo = { stage: 0, path: null });
    if (t.stage !== 2 || t.path) return;
    const cost = TATTOO_COST[2]; if (s.stone < cost) return;
    s.stone -= cost; t.stage = 3; t.path = key;
    log(s, `${m.name}選擇了「${TATTOO_PATH[key].n}」路線!`);
  });
  const onSetPact = (id, key) => mutate(s => {
    const m = getM(s, id); if (!m || m.race !== 'beast' || m.beastPact || m.lv < 2 || !BEASTPACT[key]) return;
    m.beastPact = key;
    log(s, `${m.name}與靈魂獸締結了契約:${BEASTPACT[key].n}`);
  });
  const onSpiritStone = (id, key) => mutate(s => {
    const m = getM(s, id); if (!m || m.race !== 'fairy' || !SPIRIT[key]) return;
    m.spirits = m.spirits || [];
    if (m.spirits.includes(key) || s.stone < SPIRIT_STONE_COST) return;
    s.stone -= SPIRIT_STONE_COST;
    if (Math.random() < SPIRIT_STONE_RATE) { m.spirits.push(key); log(s, `${m.name}的精靈石發揮作用,締結了${SPIRIT[key].n}契約!`); }
    else log(s, `${m.name}的精靈石碎裂了,契約沒有成功。`);
  });

  const onDorm = () => mutate(s => {
    const c = 150 * ECON * s.dorm; if (s.dorm >= 4 || s.stone < c) return;
    s.stone -= c; s.dorm++; log(s, '住處擴建了。');
  });

  const onRecruit = (id) => mutate(s => {
    const m = s.tavern.find(x => x.id === id); if (!m) return;
    const c = (150 + m.lv * 80 + m.ess.length * 120) * ECON;
    if (s.stone < c || s.members.filter(x => !x.dead).length >= 3 + s.dorm * 2) return;
    s.stone -= c; s.members.push(m); s.tavern = s.tavern.filter(x => x !== m);
    log(s, `${m.name} 在酒館加入了隊伍。`);
  });

  const onGear = (id, slot) => mutate(s => {
    const m = getM(s, id); if (!m || m[slot] >= 5) return;
    const c = gearCost(m, m[slot]); if (s.stone < c) return;
    s.stone -= c; m[slot]++; if (slot === 'arm') m.hp += 12;
    log(s, `${m.name} 的${slot === 'wpn' ? '武器' : '防具'}強化到 +${m[slot]}。`);
  });
  const onSwapWeapon = (id, w) => mutate(s => {
    const m = getM(s, id); if (!m || !w) return;
    const p = WEAPON[w].price; if (s.stone < p) return;
    s.stone -= p; m.weapon = w; m.wpn = 0;
    log(s, `${m.name} 換成了${WEAPON[w].n}。`);
  });
  const onHireNav = () => mutate(s => { if (s.navigator || s.stone < 3000 * ECON) return; s.stone -= 3000 * ECON; s.navigator = true; log(s, '雇用了一位航海士,準備好航向大海了。'); });
  const onBuyShip = () => mutate(s => { const c = shipCost(s.ship + 1); if (s.ship >= 3 || s.stone < c) return; s.stone -= c; s.ship++; log(s, `船隻建造/升級到 ${s.ship} 級。`); });

  const onBuyPotion = () => mutate(s => { if (s.stone < 30 * ECON || s.potions >= 5) return; s.stone -= 30 * ECON; s.potions++; });
  const onBuyTorch = () => mutate(s => { if (s.stone < 60 * ECON) return; s.stone -= 60 * ECON; s.torches++; });

  const onTempleHeal = () => mutate(s => {
    const c = healAllCost(s); if (s.stone < c) return;
    s.stone -= c; s.members.filter(m => !m.dead).forEach(m => { m.hp = stats(m).maxhp; });
    log(s, '全員的傷都治好了。');
  });
  const onJoinChurch = (k) => mutate(s => joinChurch(s, k, (msg) => log(s, msg)));
  const onPray = () => mutate(s => pray(s, (msg) => log(s, msg)));
  const onDonateFaith = (key) => mutate(s => donateFaith(s, key, 200 * ECON, (msg) => log(s, msg)));

  const onPassDay = () => mutate(s => processDays(s, 1, (msg) => log(s, msg)));
  const onClaimReq = (id) => mutate(s => claimReq(s, id, (msg) => log(s, msg)));
  const onExam = () => mutate(s => {
    if (!s.sel.length || s.examPassed || s.contrib < 80) return;
    startBattle(s, s.sel, ['examiner'], { exam: 1 });
  });
  const onResearch = (k) => mutate(s => research(s, k, (msg) => log(s, msg)));

  const onEnterLab = () => mutate(s => {
    if (s.debt && s.stone >= s.debt) { s.stone -= s.debt; s.debt = 0; }
    const party = s.sel.map(id => getM(s, id)).filter(m => m && !m.dead);
    if (!party.length || s.day !== 1 || s.debt) return;
    party.forEach(m => { m.soul = stats(m).soul; });
    s.run = { party: party.map(m => m.id), floor: 1, h: 0, loot: { stone: 0, ess: [], items: [] }, prev: null, torchH: 0, witchH: 0, curse: false };
    if ((s.dreadKills || 0) >= 9 || Math.random() < .01) s.run.abyss = true;
    if (Math.random() < .015) s.run.collapsePending = true;
    s.run.map = genFloor1(s);
    s.run.prev = s.run.map.start;
    autoTorch(s);
    s.maxFloor = Math.max(s.maxFloor, 1);
    s.screen = 'dungeon';
    log(s, `${party.map(m => m.name).join('、')} 穿過次元廣場的傳送門,來到第 1 層${FLOORS[1].n}。`);
    if (s.run.abyss) log(s, '水晶洞窟外圍的黑暗裡傳來不屬於這一層的氣息。深淵之主貝爾札克來了,外圍的怪物變成了 5 級的深淵變種。中心部附近還算安全。');
    const msgs = portalXp(s, party, 1);
    msgs.forEach(msg => log(s, msg));
  });

  const tabBody = {
    home: <HomeTab state={state} onDorm={onDorm} />,
    tavern: <TavernTab state={state} onRecruit={onRecruit} />,
    guild: <GuildTab state={state} onClaimReq={onClaimReq} onExam={onExam} />,
    library: <LibraryTab state={state} onResearch={onResearch} />,
    exchange: <PlaceholderTab title="中央交易所" desc="賣精髓、裂縫石和編號物品的地方。" />,
    temple: <TempleTab state={state} onJoinChurch={onJoinChurch} onTempleHeal={onTempleHeal} onPray={onPray} onDonateFaith={onDonateFaith} />,
    smith: <SmithTab state={state} onGear={onGear} onSwapWeapon={onSwapWeapon} onHireNav={onHireNav} onBuyShip={onBuyShip} />,
    store: <StoreTab state={state} onBuyPotion={onBuyPotion} onBuyTorch={onBuyTorch} />,
  }[tab];

  const handlers = { onToggleSel, onDispatch, onTattooUp, onTattooPath, onSetPact, onSpiritStone };

  const portalPanel = (
    <section className="panel">
      <h2>次元廣場</h2>
      {open ? <p className="notice">今天迷宮開啟。錯過要等下個月。</p> : <p className="mute">迷宮每月 1 日開啟,還有 <span className="num">{until}</span> 天。</p>}
      {state.debt > 0 && <p className="notice bad">你還欠 {state.debt} 石幣的稅。欠稅的人進不了次元廣場。</p>}
      <p>{party.length ? party.map(m => m.name).join('、') : <span className="mute">還沒選人</span>} <span className="mute">({party.length}/5)</span></p>
      <p className="mute" style={{ fontSize: 12 }}>目前只搬了第 1 層水晶洞窟,其他樓層跟戰鬥(遇到怪物房)還沒搬過來。</p>
      <div className="row">
        <button className="btn primary" disabled={!(open && party.length && !state.debt)} onClick={onEnterLab}>進入迷宮</button>
        <button className="btn" onClick={onPassDay}>度過一天</button>
      </div>
    </section>
  );

  if (mobile) {
    const body = mobileView === 'team'
      ? <TeamScreen state={state} handlers={handlers} onDone={() => setMobileView('map')} onGoTavern={() => { setTab('tavern'); setMobileView('bldg'); }} />
      : mobileView === 'bag'
      ? <BagScreen state={state} />
      : mobileView === 'bldg'
      ? (
        <>
          <BuildingHeader k={tab} />
          <div className="tabpanel"><div className="tabbody">{tabBody}</div></div>
        </>
      )
      : (
        <>
          <CityMap onEnterBld={k => { setTab(k); setMobileView('bldg'); }} />
          {portalPanel}
          <section className="panel"><button className="btn sm" onClick={onResetSave}>清除存檔,回到開頭</button></section>
        </>
      );
    return (
      <>
        <TopBar state={state} />
        <div className="wrap">
          <div className="camp">
            <section className="panel">{body}</section>
          </div>
        </div>
        <MobileTabBar view={mobileView} open={open} until={until} onNav={setMobileView} />
      </>
    );
  }

  return (
    <>
      <TopBar state={state} />
      <div className="wrap">
        <div className="camp">
          <RosterPanel state={state} handlers={handlers} />
          <div className="side">
            {portalPanel}
            <section className="panel">
              <div className="tabs" role="tablist">
                {Object.entries(BUILDINGS).map(([k, b]) => (
                  <button key={k} className="tab" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}><span className="ic">{b.ic}</span><span className="tl">{b.n}</span></button>
                ))}
              </div>
              <BuildingHeader k={tab} />
              <div>{tabBody}</div>
            </section>
            <section className="panel">
              <button className="btn sm" onClick={onResetSave}>清除存檔,回到開頭</button>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
