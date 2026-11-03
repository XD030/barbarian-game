// 次元崩壞:地圖還存在,但畫面被蓋過去,原地撐過固定波次才能回城。
export function CollapseMap() {
  return <p className="notice bad">次元崩壞!迷宮提前封閉,地板變成隨機的傳送門,人和怪物被丟到各處。撐過所有波次才回得去。</p>;
}

export default function CollapsePanel({ state, onCollapseFight, onCollapseRest }) {
  const c = state.run.collapse;
  return (
    <>
      <h3>第 {c.wave + 1} / {c.total} 波</h3>
      <p className="desc">{c.wave ? '下一波就要來了。' : '空間扭曲了。'}兩波之間有一點喘息的時間。</p>
      <div className="row">
        <button className="btn primary" onClick={onCollapseFight}>迎戰</button>
        {c.wave > 0 && <button className="btn" onClick={onCollapseRest}>喘口氣(回復 15% 生命)</button>}
      </div>
    </>
  );
}
