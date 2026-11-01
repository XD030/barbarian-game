export default function MobileTabBar({ view, open, until, onNav }) {
  const orb = open ? <>已<small>開啟</small></> : <>{until}<small>天後開啟</small></>;
  return (
    <nav className="mtabbar" aria-label="主選單">
      <button className="mtab" aria-pressed={view === 'team'} onClick={() => onNav('team')}><span className="ic">隊</span><span className="tl">隊伍</span></button>
      <button className="mtab" aria-pressed={view === 'bag'} onClick={() => onNav('bag')}><span className="ic">包</span><span className="tl">背包</span></button>
      <button className="mtab center" aria-label="回到城市地圖" onClick={() => onNav('map')}><span className="orb">{orb}</span></button>
      <button className="mtab" disabled aria-label="之後開放"><span className="ic">—</span><span className="tl">之後</span></button>
      <button className="mtab" disabled aria-label="之後開放"><span className="ic">—</span><span className="tl">之後</span></button>
    </nav>
  );
}
