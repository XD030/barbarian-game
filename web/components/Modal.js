'use client';

export default function Modal({ title, children, actions, onClose }) {
  return (
    <div className="modal" onClick={e => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className="box">
        <h2>{title}</h2>
        <div className="mbody">{children}</div>
        <div className="acts">
          {(actions || [{ label: '確定', cls: 'primary', onClick: onClose }]).map((a, i) => (
            <button key={i} className={`btn ${a.cls || ''}`} onClick={a.onClick}>{a.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
