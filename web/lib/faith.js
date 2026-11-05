import { ECON } from './data';

/* 信仰:帳號等級的捐獻升級清單,三個教團各自一條(用 church 欄位區分,畫面只顯示玩家
   加入的那個教團的那一條)。原作完全沒有「玩家捐款換加成」這種系統,查證結果(見
   README「神殿信仰加成」那條筆記)只找到托貝拉教團神官用的「太陽的加護」咒語(解除
   debuff、轉成等量能力加成)當風味參考,雷阿特拉斯/海因德爾兩邊查不到任何蛛絲馬跡,
   這三條效果都是使用者同意後自己設計的,不是原作考據。 */
export const FAITH_BUFFS = [
  { key: 'tobera_sun', church: 'tobera', n: '太陽之血', desc: '呼應托貝拉教團神官的「太陽的加護」咒語,讓隊員在戰鬥中持續有一絲自我治療的能力。每級隊員每回合多回復 1% 最大生命。', baseCost: 150 * ECON, costMul: 1.5, maxLv: 5 },
  { key: 'reatlas_star', church: 'reatlas', n: '星路指引', desc: '雷阿特拉斯教團主掌探險與緣份,祈願能讓運氣站在你這邊。每級擊倒怪物時掉落精髓的機率額外 +1%。', baseCost: 150 * ECON, costMul: 1.5, maxLv: 5 },
  { key: 'heindel_moon', church: 'heindel', n: '月光庇護', desc: '海因德爾教團信奉的月神墨涅鮮少留下記載,但信徒相信她會在夜裡悄悄照看旅人。每級隊伍的每日生活開銷降低 3%。', baseCost: 150 * ECON, costMul: 1.5, maxLv: 5 },
];

export function faithCost(buff, lv) {
  return Math.round(buff.baseCost * Math.pow(buff.costMul ?? 1.4, lv));
}

export function donateFaith(state, key, amount, log) {
  const buff = FAITH_BUFFS.find(b => b.key === key);
  if (!buff) return;
  const f = state.faith[key] || (state.faith[key] = { lv: 0, prog: 0 });
  if (f.lv >= buff.maxLv) return;
  const cost = faithCost(buff, f.lv);
  const step = Math.min(amount, cost - f.prog, state.stone);
  if (step <= 0) return;
  state.stone -= step;
  f.prog += step;
  if (f.prog >= cost) {
    f.lv++; f.prog = 0; state.contrib = (state.contrib || 0) + 1;
    log(`${buff.n}升到 Lv.${f.lv} 了,獲得 1 點貢獻值。`);
  }
}
