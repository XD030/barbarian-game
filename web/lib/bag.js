/* 從 index.html 搬過來的精髓背包/編號物品操作(吸收、賣出、鑑定、裝備)。
   src 參數區分精髓來源:'bag' 是城市背包(S.bag),'run' 是還在迷宮裡、剛打完還沒帶回城的
   戰利品(S.run.loot.ess)——原作兩邊共用同一個 absorbOpen/absorbDo。 */
import { ECON } from './data';
import { stats } from './stats';
import { essInfo, essPrice, absorbCheck } from './essence';
import { SK } from './skills';
import { NUM } from './num';

function essList(state, src) { return src === 'bag' ? state.bag : state.run.loot.ess; }

export function sellEss(state, i, log) {
  const it = state.bag[i];
  if (!it) return;
  const v = essPrice(it);
  state.stone += v;
  state.bag.splice(i, 1);
  log(`把${essInfo(it).n}賣了 ${v} 石幣。`);
}

export function absorbEss(state, src, i, memberId, log) {
  const list = essList(state, src);
  const it = list[i], m = state.members.find(x => x.id === memberId);
  if (!it || !m) return;
  const c = absorbCheck(m, it);
  if (!c.ok) return;
  const before = stats(m);
  if (c.upgrade !== undefined) m.ess.splice(c.upgrade, 1, it); else m.ess.push(it);
  list.splice(i, 1);
  const after = stats(m);
  m.hp = Math.min(after.maxhp, m.hp + Math.max(0, after.maxhp - before.maxhp));
  m.soul = Math.min(after.soul, m.soul + Math.max(0, after.soul - before.soul));
  log(`${m.name} 吸收了${essInfo(it).n},學會「${essInfo(it).acts.map(a => SK[a].n).join('」「')}」。`);
}

export function sellItem(state, i, log) {
  const it = state.items[i];
  if (!it) return;
  const v = it.type === 'riftstone' ? 300 * ECON * it.f : !it.ided ? 150 * ECON : NUM[it.id].price;
  state.stone += v;
  state.items.splice(i, 1);
  log(`把${it.type === 'riftstone' ? '裂縫石' : it.ided ? NUM[it.id].n : '未鑑定的編號物品'}賣了 ${v} 石幣。`);
}

export function appraiseItem(state, i, log) {
  const it = state.items[i];
  if (!it || it.ided || state.stone < 300 * ECON) return;
  state.stone -= 300 * ECON;
  it.ided = true;
  log(`鑑定出${NUM[it.id].n}。`);
}

export function equipItem(state, i, memberId, log) {
  const it = state.items[i], m = state.members.find(x => x.id === memberId);
  if (!it || !m) return;
  if (m.num) state.items.push(m.num);
  state.items.splice(i, 1);
  m.num = it;
  log(`${m.name} 裝備了${NUM[it.id].n}。`);
}

export function unequipItem(state, memberId) {
  const m = state.members.find(x => x.id === memberId);
  if (!m || !m.num) return;
  state.items.push(m.num);
  m.num = null;
  m.hp = Math.min(m.hp, stats(m).maxhp);
}
