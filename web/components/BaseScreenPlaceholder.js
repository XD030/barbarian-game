export default function BaseScreenPlaceholder({ hero, onResetSave }) {
  return (
    <section className="panel" style={{ maxWidth: 640, margin: '6vh auto 0' }}>
      <h2>角色建立完成</h2>
      <p>
        <b>{hero.name}</b>({hero.race === 'barb' ? '蠻族' : hero.race})已經存進 localStorage 了。
      </p>
      <p className="mute" style={{ fontSize: 13 }}>
        城市/迷宮/戰鬥畫面還沒搬過來(這是模組化的第一階段,先確認架構跟資料流可行)。
      </p>
      <div className="row">
        <button className="btn" onClick={onResetSave}>清除存檔,回到開頭</button>
      </div>
    </section>
  );
}
