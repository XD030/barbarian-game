export default function TopBar({ state }) {
  const open = state.day === 1;
  return (
    <div className="top">
      <div className="top-in">
        <span className="brand">蠻族迷宮生存</span>
        <span className={`day num ${open ? 'open' : ''}`}>第 {state.month} 月 {state.day} 日{open ? ' · 迷宮開啟' : ''}</span>
        <div className="res">
          <span className="rchip">石幣<b className="num">{state.stone}</b></span>
          <span className="rchip">名聲<b className="num">{state.fame}</b></span>
          <span className="rchip">貢獻<b className="num">{state.contrib}</b></span>
          {state.debt > 0 && <span className="rchip low">欠稅<b className="num">{state.debt}</b></span>}
        </div>
      </div>
    </div>
  );
}
