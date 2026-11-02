import { ECON } from './data';
import { stats } from './stats';
import { processDays } from './city';
import { FIELD_POOLS, FIELD_FLOOR, fieldFloor } from './fields';
import { RIFTS } from './rifts';

const ri = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; };

/* 樓層生成(搬自 index.html 的 genFloor)。第 4 層「天空之塔」是完全不同的小遊戲
   (爬塔選階梯,不是房間地圖),跟次元崩壞、魔女之眼、火把/黑暗視野系統一樣還沒搬過來——
   這三個留到下一輪再做,見 README。第 1/2/3/5/6 層的房間地圖、精英房、裂縫祭壇、
   層主(在安全區挑戰)都已經接上。 */
export const FLOORS = {
  1: { n: '水晶洞窟', stay: 7 },
  2: { n: '第 2 層', stay: 10 },
  3: { n: '朝聖者之路', stay: 15 },
  4: { n: '天空之塔', stay: 23 },
  5: { n: '大魔境', stay: 30 },
  6: { n: '大海', stay: 60 },
};

export const FIELDS = FIELD_POOLS;

export const RT = {
  entry: { g: '入', n: '降落點' }, combat: { g: '戰', n: '怪物' }, elite: { g: '精', n: '精英怪物' },
  chest: { g: '寶', n: '寶箱' }, resource: { g: '晶', n: '魔石礦脈' }, trap: { g: '陷', n: '陷阱' },
  spring: { g: '泉', n: '治癒泉水' }, merchant: { g: '商', n: '流浪商人' }, empty: { g: '空', n: '空地' },
  portal: { g: '門', n: '傳送門石碑' }, stairs: { g: '門', n: '傳送門石碑' }, sage: { g: '碑', n: '大賢者紀念碑' },
  altar: { g: '壇', n: '裂縫祭壇' }, rift: { g: '裂', n: '裂縫' }, hut: { g: '屋', n: '魔女小屋' },
  redstart: { g: '安', n: '起始點' }, seaport: { g: '錨', n: '錨地' }, f6gate: { g: '海', n: '通往第 6 層' },
};
export const SAFE_ROOMS = ['sage', 'hut', 'redstart', 'seaport'];

function makeGrid(W, H, s0) {
  const N = W * H, rooms = [...Array(N)].map((_, i) => ({ x: i % W, y: Math.floor(i / W), type: 'empty', visited: false, cleared: false, links: [] }));
  const link = (a, b) => { if (a !== b && !rooms[a].links.includes(b)) { rooms[a].links.push(b); rooms[b].links.push(a); } };
  const nb = i => { const x = i % W, y = Math.floor(i / W), o = []; if (x > 0) o.push(i - 1); if (x < W - 1) o.push(i + 1); if (y > 0) o.push(i - W); if (y < H - 1) o.push(i + W); return o; };
  const seen = new Set([s0]), stack = [s0];
  while (stack.length) { const c = stack[stack.length - 1]; const opts = nb(c).filter(n => !seen.has(n)); if (!opts.length) { stack.pop(); continue; } const n = pick(opts); link(c, n); seen.add(n); stack.push(n); }
  for (let k = 0; k < Math.ceil(N / 4); k++) { const a = ri(0, N - 1); link(a, pick(nb(a))); }
  return rooms;
}
function bfs(rooms, s) {
  const d = Array(rooms.length).fill(-1); d[s] = 0; const q = [s];
  while (q.length) { const c = q.shift(); for (const n of rooms[c].links) if (d[n] < 0) { d[n] = d[c] + 1; q.push(n); } }
  return d;
}

export function genEnemies(field, kind) {
  const fd = FIELDS[field], pool = fd.pool.length ? fd.pool : ['goblin'];
  if (kind === 'elite') { const el = fd.elite || [pick(pool)]; const e = Math.random() < .75 ? el[0] : pick(el); return [e, pick(pool), pick(pool)]; }
  if (kind === 'bandit') return Array.from({ length: ri(2, 3) }, () => pick(['bandit', 'bandit', 'bandit_archer']));
  const f = fieldFloor(field) || 1;
  const n = clamp(2 + ri(0, Math.ceil(f / 2)) + (fd.dense ? 1 : 0), 2, 5);
  return Array.from({ length: n }, () => pick(pool));
}

function fillRooms(state, rooms, ids, f) {
  const bag = ['combat', 'combat', 'combat', 'combat', 'combat', 'resource', 'resource', 'chest', 'trap', 'spring', 'empty'];
  ids = shuffle(ids); let k = 0;
  if (f >= 2 && ids.length > k && Math.random() < .7) rooms[ids[k++]].type = 'elite';
  if (ids.length > k && Math.random() < .45) {
    const opts = Object.entries(RIFTS).filter(([rk, r]) => r.f === f && (state.riftCD[rk] || 0) <= state.month);
    if (opts.length) { const r = rooms[ids[k++]]; r.type = 'altar'; r.rift = pick(opts)[0]; }
  }
  if (ids.length > k && Math.random() < .3) rooms[ids[k++]].type = 'merchant';
  for (; k < ids.length; k++) {
    const r = rooms[ids[k]];
    let t = pick(bag);
    const fd = FIELDS[r.field];
    if (t === 'trap' && fd && fd.traps === 0) t = 'combat';
    if (fd && fd.traps >= 3 && Math.random() < .25) t = 'trap';
    r.type = t;
  }
  for (const r of rooms) {
    if (r.type === 'combat' || r.type === 'elite') r.enemies = genEnemies(r.field, r.type);
    if (r.type === 'chest' && Math.random() < .12) { r.mimic = true; r.enemies = genEnemies(r.field, 'combat'); }
  }
}

export function genFloor(state, f) {
  let W, H, rooms, start;
  if (f === 1) {
    W = 5; H = 5; const c = 12;
    rooms = makeGrid(W, H, c);
    rooms.forEach((r, i) => {
      const dx = r.x - 2, dy = r.y - 2;
      r.field = !dx && !dy ? 'ccC' : Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'ccE' : 'ccW') : Math.abs(dy) > Math.abs(dx) ? (dy > 0 ? 'ccS' : 'ccN') : pick([dx > 0 ? 'ccE' : 'ccW', dy > 0 ? 'ccS' : 'ccN']);
    });
    rooms[c].type = 'sage'; rooms[c].cleared = true;
    const tips = { 2: 'gforest', 22: 'dead', 14: 'beast', 10: 'desert' };
    for (const [i, to] of Object.entries(tips)) { rooms[i].type = 'portal'; rooms[i].to = to; }
    const cand = rooms.map((_, i) => i).filter(i => i !== c && !tips[i]);
    start = pick(cand); rooms[start].type = 'entry';
    fillRooms(state, rooms, cand.filter(i => i !== start), 1);
  } else if (f === 2) {
    W = 4; H = 3; start = ri(0, W * H - 1); rooms = makeGrid(W, H, start);
    const field = state.run.field2 || 'dead';
    rooms.forEach(r => r.field = field);
    rooms[start].type = 'entry';
    const d = bfs(rooms, start); let far = 0; d.forEach((v, i) => { if (v > d[far]) far = i; });
    rooms[far].type = 'stairs';
    fillRooms(state, rooms, rooms.map((_, i) => i).filter(i => i !== start && i !== far), 2);
  } else if (f === 3) {
    W = 5; H = 4;
    const fieldOf = (x, y) => x >= 1 && x <= 3 && y >= 1 && y <= 2 ? 'witch' : x <= 1 && y <= 1 ? 'steelhill' : x >= 3 && y <= 1 ? 'orc' : x <= 1 ? 'marsh' : x >= 3 ? 'estuary' : y === 0 ? pick(['steelhill', 'orc']) : pick(['marsh', 'estuary']);
    const outer = []; for (let i = 0; i < W * H; i++) { const x = i % W, y = Math.floor(i / W); if (!(x >= 1 && x <= 3 && y >= 1 && y <= 2)) outer.push(i); }
    start = pick(outer); rooms = makeGrid(W, H, start);
    rooms.forEach(r => r.field = fieldOf(r.x, r.y));
    rooms[start].type = 'entry';
    const witchIdx = rooms.map((r, i) => i).filter(i => rooms[i].field === 'witch');
    const d = bfs(rooms, start);
    const portal = witchIdx.reduce((a, b) => d[b] > d[a] ? b : a, witchIdx[0]);
    rooms[portal].type = 'stairs';
    const hut = pick(witchIdx.filter(i => i !== portal));
    rooms[hut].type = 'hut'; rooms[hut].cleared = true;
    fillRooms(state, rooms, rooms.map((_, i) => i).filter(i => i !== start && i !== portal && i !== hut), 3);
  } else if (f === 5) {
    W = 5; H = 3; start = 7; rooms = makeGrid(W, H, start);
    rooms.forEach(r => r.field = r.x < 2 ? 'hellfire' : r.x > 2 ? 'frost' : 'specter');
    rooms[start].field = 'redstart'; rooms[start].type = 'redstart'; rooms[start].cleared = true; rooms[start].visited = true;
    const g = pick([2, 12]); rooms[g].type = 'f6gate';
    fillRooms(state, rooms, rooms.map((_, i) => i).filter(i => i !== start && i !== g), 5);
  } else if (f === 6) {
    W = 5; H = 3; start = 7; rooms = makeGrid(W, H, start);
    rooms.forEach(r => r.field = r.x < 2 ? 'calmsea' : r.x > 2 ? 'icesea' : 'doldrums');
    rooms[start].field = 'seaport'; rooms[start].type = 'seaport'; rooms[start].cleared = true; rooms[start].visited = true;
    fillRooms(state, rooms, rooms.map((_, i) => i).filter(i => i !== start), 6);
  }
  rooms[start].visited = true; rooms[start].cleared = true;
  return { f, W, H, rooms, start, cur: start };
}
export const genFloor1 = state => genFloor(state, 1);

export const stayLimit = run => FLOORS[run.floor].stay * 24;
export const curField = run => run.map.rooms[run.map.cur].field;
export const roomHasFoes = r => !r.cleared && (r.type === 'combat' || r.type === 'elite' || r.type === 'rift');
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
      if (f === 5) m.bonusSoul = (m.bonusSoul || 0) + 20;
      while (m.lv < 11 && m.xp >= [0, 0, 3, 7, 12, 18, 26, 36, 48, 62, 78, 96][m.lv + 1]) m.lv++;
      out.push(`${m.name} 第一次開啟第 ${f} 層的傳送門,經驗 +2${f === 5 ? ',首次踏入大魔境的成就讓魂力永久 +20' : ''}${m.lv > before ? `,升到 Lv${m.lv}!` : ''}`);
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

function runHas(s, key) { return partyMembers(s).some(m => m.num && m.num.eff && m.num.eff[key]); }

export function returnToCity(s, log, title, lead) {
  const run = s.run, L = run.loot;
  s.stone += L.stone; s.bag.push(...L.ess); s.items.push(...L.items);
  const days = Math.floor(run.h / 24) + 1;
  const names = partyMembers(s).map(m => m.name).join('、');
  s.run = null; s.screen = 'base';
  processDays(s, days, (msg) => log(s, msg));
  log(s, `${names || '隊伍'} 回到拉夫多尼亞,帶回 ${L.stone} 石幣的魔石${L.ess.length ? `、精髓 ${L.ess.length} 顆` : ''}${L.items.length ? `、物品 ${L.items.length} 件` : ''}。`);
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
  if (Math.random() < .2 && (pool.length || run.floor >= 2)) {
    const bandit = run.floor >= 2 && (Math.random() < .4 || !pool.length);
    return bandit ? genEnemies(fieldK, 'bandit') : genEnemies(fieldK, 'combat');
  }
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
    r.type = 'combat'; r.cleared = false; const enemies = genEnemies(r.field, 'combat'); r.enemies = enemies;
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

// 不打你也打不過的被動怪物(目前只有食屍鬼)可以悄悄繞過去,不算開戰。
export function sneak(s) {
  const r = s.run.map.rooms[s.run.map.cur];
  if (!roomHasFoes(s.run.map.rooms[s.run.map.cur])) return;
  r.cleared = true; r.sneaked = true;
}

// 裂縫祭壇:獻上魔石,房間變成裂縫房(開戰才能打)。
export function offerAltar(s) {
  const run = s.run, r = run.map.rooms[run.map.cur];
  if (r.type !== 'altar' || r.cleared) return false;
  const rf = RIFTS[r.rift];
  if (run.loot.stone < rf.cost) return false;
  run.loot.stone -= rf.cost;
  r.type = 'rift'; r.enemies = [rf.boss, ...rf.minions];
  return true;
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

// 第 2 層以後的樓層推進(往下一層的傳送門/樓梯觸發)。目前只接到第 1→2→3 層,
// 跟第 5→6 層(要有船+航海士)。第 3→4 層需要天空之塔(還沒搬過來),先擋下來。
export function descend(s, field) {
  const run = s.run;
  const nf = run.floor + 1;
  if (nf > 6) return false;
  if (nf === 4) return false; // 天空之塔還沒搬過來
  if (nf === 6 && !(s.ship >= 1 && s.navigator)) return false;
  if (nf === 2) run.field2 = field || pick(['beast', 'dead', 'desert', 'gforest']);
  run.floor = nf; run.prev = null;
  run.map = genFloor(s, nf);
  run.prev = run.map.start;
  s.maxFloor = Math.max(s.maxFloor, nf);
  return true;
}

export { restParty, runHas };
