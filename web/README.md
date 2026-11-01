# 蠻族迷宮生存 — React/Next.js 重寫(進行中)

把 `../index.html`(單檔案、純 JS、手寫 DOM)重寫成 React 元件化開發,用 Vite 風格的建置流程,但用 Next.js(純靜態匯出模式,`output:'export'`,沒有用到任何伺服器功能)。原因跟取捨見 `../CLAUDE.md`「目前的檔案」一節。

## 開發

```
cd web
npm run dev     # http://localhost:3000
npm run build   # 產生 out/,basePath 會是 /barbarian-game(對應 GitHub Pages 的路徑)
```

## 階段進度

- **階段 1(已完成)**:專案架構(`lib/data.js`、`lib/stats.js`、`lib/state.js`)、建立角色流程(`IntroScreen` → `CreateScreen` → 存進 localStorage 鍵 `barbarian-labyrinth-v5`)。用 Playwright 驗證過畫面、存檔、重新整理後能讀回存檔,`next build` 靜態匯出成功。
- **階段 2(已完成,桌面版)**:城市畫面(`lib/city.js` + `components/CityScreen.js` + `components/city/`)。
  - 完整功能:探險者名單(`MemberCard`,含派遣/刺青/靈魂獸契約/精靈契約面板)、住處(`HomeTab`,擴建、日誌)、酒館(`TavernTab`,招募)、鐵匠鋪(`SmithTab`,強化裝備、換武器、造船廠)、雜貨店(`StoreTab`)、大神殿(`TempleTab`,治療/安定心神/復活;移除精髓先空著)、「度過一天」(`processDays`,派遣結算/生活費/稅金/酒館換人)。
  - 先空著(`PlaceholderTab`):探險者公會、中央圖書館、中央交易所——這三個需要怪物資料(`MON`/`FIELDS`)跟精髓系統(`ESS`/`SK`/`PS`/`NUM`),等迷宮/戰鬥階段把這些資料表搬過來後再補。
  - 迷宮入口(次元廣場的「進入迷宮」)也先空著,只留「度過一天」能推進時間。
  - **重要教訓**:`setState` 的 updater 函式一開始用淺拷貝(`{...prev}`)+ 直接 mutate 巢狀陣列/物件,結果在 React/Next 開發模式的 StrictMode 下,updater 會被呼叫兩次來檢查副作用,導致同一個操作套用兩次(例如酒館招募重複執行,出現重複 id)。改成 `structuredClone(prev)` 深拷貝後解決,詳見 `app/page.js` 的 `mutate` 註解。
- **階段 3(已完成,只搬了第 1 層)**:迷宮探索(`lib/dungeon.js` + `components/DungeonScreen.js` + `components/dungeon/`)。
  - 只搬了第 1 層水晶洞窟的地圖生成(`genFloor1`,十字四區+中心安全區)跟非戰鬥房型:寶箱、魔石礦脈、陷阱、治癒泉水、流浪商人、空地、安全區(大賢者紀念碑)、傳送門石碑(入口/返回)。其他 5 層的 `FIELDS`/`genFloor` 分支還沒搬,`怪物房`(combat)遇到時只能退回上一間——戰鬥引擎是下一階段才會做。
  - 時間推進(`advanceTime`)、樓層關閉自動回城(`eject`/`returnToCity`)都照原本邏輯搬過來,城市那邊的「度過一天」(`processDays`)在回城時會接著跑,天數跟經濟會正確累加。
  - 精髓/裂縫/層主三個系統都還沒搬(跟 FIELDS 的 elite/altar 房型一起留到戰鬥階段),`fillRooms` 的房間池先拿掉這兩種。
  - 用 Playwright 測過完整流程:建角色、進迷宮、移動探索(含被怪物房擋住只能退回的情況)、紮營、等到關閉自動回城、城市經濟接續正確,沒有 console 錯誤。
- **階段 4(未開始)**:回合制戰鬥引擎(最複雜,排最後)。
- **階段 5(未開始)**:手機版專屬 UI(`isMobile()` 那一整套神魔之塔風格排版)。
- 像素圖產生系統(`humanoid()`/`GRIDS`/`gridCanvas()`)目前還沒搬,角色頭像先用種族首字當佔位符(`.spr` 的文字版本)。

## 還沒做的事

- GitHub Pages 的部署設定還沒動,現場服務的仍然是 `../index.html`。等這個重寫涵蓋完整遊戲、確認沒問題後,才會換成用 GitHub Actions 建置這個 `web/` 專案並部署。
- 沒有串接任何伺服器功能(排行榜、存檔同步是以後的事,到時候要搬離 GitHub Pages)。
