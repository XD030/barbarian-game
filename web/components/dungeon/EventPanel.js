import { stayLimit, fmtH } from '../../lib/dungeon';
import { ECON } from '../../lib/data';

export default function EventPanel({ state, r, onCamp, onCampSafe, onWaitClose, onOpenChest, onGather, onDrink, onBuy, onMove, onFight }) {
  const run = state.run;
  const camp = <button className="btn" onClick={onCamp}>紮營休息(8 小時)</button>;
  const wait = <button className="btn primary" onClick={onWaitClose}>在這裡等到迷宮關閉({fmtH(Math.max(0, stayLimit(run) - run.h))})</button>;
  const back = <button className="btn" onClick={() => onMove(run.prev)}>退回上一間</button>;

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
      <div className="row"><button className="btn" onClick={onCampSafe}>休息(8 小時,不會被偷襲)</button>{wait}</div>
      <p className="mute" style={{ fontSize: 12 }}>層主挑戰還沒搬過來(需要戰鬥引擎)。</p>
    </>
  );
  if (r.type === 'combat') {
    if (r.cleared) return <><h3>怪物</h3><p className="desc">只剩下怪物的殘骸。屍體和素材沒辦法帶出迷宮。</p><div className="row">{camp}</div></>;
    return (
      <>
        <h3>遭遇怪物</h3>
        <p className="desc">{(r.enemies || []).length} 隻怪物擋住了去路。打倒牠們才能繼續往其他方向前進。</p>
        <div className="row"><button className="btn primary" onClick={onFight}>開戰</button>{back}</div>
      </>
    );
  }
  if (r.type === 'chest') {
    if (r.cleared) return <><h3>空寶箱</h3><p className="desc">已經被翻過了。</p><div className="row">{camp}</div></>;
    return <><h3>寶箱</h3><p className="desc">一個生鏽的寶箱。</p><div className="row"><button className="btn primary" onClick={onOpenChest}>打開</button></div></>;
  }
  if (r.type === 'resource') {
    if (r.cleared) return <><h3>魔石礦脈</h3><p className="desc">已經採光了。</p><div className="row">{camp}</div></>;
    return <><h3>魔石礦脈</h3><p className="desc">採集要花 4 小時,壓力會增加。</p><div className="row"><button className="btn primary" onClick={onGather}>採集</button></div></>;
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
