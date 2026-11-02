import { ECON } from './data';

/* 從 index.html 搬過來的編號物品表(迷宮寶箱/層主掉落,不是精髓)。
   r:稀有度(單/雙/三 代表幾個詞條)、eff:裝備後的固定加成、price:直接賣出的價格。 */
export const NUM = {
  n9999: { n: 'No.9999 擴充型背包', r: '單', d: '全滅時,身上的戰利品保留一半', eff: { keepLoot: 1 }, price: 400 * ECON },
  n8811: { n: 'No.8811 迅捷長靴', r: '單', d: '速度 +8', eff: { spd: 8 }, price: 350 * ECON },
  n7702: { n: 'No.7702 鐵壁護符', r: '單', d: '防禦 +5', eff: { def: 5 }, price: 350 * ECON },
  n6630: { n: 'No.6630 魂石墜飾', r: '單', d: '魂力 +25', eff: { soul: 25 }, price: 350 * ECON },
  n0303: { n: 'No.303 保溫石', r: '單', d: '不受寒冷影響(冰霜峽谷、冰河洞窟)', eff: { warm: 1 }, price: 300 * ECON },
  n5148: { n: 'No.5148 吸血鬼之牙', r: '雙', d: '吸血 10%', eff: { ls: .1 }, price: 800 * ECON },
  n4410: { n: 'No.4410 再生指環', r: '雙', d: '每回合回復 4% 生命', eff: { regen: .04 }, price: 800 * ECON },
  n3307: { n: 'No.3307 先知之眼', r: '雙', d: '迷宮中能看清兩格內的房間', eff: { sight: 1 }, price: 900 * ECON },
  n2725: { n: 'No.2725 幸運硬幣', r: '雙', d: '精髓掉落率 +2%', eff: { luck: .02 }, price: 900 * ECON },
  n1964: { n: 'No.1964 狂戰士之血', r: '雙', d: '生命低於 30% 時攻擊 +40%', eff: { rage: .4 }, price: 800 * ECON },
  n0911: { n: 'No.911 破魔戒指', r: '雙', d: '魔抗 +15', eff: { mres: 15 }, price: 800 * ECON },
  n0077: { n: 'No.77 英雄的護手', r: '三', d: '攻擊 +8、爆擊率 +8%', eff: { atk: 8, crit: .08 }, price: 2500 * ECON },
};

export function randomNum() {
  const ids = Object.keys(NUM);
  const w = ids.map(id => NUM[id].r === '三' ? 1 : NUM[id].r === '雙' ? 4 : 8);
  let s = Math.random() * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < ids.length; i++) { s -= w[i]; if (s <= 0) return { type: 'num', id: ids[i], ided: false }; }
  return { type: 'num', id: ids[0], ided: false };
}
