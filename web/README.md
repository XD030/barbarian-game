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
- **階段 2(未開始)**:城市畫面(住處/酒館/公會/圖書館/交易所/大神殿/鐵匠鋪/雜貨店)。
- **階段 3(未開始)**:迷宮探索。
- **階段 4(未開始)**:回合制戰鬥引擎(最複雜,排最後)。
- **階段 5(未開始)**:手機版專屬 UI(`isMobile()` 那一整套神魔之塔風格排版)。
- 像素圖產生系統(`humanoid()`/`GRIDS`/`gridCanvas()`)目前還沒搬,`CreateScreen` 的角色預覽先用種族首字當佔位符。

## 還沒做的事

- GitHub Pages 的部署設定還沒動,現場服務的仍然是 `../index.html`。等這個重寫涵蓋完整遊戲、確認沒問題後,才會換成用 GitHub Actions 建置這個 `web/` 專案並部署。
- 沒有串接任何伺服器功能(排行榜、存檔同步是以後的事,到時候要搬離 GitHub Pages)。
