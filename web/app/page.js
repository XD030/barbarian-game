'use client';
import { useEffect, useState, useCallback } from 'react';
import { loadSave, writeSave, newState, makeMember, SAVE_KEY } from '../lib/state';
import { ECON } from '../lib/data';
import { refreshTavern } from '../lib/city';
import IntroScreen from '../components/IntroScreen';
import CreateScreen from '../components/CreateScreen';
import CityScreen from '../components/CityScreen';

export default function Page() {
  const [state, setState] = useState(null); // null = 還在讀 localStorage,避免 SSR/水合不一致
  const [screen, setScreen] = useState('intro'); // intro | create | base

  useEffect(() => {
    const saved = loadSave();
    setState(saved || newState());
    setScreen(saved ? (saved.screen === 'create' ? 'intro' : saved.screen) : 'intro');
  }, []);

  // 比照原本 index.html 的「S + 直接改 + save() + render()」寫法:
  // fn 直接改 working copy,改完存檔、觸發重新渲染。
  // 用 structuredClone 深拷貝再改,不要淺拷貝——React/Next 開發模式下 StrictMode
  // 會把 setState 的 updater 函式呼叫兩次來抓副作用,如果 fn 直接改到跟 prev 共用
  // 的巢狀陣列/物件(淺拷貝只複製最外層),同一個操作就會被套用兩次(例如酒館
  // 招募重複執行,兩個隊員拿到同一個 id)。深拷貝讓每次呼叫互相獨立,只有真正
  // 生效的那次回傳值算數。
  const mutate = useCallback((fn) => {
    setState(prev => {
      const next = structuredClone(prev);
      fn(next);
      writeSave(next);
      return next;
    });
  }, []);

  if (!state) return null;

  const handleNewGame = () => setScreen('create');
  const handleContinue = () => setScreen(state.screen && state.screen !== 'intro' ? state.screen : 'base');

  const handleConfirmHero = (draft) => {
    const fresh = newState();
    const h = makeMember(fresh, { name: draft.name.trim(), race: draft.race, weapon: draft.weapon, traits: [draft.bg], look: draft.look });
    h.hero = true;
    fresh.members.push(h);
    if (draft.bg === 'bg_noble') { fresh.stone += 300 * ECON; fresh.fame += 10; }
    fresh.sel = [h.id];
    fresh.screen = 'base';
    refreshTavern(fresh);
    fresh.log.unshift({ d: `${fresh.month}/${fresh.day}`, m: `${h.name} 在拉維吉恩區租了一間舊倉庫當住處,一個人開始冒險。` });
    writeSave(fresh);
    setState(fresh);
    setScreen('base');
  };

  const handleResetSave = () => {
    if (typeof window !== 'undefined') localStorage.removeItem(SAVE_KEY);
    const fresh = newState();
    setState(fresh);
    setScreen('intro');
  };

  if (screen === 'intro') return <div className="wrap"><IntroScreen saved={state.members.length ? state : null} onContinue={handleContinue} onNewGame={handleNewGame} /></div>;
  if (screen === 'create') return <div className="wrap"><CreateScreen onConfirm={handleConfirmHero} /></div>;
  return <CityScreen state={state} mutate={mutate} onResetSave={handleResetSave} />;
}
