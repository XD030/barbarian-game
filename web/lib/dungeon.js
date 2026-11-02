import { ECON } from './data';
import { stats } from './stats';
import { processDays } from './city';

const ri = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];

/* 這一階段(迷宮探索)只搬了第 1 層水晶洞窟,其他樓層的 FIELDS/genFloor
   分支還沒搬過來(需要怪物資料 MON,留到戰鬥階段一起做)。 */
export const FLOORS = {
  1: { n: '水晶洞窟', stay: 7 },
  2: { n: '第 2 層', stay: 10 },
  3: { n: '朝聖者之路', stay: 15 },
  4: { n: '天空之塔', stay: 23 },
  5: { n: '大魔境', stay: 30 },
  6: { n: '大海', stay: 60 },
};

export const FIELDS = {
  ccN: { n: '水晶洞窟・北(哥布林)', pool: ['goblin'], light: 1 },
  ccS: { n: '水晶洞窟・南(食屍鬼)', pool: ['ghoul'], light: 1 },
  ccE: { n: '水晶洞窟・東(刃狼)', pool: ['bladewolf'], light: 1 },
  ccW: { n: '水晶洞窟・西(地精)', pool: ['gnome'], light: 1 },
  ccC: { n: '水晶洞窟・中心部', pool: [], light: 1, safe: 1 },
};

export const RT = {
  entry: { g: '入', n: '降落點' }, combat: { g: '戰', n: '怪物' }, chest: { g: '寶', n: '寶箱' },
  resource: { g: '晶', n: '魔石礦脈' }, trap: { g: '陷', n: '陷阱' }, spring: { g: '泉', n: '治癒泉水' },
  merchant: { g: '商', n: '流浪商人' }, empty: { g: '空', n: '空地' }, portal: { g: '門', n: '傳送門石碑' },
  sage: { g: '碑', n: '大賢者紀念碑' },
};
export const SAFE_ROOMS = ['sage'];

function makeGrid(W, H, s0) {
  const N = W * H, rooms = [...Array(N)].map((_, i) => ({ x: i % W, y: Math.floor(i / W), type: 'empty', visited: false, cleared: false, links: [] }));
  const link = (a, b) => { if (a !== b && !rooms[a].links.includes(b)) { rooms[a].links.push(b); rooms[b].links.push(a); } };
  const nb = i => { const x = i % W, y = Math.floor(i / W), o = []; if (x > 0) o.push(i - 1); if (x < W - 1) o.push(i + 1); if (y > 0) o.push(i - W); if (y < H - 1) o.push(i + W); return o; };
  const seen = new Set([s0]), stack = [s0];
  while (stack.length) { const c = stack[stack.length - 1]; const opts = nb(c).filter(n => !seen.has(n)); if (!opts.length) { stack.pop(); continue; } const n = pick(opts); link(c, n); seen.add(n); stack.push(n); }
  for (let k = 0; k < Math.ceil(N / 4); k++) { const a = ri(0, N - 1); link(a, pick(nb(a))); }
  return rooms;
}

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function genEnemies(field) {
  const fd = FIELDS[field], pool = fd.pool.length ? fd.pool : ['goblin'];
  const n = clamp(2 + ri(0, 1), 2, 5); // 第 1 層固定算 f=1
  return Array.from({ length: n }, () => pick(pool));
}

// 原本 fillRooms 還有 elite/altar(裂縫)兩種房型,都需要還沒搬過來的怪物/裂縫資料,先從房間池拿掉。
function fillRooms(rooms, ids) {
  const bag = ['combat', 'combat', 'combat', 'resource', 'resource', 'chest', 'trap', 'spring', 'empty'];
  ids = [...ids].sort(() => Math.random() - .5);
  let k = 0;
  if (ids.length > k && Math.random() < .3) rooms[ids[k++]].type = 'merchant';
  for (; k < ids.length; k++) {
    const r = rooms[ids[k]];
    r.type = pick(bag);
    if (r.type === 'combat') r.enemies = genEnemies(r.field);
    if (r.type === 'chest' && Math.random() < .12) { r.mimic = true; r.enemies = genEnemies(r.field); }
  }
}

export function genFloor1() {
  const W = 5, H = 5, c = 12;
  const rooms = makeGrid(W, H, c);
  rooms.forEach((r, i) => {
    const dx = r.x - 2, dy = r.y - 2;
    r.field = !dx && !dy ? 'ccC' : Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'ccE' : 'ccW') : Math.abs(dy) > Math.abs(dx) ? (dy > 0 ? 'ccS' : 'ccN') : pick([dx > 0 ? 'ccE' : 'ccW', dy > 0 ? 'ccS' : 'ccN']);
  });
  rooms[c].type = 'sage'; rooms[c].cleared = true;
  const cand = rooms.map((_, i) => i).filter(i => i !== c);
  const start = pick(cand); rooms[start].type = 'entry';
  fillRooms(rooms, cand.filter(i => i !== start));
  rooms[start].visited = true; rooms[start].cleared = true;
  return { f: 1, W, H, rooms, start, cur: start };
}

export const stayLimit = run => FLOORS[run.floor].stay * 24;
export const curField = run => run.map.rooms[run.map.cur].field;
export const roomHasFoes = r => !r.cleared && r.type === 'combat';
export const reachable = (map, i) => map.rooms[i].visited || map.rooms[i].links.some(j => map.rooms[j].visited);
export const visible = (map, i) => {
  const r = map.rooms[i];
  if (r.visited || r.seen) return true;
  return r.links.some(j => map.rooms[j].visited);
};
export function fmtH(h) { const d = Math.floor(h / 24), hh = Math.floor(h % 24); return d ? `${d} 天 ${hh} 小時` : `${hh} 小時`; }

export function portalXp(s, party, f) {
  const out = [];
  for (const m of party) {
    if (!m.floors.includes(f)) {
      m.floors.push(f);
      const before = m.lv;
      m.xp += 2;
      while (m.lv < 11 && m.xp >= [0, 0, 3, 7, 12, 18, 26, 36, 48, 62, 78, 96][m.lv + 1]) m.lv++;
      out.push(`${m.name} 第一次開啟第 ${f} 層的傳送門,經驗 +2${m.lv > before ? `,升到 Lv${m.lv}!` : ''}`);
    }
  }
  if (out.length && f > 1) s.fame += 3;
  return out;
}

function restParty(party, pct, stress) {
  party.forEach(m => { const st = stats(m); m.hp = Math.min(st.maxhp, m.hp + st.maxhp * pct); m.stress = Math.max(0, m.stress - stress); });
}

// 回傳 true 代表這次推進時間把迷宮關閉時間用完了(已經自動回城)。
export function advanceTime(s, h) {
  const run = s.run;
  run.h += h;
  partyMembers(s).forEach(m => { const st = stats(m); m.soul = Math.min(st.soul, m.soul + st.soul * .03 * h); });
  if (run.h >= stayLimit(run)) { eject(s); return true; }
  return false;
}

export function partyMembers(s) { return s.run.party.map(id => s.members.find(m => m.id === id)).filter(m => m && !m.dead); }

export function returnToCity(s, log, title, lead) {
  const run = s.run, L = run.loot;
  s.stone += L.stone;
  const days = Math.floor(run.h / 24) + 1;
  const names = partyMembers(s).map(m => m.name).join('、');
  s.run = null; s.screen = 'base';
  processDays(s, days, (msg) => log(s, msg));
  log(s, `${names || '隊伍'} 回到拉夫多尼亞,帶回 ${L.stone} 石幣的魔石。`);
  s.lastReturn = { title, lead, days, stone: L.stone };
}

export function eject(s) {
  returnToCity(s, (s, msg) => { s.log.unshift({ d: `${s.month}/${s.day}`, m: msg }); }, '迷宮關閉了', '關閉的時間到了。一陣暈眩之後,你們在隔天中午出現在次元廣場。');
}

export function moveTo(s, log, i) {
  const run = s.run, map = run.map, cur = map.rooms[map.cur];
  if (!cur.links.includes(i)) return;
  if (roomHasFoes(cur) && i !== run.prev) return;
  run.prev = map.cur; map.cur = i;
  partyMembers(s).forEach(m => { m.stress = Math.min(100, m.stress + 2.5); });
  if (advanceTime(s, 5)) return;
  const r = map.rooms[i];
  if (!r.visited) { r.visited = true; onEnter(partyMembers(s), r); }
}

// 回傳值:null = 平安無事,否則是伏擊怪物的 key 陣列(交給呼叫端去 startBattle)。
export function camp(s) {
  const run = s.run;
  restParty(partyMembers(s), .25, 6);
  if (advanceTime(s, 8)) return null;
  const fieldK = curField(run), pool = FIELDS[fieldK]?.pool || [];
  if (Math.random() < .2 && pool.length) return genEnemies(fieldK);
  return null;
}
export function campSafe(s) {
  restParty(partyMembers(s), .35, 10);
  advanceTime(s, 8);
}
export function waitClose(s, log) {
  const run = s.run, h = stayLimit(run) - run.h;
  restParty(partyMembers(s), 1, 30);
  advanceTime(s, Math.max(1, h));
}

// 回傳 {msg, ambush}:ambush 非空時是機關怪物的 key 陣列,呼叫端要接著開戰。
export function openChest(s) {
  const run = s.run, r = run.map.rooms[run.map.cur];
  if (r.cleared) return null;
  if (r.mimic) { r.type = 'combat'; r.mimic = false; return { msg: '寶箱是陷阱,怪物衝了出來!', ambush: r.enemies }; }
  const f = run.floor, st = Math.round((ri(10, 25) * f + f * 8) * ECON);
  run.loot.stone += st;
  let msg = `魔石 +${st}`;
  if (Math.random() < .25 && s.potions < 5) { s.potions++; msg += ',以及一瓶藥水'; }
  r.cleared = true;
  return { msg, ambush: null };
}

// 回傳 {msg, ambush},同 openChest。
export function gather(s) {
  const run = s.run, r = run.map.rooms[run.map.cur];
  if (r.cleared) return null;
  const f = run.floor, v = Math.round(ri(20, 35) * f * ECON);
  run.loot.stone += v;
  partyMembers(s).forEach(m => { m.stress = Math.min(100, m.stress + 5); });
  r.cleared = true;
  if (advanceTime(s, 4)) return { msg: `魔石 +${v}`, ambush: null };
  const pool = FIELDS[r.field]?.pool || [];
  if (pool.length && Math.random() < .25) {
    r.type = 'combat'; r.cleared = false; const enemies = genEnemies(r.field); r.enemies = enemies;
    return { msg: `魔石 +${v}。採集的聲音引來了怪物!`, ambush: enemies };
  }
  return { msg: `魔石 +${v}`, ambush: null };
}

export function drink(s) {
  const r = s.run.map.rooms[s.run.map.cur];
  if (r.cleared) return;
  partyMembers(s).forEach(m => { const st = stats(m); m.hp = Math.min(st.maxhp, m.hp + st.maxhp * .4); m.soul = Math.min(st.soul, m.soul + st.soul * .4); m.stress = Math.max(0, m.stress - 12); });
  r.cleared = true;
}

export function buyAtMerchant(s, key) {
  const run = s.run;
  const price = { potion: 45 * ECON, torch: 80 * ECON, calm: 40 * ECON, soul: 60 * ECON }[key];
  if (run.loot.stone < price) return;
  if (key === 'potion') { if (s.potions >= 5) return; s.potions++; }
  if (key === 'torch') s.torches++;
  if (key === 'calm') partyMembers(s).forEach(m => { m.stress = Math.max(0, m.stress - 20); });
  if (key === 'soul') partyMembers(s).forEach(m => { m.soul = stats(m).soul; });
  run.loot.stone -= price;
}

export function onEnter(party, r) {
  if (r.type === 'trap') {
    const spotter = party.find(m => ['elf', 'beast'].includes(m.race) && Math.random() < .6);
    if (spotter) r.note = `${spotter.name} 發現了地上的機關,大家繞了過去。`;
    else {
      const v = pick(party), d = Math.round(stats(v).maxhp * .2);
      v.hp = Math.max(1, v.hp - d);
      v.stress = Math.min(100, v.stress + 8);
      r.note = `陷阱啟動了,${v.name} 受到 ${d} 點傷害。`;
    }
    r.cleared = true;
  }
  if (r.type === 'empty') { party.forEach(m => { m.stress = Math.min(100, m.stress + 2); }); r.cleared = true; }
}

export { restParty };
