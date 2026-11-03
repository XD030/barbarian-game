import { essInfo, essDesc, essSkillDesc, essSlots, absorbCheck } from '../lib/essence';
import Modal from './Modal';

export default function AbsorbModal({ it, who, onAbsorb, onClose }) {
  return (
    <Modal title={`吸收 ${essInfo(it).n}`} onClose={onClose} actions={[{ label: '取消', onClick: onClose }]}>
      <p className="mute" style={{ fontSize: 12.5, marginBottom: 8 }}>{essDesc(it)}</p>
      <p style={{ fontSize: 13, marginBottom: 8 }} dangerouslySetInnerHTML={{ __html: essSkillDesc(it) }} />
      <div className="list">
        {who.map(m => {
          const c = absorbCheck(m, it);
          return (
            <div className="item" key={m.id}>
              <span><b>{m.name}</b> <span className="mute">Lv{m.lv} · 槽 {m.ess.length}/{essSlots(m)}</span></span>
              {c.ok
                ? <button className="btn sm primary" onClick={() => { onAbsorb(m.id); onClose(); }}>{c.upgrade !== undefined ? '升級為守護者精髓' : '吸收'}</button>
                : <span className="mute" style={{ fontSize: 12 }}>{c.why}</span>}
            </div>
          );
        })}
      </div>
      <p className="mute" style={{ fontSize: 12, marginTop: 6 }}>槽滿或技能重複的人,要先到大神殿移除舊精髓。</p>
    </Modal>
  );
}
