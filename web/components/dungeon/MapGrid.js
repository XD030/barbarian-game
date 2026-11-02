import { RT, SAFE_ROOMS, roomHasFoes, visible, reachable } from '../../lib/dungeon';

export default function MapGrid({ map, prev, onMove }) {
  const cur = map.rooms[map.cur];
  const blocked = roomHasFoes(cur);
  const cells = [];
  for (let gy = 0; gy < map.H * 2 - 1; gy++) {
    for (let gx = 0; gx < map.W * 2 - 1; gx++) {
      if (gx % 2 === 0 && gy % 2 === 0) {
        const i = (gy / 2) * map.W + gx / 2, r = map.rooms[i], vis = visible(map, i), isCur = i === map.cur;
        const can = !isCur && cur.links.includes(i) && (!blocked || i === prev);
        let g = '?', cls = 'room';
        if (r.visited) { g = RT[r.type].g; cls += ' visited'; if (r.cleared) cls += ' cleared'; }
        else if (vis) { g = r.type === 'trap' ? '空' : RT[r.type].g; cls += ' known'; }
        if (vis && roomHasFoes(r)) cls += ' threat';
        if (vis && SAFE_ROOMS.includes(r.type)) cls += ' safe';
        if (isCur) cls += ' cur';
        if (can) cls += ' can';
        cells.push(
          <button key={i} className={cls} disabled={!can} tabIndex={can ? 0 : -1} aria-label={vis ? RT[r.type].n : '未知'} onClick={() => can && onMove(i)}>
            {g}
          </button>
        );
      } else if (gy % 2 === 0) {
        const a = (gy / 2) * map.W + (gx - 1) / 2, b = a + 1;
        cells.push(<div key={`${gx}-${gy}`}>{map.rooms[a].links.includes(b) && (visible(map, a) || visible(map, b)) && (reachable(map, a) || reachable(map, b)) ? <div className="corr-h" /> : null}</div>);
      } else if (gx % 2 === 0) {
        const a = ((gy - 1) / 2) * map.W + gx / 2, b = a + map.W;
        cells.push(<div key={`${gx}-${gy}`}>{map.rooms[a].links.includes(b) && (visible(map, a) || visible(map, b)) && (reachable(map, a) || reachable(map, b)) ? <div className="corr-v" /> : null}</div>);
      } else {
        cells.push(<div key={`${gx}-${gy}`} />);
      }
    }
  }
  const cols = Array(map.W).fill('var(--cell)').join(' var(--gap) ');
  return (
    <div className="mapbox">
      <div className="map" style={{ gridTemplateColumns: cols }}>{cells}</div>
      <div className="legend">
        <span><b>入</b>降落點</span><span><b>門</b>傳送門</span><span><b>戰</b>怪物</span><span><b>精</b>精英</span>
        <span><b>壇</b>裂縫祭壇</span><span><b>裂</b>裂縫</span><span><b>寶</b>寶箱</span><span><b>晶</b>魔石</span><span><b>碑屋安錨</b>安全區</span>
      </div>
    </div>
  );
}
