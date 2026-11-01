'use client';
import { useState } from 'react';

export default function BagScreen({ state }) {
  const [sub, setSub] = useState('item');
  return (
    <>
      <h2 style={{ marginBottom: 4 }}>背包</h2>
      <div className="tabpanel">
        <div className="booktabs">
          <button className={`booktab ${sub === 'item' ? 'sel' : ''}`} onClick={() => setSub('item')}>物品</button>
          <button className={`booktab ${sub === 'num' ? 'sel' : ''}`} onClick={() => setSub('num')}>編號</button>
        </div>
        <div className="tabbody">
          {sub === 'item' ? (
            state.bag.length ? <div className="bagGrid">{/* 精髓系統還沒搬過來 */}</div> : <p className="mute">空的。</p>
          ) : (
            state.items.length ? <div className="bagGrid">{/* 編號物品系統還沒搬過來 */}</div> : <p className="mute">沒有物品。</p>
          )}
        </div>
      </div>
      <p className="mute" style={{ fontSize: 12 }}>精髓/編號物品系統還沒搬過來(戰鬥階段一起處理)。</p>
    </>
  );
}
