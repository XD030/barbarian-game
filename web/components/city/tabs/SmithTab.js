import { WEAPON, RACE } from '../../../lib/data';
import { living, gearCost, shipCost } from '../../../lib/city';
import { ECON } from '../../../lib/data';

export default function SmithTab({ state, onGear, onSwapWeapon, onHireNav, onBuyShip }) {
  return (
    <>
      <p className="mute">強化裝備最多到 +5。也可以換一把不同類型的武器。</p>
      <div className="list">
        {living(state).map(m => {
          const cw = gearCost(m, m.wpn), ca = gearCost(m, m.arm);
          return (
            <div className="item" key={m.id}>
              <span><b>{m.name}</b> <span className="mute">{WEAPON[m.weapon].n} +{m.wpn}・防具 +{m.arm}</span></span>
              <span />
              <small className="row">
                <button className="btn sm" disabled={m.wpn >= 5 || state.stone < cw} onClick={() => onGear(m.id, 'wpn')}>武器 +1({cw})</button>
                <button className="btn sm" disabled={m.arm >= 5 || state.stone < ca} onClick={() => onGear(m.id, 'arm')}>防具 +1({ca})</button>
                <select aria-label="換武器" defaultValue="" onChange={e => { if (e.target.value) { onSwapWeapon(m.id, e.target.value); e.target.value = ''; } }}>
                  <option value="">換武器…</option>
                  {Object.entries(WEAPON).filter(([k]) => k !== m.weapon).map(([k, w]) => <option key={k} value={k}>{w.n}({w.price})</option>)}
                </select>
              </small>
            </div>
          );
        })}
      </div>
      <div className="sub">造船廠(要去第 6 層大海必須兩樣都準備好)</div>
      <div className="kv"><span>航海士</span><b>{state.navigator ? '已雇用' : '未雇用'}</b><span>船隻</span><b>{state.ship ? `${state.ship} 級` : '還沒有船'}</b></div>
      <div className="row">
        {!state.navigator && <button className="btn sm" disabled={state.stone < 3000 * ECON} onClick={onHireNav}>雇用航海士・{3000 * ECON}</button>}
        {state.ship < 3 && <button className="btn sm" disabled={state.stone < shipCost(state.ship + 1)} onClick={onBuyShip}>{state.ship ? '升級船隻' : '建造船隻'}・{state.ship + 1} 級・{shipCost(state.ship + 1)}</button>}
      </div>
    </>
  );
}
