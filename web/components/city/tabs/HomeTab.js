import { capacity, living, livingCost, taxOf, dispatchSlots, activeDispatches } from '../../../lib/city';
import { ECON } from '../../../lib/data';

export default function HomeTab({ state, onDorm }) {
  const c = 150 * ECON * state.dorm, max = state.dorm >= 4;
  return (
    <>
      <div className="kv">
        <span>住處</span><b>拉維吉恩區的舊倉庫</b>
        <span>可住</span><b>{capacity(state)} 人(目前 {living(state).length})</b>
        <span>派遣名額</span><b>{activeDispatches(state)}/{dispatchSlots(state)}</b>
        <span>每日開銷</span><b>{living(state).reduce((a, m) => a + livingCost(state, m), 0)} 石幣</b>
        <span>每月稅金</span><b>{living(state).reduce((a, m) => a + taxOf(m), 0)} 石幣(1 日繳)</b>
        {state.carnon && <><span>第 1 區特權</span><b style={{ color: 'var(--torch-hi)' }}>已取得(生活開銷 -15%)</b></>}
      </div>
      <div className="row">
        <button className="btn sm" disabled={max || state.stone < c} onClick={onDorm}>{max ? '住處已擴建到最大' : `擴建住處(${c} 石幣)`}</button>
        <span className="mute" style={{ fontSize: 12 }}>多住 2 人,休息時壓力多降 6</span>
      </div>
      {!state.carnon && <p className="mute" style={{ fontSize: 12 }}>名聲達到 150 能讓第 1 區卡隆的守衛放行,受認可的探險者生活開銷會降低(目前名聲 {state.fame})。</p>}
      <div className="sub">日誌</div>
      <div className="list">
        {state.log.map((l, i) => <div key={i}><span className="mute" style={{ marginRight: 8 }}>{l.d}</span>{l.m}</div>)}
      </div>
    </>
  );
}
