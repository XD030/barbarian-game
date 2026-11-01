import { POTION, TORCH, MAXPOT } from '../../../lib/city';

export default function StoreTab({ state, onBuyPotion, onBuyTorch }) {
  return (
    <div className="list">
      <div className="item">
        <span><b>藥水</b></span>
        <button className="btn sm" disabled={state.stone < POTION || state.potions >= MAXPOT} onClick={onBuyPotion}>{POTION}</button>
        <small>戰鬥中或迷宮裡回復 40% 生命。最多帶 {MAXPOT} 瓶(持有 {state.potions})</small>
      </div>
      <div className="item">
        <span><b>魔法火把</b></span>
        <button className="btn sm" disabled={state.stone < TORCH} onClick={onBuyTorch}>{TORCH}</button>
        <small>可以燃燒約 3 天。黑暗的樓層沒有火把只看得到走過的地方(持有 {state.torches})</small>
      </div>
    </div>
  );
}
