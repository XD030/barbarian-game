import { ECON, GRADE } from './data';
import { ESS, makeEss, essInfo } from './essence';
import { MON_INFO, monName } from './monInfo';
import { FIELD_POOLS, fieldFloor } from './fields';

const ri = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; };

/* 公會認證上限:沒考過 5 級考試時,貢獻點決定(30 以上才算中堅,見 6 級);
   考過後固定 4 級(最高階)。考試(與公會考官戰鬥)要等戰鬥引擎(階段 4)才能真的打,
   目前先把「報考」按鈕停用。 */
export const rankCap = state => state.examPassed ? 4 : state.contrib >= 30 ? 6 : 7;

export const REQ_DESC = r => r.type === 'kill' ? `討伐 ${monName(r.k)} ×${r.n}`
  : r.type === 'reach' ? `抵達第 ${r.f} 層`
  : r.type === 'deliver' ? `繳交一顆${monName(r.k)}精髓`
  : r.type === 'rift' ? '清除任意一個裂縫' : '';

export function reqProgress(state, r) {
  if (r.type === 'kill') return Math.min(r.n, (state.kc[r.k] || 0) - r.base);
  if (r.type === 'reach') return state.maxFloor >= r.f ? 1 : 0;
  if (r.type === 'rift') return state.riftsCleared > r.base ? 1 : 0;
  if (r.type === 'deliver') return state.bag.some(it => it.k === r.k) ? 1 : 0;
  return 0;
}
export const reqDone = (state, r) => reqProgress(state, r) >= (r.type === 'kill' ? r.n : 1);

/* 委託(2026-?? 改版):不用再「接受」,每 4 小時自動多一個,最多同時累積 6 個,
   完成就直接回報。產生的委託種類(討伐/繳交精髓/到達樓層/清裂縫)維持原邏輯,
   目前只會生成跟第 1 層(水晶洞窟)有關的內容,因為其他樓層的探索還沒搬過來。 */
export const REQ_CAP = 6;
export const REQ_INTERVAL_MS = 4 * 60 * 60 * 1000;

function genOneRequest(state) {
  const f = Math.min(6, state.maxFloor), pools = [];
  for (const [k, fd] of Object.entries(FIELD_POOLS)) {
    const fl = fieldFloor(k);
    if (fl && fl <= Math.min(6, f + 1)) pools.push(...fd.pool);
  }
  const t = pick(['kill', 'kill', 'kill', 'deliver', 'reach', 'rift']);
  let r;
  if (t === 'kill') {
    const k = pick(pools.length ? pools : ['goblin']), g = MON_INFO[k].g, n = g >= 9 ? ri(3, 6) : ri(1, 3);
    r = { type: 'kill', k, n, stone: GRADE[g].stone * n * 3 + 60 * ECON, contrib: g >= 9 ? 3 : 6, fame: 1, base: state.kc[k] || 0 };
  } else if (t === 'deliver') {
    const k = pick(Object.keys(ESS).filter(e => ESS[e].g === 9));
    r = { type: 'deliver', k, stone: 550 * ECON, contrib: 6, fame: 2 };
  } else if (t === 'reach' && f < 6) {
    r = { type: 'reach', f: f + 1, stone: 250 * ECON * f, contrib: 10, fame: 3 };
  } else {
    r = { type: 'rift', stone: 600 * ECON, contrib: 12, fame: 5, base: state.riftsCleared };
  }
  r.id = state.uid++;
  return r;
}

/* 追上經過的時間,補生成委託(上限 6 個)。池滿的時候時間不會繼續累積,
   要等有空位才重新起算,避免累積一大串「欠的額度」。在遊戲載入、進城市畫面、
   或城市畫面開著的時候都要呼叫一次,離線時間太久也能一次補到滿。 */
export function tickRequests(state) {
  const now = Date.now();
  if (!state.reqGenAt) { state.reqGenAt = now; return; }
  let elapsed = now - state.reqGenAt;
  while (elapsed >= REQ_INTERVAL_MS && state.reqs.length < REQ_CAP) {
    state.reqs.push(genOneRequest(state));
    elapsed -= REQ_INTERVAL_MS;
    state.reqGenAt += REQ_INTERVAL_MS;
  }
  if (state.reqs.length >= REQ_CAP) state.reqGenAt = now;
}

export function nextReqInMs(state) {
  if (state.reqs.length >= REQ_CAP) return null;
  if (!state.reqGenAt) return REQ_INTERVAL_MS;
  return Math.max(0, REQ_INTERVAL_MS - (Date.now() - state.reqGenAt));
}

export function refreshShop(state) {
  const cap = rankCap(state), gmax = cap <= 4 ? 6 : cap <= 6 ? 7 : 8;
  const pool = Object.keys(ESS).filter(k => !ESS[k].guard && ESS[k].g <= 8 && ESS[k].g >= gmax && !k.startsWith('abyss'));
  state.shop = shuffle(pool).slice(0, 3).map(k => makeEss(k));
}

export function claimReq(state, id, log) {
  const r = state.reqs.find(x => x.id === id);
  if (!r || !reqDone(state, r)) return;
  if (r.type === 'deliver') {
    const i = state.bag.findIndex(it => it.k === r.k);
    if (i < 0) return;
    state.bag.splice(i, 1);
  }
  state.stone += r.stone; state.contrib += r.contrib; state.fame += r.fame;
  state.reqs = state.reqs.filter(x => x !== r);
  log(`完成委託「${REQ_DESC(r)}」,得到 ${r.stone} 石幣、貢獻 ${r.contrib}。`);
  if (state.contrib >= 30 && state.contrib - r.contrib < 30) log('貢獻點滿 30,公會審查通過,認證上限提高到 6 級。');
}

export function buyGuildEss(state, i, log) {
  const it = state.shop[i];
  if (!it) return;
  const p = GRADE[ESS[it.k].g].price;
  if (state.stone < p) return;
  state.stone -= p; state.bag.push(it); state.shop.splice(i, 1);
  log(`在公會買下${essInfo(it).n}。`);
}
