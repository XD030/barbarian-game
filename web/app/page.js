'use client';
import { useEffect, useState } from 'react';
import { loadSave, writeSave, newState, makeMember, SAVE_KEY } from '../lib/state';
import { ECON } from '../lib/data';
import IntroScreen from '../components/IntroScreen';
import CreateScreen from '../components/CreateScreen';
import BaseScreenPlaceholder from '../components/BaseScreenPlaceholder';

export default function Page() {
  const [state, setState] = useState(null); // null = 還在讀 localStorage,避免 SSR/水合不一致
  const [screen, setScreen] = useState('intro'); // intro | create | base

  useEffect(() => {
    const saved = loadSave();
    setState(saved || newState());
    setScreen(saved ? (saved.screen === 'create' ? 'intro' : saved.screen) : 'intro');
  }, []);

  if (!state) return null;

  const hero = state.members.find(m => m.hero);

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

  return (
    <div className="wrap">
      {screen === 'intro' && (
        <IntroScreen saved={state.members.length ? state : null} onContinue={handleContinue} onNewGame={handleNewGame} />
      )}
      {screen === 'create' && <CreateScreen onConfirm={handleConfirmHero} />}
      {screen === 'base' && hero && <BaseScreenPlaceholder hero={hero} onResetSave={handleResetSave} />}
    </div>
  );
}
