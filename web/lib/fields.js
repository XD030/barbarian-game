/* 從 index.html 的 FIELDS 表抽出「名字 + 一般怪物池(pool)」,給公會委託生成跟
   (以後)其他樓層地圖用。只搬了委託系統會用到的欄位,精英池/陷阱密度/光暗/顏色
   等實際生成地圖才需要的欄位留到對應樓層搬過來時再補(目前只有第 1 層的 ccN/ccS/
   ccE/ccW/ccC 在 lib/dungeon.js 裡有完整版本,跟這裡的 pool 資料一致)。 */
export const FIELD_POOLS = {
  ccN: { n: '水晶洞窟・北(哥布林)', pool: ['goblin'] },
  ccS: { n: '水晶洞窟・南(食屍鬼)', pool: ['ghoul'] },
  ccE: { n: '水晶洞窟・東(刃狼)', pool: ['bladewolf'] },
  ccW: { n: '水晶洞窟・西(地精)', pool: ['gnome'] },
  ccC: { n: '水晶洞窟・中心部', pool: [] },
  beast: { n: '野獸巢穴', pool: ['giant_bladewolf', 'bloody_bladewolf', 'wall_mole', 'halfmoon_bear', 'sabertooth'] },
  dead: { n: '死者之地', pool: ['ghoul', 'elder_ghoul', 'skel_warrior', 'skel_archer', 'skel_mage', 'banshee', 'death_fiend', 'chimera_wolf'] },
  desert: { n: '岩石沙漠', pool: ['gnome', 'kobold', 'kobold_shield', 'fallen_gnome', 'stone_golem', 'sandman', 'sandworm'] },
  gforest: { n: '哥布林森林', pool: ['goblin', 'goblin_sword', 'goblin_archer'] },
  steelhill: { n: '鋼岩丘陵', pool: ['wormstone', 'iron_falcon', 'steelhill_guard'] },
  orc: { n: '獸人聚落', pool: ['orc_shaman', 'orc_warrior', 'orc_archer'] },
  marsh: { n: '綠尾沼澤', pool: ['lizardman', 'frogman'] },
  estuary: { n: '漆黑河口', pool: ['frogman', 'lizardman'] },
  witch: { n: '魔女森林', pool: ['fairy', 'wraith', 'witch_lamp', 'woodman', 'owlbear', 'dryad', 'homunculus'] },
  tower: { n: '天空之塔', pool: ['orc_warrior', 'orc_archer', 'orc_shaman', 'iron_falcon', 'steelhill_guard', 'owlbear', 'lizardman', 'homunculus', 'tower_guardian'] },
  redstart: { n: '大魔境・起始點', pool: [] },
  hellfire: { n: '地獄火峽谷', pool: ['fire_dead', 'redmud', 'stoneburn', 'hellflame'] },
  frost: { n: '冰霜峽谷', pool: ['frost_wolf', 'ice_orc_shaman', 'redmud'] },
  specter: { n: '亡靈峽谷', pool: ['fallen_creation', 'cursestone', 'blood_wraith', 'souleater'] },
  seaport: { n: '大海・錨地', pool: [] },
  calmsea: { n: '平靜海域', pool: ['sea_horn_beast', 'ranemut_warrior'] },
  doldrums: { n: '無風帶', pool: ['sea_horn_beast', 'shipwreck_wraith', 'ranemut_warrior'] },
  icesea: { n: '冰海', pool: ['ranemut_warrior', 'shipwreck_wraith'] },
};

export const FIELD_FLOOR = {
  ccN: 1, ccS: 1, ccE: 1, ccW: 1, beast: 2, dead: 2, desert: 2, gforest: 2,
  steelhill: 3, orc: 3, marsh: 3, estuary: 3, witch: 3, tower: 4,
  hellfire: 5, frost: 5, specter: 5, calmsea: 6, doldrums: 6, icesea: 6,
};
export const fieldFloor = k => FIELD_FLOOR[k];
