'use client';
import { useEffect, useState } from 'react';

export function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    let mq;
    try { mq = matchMedia('(max-width:767px)'); } catch { return; }
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return mobile;
}
