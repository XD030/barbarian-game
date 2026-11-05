import { ECON, DT, GRADE } from './data';
import { MON_INFO, monName } from './monInfo';
import { ESS, makeEss, essInfo } from './essence';

/* 中央圖書館的怪物圖鑑這次改成「自己記錄」:不是花錢解鎖,而是遇到(戰鬥裡碰過,
   見 lib/combat.js 的 learn() 寫進 state.encountered)之後,自己猜這隻怪物的弱點/
   抗性屬性,猜對才正式記進 state.known(戰鬥裡能不能自動打弱點也看這個)。這整套猜測
   機制原作沒有提到,是使用者自己的設計,不是原作考據——猜錯一天(全館共用額度,不分
   隻怪物)只有第一次免費重試,之後每次收費翻倍(GUESS_BASE_COST 起跳)。 */
export const GUESS_BASE_COST = 300 * ECON;

const sameSet = (a, b) => a.length === b.length && a.every(x => b.includes(x));

/* 今天第幾次猜測決定要不要收費:第 1 次(全館共用,不分隻)免費,第 2 次起收費翻倍。 */
export function nextGuessCost(state) {
  const n = state.guessCount || 0;
  return n === 0 ? 0 : GUESS_BASE_COST * Math.pow(2, n - 1);
}

export function guessMonster(state, k, weak, resist, log) {
  if (!(state.encountered || []).includes(k) || (state.known || []).includes(k)) return;
  const cost = nextGuessCost(state);
  if (cost > 0) {
    if (state.stone < cost) return;
    state.stone -= cost;
  }
  state.guessCount = (state.guessCount || 0) + 1;
  const d = MON_INFO[k];
  const correct = sameSet(weak, d.weak || []) && sameSet(resist, d.resist || []);
  if (correct) {
    state.known = state.known || [];
    state.known.push(k);
    log(`猜對了!記錄下${monName(k)}的弱點跟抗性。`);
  } else {
    log(cost > 0 ? `猜錯了${monName(k)}的弱點/抗性,花了 ${cost} 石幣。` : `猜錯了${monName(k)}的弱點/抗性,今天還有免費重試機會。`);
  }
}

export function monNote(k) {
  const d = MON_INFO[k], t = d.tags || {}, n = [];
  if (t.passive) n.push('不會主動攻擊');
  if (t.spirit) n.push('靈體,物理攻擊幾乎無效');
  if (t.poison) n.push('攻擊帶毒');
  if (t.stealth) n.push('會融入周圍隱身');
  if (t.curse) n.push('先出手攻擊會被下「怨恨之印」');
  if (t.bind) n.push('會束縛對手');
  if (t.heal) n.push('會治療同伴');
  if (t.buff) n.push('會強化同伴');
  if (t.fear) n.push('會讓人恐懼');
  if (t.silence) n.push('會下沉默,封鎖精髓技能');
  if (t.enrage) n.push('生命降低時會覺醒,越打越強');
  if (t.summon) n.push(`會召喚${monName(t.summon)}`);
  if (t.drain) n.push('攻擊時吸血');
  if (t.noheal) n.push('傷口難以癒合');
  if (d.atkdt) n.push(`${DT[d.atkdt]}屬性攻擊`);
  return n.join('、') || '沒有特別的能力';
}

/* 圖書館常備販售的 9 級精髓(顏色隨機),照原作 LIB_ESS 清單。 */
export const LIB_ESS = ['goblin', 'ghoul', 'gnome', 'bladewolf', 'kobold', 'kobold_shield', 'goblin_archer', 'goblin_sword', 'skel_archer', 'skel_warrior', 'banshee', 'wall_mole'];

export function buyLibEss(state, k, log) {
  if (state.stone < GRADE[9].price || !ESS[k]) return;
  state.stone -= GRADE[9].price;
  const it = makeEss(k);
  state.bag.push(it);
  log(`在圖書館買下${essInfo(it).n}。`);
}
