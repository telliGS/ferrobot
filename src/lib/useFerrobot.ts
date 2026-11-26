import { useCallback, useEffect, useRef, useState } from 'react';
import { answerFor, type FerrobotReply } from './ferrobot';

export type FerrobotTurn =
  | { id: number; role: 'user'; text: string }
  | { id: number; role: 'ferrobot'; reply: FerrobotReply };

/** La consulta es local, pero un salto instantáneo no se lee como una consulta. */
const THINKING_MS = 320;

export function useFerrobot() {
  const [turns, setTurns] = useState<FerrobotTurn[]>([]);
  const [draft, setDraft] = useState('');
  const [thinking, setThinking] = useState(false);

  const nextId = useRef(1);
  const timer = useRef<number | null>(null);
  const busy = useRef(false);

  useEffect(() => {
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, []);

  const send = useCallback((text: string) => {
    const value = text.trim();
    if (!value || busy.current) return;

    busy.current = true;
    setDraft('');
    setThinking(true);
    setTurns((previous) => [
      ...previous,
      { id: nextId.current++, role: 'user', text: value },
    ]);

    timer.current = window.setTimeout(() => {
      const reply = answerFor(value);
      setTurns((previous) => [
        ...previous,
        { id: nextId.current++, role: 'ferrobot', reply },
      ]);
      setThinking(false);
      busy.current = false;
      timer.current = null;
    }, THINKING_MS);
  }, []);

  return { turns, thinking, draft, setDraft, send };
}
