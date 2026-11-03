import { useState } from 'react';
import { essInfo, essDesc, essSkillDesc, essPrice, ESS } from '../../../lib/essence';
import { NUM } from '../../../lib/num';
import { ECON, GRADE } from '../../../lib/data';
import { living } from '../../../lib/city';
import { LIB_ESS } from '../../../lib/library';
import { SK } from '../../../lib/skills';
import { PS } from '../../../lib/passives';
import { monName } from '../../../lib/monInfo';
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

export default function ExchangeTab({ state, onAbsorb, onSellEss, onEquip, onAppraise, onSellItem, onBuyLibEss, onBuyGuildEss }) {
  const [absorbTarget, setAbsorbTarget] = useState(null); // {src:'bag', i}
  const [equipTarget, setEquipTarget] = useState(null); // i into state.items

  return (
    <>
      <div className="sub">圖書館精髓(9 級,顏色隨機)</div>
      <div className="list">
        {LIB_ESS.map(k => (
          <div className="item" key={k}>
            <span>{monName(k)}精髓</span>
            <button className="btn sm" disabled={state.stone < GRADE[9].price} onClick={() => onBuyLibEss(k)}>{GRADE[9].price}</button>
            <small>{ESS[k].acts.map(a => `「${SK[a].n}」`).join('或')}{ESS[k].pas ? `;被動「${PS[ESS[k].pas].n}」` : ''}</small>
          </div>
        ))}
      </div>
      <div className="sub">公會精髓(8 級以上,公會認證越高能買越高級,每月 1 日更新)</div>
      {state.shop.length ? (
        <div className="list">
          {state.shop.map((it, i) => {
            const p = GRADE[essInfo(it).g].price;
            return (
              <div className="item" key={i}>
                <span className="chip ess" style={{ '--c': essInfo(it).color }}>{essInfo(it).n}</span>
                <button className="btn sm" disabled={state.stone < p} onClick={() => onBuyGuildEss(i)}>{p}</button>
                <small>{essDesc(it)}</small>
              </div>
            );
          })}
        </div>
      ) : <p className="mute">這個月的精髓賣完了。</p>}
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
