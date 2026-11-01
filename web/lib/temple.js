/* 三神教底下的三個教團(神的設定照原作나무위키「설정」7.4 節逐字核對過,海因德爾教團原作幾乎
   沒有內容,月神墨涅是使用者自己補的設定)。整個帳號只能加入一個,加入後無法更換。
   不同教團的增益/效果之後再設計,這裡先只有名字、神祇、風味文字。 */
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

/* 祈禱:一天一次,免費。一半機率壓力歸零,一半機率沒有效果。
   隨機增益那個版本先不做(之後有需要再設計)。 */
export function pray(state, memberId, log) {
  const m = state.members.find(x => x.id === memberId);
  if (!m || m.dead || m.prayedToday) return;
  m.prayedToday = true;
  if (Math.random() < 0.5) {
    m.stress = 0;
    log(`${m.name}在神殿祈禱,心情徹底平靜下來(壓力歸零)。`);
  } else {
    log(`${m.name}在神殿祈禱,但沒有感覺到什麼特別的。`);
  }
}
