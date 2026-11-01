/* 信仰:帳號等級的捐獻升級清單,三個教團先共用同一套模板,之後再依教團個別設計增益內容。
   FAITH_BUFFS 目前故意留空——等實際增益項目/數值定案後再補進來,UI 跟升級邏輯先做好。 */
export const FAITH_BUFFS = [];

export function faithCost(buff, lv) {
  return Math.round(buff.baseCost * Math.pow(buff.costMul ?? 1.4, lv));
}

export function donateFaith(state, key, amount, log) {
  const buff = FAITH_BUFFS.find(b => b.key === key);
  if (!buff) return;
  const f = state.faith[key] || (state.faith[key] = { lv: 0, prog: 0 });
  if (f.lv >= buff.maxLv) return;
  const cost = faithCost(buff, f.lv);
  const step = Math.min(amount, cost - f.prog, state.stone);
  if (step <= 0) return;
  state.stone -= step;
  f.prog += step;
  if (f.prog >= cost) {
    f.lv++; f.prog = 0; state.contrib = (state.contrib || 0) + 1;
    log(`${buff.n}升到 Lv.${f.lv} 了,獲得 1 點貢獻值。`);
  }
}
