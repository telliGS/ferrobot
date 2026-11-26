import { useEffect, useState, type ReactNode } from 'react';
import s from './AppShell.module.css';
import { numericDate, time } from '../lib/format';

type Section = {
  id: string;
  short: string;
  label: string;
  hint: string;
  ready: boolean;
};

const sections: Section[] = [
  { id: 'pos', short: 'POS', label: 'Punto de venta', hint: 'F1', ready: true },
  { id: 'catalogo', short: 'CAT', label: 'Catálogo', hint: 'F2', ready: false },
  { id: 'inventario', short: 'INV', label: 'Inventario', hint: 'F3', ready: false },
  { id: 'reportes', short: 'REP', label: 'Reportes', hint: 'F4', ready: false },
];

const assistantSection = { short: 'IA', label: 'Ferrobot', hint: 'F5' };

type AppShellProps = {
  section: string;
  /** Palabras guía: qué tramo se está viendo, calculado con los resultados. */
  guide: ReactNode;
  assistantOpen: boolean;
  onAssistantToggle: () => void;
  children: ReactNode;
};

export function AppShell({
  section,
  guide,
  assistantOpen,
  onAssistantToggle,
  children,
}: AppShellProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className={s.shell}>
      <aside className={s.rail} aria-label="Secciones del sistema">
        <div className={s.mark} aria-hidden="true">
          <span className={s.markH} />
          <span className={s.markV} />
        </div>

        <nav className={s.nav}>
          {sections.map((item) =>
            item.ready ? (
              <button
                key={item.id}
                type="button"
                className={s.railItem}
                data-active="true"
                aria-current="page"
              >
                <span className={s.railTick} aria-hidden="true" />
                <span className={s.railShort} aria-hidden="true">
                  {item.short}
                </span>
                <span className="sr-only">
                  {item.label} ({item.hint})
                </span>
              </button>
            ) : (
              <span
                key={item.id}
                className={s.railItem}
                data-pending="true"
                aria-hidden="true"
              >
                <span className={s.railTick} />
                <span className={s.railShort}>{item.short}</span>
              </span>
            ),
          )}

          <span className={s.railSplit} aria-hidden="true" />

          <button
            type="button"
            className={s.railItem}
            data-open={assistantOpen}
            aria-expanded={assistantOpen}
            aria-controls="ferrobot"
            aria-keyshortcuts="F5"
            onClick={onAssistantToggle}
            title="Ferrobot · F5"
          >
            <span className={s.railTick} aria-hidden="true" />
            <span className={s.railShort} aria-hidden="true">
              {assistantSection.short}
            </span>
            <span className="sr-only">
              {assistantSection.label} ({assistantSection.hint})
            </span>
          </button>
        </nav>

        <p className={s.railFoot} aria-hidden="true">
          v0.1
        </p>
      </aside>

      <div className={s.main}>
        <header className={s.guide}>
          <div className={s.guideLead}>
            <span className={s.guideSection}>{section}</span>
            <div className={s.guideWords}>{guide}</div>
          </div>

          <div className={s.guideMeta}>
            <span className={s.clock}>
              {numericDate(now)} · {time(now)}
            </span>
            <span className={s.rule} aria-hidden="true" />
            <span className={s.user}>Vendedor</span>
          </div>
        </header>

        <main className={s.content}>{children}</main>
      </div>
    </div>
  );
}
