'use client';
import ExchangeTab from './tabs/ExchangeTab';

export default function BagScreen({ state, onAbsorb, onSellEss, onEquip, onAppraise, onSellItem }) {
  return (
    <>
      <h2 style={{ marginBottom: 4 }}>背包</h2>
      <ExchangeTab state={state} onAbsorb={onAbsorb} onSellEss={onSellEss} onEquip={onEquip} onAppraise={onAppraise} onSellItem={onSellItem} />
    </>
  );
}
