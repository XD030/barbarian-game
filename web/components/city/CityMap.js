import { BUILDINGS } from './buildings';

export default function CityMap({ onEnterBld }) {
  return (
    <>
      <h2 style={{ marginBottom: 4 }}>拉夫多尼亞</h2>
      <p className="mute" style={{ fontSize: 12.5, marginBottom: 4 }}>點建築物進去</p>
      <div className="citymap">
        {Object.entries(BUILDINGS).map(([k, b]) => (
          <button key={k} className={`bld ${k}`} onClick={() => onEnterBld(k)}>
            <span className="ico">{b.ic}</span><span className="tl">{b.n}</span>
          </button>
        ))}
      </div>
    </>
  );
}
