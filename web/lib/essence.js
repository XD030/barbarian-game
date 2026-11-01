/* 從 index.html 搬過來的精髓表(ESS)跟相關計算函式。
   g:精髓等級(9 最弱、4 最強)、st:吸收後加的能力值、acts:對應 SK 表的主動技能、
   pas:對應 PS 表的被動、guard:是不是守護者/層主限定的「守護者精髓」(效果 ×1.5、附帶全部主動)。 */
export const ESS = {
  goblin: { g: 9, st: { atk: 2, def: 1 }, acts: ['trap', 'poisonblade'], pas: 'paralyzeHit' },
  ghoul: { g: 9, st: { hp: 20, spd: 3 }, acts: ['pounce', 'devour'] },
  gnome: { g: 9, st: { def: 3, hp: 10 }, acts: ['merge'] },
  bladewolf: { g: 9, st: { spd: 5, atk: 1 }, acts: ['track'], pas: 'scent' },
  goblin_sword: { g: 9, st: { atk: 3 }, acts: ['rend'], pas: 'paralyzeHit' },
  goblin_archer: { g: 9, st: { spd: 4, atk: 2 }, acts: ['stealth'], pas: 'poisonArrow' },
  kobold: { g: 9, st: { atk: 2, hp: 15 }, acts: ['thrust'] },
  kobold_shield: { g: 9, st: { def: 4, hp: 15 }, acts: ['shieldbash'] },
  fallen_gnome: { g: 9, st: { def: 3, mres: 3 }, acts: ['merge', 'darkbolt'] },
  slime: { g: 9, st: { hp: 35, atk: -2, def: -2, spd: -4 }, acts: ['acid'] },
  skel_warrior: { g: 9, st: { def: 3, atk: 1 }, acts: ['boneguard'] },
  skel_archer: { g: 9, st: { atk: 2, spd: 2 }, acts: ['volley'] },
  skel_mage: { g: 9, st: { soul: 15 }, acts: ['bonespear'] },
  banshee: { g: 9, st: { mres: 8 }, acts: ['wail'] },
  elder_ghoul: { g: 9, st: { hp: 35, spd: 2 }, acts: ['devour'] },
  giant_bladewolf: { g: 9, st: { hp: 20, spd: 4 }, acts: ['rend', 'track'] },
  bloody_bladewolf: { g: 9, st: { spd: 5, ls: .05 }, acts: ['bleed'], pas: 'scent' },
  wall_mole: { g: 9, st: { def: 3, hp: 15 }, acts: ['burrow'] },
  halfmoon_bear: { g: 9, st: { hp: 40, atk: 2 }, acts: ['maul'] },
  fairy: { g: 9, st: { soul: 15, spd: 3 }, acts: ['dust'] },
  wraith: { g: 9, st: { soul: 15, mres: 5 }, acts: ['corpseflame'] },
  witch_lamp: { g: 9, st: { soul: 10 }, acts: ['wisp'] },
  woodman: { g: 9, st: { hp: 30, def: 2 }, acts: ['bark'] },
  frost_wolf: { g: 9, st: { spd: 4, mres: 4 }, acts: ['frostbite'] },
  sabertooth: { g: 8, st: { atk: 5, spd: 3 }, acts: ['rend', 'maul'] },
  werewolf: { g: 8, st: { atk: 5, spd: 4 }, acts: ['frenzy'], pas: 'preserve' },
  death_fiend: { g: 8, st: { hp: 40, def: 2 }, acts: ['ghoulcall'], pas: 'preserve' },
  chimera_wolf: { g: 8, st: { atk: 3, hp: 30 }, acts: ['triplebite'] },
  ghoul_lord: { g: 8, st: { hp: 50, ls: .06 }, acts: ['devour', 'ghoulcall'] },
  stone_golem: { g: 8, st: { def: 5, hp: 40 }, acts: ['restraint'] },
  monolith: { g: 8, st: { def: 6, hp: 50 }, acts: ['stoneskin'] },
  sandman: { g: 8, st: { mres: 5, spd: 3 }, acts: ['sandstorm'] },
  sandworm: { g: 8, st: { hp: 50, atk: 2 }, acts: ['swallow'] },
  wormstone: { g: 8, st: { def: 5, hp: 20 }, acts: ['quake'] },
  iron_falcon: { g: 8, st: { spd: 6, atk: 3 }, acts: ['featherpierce'] },
  orc_shaman: { g: 8, st: { soul: 15, mres: 3 }, acts: ['fervor'] },
  steelhill_guard: { g: 8, st: { atk: 4, spd: 3, def: 2 }, acts: ['weakspot', 'pierce', 'quake'], pas: 'ambush' },
  orc_warrior: { g: 8, st: { atk: 6, hp: 30 }, acts: ['whirl'] },
  orc_archer: { g: 8, st: { atk: 4, spd: 3 }, acts: ['pierce'] },
  lizardman: { g: 8, st: { hp: 30, def: 3 }, acts: ['thermal'] },
  frogman: { g: 8, st: { spd: 3, hp: 20 }, acts: ['tongue'], pas: 'rottenSlime' },
  owlbear: { g: 8, st: { hp: 60, atk: 3 }, acts: ['roar'] },
  dryad: { g: 8, st: { soul: 20, regen: .03 }, acts: ['roots'] },
  homunculus: { g: 8, st: { soul: 20, atk: 2 }, acts: ['manabolt'] },
  fire_dead: { g: 8, st: { atk: 4, mres: 4 }, acts: ['fireslash'] },
  fallen_creation: { g: 8, st: { hp: 50, def: 2 }, acts: ['corrode'] },
  dullahan: { g: 7, st: { atk: 8, def: 5 }, acts: ['charge'] },
  hobgoblin: { g: 7, st: { atk: 6, hp: 40 }, acts: ['poisonweapon'] },
  iron_giant: { g: 7, st: { def: 8, hp: 80 }, acts: ['quake'] },
  orc_champion: { g: 7, st: { atk: 8, hp: 60 }, acts: ['warcry'] },
  half_troll: { g: 7, st: { hp: 80, regen: .05 }, acts: ['berserk'] },
  carnivaro: { g: 7, st: { spd: 6, atk: 5, mres: 4 }, acts: ['mines', 'track'], pas: 'momentum' },
  redmud: { g: 7, st: { hp: 70, def: 3 }, acts: ['mudbind'] },
  ice_orc_shaman: { g: 7, st: { mres: 8, soul: 15 }, acts: ['icewall'] },
  death_knight: { g: 6, st: { atk: 10, def: 8 }, acts: ['resentment'] },
  tower_guardian: { g: 6, st: { def: 10, hp: 60 }, acts: ['boneguard'] },
  stoneburn: { g: 6, st: { def: 8, atk: 6 }, acts: ['magma'] },
  cursestone: { g: 6, st: { mres: 10, def: 6 }, acts: ['curse'] },
  abyss_goblin: { g: 5, st: { atk: 8, spd: 5 }, acts: ['randomtrap'], pas: 'paralyzeHit' },
  abyss_ghoul: { g: 5, st: { hp: 100, ls: .1 }, acts: ['devour'], pas: 'corrupted' },
  abyss_gnome: { g: 5, st: { def: 12, hp: 60 }, acts: ['merge', 'restraint'] },
  abyss_bladewolf: { g: 5, st: { spd: 10, atk: 10 }, acts: ['madness'], pas: 'scent' },
  deathworm: { g: 5, st: { hp: 120, def: 8 }, acts: ['swallow'] },
  orc_hero: { g: 5, st: { atk: 10, hp: 80, def: 5 }, acts: ['warcry', 'banner', 'giantform'], pas: 'herosPath' },
  ifrit: { g: 5, st: { atk: 12, mres: 10 }, acts: ['burninghide'] },
  hellflame: { g: 5, st: { soul: 30, atk: 10 }, acts: ['hellfire'] },
  blood_wraith: { g: 5, st: { atk: 10, soul: 20 }, acts: ['bloodcurse'] },
  souleater: { g: 5, st: { soul: 40, mres: 6 }, acts: ['soulreap'] },
  sky_sentinel: { g: 5, st: { def: 12, hp: 100 }, acts: ['judgement'] },
  vampire: { g: 5, st: { atk: 10, ls: .1, spd: 6 }, acts: ['blooddrain', 'batswarm'], guard: 1 },
  yeti: { g: 7, st: { hp: 60, mres: 6 }, acts: ['blizzard', 'maul'], guard: 1 },
  slime_king: { g: 6, st: { hp: 60, regen: .04 }, acts: ['slimeshield', 'acid'], guard: 1 },
  iron_man: { g: 6, st: { def: 8, hp: 60 }, acts: ['ironwall', 'restraint'], guard: 1 },
  dread_lord: { g: 5, st: { atk: 6, def: 2, hp: 30, spd: 4 }, acts: ['despairwave'], pas: 'ambush', guard: 1 },
  abyss_lord: { g: 5, st: { atk: 9, def: 4, hp: 45, mres: 6 }, acts: ['abyssdevour'], guard: 1 },
  gunner_captain: { g: 7, st: { atk: 6, spd: 4 }, acts: ['volley', 'pierce'], guard: 1 },
  regret_lord: { g: 5, st: { atk: 8, def: 6, hp: 45 }, acts: ['acidburst'], guard: 1 },
  doomsday_knight: { g: 5, st: { atk: 10, def: 6 }, acts: ['spiritdemon'], pas: 'chivalry', guard: 1 },
  chaos_lord: { g: 4, st: { atk: 10, def: 5, hp: 50, mres: 6 }, acts: ['despairrain', 'maliceriff'], guard: 1 },
  doppelganger: { g: 5, st: { spd: 8, atk: 5 }, acts: ['mirror', 'copystrike'], guard: 1 },
  sky_lord: { g: 4, st: { def: 12, hp: 60, atk: 8 }, acts: ['collapsestrike', 'falseheaven'], guard: 1 },
  soul_keeper: { g: 4, st: { soul: 40, atk: 8 }, acts: ['soulreap', 'soulshield'], guard: 1 },
  silence_lord: { g: 4, st: { soul: 35, atk: 10, mres: 8 }, acts: ['betrayalgrasp'], guard: 1 },
  sea_horn_beast: { g: 6, st: { hp: 40, atk: 4 }, acts: ['maul'] },
  ranemut_warrior: { g: 7, st: { atk: 5, def: 2 }, acts: ['charge'] },
  shipwreck_wraith: { g: 8, st: { soul: 15, mres: 4 }, acts: ['corpseflame'] },
};

import { SK } from './skills';
import { PS } from './passives';
import { GRADE, COLORS } from './data';
import { monName } from './monNames';

export function makeEss(k, gd) {
  return { k, c: Math.floor(Math.random() * ESS[k].acts.length), gd: !!(gd || ESS[k].guard) };
}

export function essInfo(it) {
  const d = ESS[it.k], mul = it.gd ? 1.5 : 1, st = {};
  for (const [s, v] of Object.entries(d.st)) st[s] = Math.round(v * mul * 100) / 100;
  const acts = it.gd ? d.acts.slice() : [d.acts[it.c % d.acts.length]];
  const col = it.gd ? ['虹', ''] : COLORS[it.c % COLORS.length];
  return { n: `${col[0]}色・${monName(it.k)}精髓`, short: `${monName(it.k)}精髓`, g: d.g, st, acts, pas: d.pas || null, color: col[1], gd: it.gd };
}

const STAT_LABEL = { hp: '生命', atk: '攻擊', def: '防禦', spd: '速度', soul: '魂力', mres: '魔抗' };
export function essDesc(it) {
  const e = essInfo(it), p = [];
  for (const [s, v] of Object.entries(e.st)) {
    if (STAT_LABEL[s]) p.push(`${STAT_LABEL[s]} ${v > 0 ? '+' : ''}${v}`);
    else if (s === 'ls') p.push(`吸血 ${Math.round(v * 100)}%`);
    else if (s === 'regen') p.push(`再生 ${Math.round(v * 100)}%`);
  }
  return `${e.g}級${e.gd ? '・守護者' : ''}。${p.join('、')}。主動「${e.acts.map(a => SK[a].n).join('」「')}」${e.pas ? `;被動「${PS[e.pas].n}」` : ''}`;
}

export function essSkillDesc(it) {
  const e = essInfo(it);
  return e.acts.map(a => `「${SK[a].n}」${SK[a].d}(魂力 ${SK[a].cost})`).join('<br>') + (e.pas ? `<br>被動「${PS[e.pas].n}」${PS[e.pas].d}` : '');
}

export const essSlots = m => Math.max(1, m.lv - (memberPas(m).includes('corrupted') ? 1 : 0));

export function memberActs(m) {
  const acts = [...new Set(m.ess.map(it => essInfo(it)).flatMap(e => e.acts))];
  if (m.race === 'barb' && m.tattoo && m.tattoo.path === 'wild' && !acts.includes('wildburst')) acts.push('wildburst');
  return acts;
}
export function memberPas(m) {
  return [...new Set(m.ess.map(it => ESS[it.k].pas).filter(Boolean))];
}

export function absorbCheck(m, it) {
  const e = essInfo(it);
  const up = it.gd && m.ess.findIndex(x => x.k === it.k && !x.gd);
  if (it.gd && up >= 0) return { ok: true, upgrade: up };
  if (m.ess.length >= essSlots(m)) return { ok: false, why: '槽滿了' };
  const acts = memberActs(m), pas = memberPas(m);
  if (e.acts.some(a => acts.includes(a)) || (e.pas && pas.includes(e.pas))) return { ok: false, why: '技能重複' };
  return { ok: true };
}

export const essPrice = it => Math.round(GRADE[ESS[it.k].g].price * (it.gd ? 2 : 1) * .5);
export const essValue = m => m.ess.reduce((a, it) => a + GRADE[ESS[it.k].g].ev * (it.gd ? 1.5 : 1), 0);
