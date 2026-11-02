import { RACE, WEAPON, RANDOM_TRAITS, CLASH, NAMES, BARB_NAMES, LV_XP, ECON } from './data';
import { stats } from './stats';

export const SAVE_KEY = 'barbarian-labyrinth-v5';

const ri = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];

export function newState() {
  return {
    v: 5, uid: 1, month: 1, day: 1, stone: 450 * ECON, potions: 2, torches: 1, debt: 0, dorm: 1,
    members: [], bag: [], items: [], tavern: [], shop: [], reqs: [], active: [], contrib: 0, fame: 0, examPassed: false,
    sel: [], log: [], screen: 'intro', draft: null, removals: 0, ship: 0, navigator: false, maxFloor: 1, startFloor: 1, kc: {}, run: null,
    known: [], riftsCleared: 0, reqGenAt: null, church: null, faith: {}, fallen: [], battle: null,
  };
}

export function genName(race, state) {
  const used = new Set((state.members || []).map(m => m.name).concat((state.tavern || []).map(m => m.name)));
  const src = race === 'barb' ? BARB_NAMES : NAMES;
  const opts = src.filter(n => !used.has(n));
  return opts.length ? pick(opts) : pick(src) + ri(2, 9);
}

export function makeMember(state, o = {}) {
  const race = o.race || pick(Object.keys(RACE)), weapon = o.weapon || pick(Object.keys(WEAPON));
  let traits = o.traits;
  if (!traits) {
    traits = [];
    const n = Math.random() < 0.45 ? 2 : 1;
    let g = 0;
    while (traits.length < n && g++ < 50) {
      const t = pick(RANDOM_TRAITS);
      if (!traits.includes(t) && !traits.includes(CLASH[t])) traits.push(t);
    }
  }
  const m = {
    id: state.uid++, name: o.name || genName(race, state), race, weapon, lv: o.lv || 1, xp: LV_XP[o.lv || 1] || 0,
    hp: 1, soul: 0, stress: 0, wpn: 0, arm: 0, traits, ess: o.ess || [], kills: [], floors: [], job: 'rest',
    look: o.look ?? ri(0, 5), num: null, bonusSoul: 0,
  };
  const st = stats(m);
  m.hp = st.maxhp; m.soul = st.soul;
  return m;
}

export function loadSave() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data && data.v === 5 ? data : null;
  } catch { return null; }
}

export function writeSave(state) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch { /* 存檔失敗(例如無痕模式)就先不管 */ }
}
