# 蠻族迷宮生存

以韓國網路小說《게임 속 바바리안으로 살아남기》(台版《變成蠻族!遊戲生存戰》)的世界觀與機制為基礎的同人迷宮生存遊戲,個人自玩用。

## 最重要的方向
- **世界觀、機制、設定照原作**;劇情與主角是玩家自己的冒險,不使用比約恩或原作劇情。
- 原作沒有細節的地方才自訂,並在 `docs/design-notes.md` 標明哪些是原作、哪些是自訂。
- 玩法結構參考 Steam 遊戲 Dungeon Settlers:城市經營 + 四人小隊下迷宮 + 同伴永久死亡。
- 戰鬥是回合制,有依速度排列的順序條(類似崩壞:星穹鐵道),版面像神魔之塔:上方是怪物圖片,下方是隊伍頭像與血條。**不要文字訊息框**,傷害數字和狀態直接跳在角色身上。
- 手機與電腦用不同介面:電腦維持置中卡片式排版;手機(`@media (max-width:720px)`)走神魔之塔風格——建物選單是底部固定圖示列、迷宮事件面板是貼底的固定卡片、戰鬥畫面滿版鋪開整個螢幕。純 CSS 切換,不是另外做一套 HTML。
- 主角死亡要到三神教大神殿復活,第一次免費,之後收費遞增;同伴死亡是永久的。

## 目前的檔案
- `index.html`:整個遊戲(單一檔案,原生 JS,無外部套件,像素圖用程式產生)。用瀏覽器直接打開就能玩,存檔在 localStorage(鍵 `barbarian-labyrinth-v5`)。
- `docs/design-notes.md`:設計紀錄、已實作的原作設定、自訂部分、尚未做的原作要素。
- `tests/smoke.js`:無介面流程測試,`node tests/smoke.js`。

## index.html 結構(搜尋區塊註解)
- `DATA`:`WEAPON`、`RACE`、`TRAIT`、`GRADE`、`SK`(主動技能)、`PS`(被動)、`ESS`(精髓)、`MON`(怪物與像素圖設定)、`FIELDS`(區域)、`FLOORS`、`RIFTS`、`NUM`(編號物品)。
- `STATE`:`newState()`、`stats(m)`、精髓相關(`makeEss`、`essInfo`、`absorbCheck`)。
- `SPRITES`:`humanoid()` 與 `GRIDS` 產生像素圖,`gridCanvas()` 自動加外框。
- `CITY`:城市分頁(住處、酒館、公會、圖書館、交易所、大神殿、鐵匠鋪、雜貨店)、`processDays()`。角色登記後是單人出發,同伴要去酒館招募:`TAVERN_TIERS`(等級門檻,越高級要求的名聲/貢獻點/樓層進度越高)、`refreshTavern()`(每月 1、15 日換人)、`tavernTab()`、`ACT.recruit`。名聲滿 150 會在 `processDays` 觸發第 1 區卡隆特權(`S.carnon`,生活開銷 -15%,住處分頁看得到進度)。
- `LABYRINTH`:`genFloor()`(第 1 層十字四區、第 2 層四區之一、第 3 層朝聖者之路、第 5 層三峽谷、第 6 層大海三海域)、天空之塔(`towerHTML`、`ACT.stair`)、次元崩壞、時間與關閉(`advanceTime`、`eject`)、`FLOORMASTER`+`floorMasterBlock()`+`ACT.fmaster`(6 個層主都做了:第 1~5 層各一個 + 第 1 層的深淵之主貝爾札克特殊事件款,鍵 `'abyss'`,資料驅動,之後要加新層主只要加表格項目;第 6 層層主原作資料不足,還沒做)。第 6 層要在鐵匠鋪(`smithTab`)花石幣雇用航海士(`S.navigator`)、建造船隻(`S.ship`,1~3 級,`shipCost`)才能從第 5 層的 `f6gate` 房間出發。
- `TURN-BASED BATTLE`:`startBattle`、`battleLoop`(非同步,玩家回合用 Promise 等待指令)、`hit`、`fall`、`endBattle`、跳字 `pop()`。敵方標籤除了原本的 `heavy`/`aoe`/`bind`/`fear`/`summon` 外,層主補完時新增了兩個通用機制:`silence`(沉默,下在玩家身上會讓精髓技能按鈕變灰、AI 也不會選技能,`renderCmd`/`autoChoose`/`ACT.bCmd` 都有擋)、`enrage`(覺醒,生命降到 50%/20% 各觸發一次永久強化,邏輯在 `enemyAct`)。6 個層主的技能、小怪都各自客製化,不互相套用同一招,細節見 `docs/design-notes.md`。
- 互動統一用 `data-act` / `data-change` / `data-input` 事件委派到 `ACT` 物件。
- `<style>` 開頭附近的「Mobile (phone) layout」media query集中放所有手機版專屬 CSS(`.tabs` 變底部固定圖示列、`.dun .panel.event` 變貼底固定卡片、`.bt` 滿版),都用 `display:contents`/`position:fixed` 之類純 CSS 手法接管既有 HTML,沒有另外寫手機版的 render 函式。

## 開發慣例
- 介面文字一律繁體中文(台灣用語)。
- 改完一定跑 `node tests/smoke.js`,確認沒有例外、戰鬥不會卡住。
- 調整數值時,可以寫一次性腳本模擬多場戰鬥看勝率(參考 smoke.js 的假 DOM 寫法)。
- 新增怪物要同時補:`MON`(含 `spr` 像素圖)、`ESS`(若會掉精髓)、所屬 `FIELDS` 的 `pool`。

## 下一步候選
- 依實際遊玩調整平衡(使用者確認過目前難度是照原作設計的,不算 bug,先不特別調降)。
- 第 6 層層主(原作名字跟細節還沒查到確切的,之後查到再補)、地下 1 層「紀錄保管所」(原作要在第 3 層收集 3 個碎片才能開啟傳送門,層主是記錄之主雷卡多,規模、機制都跟現有樓層差很多,還沒做)、第 7 層以後。
- 同伴是否能復活;移植到 Godot 4:資料表轉成 JSON 或 Resource,戰鬥邏輯照 `TURN-BASED BATTLE` 區塊搬。
- 原作要素盤點過一輪(見 `docs/design-notes.md`「確認不做的部分」):惡靈/惡靈獵人/圓桌是比約恩的個人劇情,依方向不做;細分能力值的精神力重點已經用蠻族種族的壓力減速體現,不用另外做三分類能力值表。
