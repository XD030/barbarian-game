export default function IntroScreen({ saved, onContinue, onNewGame }) {
  return (
    <section className="intro">
      <h1>蠻族迷宮生存</h1>
      <p className="lede">
        世界只剩下一座城市,拉夫多尼亞。每個月的第一天,拉維吉恩區次元廣場的傳送門會通往迷宮。
        進去的人要等那一層關閉才回得來,帶著魔石和精髓,或者再也沒有回來。
        你剛在公會登記了名字,接下來發生的事只屬於你。
      </p>
      <div className="strip" />
      <div className="rules">
        <div><b>武器與精髓</b>沒有職業。武器決定攻擊類型,能力和技能全部來自精髓:一顆精髓給能力值、一個主動技能和一個被動,顏色決定是哪個主動技能。</div>
        <div><b>等級就是精髓槽</b>經驗只來自第一次打倒某種怪物和開啟新的傳送門。每升一級多一個精髓槽。</div>
        <div><b>關閉才能回城</b>迷宮每月 1 日開啟。各層關閉時間不同(1 層 7 天到 5 層 30 天),關閉時才會被傳回城市。</div>
        <div><b>知識就是力量</b>沒研究過的怪物看不到弱點。到中央圖書館查資料,或親身交手來記錄。</div>
        <div><b>裂縫</b>在祭壇獻上魔石打開裂縫,打倒守護者才出得來。守護者會留下裂縫石、編號物品或彩虹色的守護者精髓。</div>
        <div><b>死亡</b>同伴死了就回不來。主角死了要到三神教大神殿復活,第一次免費。</div>
      </div>
      <div className="row">
        {saved ? (
          <>
            <button className="btn primary" onClick={onContinue}>繼續冒險(第 {saved.month} 月 {saved.day} 日)</button>
            <button className="btn" onClick={onNewGame}>建立新角色</button>
          </>
        ) : (
          <button className="btn primary" onClick={onNewGame}>建立角色</button>
        )}
      </div>
    </section>
  );
}
