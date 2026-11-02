import { stayLimit, fmtH, FIELDS } from '../../lib/dungeon';
import { ECON } from '../../lib/data';
import { MON_INFO } from '../../lib/monInfo';
import { FLOORMASTER, RIFTS } from '../../lib/rifts';
import { monName } from '../../lib/monInfo';

function FloorMasterBlock({ fmKey, onFmaster }) {
  const fm = FLOORMASTER[fmKey];
  if (!fm) return null;
  return (
    <>
      <p className="desc" style={{ marginTop: 10 }}>{fm.desc}</p>
      <div className="row"><button className="btn primary" onClick={() => onFmaster(fmKey)}>挑戰{fm.n}</button></div>
    </>
  );
}

export default function EventPanel({ state, r, onCamp, onCampSafe, onWaitClose, onOpenChest, onGather, onDrink, onBuy, onMove, onFight, onSneak, onOffer, onDescend, onFmaster }) {
  const run = state.run;
  const camp = <button className="btn" onClick={onCamp}>紮營休息(8 小時)</button>;
  const wait = <button className="btn primary" onClick={onWaitClose}>在這裡等到迷宮關閉({fmtH(Math.max(0, stayLimit(run) - run.h))})</button>;
  const back = <button className="btn" onClick={() => onMove(run.prev)}>退回上一間</button>;
  const safeRest = <button className="btn" onClick={onCampSafe}>休息(8 小時,不會被偷襲)</button>;

  if (r.type === 'entry') return (
    <>
      <h3>降落點</h3>
      <p className="desc">傳送門把你們丟在這裡。迷宮關閉前沒有辦法回城。</p>
      <div className="row">{camp}</div>
    </>
  );
  if (r.type === 'sage') return (
    <>
      <h3>大賢者紀念碑</h3>
      <p className="desc">水晶洞窟的中心部。古老的石碑旁很少有怪物靠近,是這一層的安全區。可以安心休息,也可以在這裡等到迷宮關閉。</p>
      <div className="row">{safeRest}{wait}</div>
      <FloorMasterBlock fmKey={1} onFmaster={onFmaster} />
      {run.abyss && <FloorMasterBlock fmKey="abyss" onFmaster={onFmaster} />}
    </>
  );
  if (r.type === 'hut') return (
    <>
      <h3>魔女小屋</h3>
      <p className="desc">從樹皮的縫隙鑽進去,是魔女森林裡唯一的安全處。</p>
      <div className="row">{safeRest}{wait}</div>
      <FloorMasterBlock fmKey={3} onFmaster={onFmaster} />
    </>
  );
  if (r.type === 'redstart') return (
    <>
      <h3>大魔境・起始點</h3>
      <p className="desc">紅色的光照著這片安全區。數十條像溜滑梯一樣的峽谷從這裡向外延伸。</p>
      <div className="row">{safeRest}{wait}</div>
      <FloorMasterBlock fmKey={5} onFmaster={onFmaster} />
    </>
  );
  if (r.type === 'seaport') return (
    <>
      <h3>大海・錨地</h3>
      <p className="desc">船停在這裡的淺灘上,算是第 6 層唯一的安全區。</p>
      <div className="row">{safeRest}{wait}</div>
      <FloorMasterBlock fmKey={6} onFmaster={onFmaster} />
    </>
  );
  if (r.type === 'portal') return (
    <>
      <h3>傳送門石碑・往{FIELDS[r.to].n}</h3>
      <p className="desc">第 1 層四個方向各有一座傳送門,這一座通往第 2 層的「{FIELDS[r.to].n}」。第 2 層會在第 10 天關閉。</p>
      <div className="row"><button className="btn primary" onClick={() => onDescend(r.to)}>前往{FIELDS[r.to].n}</button>{camp}</div>
    </>
  );
  if (r.type === 'stairs') {
    if (run.floor === 2) return (
      <>
        <h3>傳送門石碑・往朝聖者之路</h3>
        <p className="desc">往下是第 3 層朝聖者之路,會在第 15 天關閉。</p>
        <div className="row"><button className="btn primary" onClick={() => onDescend()}>前往第 3 層</button>{camp}</div>
        <FloorMasterBlock fmKey={2} onFmaster={onFmaster} />
      </>
    );
    return (
      <>
        <h3>傳送門石碑・往天空之塔</h3>
        <p className="desc">魔女森林中心的傳送門。第 4 層天空之塔是獨立的爬塔小遊戲,還沒搬過來——這座傳送門先進不去。</p>
        <div className="row">{camp}</div>
      </>
    );
  }
  if (r.type === 'f6gate') {
    const ready = state.ship >= 1 && state.navigator;
    if (ready) return (
      <>
        <h3>通往大海的港口</h3>
        <p className="desc">船隻已經備妥,航海士也準備好了。往下是第 6 層大海,要花 60 天才會關閉。</p>
        <div className="row"><button className="btn primary" onClick={() => onDescend()}>揚帆出海</button>{camp}</div>
      </>
    );
    return (
      <>
        <h3>亡靈峽谷的盡頭</h3>
        <p className="desc">再往下是第 6 層大海,但現在過不去。{!state.navigator && '回城裡的鐵匠鋪雇用航海士。'}{state.ship < 1 && '回城裡的鐵匠鋪建造船隻。'}</p>
        <div className="row">{camp}{wait}</div>
      </>
    );
  }
  if (r.type === 'combat' || r.type === 'elite') {
    if (r.cleared) return <><h3>{r.type === 'elite' ? '精英怪物' : '怪物'}</h3><p className="desc">只剩下怪物的殘骸。屍體和素材沒辦法帶出迷宮。</p><div className="row">{camp}</div></>;
    const allPassive = (r.enemies || []).every(k => (MON_INFO[k].tags || {}).passive);
    return (
      <>
        <h3>{r.type === 'elite' ? '強敵擋住去路' : '遭遇怪物'}</h3>
        <p className="desc">{allPassive ? '牠們似乎沒有攻擊的意思。可以繞過去,也可以先出手。' : '不打倒牠們就無法往其他方向前進。'}({(r.enemies || []).map(monName).join('、')})</p>
        <div className="row"><button className="btn primary" onClick={onFight}>迎戰</button>{back}{allPassive && <button className="btn" onClick={onSneak}>悄悄通過</button>}</div>
      </>
    );
  }
  if (r.type === 'altar') {
    const rf = RIFTS[r.rift];
    if (r.cleared) return <><h3>熄滅的祭壇</h3><p className="desc">裂縫已經關閉了。</p><div className="row">{camp}</div></>;
    return (
      <>
        <h3>裂縫祭壇・{rf.n}</h3>
        <p className="desc">獻上 {rf.cost} 石幣價值的魔石(從身上扣),就能打開通往「{rf.n}」的裂縫。守護者「{monName(rf.boss)}」{MON_INFO[rf.boss].g}級。進去之後不打倒守護者就出不來。</p>
        <div className="row"><button className="btn primary" disabled={run.loot.stone < rf.cost} onClick={onOffer}>獻上魔石(身上 {run.loot.stone})</button>{camp}</div>
      </>
    );
  }
  if (r.type === 'rift') {
    const rf = RIFTS[r.rift];
    if (r.cleared) return <><h3>{rf.n}</h3><p className="desc">守護者倒下後,裂縫闔上了。</p><div className="row">{camp}</div></>;
    return (
      <>
        <h3>裂縫:{rf.n}</h3>
        <p className="desc">空間被撕開了一道口子。進去之後無法逃跑。</p>
        <div className="row"><button className="btn primary" onClick={onFight}>進入裂縫</button>{back}</div>
      </>
    );
  }
  if (r.type === 'chest') {
    if (r.cleared) return <><h3>空寶箱</h3><p className="desc">已經被翻過了。</p><div className="row">{camp}</div></>;
    return <><h3>寶箱</h3><p className="desc">一個生鏽的寶箱。</p><div className="row"><button className="btn primary" onClick={onOpenChest}>打開</button></div></>;
  }
  if (r.type === 'resource') {
    if (r.cleared) return <><h3>魔石礦脈</h3><p className="desc">已經採光了。</p><div className="row">{camp}</div></>;
    return <><h3>魔石礦脈</h3><p className="desc">採集要花 4 小時,壓力會增加,可能被怪物撞見。</p><div className="row"><button className="btn primary" onClick={onGather}>採集</button></div></>;
  }
  if (r.type === 'trap') return <><h3>陷阱</h3><p className="desc">{r.note || '機關已經觸發過了。'}</p><div className="row">{camp}</div></>;
  if (r.type === 'spring') {
    if (r.cleared) return <><h3>乾涸的泉水</h3><p className="desc">泉水已經被喝光了。</p><div className="row">{camp}</div></>;
    return <><h3>治癒泉水</h3><p className="desc">全隊回復 40% 生命和魂力,壓力 -12。</p><div className="row"><button className="btn primary" onClick={onDrink}>飲用泉水</button></div></>;
  }
  if (r.type === 'merchant') return (
    <>
      <h3>流浪商人</h3>
      <p className="desc">在迷宮裡做生意的探險者,收你身上的魔石({run.loot.stone})。</p>
      <div className="row">
        <button className="btn" disabled={run.loot.stone < 45 * ECON || state.potions >= 5} onClick={() => onBuy('potion')}>藥水 · {45 * ECON}</button>
        <button className="btn" disabled={run.loot.stone < 80 * ECON} onClick={() => onBuy('torch')}>火把 · {80 * ECON}</button>
        <button className="btn" disabled={run.loot.stone < 40 * ECON} onClick={() => onBuy('calm')}>鎮定香 全隊壓力 -20 · {40 * ECON}</button>
        <button className="btn" disabled={run.loot.stone < 60 * ECON} onClick={() => onBuy('soul')}>魂力藥劑 · {60 * ECON}</button>
      </div>
    </>
  );
  return <><h3>空地</h3><p className="desc">{r.note || '寂靜得令人不安。'}</p><div className="row">{camp}</div></>;
}
