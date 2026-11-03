import { useState } from 'react';
import { REQ_CAP, REQ_DESC, reqProgress, reqDone, nextReqInMs, rankCap } from '../../../lib/guild';

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

export default function GuildTab({ state, onClaimReq, onExam }) {
  const [book, setBook] = useState('req');
  const nextIn = nextReqInMs(state);
  const cap = rankCap(state);
  const canExam = state.contrib >= 80 && !state.examPassed;
  const sel = state.sel.map(id => state.members.find(m => m.id === id)).filter(m => m && !m.dead);

  return (
    <>
      <p className="mute" style={{ fontSize: 12.5, marginBottom: 16 }}>
        每 4 小時可獲取一個新委託。最多可同時持有 {REQ_CAP} 個委託
        {nextIn != null && <> · 下一個委託:{fmtCountdown(nextIn)}後</>}
      </p>

      <div className="pillbar" style={{ marginBottom: 14 }}>
        {BOOKS.map(([k, n]) => (
          <button key={k} className={`pill ${book === k ? 'sel' : ''}`} onClick={() => setBook(k)}>{n}</button>
        ))}
      </div>

      {book === 'req' && (
        state.reqs.length ? (
          <div className="qlist">
            {state.reqs.map(r => <ReqCard key={r.id} state={state} r={r} onClaim={onClaimReq} />)}
          </div>
        ) : <p className="mute">目前沒有委託。</p>
      )}

      {book === 'bounty' && <p className="mute">懸賞還沒開放。</p>}
      {book === 'exam' && (
        <>
          <p className="mute" style={{ fontSize: 12.5 }}>
            公會認證:{cap === 7 ? '最高可認定為 7 級' : cap === 6 ? '中堅(可認定到 6 級)' : '考試合格(可認定到 4 級)'}
            ・貢獻 {state.contrib}{state.contrib < 30 ? '(滿 30 通過 6 級審查)' : state.examPassed ? '' : '(滿 80 可報考 5 級)'}
          </p>
          {state.examPassed ? (
            <p className="mute">已經通過 5 級晉級考試了。</p>
          ) : !canExam ? (
            <p className="mute">貢獻點滿 80 才能報考 5 級晉級考試(與公會考官交手)。</p>
          ) : (
            <>
              <p className="mute" style={{ fontSize: 12.5 }}>{sel.length ? sel.map(m => m.name).join('、') : '還沒選人'}(到上方「探險者」名單勾選「出征」組隊)</p>
              <div className="row"><button className="btn primary" disabled={!sel.length} onClick={onExam}>報考 5 級晉級考試(與考官交手)</button></div>
            </>
          )}
        </>
      )}
    </>
  );
}
