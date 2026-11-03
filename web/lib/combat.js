/* 從 index.html 的回合制戰鬥系統(ATB 排序 + 指令制)搬過來的戰鬥引擎。
   跟原本最大的差異:原本用 DOM + async/await(sleep 製造動畫節奏)逐步播放每個動作,
   這裡改成同步解析——玩家送出指令後,立刻把「自己這回合」跟後面所有非玩家回合
   (敵人、或開了自動的玩家角色)一次算完,直到遇到下一個需要玩家操作的回合,或戰鬥結束為止。
   沒有逐幀動畫/飄字特效,改成一條文字戰鬥紀錄(B.log)。
   戰鬥狀態放在 state.battle(不是 state.run.battle),因為公會考核(opt.exam)是在城市畫面打的,
   沒有 state.run 可以掛。一般戰鬥房/伏擊/寶箱陷阱/採集被打擾/裂縫/層主/天空之塔(opt.tower)/
   次元崩壞(opt.collapse)都已經接上。場域特效(B.fx,跟著目前場域走)也接上了:魔女森林
   witch 不影響戰鬥本身(影響的是移動時的壓力,在 dungeon.js 的 moveTo)、餘燼烙印 ember(技能
   魂力消耗 ×1.5、玩家每回合開始灼燒 4% 最大生命)、嚴寒 frost(玩家速度 -15%,除非帶保溫石)、
   地縛靈 specter(玩家受到傷害 +25%)。女妖的「怨恨之印」(run.curse)也接上了:主動攻擊有
   curse 標籤的怪物(目前只有死者之地的女妖 banshee)會中咒,移動壓力多 +60%,直到離開迷宮。 */
import { WEAPON, GRADE, ECON } from './data';
import { stats, hasT, memberPas, numEff } from './stats';
import { ESS, essInfo, makeEss, memberActs } from './essence';
import { SK } from './skills';
import { MON_INFO, monName } from './monInfo';
import { MON_COMBAT } from './monCombat';
import { killMember, addStress, gainXp } from './city';
import { roomHasFoes, advanceTime, stayLimit, towerChoices, returnToCity, FIELDS, curField } from './dungeon';
import { processDays } from './city';
import { refreshShop } from './guild';
import { RIFTS, FLOORMASTER } from './rifts';
import { randomNum } from './num';

const PHYS = ['slash', 'pierce', 'blunt'];
export const INTENT_LABEL = {
  atk: '攻擊', aoe: '範圍攻擊', charge: '準備蓄力', smash: '重擊!', summon: '召喚', bind: '束縛',
  fear: '恐嚇', silence: '沉默', enrage: '力量覺醒', enrage2: '徹底覺醒', heal: '治療', buff: '強化同伴', watch: '觀望',
};

const ri = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
const aliveU = u => u && !u.dead && !u.down;
const buffSum = (u, k) => u.buffs.reduce((a, b) => a + (typeof b[k] === 'number' ? b[k] : 0), 0);
const hasBuff = (u, k) => u.buffs.some(b => b[k]);
const healU = (u, amt) => { if (hasBuff(u, 'noheal')) return 0; const b = u.hp; u.hp = Math.min(u.maxhp, u.hp + amt); return Math.round(u.hp - b); };
const effSpd = u => u.spd * Math.max(.3, 1 + buffSum(u, 'spd') + (u.momentum || 0) * .05);

export const isKnown = (state, k) => state.known.includes(k);
const learn = (state, k) => { if (k && MON_INFO[k] && !state.known.includes(k)) state.known.push(k); };

function heroUnit(m) {
  const st = stats(m), w = WEAPON[m.weapon], pas = memberPas(m);
  return {
    side: 'p', m, name: m.name, hp: Math.max(1, m.hp), maxhp: st.maxhp, atk: st.atk, def: st.def, spd: st.spd, mres: st.mres,
    soul: Math.min(st.soul, m.soul), soulMax: st.soul, crit: st.crit, ls: st.ls, regen: st.regen,
    dt: w.dt, w, line: w.line * (m.race === 'barb' && m.tattoo && m.tattoo.path === 'wild' ? 3 : 1),
    skills: memberActs(m), pas, num: numEff(m), buffs: [], momentum: 0,
  };
}
function monUnit(key) {
  const info = MON_INFO[key], d = MON_COMBAT[key], t = info.tags || {};
  const u = {
    side: 'e', key, name: info.n, g: info.g, hp: d.hp, maxhp: d.hp, atk: d.atk, def: d.def, spd: d.spd,
    mres: d.mres ?? (10 - info.g) * 3, weak: info.weak || [], resist: info.resist || [], tough: d.tough, toughMax: d.tough,
    broken: false, boss: !!info.boss, elite: !!info.elite, noEss: !!info.noEss, atkdt: info.atkdt || null, tags: t,
    summoned: false, buffs: [], intent: t.passive ? 'watch' : 'atk', pat: 0, provoked: !t.passive,
  };
  if (t.stealth) u.buffs.push({ label: '隱身', untarget: 1, t: 1 });
  return u;
}
function labelDupes(B) {
  const cnt = {};
  B.units.filter(u => u.side === 'e').forEach(u => { cnt[u.key] = (cnt[u.key] || 0) + 1; });
  const seen = {};
  B.units.filter(u => u.side === 'e').forEach(u => { seen[u.key] = (seen[u.key] || 0) + 1; if (cnt[u.key] > 1) u.name = MON_INFO[u.key].n + ' ' + 'ABCDEFGH'[seen[u.key] - 1]; });
}

function targetable(B, side, viewer) {
  const foes = B.units.filter(u => u.side === side && aliveU(u));
  const vis = foes.filter(u => !hasBuff(u, 'untarget') || (viewer && viewer.pas && viewer.pas.includes('scent')));
  return vis.length ? vis : foes;
}
function curTarget(state, B, a) {
  const foes = targetable(B, 'e', a);
  if (!foes.length) return null;
  if (B.target && foes.includes(B.target)) return B.target;
  return foes.find(u => isKnown(state, u.key) && u.weak.includes(a.dt)) || foes[0];
}
function partyTarget(B) {
  const p = targetable(B, 'p');
  if (!p.length) return null;
  const tz = p.filter(u => hasBuff(u, 'taunt'));
  if (tz.length) return pick(tz);
  const tot = p.reduce((a, u) => a + u.line, 0);
  let r = Math.random() * tot;
  for (const u of p) { r -= u.line; if (r <= 0) return u; }
  return p[0];
}

export function skillCost(B, a, k) { let c = SK[k].cost * (1 - Math.min(.5, buffSum(a, 'costdown'))); if (B && B.fx === 'ember') c *= 1.5; return Math.round(c); }

function addBuff(B, u, b, label) {
  u.buffs = u.buffs.filter(x => x.label !== label);
  u.buffs.push({ ...b, label, fresh: B.actor === u });
}
function applyStatus(B, t, kind, src) {
  if (!aliveU(t)) return;
  if (kind === 'poison') { t.buffs = t.buffs.filter(b => b.label !== '中毒'); t.buffs.push({ label: '中毒', dot: Math.max(2, src.atk * .3), t: 3 }); B.log.push(`${t.name} 中毒了`); }
  if (kind === 'bleed') { t.buffs = t.buffs.filter(b => b.label !== '流血'); t.buffs.push({ label: '流血', dot: t.maxhp * .05, t: 3 }); B.log.push(`${t.name} 流血了`); }
  if (kind === 'burn') { t.buffs = t.buffs.filter(b => b.label !== '燃燒'); t.buffs.push({ label: '燃燒', dot: Math.max(2, src.atk * .35), t: 3 }); B.log.push(`${t.name} 燃燒了`); }
}
function tickBuffs(u) {
  u.buffs.forEach(b => { if (b.fresh) { b.fresh = false; return; } if (!b.bind) b.t--; });
  u.buffs = u.buffs.filter(b => b.t > 0);
}
function dots(state, B, a) {
  for (const b of a.buffs.filter(x => x.dot)) {
    const d = Math.max(1, Math.round(b.dot));
    a.hp -= d;
    B.log.push(`${a.name} ${b.label} -${d}`);
    if (a.hp <= 0) { fall(state, B, a, null); return true; }
  }
  return false;
}

function effAtk(u) {
  let a = u.atk * (1 + buffSum(u, 'atk'));
  if (hasBuff(u, 'madness')) a += u.def * 2;
  if (u.side === 'p') {
    const s = u.m.stress;
    if (s >= 100) a *= .7; else if (s >= 70) a *= .9;
    if (u.num.rage && u.hp < u.maxhp * .3) a *= 1 + u.num.rage;
  }
  return a;
}
function effDef(u, magic) {
  if (!magic && hasBuff(u, 'madness')) return 0;
  const base = magic ? u.mres : u.def;
  const k = 1 + buffSum(u, magic ? 'mres' : 'def') * (magic ? 0 : 1);
  let v = base * k + (magic ? buffSum(u, 'mres') : 0);
  if (u.side === 'p' && u.pas.includes('herosPath') && u.hp < u.maxhp * .5) v *= 1.5;
  return Math.max(0, v);
}

function hit(state, B, src, t, mult, dt, brk, opt) {
  if (!aliveU(t)) return;
  const phys = !dt || PHYS.includes(dt);
  const dodge = buffSum(t, 'dodge') + (t.side === 'p' && phys && t.pas.includes('rottenSlime') ? .15 : 0);
  if (dodge > 0 && Math.random() < dodge) { B.log.push(`${t.name} 閃避了`); return; }
  const counter = t.buffs.find(b => b.counter);
  let atk = effAtk(src);
  const nm = src.buffs.find(b => b.nextMul);
  if (nm) { atk *= nm.nextMul; src.buffs = src.buffs.filter(b => b !== nm); }
  let ignore = opt.ignore;
  if (src.side === 'p' && src.pas.includes('ambush') && !src.ambushed) { src.ambushed = true; ignore = true; }
  let def = ignore ? 0 : effDef(t, !phys);
  if (src.side === 'p' && src.w.pen) def *= 1 - src.w.pen;
  let dmg = atk * mult * rnd(.9, 1.1) * (phys ? 1 - def / (def + 40) : 1 - def / (def + 60));
  let tag = '';
  if (t.side === 'e' && dt) {
    if (t.weak.includes(dt)) { dmg *= 1.4; tag = 'weak'; }
    else if (t.resist.includes(dt)) { dmg *= .6; tag = 'resist'; }
    if (t.tags.spirit && phys) { dmg *= .35; tag = 'resist'; }
  }
  if (t.broken) dmg *= 1.25;
  dmg *= 1 + buffSum(t, 'vuln');
  const crit = Math.random() < (src.crit || .05) + buffSum(src, 'crit');
  if (crit) dmg *= 1.5;
  let note = '';
  if (t.defend) dmg *= .5;
  if (t.side === 'p' && t.w.block && Math.random() < t.w.block) { dmg *= .4; note = '格擋'; }
  dmg = Math.max(1, Math.round(dmg));
  if (t.side === 'p' && t.pas.includes('chivalry') && !t.chiv && t.hp - dmg <= 0) { t.chiv = true; dmg = Math.max(0, t.hp - 1); note = '騎士道'; }
  t.hp -= dmg;
  const bind = t.buffs.find(b => b.bind);
  if (bind && dmg > 0) t.buffs = t.buffs.filter(b => b !== bind);
  if (t.side === 'e' && !t.provoked) { t.provoked = true; t.intent = decideIntent(t, B); }
  if (t.side === 'e') learn(state, t.key);
  let label = `${t.name} ${tag === 'weak' ? '弱點 ' : tag === 'resist' ? '抵抗 ' : ''}-${dmg}`;
  if (crit) label = '爆擊!' + label;
  if (note) label += `(${note})`;
  B.log.push(label);
  if (t.side === 'p') addStress(t.m, 1.5);
  if (t.side === 'e' && tag === 'weak' && !t.broken && brk && t.hp > 0) {
    t.tough -= brk * ((src.w && src.w.brk) || 1);
    if (t.tough <= 0) { t.tough = 0; t.broken = true; t.av += 5000 / t.spd; const ex = Math.round(src.atk * .5); t.hp -= ex; B.log.push(`${t.name} 體勢崩潰,追加 ${ex} 傷害`); }
  }
  if (t.hp > 0) {
    if (opt.delay) { t.av += opt.delay * 10000 / t.spd; B.log.push(`${t.name} 行動延後`); }
    if (src.side === 'p' && src.w.stun && Math.random() < src.w.stun) { t.av += 3500 / t.spd; B.log.push(`${t.name} 踉蹌`); }
    if (src.side === 'p' && src.pas.includes('paralyzeHit') && Math.random() < .2) { t.av += 3000 / t.spd; B.log.push(`${t.name} 麻痺`); }
    if (opt.status) applyStatus(B, t, opt.status, src);
    if (src.side === 'p' && (hasBuff(src, 'poisonHit') || (src.pas.includes('poisonArrow') && Math.random() < .3))) applyStatus(B, t, 'poison', src);
    if (src.side === 'e' && src.tags.poison && Math.random() < src.tags.poison) applyStatus(B, t, 'poison', src);
    if (src.side === 'e' && src.tags.noheal) addBuff(B, t, { noheal: 1, t: 2 }, '怨念');
    if (src.side === 'p' && src.m.race === 'barb' && src.m.tattoo && src.m.tattoo.path === 'flame' && Math.random() < .2) applyStatus(B, t, 'burn', src);
    if (src.side === 'p' && src.m.race === 'fairy' && src.m.spirits && src.m.spirits.includes('fire') && Math.random() < .15) applyStatus(B, t, 'burn', src);
  }
  const drain = (src.ls || 0) + (opt.drain || 0) + (src.side === 'e' ? src.tags.drain || 0 : 0);
  if (drain && aliveU(src)) { const h = healU(src, dmg * drain); if (h > 0) B.log.push(`${src.name} 回復 ${h}`); }
  const th = buffSum(t, 'thorns');
  if (th && aliveU(src)) { const r = Math.max(1, Math.round(dmg * th)); src.hp -= r; B.log.push(`${src.name} 反彈 -${r}`); if (src.hp <= 0) fall(state, B, src, t); }
  if (counter && aliveU(src) && t.hp > 0) { t.buffs = t.buffs.filter(b => b !== counter); const r = Math.round(effAtk(t) * counter.counter); src.hp -= r; src.av += 3000 / src.spd; B.log.push(`陷阱反擊,${src.name} -${r}`); if (src.hp <= 0) fall(state, B, src, t); }
  if (src.side === 'p' && src.m.race === 'beast' && src.m.beastPact === 'summon' && !opt.beastProc && aliveU(t) && Math.random() < .25) { B.log.push('靈魂獸追擊!'); hit(state, B, src, t, .4, null, 0, { beastProc: 1, multi: 1 }); }
  if (t.hp <= 0) fall(state, B, t, src);
}

function fall(state, B, t, src) {
  if (t.side === 'p') {
    if (t.down) return;
    t.down = true; t.hp = 0;
    B.log.push(`${t.name} 倒下了`);
    B.units.filter(u => u.side === 'p' && aliveU(u)).forEach(u => addStress(u.m, 8));
    return;
  }
  if (t.dead) return;
  t.dead = true; t.hp = 0;
  if (B.target === t) B.target = null;
  if (!B.opt.exam) {
    state.kc[t.key] = (state.kc[t.key] || 0) + 1;
    const G = GRADE[t.g];
    const greedy = 1 + B.units.filter(u => u.side === 'p' && hasT(u.m, 'greedy')).length * .1;
    B.loot.stone += Math.round(G.stone * greedy);
    if (!B.kills.includes(t.key)) B.kills.push(t.key);
  }
  B.log.push(`${t.name} 倒下了`);
  if (B.opt.exam || t.noEss) return;
  if (t.boss && (B.opt.rift || B.opt.fmaster)) {
    if (Math.random() < .33) { const it = makeEss(t.key, true); B.loot.ess.push(it); B.log.push('守護者精髓!'); }
    if (Math.random() < .33) { B.loot.items.push(randomNum()); B.log.push('編號物品!'); }
    if (B.opt.rift) { if (Math.random() < .33) { B.loot.items.push({ type: 'riftstone', f: B.f }); B.log.push('裂縫石'); } }
    else if (Math.random() < .33) { B.loot.stone += 400 * ECON; B.log.push('大量魔石!'); }
    return;
  }
  const pu = B.units.filter(u => u.side === 'p');
  const luck = pu.reduce((a, u) => a + (hasT(u.m, 'lucky') ? .01 : 0) + (hasT(u.m, 'bg_hunter') ? .01 : 0) + (u.pas.includes('greed') ? .02 : 0) + (u.num.luck || 0), 0);
  const drop = (t.boss ? .5 : .01) + luck;
  if (ESS[t.key] && Math.random() < drop) { const it = makeEss(t.key); B.loot.ess.push(it); B.log.push('掉落了精髓!'); }
  if (src && src.side === 'p' && hasT(src.m, 'bloodlust') && aliveU(src)) healU(src, src.maxhp * .1);
}

function decideIntent(a, B) {
  const t = a.tags;
  if (a.intent === 'charge') return 'smash';
  if (a.boss) { const pat = ['atk', t.aoe ? 'aoe' : 'atk', t.bind ? 'bind' : t.fear ? 'fear' : t.silence ? 'silence' : 'atk', t.heavy ? 'charge' : 'atk']; const it = pat[a.pat % pat.length]; a.pat++; return it; }
  const r = Math.random();
  if (t.heal && B.units.some(u => u.side === 'e' && aliveU(u) && u.hp / u.maxhp < .6) && r < .5) return 'heal';
  if (t.buff && r < .2) return 'buff';
  if (t.bind && r < .22) return 'bind';
  if (t.fear && r < .2) return 'fear';
  if (t.heavy && r < .25) return 'charge';
  if (t.aoe && r < .3) return 'aoe';
  return 'atk';
}
function enemyAct(a, B) {
  if (a.tags.summon && !a.summoned && a.hp < a.maxhp * .5 && B.units.filter(u => u.side === 'e' && aliveU(u)).length < 5) return { type: 'summon' };
  if (a.tags.enrage && !a.enraged && a.hp < a.maxhp * .5) return { type: 'enrage' };
  if (a.tags.enrage && a.enraged && !a.enraged2 && a.hp < a.maxhp * .2) return { type: 'enrage2' };
  return { type: a.intent };
}
function autoChoose(state, B, a) {
  const foes = targetable(B, 'e', a), allies = B.units.filter(u => u.side === 'p' && aliveU(u));
  const silenced = hasBuff(a, 'silence');
  const can = k => !silenced && a.soul >= skillCost(B, a, k);
  const low = allies.filter(u => u.hp / u.maxhp < .5).length;
  for (const k of a.skills) {
    const s = SK[k]; if (!can(k)) continue;
    if (s.kind === 'heal' && low >= 1) return { type: 'sk', k };
    if (s.kind === 'aoe' && foes.length >= 2) return { type: 'sk', k };
    if (s.kind === 'team' && !a.buffs.some(b => b.label === s.label) && Math.random() < .5) return { type: 'sk', k };
  }
  const t = foes.find(f => isKnown(state, f.key) && f.weak.includes(a.dt) && !f.broken) || foes.reduce((x, y) => y.hp < x.hp ? y : x, foes[0]);
  for (const k of a.skills) { const s = SK[k]; if (can(k) && ['single', 'multi', 'debuff'].includes(s.kind) && a.soul >= skillCost(B, a, k) + 10) return { type: 'sk', k, t }; }
  if (a.hp / a.maxhp < .3 && state.potions && Math.random() < .5) return { type: 'pot' };
  return { type: 'atk', t };
}

function perform(state, B, a, act) {
  const foesOf = u => targetable(B, u.side === 'p' ? 'e' : 'p', u);
  const allyOf = u => B.units.filter(x => x.side === u.side && aliveU(x));
  if (a.side === 'e') {
    switch (act.type) {
      case 'summon': { a.summoned = true; B.log.push(`${a.name} 召喚!`); for (let i = 0; i < 2; i++) { const s = monUnit(a.tags.summon); s.av = 10000 / effSpd(s); B.units.push(s); } labelDupes(B); break; }
      case 'charge': B.log.push(`${a.name} 蓄力中……`); break;
      case 'smash': { const t = partyTarget(B); if (t) { B.log.push(`${a.name} 重擊!`); hit(state, B, a, t, 2.3, a.atkdt, 0, {}); } break; }
      case 'aoe': { B.log.push(`${a.name} 範圍攻擊!`); for (const t of foesOf(a)) hit(state, B, a, t, .75, a.atkdt, 0, { multi: 1 }); break; }
      case 'bind': { const t = partyTarget(B); if (t) { B.log.push(`${a.name} 束縛!`); addBuff(B, t, { bind: 1, t: 3 }, '束縛'); } break; }
      case 'fear': { B.log.push(`${a.name} 恐嚇!`); foesOf(a).forEach(t => { const resist = t.m && t.m.race === 'barb'; addBuff(B, t, { atk: resist ? -.1 : -.25, t: 2 }, '恐懼'); }); break; }
      case 'silence': { B.log.push(`${a.name} 沉默!`); foesOf(a).forEach(t => addBuff(B, t, { silence: 1, t: 2 }, '沉默')); break; }
      case 'enrage': { a.enraged = true; B.log.push(`${a.name} 力量覺醒!`); addBuff(B, a, { atk: .3, def: .25, t: 99 }, '覺醒'); break; }
      case 'enrage2': { a.enraged2 = true; B.log.push(`${a.name} 徹底覺醒!`); addBuff(B, a, { atk: .3, def: .25, t: 99 }, '徹底覺醒'); break; }
      case 'heal': { const al = allyOf(a); const t = al.reduce((x, y) => y.hp / y.maxhp < x.hp / x.maxhp ? y : x, al[0]); const h = healU(t, t.maxhp * .25); B.log.push(`${a.name} 治療了 ${t.name} +${h}`); break; }
      case 'buff': { B.log.push(`${a.name} 強化同伴`); allyOf(a).forEach(t => addBuff(B, t, { def: .5, t: 2 }, '狂熱')); break; }
      default: { const t = partyTarget(B); if (t) hit(state, B, a, t, 1, a.atkdt, 0, {}); }
    }
    if (!['summon', 'enrage', 'enrage2'].includes(act.type) && !a.dead) a.intent = decideIntent(a, B);
    return;
  }
  switch (act.type) {
    case 'atk': { const t = act.t && aliveU(act.t) ? act.t : curTarget(state, B, a); if (!t) return; a.soul = Math.min(a.soulMax, a.soul + 12); hit(state, B, a, t, 1, a.dt, 10, {}); break; }
    case 'def': a.defend = true; a.soul = Math.min(a.soulMax, a.soul + 15); B.log.push(`${a.name} 防禦`); break;
    case 'pot': { if (!state.potions) return; state.potions--; const al = allyOf(a); const t = al.reduce((x, y) => y.hp / y.maxhp < x.hp / x.maxhp ? y : x, al[0]); const h = healU(t, t.maxhp * .4); B.log.push(h ? `${t.name} 喝下藥水 +${h}` : `${t.name} 已經滿血了`); break; }
    case 'flee': { if (Math.random() < .7) { B.log.push('逃跑成功!'); B.fled = true; B.over = true; } else B.log.push('逃跑失敗!'); break; }
    case 'sk': {
      const s = SK[act.k]; a.soul -= skillCost(B, a, act.k); B.log.push(`${a.name} 使用「${s.n}」`);
      const dt = s.dt || a.dt, mult = (s.mult || 0) * (a.pas.includes('corrupted') ? 1.5 : 1);
      const st = act.t && aliveU(act.t) ? act.t : curTarget(state, B, a);
      if (s.kind === 'single') { if (st) hit(state, B, a, st, mult, dt, s.brk, { ignore: s.ignore, drain: s.drain, status: s.status, delay: s.delay }); }
      else if (s.kind === 'multi') { for (let i = 0; i < s.hits; i++) { const fs = foesOf(a); if (!fs.length) break; hit(state, B, a, pick(fs), mult, dt, s.brk, { status: s.status }); } }
      else if (s.kind === 'aoe') { for (const t of foesOf(a)) { hit(state, B, a, t, mult, dt, s.brk, { multi: 1 }); if (s.debuff && aliveU(t)) addBuff(B, t, s.debuff, s.label); } }
      else if (s.kind === 'debuff') { if (st) { if (mult) hit(state, B, a, st, mult, dt, 10, { status: s.status }); if (aliveU(st)) { addBuff(B, st, s.debuff, s.label); B.log.push(`${st.name} ${s.label}`); } } }
      else if (s.kind === 'debuffAll') { for (const t of foesOf(a)) { addBuff(B, t, s.debuff, s.label); if (s.status) applyStatus(B, t, s.status, a); } }
      else if (s.kind === 'self') { addBuff(B, a, s.buff, s.label || s.n); if (s.heal) { const h = healU(a, a.maxhp * s.heal); if (h) B.log.push(`${a.name} +${h}`); } }
      else if (s.kind === 'team') { allyOf(a).forEach(u => addBuff(B, u, s.buff, s.label)); }
      else if (s.kind === 'ally') { const al = allyOf(a); const t = al.reduce((x, y) => y.hp / y.maxhp < x.hp / x.maxhp ? y : x, al[0]); addBuff(B, t, s.buff, s.label); }
      else if (s.kind === 'heal') { for (const u of allyOf(a)) { const h = healU(u, u.maxhp * s.heal); if (s.buff) addBuff(B, u, s.buff, s.label); B.log.push(h ? `${u.name} +${h}` : `${u.name} 無法回復`); } }
      else if (s.kind === 'random') { if (st) { const r = ri(0, 3); if (r === 0) hit(state, B, a, st, 2.0, 'dark', 20, {}); else if (r === 1) { addBuff(B, st, { bind: 1, t: 3 }, '束縛'); B.log.push(`${st.name} 束縛`); } else if (r === 2) { applyStatus(B, st, 'poison', a); applyStatus(B, st, 'bleed', a); } else { addBuff(B, st, { atk: -.3, def: -.3, t: 3 }, '詛咒'); B.log.push(`${st.name} 詛咒`); } } }
      break;
    }
  }
}

function nextActor(B) {
  const live = B.units.filter(aliveU);
  let a = live[0];
  for (const u of live) if (u.av < a.av) a = u;
  const t = a.av;
  live.forEach(u => u.av -= t);
  return a;
}
function checkEnd(B) {
  const pa = B.units.some(u => u.side === 'p' && aliveU(u)), ea = B.units.some(u => u.side === 'e' && aliveU(u));
  if (!pa || !ea) { B.over = true; B.win = !ea && pa; }
}
function takeTurn(state, B, a, autoAct) {
  if (dots(state, B, a)) return;
  const bind = a.buffs.find(b => b.bind);
  if (bind) { a.buffs = a.buffs.filter(b => b !== bind); B.log.push(`${a.name} 被束縛,無法行動`); return; }
  if (a.side === 'e') {
    if (a.broken) { a.broken = false; a.tough = a.toughMax; a.intent = decideIntent(a, B); B.log.push(`${a.name} 恢復體勢`); tickBuffs(a); return; }
    if (a.tags.regen && a.hp < a.maxhp) { const h = healU(a, a.maxhp * a.tags.regen); if (h) B.log.push(`${a.name} +${h}`); }
    if (!a.provoked) { tickBuffs(a); return; }
    perform(state, B, a, enemyAct(a, B));
    if (!B.over) tickBuffs(a);
    return;
  }
  a.defend = false;
  if (B.fx === 'ember') { const d = Math.round(a.maxhp * .04); a.hp -= d; B.log.push(`${a.name} 灼燒 -${d}`); if (a.hp <= 0) { fall(state, B, a, null); return; } }
  if (a.regen) healU(a, a.maxhp * a.regen);
  a.soul = Math.min(a.soulMax, a.soul + a.soulMax * .08);
  if (a.m.stress >= 100 && Math.random() < .2) { B.log.push(`${a.name} 發抖,無法行動`); tickBuffs(a); return; }
  perform(state, B, a, autoAct);
  if (!B.over) { tickBuffs(a); if (a.pas.includes('momentum')) a.momentum = Math.min(3, (a.momentum || 0) + 1); }
}
function runLoop(state, B) {
  let guard = 0;
  while (!B.over && guard++ < 800) {
    const a = nextActor(B);
    B.actor = a; B.turn++;
    if (a.side === 'p' && !B.auto) { B.waiting = true; return; }
    const autoAct = a.side === 'p' ? autoChoose(state, B, a) : null;
    takeTurn(state, B, a, autoAct);
    if (B.over) break;
    a.av = 10000 / effSpd(a);
    checkEnd(B);
  }
  B.waiting = false;
  if (B.log.length > 120) B.log = B.log.slice(-120);
}

export function startBattle(state, partyIds, enemyKeys, opt = {}) {
  const run = state.run;
  const party = partyIds.map(id => state.members.find(m => m.id === id)).filter(m => m && !m.dead && (opt.exam || m.hp > 0));
  const units = party.map(heroUnit).concat(enemyKeys.map(k => monUnit(k)));
  const fx = run && !opt.exam ? FIELDS[curField(run)]?.fx : null;
  units.forEach(u => {
    if (u.side !== 'p') return;
    if (fx === 'frost' && !u.num.warm) u.buffs.push({ label: '嚴寒', spd: -.15, t: 99 });
    if (fx === 'specter') u.buffs.push({ label: '地縛靈', vuln: .25, t: 99 });
  });
  let newCurse = false;
  if (run && !opt.ambush && !opt.exam && !run.curse && enemyKeys.some(k => (MON_INFO[k].tags || {}).curse)) { run.curse = true; newCurse = true; }
  units.forEach(u => { u.av = 10000 / effSpd(u) * (u.side === 'e' && opt.ambush ? .6 : 1); });
  const B = { units, over: false, win: false, fled: false, opt, f: state.run ? state.run.floor : 0, loot: { stone: 0, ess: [], items: [] }, kills: [], log: [], turn: 0, auto: false, actor: null, waiting: false, target: null, fx };
  state.battle = B;
  state.screen = 'battle';
  labelDupes(B);
  B.log.push(opt.exam ? '晉級考試開始!' : opt.ambush ? '遭到偷襲!' : '戰鬥開始!');
  if (newCurse) B.log.push('你們先對女妖出手,被下了「怨恨之印」。詛咒會跟著你們直到離開迷宮。');
  runLoop(state, B);
}
export function setTarget(state, idx) {
  const B = state.battle; if (!B) return;
  const u = B.units[idx];
  if (!u || !aliveU(u)) return;
  if (hasBuff(u, 'untarget') && !(B.actor && B.actor.pas && B.actor.pas.includes('scent'))) return;
  B.target = u;
}
export function buildPlayerAct(state, kind, skillKey) {
  const B = state.battle, a = B.actor;
  if (kind === 'atk') return { type: 'atk', t: curTarget(state, B, a) };
  if (kind === 'def') return { type: 'def' };
  if (kind === 'pot') return state.potions && !B.opt.exam ? { type: 'pot' } : null;
  if (kind === 'flee') return B.opt.exam ? null : { type: 'flee' };
  if (kind === 'sk') {
    if (hasBuff(a, 'silence') || a.soul < skillCost(B, a, skillKey)) return null;
    return { type: 'sk', k: skillKey, t: curTarget(state, B, a) };
  }
  return null;
}
export function submitAction(state, act) {
  const B = state.battle;
  if (!B || !B.waiting || !act) return;
  const a = B.actor;
  B.waiting = false;
  takeTurn(state, B, a, act);
  if (!B.over) { a.av = 10000 / effSpd(a); checkEnd(B); }
  if (!B.over) runLoop(state, B); else if (B.log.length > 120) B.log = B.log.slice(-120);
}
export function toggleAuto(state) {
  const B = state.battle; if (!B) return;
  B.auto = !B.auto;
  if (B.auto && B.waiting) submitAction(state, autoChoose(state, B, B.actor));
}

function wipeOut(state, deaths, log) {
  const run = state.run;
  const days = Math.max(1, Math.floor(stayLimit(run) / 24)) + 1;
  state.run = null; state.screen = 'base';
  processDays(state, days, log);
  log(state, `隊伍在第 ${run.floor} 層全滅${deaths.length ? `(${deaths.join('、')})` : ''},身上的戰利品全部遺失。`);
}

export function resolveBattle(state, log) {
  const B = state.battle;
  if (!B || !B.over) return;
  const pu = B.units.filter(u => u.side === 'p');
  B.units.filter(u => u.side === 'e').forEach(u => learn(state, u.key));

  if (B.opt.exam) {
    for (const u of pu) { const m = u.m; m.soul = u.soul; m.hp = Math.max(1, Math.round(u.down ? u.maxhp * .2 : u.hp)); }
    state.battle = null; state.screen = 'base';
    if (B.win) { state.examPassed = true; state.fame += 10; log(state, '通過了 5 級晉級考試!公會的認證上限提高到 4 級。'); refreshShop(state); }
    else log(state, '晉級考試沒有通過。下次再來。');
    return;
  }

  const run = state.run;
  if (B.fled) {
    const lost = [];
    for (const u of pu) {
      const m = u.m; m.soul = u.soul;
      if (u.down) { if (Math.random() < .15 && !m.hero) { lost.push(m.name); killMember(state, m, log); continue; } m.hp = Math.max(1, Math.round(u.maxhp * .1)); }
      else m.hp = Math.max(1, Math.round(u.hp));
      addStress(m, 12);
    }
    run.party = run.party.filter(id => { const m = state.members.find(x => x.id === id); return m && !m.dead; });
    if (run.map && !B.opt.ambush && !B.opt.tower) run.map.cur = run.prev;
    state.battle = null; state.screen = 'dungeon';
    if (!run.party.length) { wipeOut(state, lost, log); return; }
    log(state, lost.length ? `逃跑時 ${lost.join('、')} 沒能跟上……` : '你們狼狽地逃了出來。');
    return;
  }
  const win = B.win, loot = B.loot, kills = [...B.kills], deaths = [], downed = [], xpLines = [];
  if (win) {
    for (const u of pu) {
      const m = u.m; m.soul = u.soul;
      if (u.down) { if (Math.random() < .3) { deaths.push(m.name); killMember(state, m, log); continue; } m.hp = Math.max(1, Math.round(u.maxhp * .1)); addStress(m, 20); downed.push(m.name); }
      else m.hp = Math.max(1, Math.round(u.hp));
      addStress(m, 3 + run.floor);
      let xp = 0; const fresh = [];
      for (const k of kills) { if (!m.kills.includes(k)) { m.kills.push(k); xp += GRADE[MON_INFO[k].g].xp; fresh.push(monName(k)); } }
      if (B.opt.rift) xp += 3;
      if (B.opt.fmaster) xp += 5;
      if (xp) { const ups = gainXp(m, xp); xpLines.push(`${m.name}:${fresh.length ? `第一次打倒${fresh.join('、')}` : ''}${B.opt.rift ? `${fresh.length ? ',' : ''}打倒守護者 +3` : ''}${B.opt.fmaster ? `${fresh.length ? ',' : ''}打倒層主 +5` : ''},經驗 +${xp}${ups.length ? `,升到 Lv${m.lv}!` : ''}`); }
    }
    run.party = run.party.filter(id => { const m = state.members.find(x => x.id === id); return m && !m.dead; });
    run.loot.stone += loot.stone; run.loot.ess.push(...loot.ess); run.loot.items.push(...loot.items);
    if (run.map && !B.opt.tower && !B.opt.collapse) { const room = run.map.rooms[run.map.cur]; if (room && roomHasFoes(room)) room.cleared = true; }
    if (B.opt.rift) { state.riftCD[B.opt.riftKey] = state.month + 2; state.riftsCleared++; state.fame += 5; log(state, `打倒了裂縫「${RIFTS[B.opt.riftKey].n}」的守護者。`); }
    if (B.opt.tower && run.tower) {
      if (B.opt.boss) { run.tower.guardDone = true; }
      else { run.tower.stage = Math.min(100, run.tower.stage + (run.tower.pending || 0)); run.tower.choices = towerChoices(); }
    }
    if (B.opt.collapse && run.collapse) { run.collapse.wave++; }
    if (B.opt.fmaster) {
      state.floorBoss = state.floorBoss || {};
      if (!state.floorBoss[B.opt.fmaster]) { state.floorBoss[B.opt.fmaster] = true; state.fame += 8; }
      log(state, `打倒了第 ${B.opt.fmaster} 層的層主「${FLOORMASTER[B.opt.fmaster].n}」!`);
      if (B.opt.fmaster === 1) { state.dreadKills = (state.dreadKills || 0) + 1; if (state.dreadKills >= 9) log(state, '接連打倒了九次「恐懼之主」,深處傳來了更深沉的氣息……'); }
      if (B.opt.fmaster === 'abyss') state.dreadKills = 0;
      if (B.opt.fmaster === 4 && pu.length === 1) { state.stone += 800 * ECON; log(state, `${pu[0].m.name} 獨自打倒了天空之主,守衛認可了這份孤高的實力,額外獲得 ${800 * ECON} 石幣。`); }
    }
  } else if (B.opt.fmaster === 1) {
    const victim = pick(pu).m;
    deaths.push(victim.name); killMember(state, victim, log);
    pu.filter(u => u.m !== victim).forEach(u => { u.m.soul = u.soul; u.m.hp = Math.max(1, Math.round(u.maxhp * .2)); addStress(u.m, 15); });
    run.party = run.party.filter(id => { const m = state.members.find(x => x.id === id); return m && !m.dead; });
    state.battle = null;
    if (!run.party.length) { wipeOut(state, deaths, log); return; }
    state.screen = 'dungeon';
    advanceTime(state, 2);
    run.loot.stone += loot.stone; run.loot.ess.push(...loot.ess); run.loot.items.push(...loot.items);
    log(state, `恐懼之主消失前,拖走了觸發這場戰鬥的${victim.name},其他人僥倖逃了回來。`);
    return;
  } else {
    for (const u of pu) { deaths.push(u.m.name); killMember(state, u.m, log); }
    run.party = [];
  }
  state.battle = null;
  if (!run.party.length) { wipeOut(state, deaths, log); return; }
  state.screen = 'dungeon';
  if (B.opt.collapse && run.collapse && run.collapse.wave >= run.collapse.total) {
    returnToCity(state, log, '撐過了次元崩壞', '最後一波結束,扭曲的空間把你們吐回了次元廣場。混亂中撿到的東西都還在身上。', true);
    return;
  }
  advanceTime(state, 2);
  const parts = [`魔石 +${loot.stone}`];
  if (loot.ess.length) parts.push(`取得:${loot.ess.map(it => essInfo(it).n).join('、')}`);
  log(state, (win ? '戰鬥勝利!' : '全隊倒下……') + ' ' + parts.join('、'));
  xpLines.forEach(l => log(state, l));
  if (downed.length) log(state, `${downed.join('、')} 重傷撿回一命,壓力大增。`);
  if (deaths.length) log(state, `${deaths.join('、')} 傷得太重,沒能撐下去。`);
  if (B.opt.tower && !B.opt.boss && run.tower) log(state, `天空之塔:第 ${run.tower.stage} 階`);
}
