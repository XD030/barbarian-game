import { RACE, WEAPON, ECON, TATTOO_PATH, TATTOO_COST, BEASTPACT, SPIRIT, SPIRIT_STONE_COST, SPIRIT_STONE_RATE, LV_XP, MAXLV } from './data';
import { hasT, stats } from './stats';
import { makeMember } from './state';
import { refreshShop } from './guild';
import { makeEss } from './essence';

function stressMult(m) { let k = 1; if (hasT(m, 'brave')) k *= .7; if (hasT(m, 'coward')) k *= 1.4; if (hasT(m, 'bg_drifter')) k *= .7; if (m.race === 'barb') k *= .85; return k; }
export function addStress(m, v) { m.stress = Math.max(0, Math.min(100, m.stress + (v > 0 ? v * stressMult(m) : v))); }

export function gainXp(m, xp) {
  m.xp += xp;
  const ups = [];
  while (m.lv < MAXLV && m.xp >= LV_XP[m.lv + 1]) {
    const r = m.hp / stats(m).maxhp;
    m.lv++;
    m.hp = Math.round(r * stats(m).maxhp);
    ups.push(m.lv);
  }
  return ups;
}

/* 戰鬥死亡:主角(m.hero)就算死了也留在隊伍裡(m.dead=true),等以後的「蘇生之石」復活;
   一般隊員直接從 state.members 移除。 */
export function killMember(state, m, log) {
  if (m.hero) {
    m.dead = true; m.hp = 0;
    state.sel = state.sel.filter(id => id !== m.id);
    log(state, `${m.name} 死在了迷宮裡。遺體在迷宮關閉時被送回,安置在神殿。`);
    return;
  }
  state.members = state.members.filter(x => x.id !== m.id);
  state.sel = state.sel.filter(id => id !== m.id);
  state.fallen = state.fallen || [];
  state.fallen.push({ name: m.name, lv: m.lv, d: `${state.month}/${state.day}` });
  if (m.num) { state.items = state.items || []; state.items.push(m.num); }
  log(state, `${m.name}(Lv${m.lv})死在了迷宮裡。`);
}

const ri = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];

export const DAYS_IN_MONTH = 30;
export const LIVING = 2 * ECON, TAX = 20 * ECON, POTION = 30 * ECON, TORCH = 60 * ECON, MAXPOT = 5;

export const capacity = state => 3 + state.dorm * 2;
export const living = state => state.members.filter(m => !m.dead);
export const taxOf = m => Math.round(TAX * (RACE[m.race].tax ?? 1));
export const livingCost = (state, m) => {
  const heindelLv = state.church === 'heindel' ? (state.faith?.heindel_moon?.lv || 0) : 0;
  return Math.round(LIVING * (RACE[m.race].live || 1) * (hasT(m, 'glutton') ? 2 : 1) * (state.carnon ? .85 : 1) * (1 - heindelLv * .03));
};

export const DISPATCH_MISSIONS = {
  short: { n: '短程派遣', days: 1, rate: 15 * ECON },
  mid: { n: '中程派遣', days: 3, rate: 18 * ECON },
  long: { n: '長程派遣', days: 7, rate: 22 * ECON },
};
export const dispatchSlots = state => state.dorm + 1;
export const activeDispatches = state => living(state).filter(m => m.dispatch).length;

export const TAVERN_TIERS = [
  { lv: 1, cond: () => true, w: 5, label: '' },
  { lv: 2, cond: () => true, w: 4, label: '' },
  { lv: 3, cond: s => s.fame >= 15, w: 3, label: '名聲達到 15' },
  { lv: 4, cond: s => s.fame >= 35 && s.contrib >= 20, w: 2, label: '名聲 35、貢獻點 20' },
  { lv: 5, cond: s => s.fame >= 60 && s.contrib >= 30, w: 1.4, label: '名聲 60、貢獻點 30(公會 6 級認證)' },
  { lv: 6, cond: s => s.fame >= 90 && s.maxFloor >= 3, w: 1, label: '名聲 90、抵達過第 3 層' },
  { lv: 7, cond: s => s.fame >= 130 && s.maxFloor >= 5 && s.contrib >= 80, w: .7, label: '名聲 130、抵達過第 5 層、貢獻點 80' },
];
export const tavernUnlocked = state => TAVERN_TIERS.filter(t => t.cond(state));
export const recruitCost = m => (150 + m.lv * 80 + m.ess.length * 120) * ECON;

const TAVERN_ESS_POOL = ['goblin', 'ghoul', 'gnome', 'bladewolf', 'kobold', 'goblin_archer'];

export function refreshTavern(state) {
  const unlocked = tavernUnlocked(state);
  state.tavern = Array.from({ length: 4 }, () => {
    const totalW = unlocked.reduce((a, t) => a + t.w, 0);
    let r = Math.random() * totalW, tier = unlocked[unlocked.length - 1];
    for (const t of unlocked) { if (r < t.w) { tier = t; break; } r -= t.w; }
    const ess = Math.random() < .2 + tier.lv * .05 ? [makeEss(pick(TAVERN_ESS_POOL))] : [];
    return makeMember(state, { lv: tier.lv, ess });
  });
}

export function gearCost(m, t) { return Math.round(80 * ECON * (t + 1) * (RACE[m.race].forge || 1)); }
export function shipCost(t) { return (t === 1 ? 4000 : t === 2 ? 9000 : 16000) * ECON; }
export function removeCost(state) { return 500 * ECON * Math.pow(2, state.removals); }
export function healAllCost(state) { return living(state).reduce((a, m) => a + Math.ceil((stats(m).maxhp - m.hp) / 2 * ECON), 0); }

/* 走 n 天:派遣倒數/結算、休息回復、生活費、每月繳稅跟換酒館候選人。
   原作裡「打工」已經換成派遣系統,詳見 docs/design-notes.md。 */
export function processDays(state, n, log) {
  for (let d = 0; d < n; d++) {
    let earn = 0;
    state.prayedToday = false;
    state.guessCount = 0;
    for (const m of living(state)) {
      const st = stats(m);
      if (m.dispatch) {
        m.dispatch.left--;
        if (m.dispatch.left <= 0) {
          const ms = DISPATCH_MISSIONS[m.dispatch.key], k = hasT(m, 'diligent') ? 1.5 : hasT(m, 'lazy') ? .5 : 1;
          const reward = Math.round(ms.rate * ms.days * (1 + (m.lv - 1) * .1) * k);
          earn += reward;
          log(`${m.name}結束了${ms.n},帶回 ${reward} 石幣。`);
          m.dispatch = null;
        }
        continue;
      }
      m.hp = Math.min(st.maxhp, m.hp + st.maxhp * .35);
      m.stress = Math.max(0, m.stress - (15 + state.dorm * 6) * (hasT(m, 'insomniac') ? .5 : 1));
      m.soul = st.soul;
    }
    state.stone += earn;
    const cost = living(state).reduce((a, m) => a + livingCost(state, m), 0);
    if (state.stone >= cost) state.stone -= cost;
    else { state.stone = 0; living(state).forEach(m => { addStress(m, 10); m.hp = Math.max(1, m.hp - stats(m).maxhp * .1); }); log('付不出生活費,大家餓著肚子過了一天。'); }
    state.day++;
    if (state.day > DAYS_IN_MONTH) {
      state.day = 1; state.month++;
      const tax = living(state).reduce((a, m) => a + taxOf(m), 0) + state.debt;
      if (state.stone >= tax) { state.stone -= tax; state.debt = 0; if (tax) log(`第 ${state.month} 月開始,繳了 ${tax} 石幣的稅。`); }
      else { state.debt = tax - state.stone; state.stone = 0; log(`稅金不夠繳,還欠 ${state.debt} 石幣。欠稅的人進不了次元廣場。`); }
      refreshShop(state);
    }
    if (state.day === 1 || state.day === 15) refreshTavern(state);
    if (!state.carnon && state.fame >= 150) { state.carnon = true; log('名聲傳到了拉夫多尼亞第 1 區,卡隆的守衛不再攔你——身為受認可的探險者,每天的生活開銷降了一些。'); }
  }
}

export { TATTOO_PATH, TATTOO_COST, BEASTPACT, SPIRIT, SPIRIT_STONE_COST, SPIRIT_STONE_RATE, WEAPON };
