import { BUILDINGS } from './buildings';

export default function BuildingHeader({ k }) {
  const b = BUILDINGS[k];
  if (!b) return null;
  return (
    <>
      <div className="bldhead">
        <span className={`bldicon ${k}`}>{b.ic}</span>
        <div>
          <h2>{b.n}</h2>
          <p className="mute" style={{ fontSize: 12.5 }}>{b.place}</p>
        </div>
      </div>
      {b.flavor && <p className="mute" style={{ fontSize: 13 }}>{b.flavor}</p>}
    </>
  );
}
