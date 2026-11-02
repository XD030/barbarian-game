/* 從 index.html 的 FIELDS 表搬過來(名字/一般怪物池/精英池/陷阱密度)。
   光暗(light/dark)、火把視野這套系統還沒搬——目前所有樓層一律視為「亮」,
   等那套系統要做的時候再補。`elite` 沒特別列出的場域,原本就是從一般池隨機挑一隻當精英
   (見 lib/dungeon.js 的 genEnemies 'elite' 分支)。 */
export const FIELD_POOLS = {
  ccN: { n: '水晶洞窟・北(哥布林)', pool: ['goblin'] },
  ccS: { n: '水晶洞窟・南(食屍鬼)', pool: ['ghoul'] },
  ccE: { n: '水晶洞窟・東(刃狼)', pool: ['bladewolf'] },
  ccW: { n: '水晶洞窟・西(地精)', pool: ['gnome'] },
  ccC: { n: '水晶洞窟・中心部', pool: [], safe: 1 },
  beast: { n: '野獸巢穴', pool: ['giant_bladewolf', 'bloody_bladewolf', 'wall_mole', 'halfmoon_bear', 'sabertooth'], elite: ['werewolf', 'sabertooth'], traps: 1 },
  dead: { n: '死者之地', pool: ['ghoul', 'elder_ghoul', 'skel_warrior', 'skel_archer', 'skel_mage', 'banshee', 'death_fiend', 'chimera_wolf'], elite: ['dullahan', 'ghoul_lord', 'death_knight'], traps: 0 },
  desert: { n: '岩石沙漠', pool: ['gnome', 'kobold', 'kobold_shield', 'fallen_gnome', 'stone_golem', 'sandman', 'sandworm'], elite: ['monolith', 'deathworm'], traps: 1 },
  gforest: { n: '哥布林森林', pool: ['goblin', 'goblin_sword', 'goblin_archer'], elite: ['hobgoblin'], traps: 3 },
  steelhill: { n: '鋼岩丘陵', pool: ['wormstone', 'iron_falcon', 'steelhill_guard'], elite: ['iron_giant'], traps: 1 },
  orc: { n: '獸人聚落', pool: ['orc_shaman', 'orc_warrior', 'orc_archer'], elite: ['orc_champion', 'orc_hero'], traps: 1, dense: 1 },
  marsh: { n: '綠尾沼澤', pool: ['lizardman', 'frogman'], elite: ['half_troll'], traps: 1 },
  estuary: { n: '漆黑河口', pool: ['frogman', 'lizardman'], elite: ['half_troll'], traps: 1 },
  witch: { n: '魔女森林', pool: ['fairy', 'wraith', 'witch_lamp', 'woodman', 'owlbear', 'dryad', 'homunculus'], elite: ['half_troll', 'carnivaro'], traps: 1, fx: 'witch' },
  tower: { n: '天空之塔', pool: ['orc_warrior', 'orc_archer', 'orc_shaman', 'iron_falcon', 'steelhill_guard', 'owlbear', 'lizardman', 'homunculus', 'tower_guardian'] },
  redstart: { n: '大魔境・起始點', pool: [], safe: 1 },
  hellfire: { n: '地獄火峽谷', pool: ['fire_dead', 'redmud', 'stoneburn', 'hellflame'], elite: ['ifrit'], fx: 'ember' },
  frost: { n: '冰霜峽谷', pool: ['frost_wolf', 'ice_orc_shaman', 'redmud'], elite: ['ice_orc_shaman'], fx: 'frost' },
  specter: { n: '亡靈峽谷', pool: ['fallen_creation', 'cursestone', 'blood_wraith', 'souleater'], elite: ['souleater'], fx: 'specter' },
  seaport: { n: '大海・錨地', pool: [], safe: 1 },
  calmsea: { n: '平靜海域', pool: ['sea_horn_beast', 'ranemut_warrior'] },
  doldrums: { n: '無風帶', pool: ['sea_horn_beast', 'shipwreck_wraith', 'ranemut_warrior'], elite: ['ranemut_warrior'], traps: 1 },
  icesea: { n: '冰海', pool: ['ranemut_warrior', 'shipwreck_wraith'], elite: ['shipwreck_wraith'], fx: 'frost' },
};

export const FIELD_FLOOR = {
  ccN: 1, ccS: 1, ccE: 1, ccW: 1, beast: 2, dead: 2, desert: 2, gforest: 2,
  steelhill: 3, orc: 3, marsh: 3, estuary: 3, witch: 3, tower: 4,
  hellfire: 5, frost: 5, specter: 5, calmsea: 6, doldrums: 6, icesea: 6,
};
export const fieldFloor = k => FIELD_FLOOR[k];
