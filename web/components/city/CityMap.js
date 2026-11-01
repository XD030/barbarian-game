export default function CityMap({ tabs, onEnterBld }) {
  return (
    <>
      <h2 style={{ marginBottom: 4 }}>拉夫多尼亞</h2>
      <p className="mute" style={{ fontSize: 12.5, marginBottom: 4 }}>點建築物進去</p>
      <div className="citymap">
        {tabs.map(([k, n, ic]) => (
          <button key={k} className={`bld ${k}`} onClick={() => onEnterBld(k)}>
            <span className="ico">{ic}</span><span className="tl">{n}</span>
          </button>
        ))}
      </div>
    </>
  );
}
