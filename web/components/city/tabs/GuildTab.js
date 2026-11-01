import { useState } from 'react';
import { REQ_CAP, REQ_DESC, reqProgress, reqDone, nextReqInMs } from '../../../lib/guild';

const BOOKS = [['req', '委託'], ['bounty', '懸賞'], ['exam', '考核']];

function fmtCountdown(ms) {
  const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000);
  return `${h}小時${m}分`;
}

function ReqCard({ state, r, onClaim }) {
  const done = reqDone(state, r);
  const sub = r.type === 'kill' ? `進度:${Math.max(0, reqProgress(state, r))} / ${r.n}`
    : r.type === 'deliver' ? `目前持有 ${reqProgress(state, r)}`
    : done ? '可以回報' : '尚未完成';
  return (
    <div className="qcard">
      <b>{REQ_DESC(r)}</b>
      <span className="sub">{sub}</span>
      <div className="row" style={{ justifyContent: 'space-between', marginTop: 4 }}>
        <span className="mute" style={{ fontSize: 12 }}>報酬 {r.stone} 石幣、貢獻 {r.contrib}、名聲 {r.fame}</span>
        <button className={`btn sm ${done ? 'primary' : ''}`} disabled={!done} onClick={() => onClaim(r.id)}>回報</button>
      </div>
    </div>
  );
}

export default function GuildTab({ state, onClaimReq }) {
  const [book, setBook] = useState('req');
  const nextIn = nextReqInMs(state);

  return (
    <>
      <div className="gbooks">
        {BOOKS.map(([k, n]) => (
          <button key={k} className={`gbook ${book === k ? 'sel' : ''}`} onClick={() => setBook(k)}>{n}</button>
        ))}
      </div>

      {book === 'req' && (
        <>
          <h3 style={{ margin: 0 }}>每日任務</h3>
          <p className="mute" style={{ fontSize: 12.5 }}>
            每 4 小時可獲取一個新任務。最多可同時持有 {REQ_CAP} 個任務
            {nextIn != null && <> · 下一個任務:{fmtCountdown(nextIn)}後</>}
          </p>
          {state.reqs.length ? (
            <div className="qlist">
              {state.reqs.map(r => <ReqCard key={r.id} state={state} r={r} onClaim={onClaimReq} />)}
            </div>
          ) : <p className="mute">目前沒有委託。</p>}
        </>
      )}

      {book === 'bounty' && <p className="mute">懸賞還沒開放。</p>}
      {book === 'exam' && <p className="mute">考核還沒開放。</p>}
    </>
  );
}
