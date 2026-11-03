/* 三神教底下的三個教團(神的設定照原作나무위키「설정」7.4 節逐字核對過,海因德爾教團原作幾乎
   沒有內容,月神墨涅是使用者自己補的設定)。整個帳號只能加入一個,加入後無法更換。
   不同教團的增益/效果之後再設計,這裡先只有名字、神祇、風味文字。 */
import { removeCost } from './city';
import { stats } from './stats';
import { essInfo } from './essence';
export const CHURCHES = {
  tobera: { n: '托貝拉教團', god: '太陽神托貝拉', flavor: '禁止對蠻族使用神聖力量——相傳幾千年前有個蠻族喝醉酒,對托貝拉的石像撒尿,從此定下這條規矩。' },
  reatlas: { n: '雷阿特拉斯教團', god: '探險之神兼星辰女神雷阿特拉斯', flavor: '高層只有 3 位聖騎士團長、2 位大神官、1 位樞機主教跟 1 位靈性大主教(地位相當於教皇)。' },
  heindel: { n: '海因德爾教團', god: '月神墨涅', flavor: '原作裡這個教團幾乎沒有留下記載,墨涅的傳說要靠自己探索。' },
};

export function joinChurch(state, key, log) {
  if (state.church || !CHURCHES[key]) return;
  state.church = key;
  log(`在${CHURCHES[key].n}的神殿獻上誓言,正式成為${CHURCHES[key].god}的信徒。`);
}

/* 祈禱:全隊一起,一天一次,免費,壓力減半。 */
export function pray(state, log) {
  if (state.prayedToday) return;
  state.prayedToday = true;
  state.members.filter(m => !m.dead).forEach(m => { m.stress = Math.round(m.stress / 2); });
  log('全隊在神殿祈禱,大家的壓力都減少了一半。');
}

/* 移除精髓:唯一能讓精髓槽空出來的地方,費用每次翻倍。 */
export function removeEssence(state, memberId, j, log) {
  const m = state.members.find(x => x.id === memberId);
  const it = m && m.ess[j];
  if (!it) return;
  const c = removeCost(state);
  if (state.stone < c) return;
  state.stone -= c;
  state.removals++;
  m.ess.splice(j, 1);
  m.hp = Math.min(m.hp, stats(m).maxhp);
  log(`${m.name} 和${essInfo(it).short}之間的「線」被切斷了。花了 ${c} 石幣。`);
}
