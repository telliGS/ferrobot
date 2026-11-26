import { useEffect, useRef, type FormEvent } from 'react';
import s from './FerrobotPanel.module.css';
import { products, type Product, type Variant } from '../data/catalog';
import {
  catalogStats,
  ferrobotIntro,
  suggestions,
  type FerrobotCard,
  type FerrobotChoice,
  type FerrobotReply,
} from '../lib/ferrobot';
import { count, money } from '../lib/format';
import { stockState } from '../lib/search';
import { useFerrobot, type FerrobotTurn } from '../lib/useFerrobot';

type FerrobotPanelProps = {
  open: boolean;
  onClose: () => void;
  onReveal: (productId: string, variantId: string) => void;
};

const variantIndex = new Map<string, { product: Product; variant: Variant }>();
for (const product of products) {
  for (const variant of product.variants) {
    variantIndex.set(variant.id, { product, variant });
  }
}

/**
 * Ferrobot es una herramienta de mostrador, no un personaje.
 * Panel no modal: se puede seguir mirando el catálogo y la nota de venta.
 * Sin burbujas, sin emojis, sin mascota. La conversación es un registro.
 */
export function FerrobotPanel({ open, onClose, onReveal }: FerrobotPanelProps) {
  const { turns, thinking, draft, setDraft, send } = useFerrobot();
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  /* El registro se queda abajo, como una libreta que se sigue escribiendo. */
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [turns, thinking]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    send(draft);
  }

  return (
    <aside
      id="ferrobot"
      className={s.panel}
      data-open={open}
      inert={!open}
      aria-labelledby="ferrobot-title"
      onKeyDown={(event) => {
        /* Cierra desde cualquier control del panel, no solo desde el campo. */
        if (event.key === 'Escape') {
          event.preventDefault();
          onClose();
        }
      }}
    >
      <header className={s.head}>
        <div className={s.headText}>
          <p className={s.kicker}>Asistente de mostrador</p>
          <h2 className={s.title} id="ferrobot-title">
            Ferrobot
          </h2>
          <p className={s.status}>
            <span className={s.statusDot} aria-hidden="true" />
            Catálogo local · {catalogStats.products} productos
          </p>
        </div>

        <button
          type="button"
          className={s.close}
          onClick={onClose}
          aria-label="Cerrar Ferrobot"
        >
          <span aria-hidden="true">×</span>
        </button>
      </header>

      <ol
        ref={logRef}
        className={s.log}
        role="log"
        aria-label="Conversación con Ferrobot"
        aria-live="polite"
        aria-relevant="additions"
      >
        {turns.length === 0 && (
          <li className={s.intro}>
            <p className={s.introLead}>{ferrobotIntro.lead}</p>
            <p className={s.introNote}>{ferrobotIntro.note}</p>
            <div className={s.suggestions} role="group" aria-label="Consultas sugeridas">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.query}
                  type="button"
                  className={s.suggestion}
                  onClick={() => send(suggestion.query)}
                >
                  {suggestion.label}
                </button>
              ))}
            </div>
          </li>
        )}

        {turns.map((turn) => (
          <Turn
            key={turn.id}
            turn={turn}
            disabled={thinking}
            onReveal={onReveal}
            onSend={send}
          />
        ))}

        {thinking && (
          <li className={s.thinkingRow} aria-hidden="true">
            <span className={s.who}>Ferrobot</span>
            <span className={s.thinking}>
              <span className={s.ticks}>
                <i />
                <i />
                <i />
              </span>
              Consultando catálogo…
            </span>
          </li>
        )}
      </ol>

      <p className="sr-only" role="status">
        {thinking ? 'Consultando el catálogo' : ''}
      </p>

      <form className={s.composer} onSubmit={onSubmit}>
        <label className={s.label} htmlFor="ferrobot-input">
          Preguntar a Ferrobot
        </label>
        <div className={s.inputRow}>
          <input
            ref={inputRef}
            id="ferrobot-input"
            type="text"
            className={s.input}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={'Ej.: clavo 2" o 5/16'}
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="submit"
            className={s.submit}
            disabled={!draft.trim() || thinking}
          >
            Consultar
          </button>
        </div>
        <p className={s.hint}>
          <kbd>Enter</kbd> envía · <kbd>Esc</kbd> o <kbd>F5</kbd> cierran
        </p>
      </form>
    </aside>
  );
}

/* --- Registro ---------------------------------------------------------- */

type TurnProps = {
  turn: FerrobotTurn;
  disabled: boolean;
  onReveal: (productId: string, variantId: string) => void;
  onSend: (text: string) => void;
};

function Turn({ turn, disabled, onReveal, onSend }: TurnProps) {
  if (turn.role === 'user') {
    return (
      <li className={s.turn} data-role="user">
        <span className={s.who}>Vos</span>
        <p className={s.userText}>{turn.text}</p>
      </li>
    );
  }

  return (
    <li className={s.turn} data-role="ferrobot">
      <span className={s.who}>Ferrobot</span>
      <Reply reply={turn.reply} disabled={disabled} onReveal={onReveal} onSend={onSend} />
    </li>
  );
}

type ReplyProps = {
  reply: FerrobotReply;
  disabled: boolean;
  onReveal: (productId: string, variantId: string) => void;
  onSend: (text: string) => void;
};

function Reply({ reply, disabled, onReveal, onSend }: ReplyProps) {
  return (
    <div className={s.reply}>
      <p className={s.lead}>{reply.lead}</p>

      {reply.cards && reply.cards.length > 0 && (
        <ul className={s.cards} aria-label="Variantes encontradas">
          {reply.cards.map((card) => (
            <li key={`${card.productId}:${card.variantId}`}>
              <VariantCard card={card} onReveal={onReveal} />
            </li>
          ))}
        </ul>
      )}

      {reply.choices && reply.choices.length > 0 && (
        <div className={s.choiceBlock}>
          {reply.choicePrompt && <p className={s.choicePrompt}>{reply.choicePrompt}</p>}
          <div className={s.choiceRow}>
            {reply.choices.map((choice, index) => (
              <Choice
                key={`${choice.query}:${index}`}
                choice={choice}
                disabled={disabled}
                onSend={onSend}
              />
            ))}
          </div>
        </div>
      )}

      {reply.note && <p className={s.note}>{reply.note}</p>}
    </div>
  );
}

function Choice({
  choice,
  disabled,
  onSend,
}: {
  choice: FerrobotChoice;
  disabled: boolean;
  onSend: (text: string) => void;
}) {
  return (
    <button
      type="button"
      className={s.choice}
      disabled={disabled}
      onClick={() => onSend(choice.query)}
    >
      {choice.label}
    </button>
  );
}

function VariantCard({
  card,
  onReveal,
}: {
  card: FerrobotCard;
  onReveal: (productId: string, variantId: string) => void;
}) {
  const entry = variantIndex.get(card.variantId);
  if (!entry) return null;

  const { product, variant } = entry;
  const state = stockState(variant);
  const stock =
    state === 'out'
      ? 'sin stock'
      : `${count(variant.stock)} · ${state === 'low' ? 'bajo mínimo' : 'en stock'}`;

  return (
    <button
      type="button"
      className={s.card}
      onClick={() => onReveal(product.id, variant.id)}
    >
      <span className={s.cardTop}>
        <span className={s.cardName}>{product.name}</span>
        <span className={s.cardMeasure}>{variant.label}</span>
      </span>
      <span className={s.cardBottom}>
        <span className={s.cardPrice}>{money(variant.price)}</span>
        <span className={s.cardStock} data-state={state}>
          {stock}
        </span>
        <span className={s.cardGo}>Ver en el catálogo</span>
      </span>
    </button>
  );
}
