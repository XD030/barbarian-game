import { ECON, DT } from './data';
import { MON_INFO, monName } from './monInfo';

/* 中央圖書館=付費解鎖的怪物圖鑑。原作裡圖書館唯一的館員拉格納用「書籍探測魔法」
   幫忙找資料,2 年後開始收費,一次 3000 石幣——這裡直接照原作數字(乘上 ECON 經濟
   倍率)當每隻怪物的解鎖費,不分強弱。原作沒有提到圖書館賣精髓或查弱點這種機制,
   這部分是把「花錢查資料」具象化成遊戲裡的圖鑑解鎖。 */
export const RESEARCH_COST = 3000 * ECON;

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

export function research(state, k, log) {
  if (state.stone < RESEARCH_COST || !MON_INFO[k]) return;
  state.known = state.known || [];
  if (state.known.includes(k)) return;
  state.stone -= RESEARCH_COST;
  state.known.push(k);
  log(`花錢請圖書館的拉格納查到了${monName(k)}的資料。`);
}
