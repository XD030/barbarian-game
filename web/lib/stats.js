import { WEAPON, RACE } from './data';
import { essInfo, memberPas } from './essence';

export const hasT = (m, t) => m.traits.includes(t);
export { memberPas };

export function numEff(m) {
  if (!m.num) return {};
  return m.num.eff || {};
}

export function stats(m) {
  const w = WEAPON[m.weapon], r = RACE[m.race];
  let hp = w.hp * (r.hp || 1), atk = w.atk + (r.atk || 0), def = w.def + (r.def || 0), spd = w.spd + (r.spd || 0),
    soul = 40 + (w.soul || 0) + (r.soul || 0) + (m.bonusSoul || 0), mres = r.mres || 0, crit = .05 + (w.crit || 0), ls = 0, regen = 0;
  const L = m.lv - 1;
  hp *= 1 + .07 * L; atk += 1.2 * L; def += .5 * L; soul += Math.min(L, 4) * 10 + Math.max(0, L - 4) * 30; spd += L * .5;
  atk += m.wpn * 3; def += m.arm * 2; hp += m.arm * 12;
  for (const it of m.ess || []) {
    const e = essInfo(it).st;
    hp += e.hp || 0; atk += e.atk || 0; def += e.def || 0; spd += e.spd || 0; soul += e.soul || 0; mres += e.mres || 0; ls += e.ls || 0; regen += e.regen || 0;
  }
  if (m.num) { const f = numEff(m); atk += f.atk || 0; def += f.def || 0; spd += f.spd || 0; soul += f.soul || 0; mres += f.mres || 0; ls += f.ls || 0; regen += f.regen || 0; crit += f.crit || 0; }
  if (hasT(m, 'tough')) hp *= 1.15; if (hasT(m, 'quick')) spd += 6; if (hasT(m, 'pacifist')) atk *= .75; if (hasT(m, 'bg_merc')) atk += 3;
  if (m.race === 'beast' && m.beastPact === 'enhance') { atk *= 1.15; spd *= 1.10; }
  if (m.race === 'beast' && m.beastPact === 'ability') { crit += .12; ls += .08; }
  if (m.race === 'barb' && m.tattoo && m.tattoo.path === 'flame') { atk *= 1.10; crit += .08; }
  if (m.race === 'barb' && m.tattoo && m.tattoo.path === 'steel') { def += 12; hp *= 1.15; }
  if (m.race === 'barb' && m.tattoo && m.tattoo.path === 'wild') { hp += 50; def += 8; }
  if (m.race === 'fairy' && m.spirits) {
    if (m.spirits.includes('fire')) atk *= 1.05;
    if (m.spirits.includes('water')) regen += .03;
    if (m.spirits.includes('wind')) spd += 8;
    if (m.spirits.includes('earth')) def += 5;
  }
  if (m.prayBuff) atk *= 1 + (m.prayBuff.atk || 0);
  return {
    maxhp: Math.max(10, Math.round(hp)), atk: Math.max(1, Math.round(atk * 10) / 10), def: Math.max(0, Math.round(def * 10) / 10),
    spd: Math.max(40, Math.round(spd)), soul: Math.round(soul), mres: Math.round(mres), crit, ls, regen,
  };
}
