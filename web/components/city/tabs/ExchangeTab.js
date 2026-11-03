import { useState } from 'react';
import { essInfo, essSkillDesc, essPrice } from '../../../lib/essence';
import { NUM } from '../../../lib/num';
import { ECON } from '../../../lib/data';
import { living } from '../../../lib/city';
import Modal from '../../Modal';
import AbsorbModal from '../../AbsorbModal';

function EquipModal({ state, it, onEquip, onClose }) {
  const d = NUM[it.id];
  return (
    <Modal title={`裝備 ${d.n}`} onClose={onClose} actions={[{ label: '取消', onClick: onClose }]}>
      <p className="mute">{d.d}</p>
      <div className="list">
        {living(state).map(m => (
          <div className="item" key={m.id}>
            <span><b>{m.name}</b> <span className="mute">{m.num ? '已裝備 ' + NUM[m.num.id].n : ''}</span></span>
            <button className="btn sm primary" onClick={() => { onEquip(m.id); onClose(); }}>裝備</button>
          </div>
        ))}
      </div>
    </Modal>
  );
}

function essRow(it, i, onAbsorbOpen, onSellEss) {
  return (
    <div className="item" key={i}>
      <span className="chip ess" style={{ '--c': essInfo(it).color }}>{essInfo(it).n}</span>
      <span className="row">
        <button className="btn sm" onClick={() => onAbsorbOpen(i)}>吸收</button>
        <button className="btn sm" onClick={() => onSellEss(i)}>賣 {essPrice(it)}</button>
      </span>
      <small dangerouslySetInnerHTML={{ __html: essSkillDesc(it) }} />
    </div>
  );
}

function itemRow(it, i, onEquipOpen, onAppraise, onSellItem, state) {
  if (it.type === 'riftstone') {
    return (
      <div className="item" key={i}>
        <span>裂縫石(第 {it.f} 層)</span>
        <button className="btn sm" onClick={() => onSellItem(i)}>賣 {300 * ECON * it.f}</button>
      </div>
    );
  }
  if (!it.ided) {
    return (
      <div className="item" key={i}>
        <span>未鑑定的編號物品</span>
        <span className="row">
          <button className="btn sm" disabled={state.stone < 300 * ECON} onClick={() => onAppraise(i)}>鑑定 {300 * ECON}</button>
          <button className="btn sm" onClick={() => onSellItem(i)}>直接賣 {150 * ECON}</button>
        </span>
      </div>
    );
  }
  const d = NUM[it.id];
  return (
    <div className="item" key={i}>
      <span>{d.n} <span className="mute">({d.r})</span></span>
      <span className="row">
        <button className="btn sm" onClick={() => onEquipOpen(i)}>裝備</button>
        <button className="btn sm" onClick={() => onSellItem(i)}>賣 {d.price}</button>
      </span>
      <small>{d.d}</small>
    </div>
  );
}

export default function ExchangeTab({ state, onAbsorb, onSellEss, onEquip, onAppraise, onSellItem }) {
  const [absorbTarget, setAbsorbTarget] = useState(null); // {src:'bag', i}
  const [equipTarget, setEquipTarget] = useState(null); // i into state.items

  return (
    <>
      <div className="sub">精髓背包</div>
      {state.bag.length ? (
        <div className="list">
          {state.bag.map((it, i) => essRow(it, i, () => setAbsorbTarget({ src: 'bag', i }), (idx) => onSellEss(idx)))}
        </div>
      ) : <p className="mute">空的。</p>}
      <div className="sub">物品</div>
      {state.items.length ? (
        <div className="list">
          {state.items.map((it, i) => itemRow(it, i, (idx) => setEquipTarget(idx), onAppraise, onSellItem, state))}
        </div>
      ) : <p className="mute">沒有物品。</p>}

      {absorbTarget && (
        <AbsorbModal
          who={living(state)}
          it={state.bag[absorbTarget.i]}
          onAbsorb={(memberId) => onAbsorb('bag', absorbTarget.i, memberId)}
          onClose={() => setAbsorbTarget(null)}
        />
      )}
      {equipTarget != null && state.items[equipTarget] && (
        <EquipModal
          state={state}
          it={state.items[equipTarget]}
          onEquip={(memberId) => onEquip(equipTarget, memberId)}
          onClose={() => setEquipTarget(null)}
        />
      )}
    </>
  );
}
