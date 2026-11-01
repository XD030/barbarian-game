/* 從 index.html 搬過來的遊戲資料表(目前只搬了建立角色畫面會用到的部分)。
   經濟規模倍率,詳見 docs/design-notes.md「經濟規模整體重訂」。 */
export const ECON = 583;

export const DT = { slash: '斬', pierce: '刺', blunt: '鈍', magic: '魔', fire: '火', ice: '冰', thunder: '雷', holy: '聖', dark: '暗' };

export const WEAPON = {
  shield: { n: '盾與單手錘', dt: 'blunt', hp: 125, atk: 9, def: 10, spd: 92, line: 3, pass: '格擋:25% 機率減免 60% 傷害', block: .25, price: 150 * ECON },
  hammer: { n: '雙手戰鎚', dt: 'blunt', hp: 108, atk: 16, def: 4, spd: 84, line: 3, pass: '重擊:20% 機率讓目標行動延後', stun: .2, price: 180 * ECON },
  sword: { n: '長劍', dt: 'slash', hp: 98, atk: 12, def: 5, spd: 100, line: 3, pass: '爆擊率 +10%', crit: .10, price: 150 * ECON },
  spear: { n: '長槍', dt: 'pierce', hp: 94, atk: 12, def: 4, spd: 97, line: 2, pass: '削減體勢 +50%', brk: 1.5, price: 150 * ECON },
  daggers: { n: '雙短刀', dt: 'slash', hp: 82, atk: 9, def: 3, spd: 118, line: 3, pass: '爆擊率 +20%', crit: .20, price: 150 * ECON },
  bow: { n: '弓', dt: 'pierce', hp: 74, atk: 12, def: 2, spd: 103, line: 1, pass: '站在後排,較少被攻擊', price: 150 * ECON },
  staff: { n: '法杖', dt: 'magic', hp: 68, atk: 13, def: 1, spd: 95, line: 1, robe: 1, pass: '魂力上限 +30,無視 40% 防禦', soul: 30, pen: .4, price: 200 * ECON },
};

export const RACE = {
  human: { n: '人類', d: '稅金減半,魂力 +10', tax: .5, soul: 10 },
  barb: { n: '蠻族', d: '巨大強壯:生命 +25%、攻擊 +2,但生活開銷較大。真正的強項其實是精神力:累積壓力的速度 -15%,幾乎不受恐懼效果影響。嬰兒時期薩滿刻下的靈魂刻印能進一步強化自己', hp: 1.25, atk: 2, live: 1.5 },
  dwarf: { n: '矮人', d: '防禦 +3,鍛造費用 -25%,速度 -5,裝備編號物品的效果 ×1.5', def: 3, spd: -5, forge: .75 },
  elf: { n: '精靈', d: '速度 +4、魂力 +10、魔抗 +5,能察覺陷阱', spd: 4, soul: 10, mres: 5, trap: 1 },
  beast: { n: '獸人', d: '速度 +8,嗅覺敏銳能察覺陷阱', spd: 8, trap: 1 },
  fairy: { n: '妖精', d: '魂力 +25、魔抗 +8、速度 +6,生命 -20%。能跟四大元素精靈(火/水/風/土)締結契約,天賦高的能同時締約全部四個;傳說中每個時代只有一人能締結「精靈王契約」', hp: .8, soul: 25, mres: 8, spd: 6 },
  dragon: { n: '龍人族', d: '因祖先的功績免繳稅金,防禦 +2', tax: 0, def: 2 },
};

export const TATTOO_PATH = {
  flame: { n: '熰燰之魂', d: '灼熱的靈魂。攻擊 +10%、爆擊率 +8%,普通攻擊有 20% 機率使目標燃燒' },
  steel: { n: '鋼鐵之魂', d: '如鋼鐵般堅硬的軀體。防禦 +12、生命 +15%' },
  wild: { n: '野性之魂', d: '原始的野性,仇恨值大增但也更容易被盯上。生命 +50、防禦 +8,解鎖主動技能「野性噴發」' },
};
export const TATTOO_COST = [550000, 1000000, 2000000, 4000000, 8000000];

export const BEASTPACT = {
  summon: { n: '召喚·靈魂獸追擊', d: '普通攻擊後 25% 機率讓靈魂獸追加一擊(40% 攻擊力)' },
  enhance: { n: '強化·猛獸之力', d: '攻擊 +15%、速度 +10%' },
  ability: { n: '異能·野性直覺', d: '爆擊率 +12%、吸血 +8%' },
};

export const SPIRIT = {
  fire: { n: '火精靈', d: '攻擊 +5%,普通攻擊有 15% 機率使目標燃燒' },
  water: { n: '水精靈', d: '每回合回復 3% 生命' },
  wind: { n: '風精靈', d: '速度 +8' },
  earth: { n: '土精靈', d: '防禦 +5' },
};
export const SPIRIT_STONE_COST = 150000, SPIRIT_STONE_RATE = .1;

export const TRAIT = {
  bg_merc: { n: '傭兵出身', d: '攻擊 +3', good: 1, bg: 1 },
  bg_hunter: { n: '獵人出身', d: '全隊精髓掉落 +1%,能看出相鄰房間的敵人數量', good: 1, bg: 1 },
  bg_scholar: { n: '學者出身', d: '一開始就熟知第 1 層的怪物', good: 1, bg: 1 },
  bg_noble: { n: '沒落貴族', d: '開局多帶 300 石幣,名聲 +10', good: 1, bg: 1 },
  bg_drifter: { n: '流浪者', d: '自身壓力增加 -30%', good: 1, bg: 1 },
  brave: { n: '勇猛', d: '壓力增加 -30%', good: 1 }, coward: { n: '膽小', d: '壓力增加 +40%' }, pacifist: { n: '和平主義', d: '厭惡戰鬥,攻擊 -25%' },
  glutton: { n: '大胃王', d: '每天生活費加倍' }, tough: { n: '強韌', d: '生命 +15%', good: 1 }, greedy: { n: '貪財', d: '戰鬥獲得魔石 +10%', good: 1 },
  quick: { n: '敏捷', d: '速度 +6', good: 1 }, lucky: { n: '幸運', d: '精髓掉落 +1%', good: 1 }, insomniac: { n: '失眠', d: '休息時壓力回復減半' },
  diligent: { n: '勤勞', d: '打工收入 +50%', good: 1 }, lazy: { n: '懶散', d: '打工收入 -50%' }, bloodlust: { n: '嗜血', d: '擊倒敵人時回復 10% 生命', good: 1 },
};
export const RANDOM_TRAITS = ['brave', 'coward', 'pacifist', 'glutton', 'tough', 'greedy', 'quick', 'lucky', 'insomniac', 'diligent', 'lazy', 'bloodlust'];
export const CLASH = { brave: 'coward', coward: 'brave', diligent: 'lazy', lazy: 'diligent' };

export const LV_XP = [0, 0, 3, 7, 12, 18, 26, 36, 48, 62, 78, 96];
export const MAXLV = 11;

export const HAIR = ['#3a2a1e', '#7a4a2a', '#c9a24a', '#a8a39a', '#8a2f22', '#1f1f2a'];
export const SKIN = { human: '#e2b78f', barb: '#c58b5f', dwarf: '#e6a982', elf: '#f1d6b6', beast: '#b98656', fairy: '#f8e0d0', dragon: '#8fb08a' };

export const NAMES = ['艾登', '莉娜', '葛雷', '薇拉', '托倫', '米拉', '卡爾', '希爾達', '羅文', '伊莎', '貝恩', '諾拉', '達瑞克', '芙蕾雅', '歐林', '塞拉', '雷克', '艾薇', '古斯', '妮雅', '哈根', '露絲', '布蘭', '凱特', '瑟琳', '杜蘭', '安柏', '洛克', '梅芙', '提歐'];
export const BARB_NAMES = ['阿克森', '烏爾格', '卡拉克', '莫拉德', '希庫', '瓦爾加', '托格', '布蘭卡', '約根', '哈爾德'];
