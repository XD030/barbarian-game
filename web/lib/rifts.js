import { ECON } from './data';

/* 從 index.html 搬過來的裂縫表跟層主表。
   f:哪一層能碰到(祭壇生成時只挑同層的)、boss/minions:MON 表的 key、cost:獻祭的石幣。 */
export const RIFTS = {
  blood_fortress: { n: '血色城塞', f: 1, boss: 'vampire', minions: ['bloody_bladewolf', 'ghoul'], cost: 150 * ECON },
  glacier_cave: { n: '冰河洞窟', f: 1, boss: 'yeti', minions: ['frost_wolf'], cost: 120 * ECON },
  green_mine: { n: '綠色礦坑', f: 1, boss: 'slime_king', minions: ['slime', 'slime'], cost: 100 * ECON },
  steel_tomb: { n: '鋼鐵之墓', f: 1, boss: 'iron_man', minions: ['stone_golem'], cost: 130 * ECON },
  gun_desert: { n: '槍砲沙漠', f: 2, boss: 'gunner_captain', minions: ['bandit_archer', 'bandit'], cost: 300 * ECON },
  white_temple: { n: '白色神殿', f: 3, boss: 'doomsday_knight', minions: ['fallen_creation'], cost: 700 * ECON },
  doppel_forest: { n: '分身魔森林', f: 4, boss: 'doppelganger', minions: ['bandit'], cost: 1500 * ECON },
  soul_fortress: { n: '靈魂要塞', f: 5, boss: 'soul_keeper', minions: ['blood_wraith'], cost: 3500 * ECON },
};

/* 各層的層主(鍵是樓層數,打的時候在該層安全區挑戰,可重複挑戰取得戰利品)。
   詳細的自訂技能/機制設計筆記見 ../index.html 同一段註解,這裡先只搬資料跟流程,
   每個層主的招式照 MON/SK 表原本有的 tags 走(decideIntent/enemyAct 已經是通用邏輯)。 */
export const FLOORMASTER = {
  1: { n: '恐懼之主德雷德菲爾', key: 'dread_lord', minions: ['crystal_maggot', 'crystal_maggot', 'crystal_maggot'],
    desc: '水晶洞窟深處流傳著,這個瘦小的「恐懼之主」其實不是真正的德雷德菲爾——而是殺了他、奪走名字的冒牌貨。打輸了,牠只會拖走觸發這場戰鬥的人。' },
  2: { n: '後悔之主', key: 'regret_lord', minions: ['bandit_archer', 'bandit'],
    desc: '水下的祭壇一碰就引發酸蝕爆炸。據說後悔之主會隨著傷勢越打越強,絕對不能拖久。' },
  3: { n: '混沌之主利亞基斯', key: 'chaos_lord', minions: ['chaos_spirit', 'chaos_spirit', 'chaos_spirit'],
    desc: '魔女的獻祭儀式喚醒了混沌之主利亞基斯,隨行的混沌之靈不堪一擊,但祂的絕望之雨與惡意裂隙會讓隊伍節節敗退。' },
  4: { n: '天空之主', key: 'sky_lord', minions: ['tower_guardian', 'tower_guardian'],
    desc: '守護著這座被魔女一派稱為「天空之塔」的地底遺跡。傳說獨自一人打倒祂的探險者,能得到額外的賞賜。' },
  5: { n: '寂靜之主希利亞特', key: 'silence_lord', minions: ['blood_wraith'],
    desc: '原本是帝國的探險者,後來叛變投靠魔女。一隻眼、過長的手臂——牠的「不言令」能封鎖範圍內所有精髓技能。' },
  abyss: { n: '深淵之主貝爾札克', key: 'abyss_lord', minions: ['abyss_watcher', 'abyss_watcher'],
    desc: '接連打倒恐懼之主九次後,深淵之主貝爾札克開始在水晶洞窟裡徘徊。濃霧般的深淵之霧會封鎖精髓技能。' },
};
