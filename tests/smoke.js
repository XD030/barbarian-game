// 無介面流程測試:node tests/smoke.js
// 讀取 index.html 的 <script>,用假的 DOM 跑一遍城市、迷宮、戰鬥,確認沒有例外或卡住。
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
let js = html.slice(html.indexOf('<script>') + 8, html.lastIndexOf('</script>'));
js = js.replace('const sleep=ms=>new Promise(r=>setTimeout(r,ms));', 'const sleep=ms=>Promise.resolve();');

const el = () => ({
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 10, height: 10 }),
  appendChild() {}, remove() {}, className: '', innerHTML: '', hidden: true, textContent: '',
  style: { setProperty() {} }, classList: { toggle() {} }, focus() {}, addEventListener() {}, removeEventListener() {}
});
const els = {};
global.document = {
  querySelector: s => els[s] || (els[s] = el()),
  querySelectorAll: () => [],
  getElementById: s => els['#' + s] || (els['#' + s] = el()),
  addEventListener() {},
  createElement: () => ({ style: {}, remove() {}, width: 0, height: 0, getContext: () => ({ fillRect() {}, set fillStyle(v) {} }), toDataURL: () => 'data:' })
};
global.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
global.window = {};

js += `
;(async()=>{
  const tick=()=>new Promise(r=>setImmediate(r));
  async function waitB(){let g=0;while(B&&g++<40000)await tick();if(B)throw new Error('戰鬥卡住了');}
  ACT.newGame();ACT.confirmHero();
  S.auto=true;S.fast=true;S.stone+=5000;
  S.tavern.slice().forEach(m=>ACT.recruit(m.id));
  ACT.buyLibEss('goblin');ACT.absorbDo('bag:0:'+S.members[0].id);
  for(const t of ['guild','library','exchange','temple','smith','store','home']){ACT.tab(t);render();}
  let battles=0;
  for(let month=0;month<4;month++){
    if(S.screen!=='base')break;
    if(hero().dead)ACT.revive();
    living().forEach(m=>m.hp=stats(m).maxhp);
    S.sel=living().slice(0,4).map(m=>m.id);
    if(S.day!==1)ACT.skipToOpen();
    S.stone+=S.debt;
    ACT.enterLab();
    for(let step=0;step<200&&S.run;step++){
      const run=S.run;if(B){await waitB();continue;}
      if(run.collapse){ACT.collapseFight();battles++;await waitB();continue;}
      if(run.tower){if(run.tower.guardDone){ACT.descend();await waitB();continue;}if(run.tower.stage>=100){ACT.towerBoss();await waitB();continue;}ACT.stair(0);if(B){battles++;await waitB();}continue;}
      const map=run.map,cur=map.rooms[map.cur];
      if(roomHasFoes(cur)){ACT.fight();battles++;await waitB();continue;}
      if((cur.type==='portal'||cur.type==='stairs')&&run.h>40){ACT.descend(cur.to);if(B){battles++;await waitB();}continue;}
      const opts=cur.links.filter(i=>!map.rooms[i].visited);ACT.move(opts.length?pick(opts):pick(cur.links));
      if(B){battles++;await waitB();}
    }
    if(S.run)ACT.waitClose();
    while(living().length<4&&S.tavern.length){S.stone+=1000;ACT.recruit(S.tavern[0].id);}
  }
  console.log('OK:戰鬥',battles,'場,最深第',S.maxFloor,'層,日期',S.month+'/'+S.day);
})().catch(e=>{console.error('失敗:',e.stack);process.exit(1);});`;
eval(js);
