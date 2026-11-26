import { useEffect, useState } from 'react';
import s from './BootDial.module.css';

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Arranque: un nonio corre hasta alinear sus marcas con la regla principal.
 * Cuando coinciden, el sistema está listo.
 *
 * Dura 620 ms, no bloquea la carga y se descarta con cualquier clic.
 * Con movimiento reducido no se muestra.
 */
export function BootDial() {
  const [visible, setVisible] = useState(() => !prefersReducedMotion());

  useEffect(() => {
    if (!visible) return;
    const id = window.setTimeout(() => setVisible(false), 620);
    return () => window.clearTimeout(id);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className={s.overlay}
      onClick={() => setVisible(false)}
      role="presentation"
    >
      <div className={s.dial} aria-hidden="true">
        <div className={s.beam} />
        <div className={s.jaw}>
          <div className={s.vernier} />
        </div>
      </div>
      <span className={s.caption} aria-hidden="true">
        calibrando
      </span>
    </div>
  );
}
