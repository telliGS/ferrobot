import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import s from './PosView.module.css';
import { AppShell } from '../components/AppShell';
import { FerrobotPanel } from '../components/FerrobotPanel';
import { ReceiptSheet } from '../components/ReceiptSheet';
import { categories, products, type Product, type Variant } from '../data/catalog';
import { paymentMethods, type PaymentMethod, type Sale } from '../data/sale';
import { count, money, receiptNumber } from '../lib/format';
import { searchProducts, stockState, type Hit } from '../lib/search';

/** Índice variante → producto, para resolver el ticket sin recorrer el catálogo. */
const variantIndex = new Map<string, { product: Product; variant: Variant }>(
  products.flatMap((product) =>
    product.variants.map((variant) => [variant.id, { product, variant }] as const),
  ),
);

type TicketLine = {
  variantId: string;
  qty: number;
  /** Precio congelado al agregar. Ver D-20 en docs/decisiones.md. */
  unitPrice: number;
};

const categoryName = (id: string) =>
  categories.find((category) => category.id === id)?.name ?? '';

export function PosView() {
  const [query, setQuery] = useState('');
  const [listFocused, setListFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [variantByProduct, setVariantByProduct] = useState<Record<string, string>>({});
  const [lines, setLines] = useState<TicketLine[]>([]);
  const [payment, setPayment] = useState<PaymentMethod>('efectivo');
  const [sale, setSale] = useState<Sale | null>(null);
  const [sequence, setSequence] = useState(43);
  const [assistantOpen, setAssistantOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const rowRefs = useRef<Array<HTMLLIElement | null>>([]);

  const results = useMemo(() => searchProducts(query), [query]);
  const safeIndex = Math.min(activeIndex, Math.max(results.length - 1, 0));
  const active: Hit | undefined = results[safeIndex];

  const selectedVariant = useCallback(
    (hit: Hit): Variant =>
      hit.product.variants.find((variant) => variant.id === variantByProduct[hit.product.id]) ??
      hit.variant,
    [variantByProduct],
  );

  const total = lines.reduce((sum, line) => sum + line.unitPrice * line.qty, 0);
  const itemCount = lines.reduce((sum, line) => sum + line.qty, 0);

  /* La fila activa se mantiene a la vista al recorrer con ↓/↑. Sin esto, con
     una lista más larga que el catálogo, se puede seleccionar una fila que no
     se ve. `nearest` no mueve nada si la fila ya está entera a la vista. */
  useEffect(() => {
    if (!listFocused) return;
    rowRefs.current[safeIndex]?.scrollIntoView({ block: 'nearest' });
  }, [listFocused, safeIndex, query]);

  const addVariant = useCallback((variant: Variant) => {
    if (variant.stock <= 0) return;
    setLines((previous) => {
      const existing = previous.find((line) => line.variantId === variant.id);
      if (!existing) {
        return [...previous, { variantId: variant.id, qty: 1, unitPrice: variant.price }];
      }
      if (existing.qty >= variant.stock) return previous;
      return previous.map((line) =>
        line.variantId === variant.id ? { ...line, qty: line.qty + 1 } : line,
      );
    });
  }, []);

  const changeQty = useCallback((variantId: string, delta: number) => {
    setLines((previous) =>
      previous.flatMap((line) => {
        if (line.variantId !== variantId) return [line];
        const stock = variantIndex.get(variantId)?.variant.stock ?? line.qty;
        const next = line.qty + delta;
        if (next <= 0) return [];
        if (next > stock) return [line];
        return [{ ...line, qty: next }];
      }),
    );
  }, []);

  const setQty = useCallback((variantId: string, qty: number) => {
    setLines((previous) =>
      previous.flatMap((line) => {
        if (line.variantId !== variantId) return [line];
        const stock = variantIndex.get(variantId)?.variant.stock ?? line.qty;
        const next = Math.min(Math.max(qty, 0), stock);
        if (next <= 0) return [];
        return [{ ...line, qty: next }];
      }),
    );
  }, []);

  const toggleAssistant = useCallback(() => {
    setAssistantOpen((open) => !open);
  }, []);

  const closeAssistant = useCallback(() => {
    setAssistantOpen(false);
    inputRef.current?.focus();
  }, []);

  /** El puente con el mostrador: deja la variante exacta abierta en el catálogo. */
  const revealVariant = useCallback((productId: string, variantId: string) => {
    const entry = variantIndex.get(variantId);
    if (!entry || entry.product.id !== productId) return;

    setQuery(entry.product.code);
    setActiveIndex(0);
    setVariantByProduct((previous) => ({ ...previous, [productId]: variantId }));
    setListFocused(true);
    setAssistantOpen(false);
    inputRef.current?.focus();
  }, []);

  const charge = useCallback(() => {
    if (lines.length === 0) return;
    setAssistantOpen(false);
    const saleLines = lines.flatMap((line) => {
      const entry = variantIndex.get(line.variantId);
      if (!entry) return [];
      return [{ ...entry, qty: line.qty, unitPrice: line.unitPrice }];
    });
    setSale({
      number: receiptNumber(sequence),
      at: new Date(),
      lines: saleLines,
      total: saleLines.reduce((sum, line) => sum + line.unitPrice * line.qty, 0),
      payment,
    });
    setSequence((value) => value + 1);
  }, [lines, payment, sequence]);

  useEffect(() => {
    function onKey(event: globalThis.KeyboardEvent) {
      if (event.key === 'F2') {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
      if (event.key === 'F5') {
        event.preventDefault();
        if (sale) return;
        if (assistantOpen) {
          setAssistantOpen(false);
          inputRef.current?.focus();
        } else {
          setAssistantOpen(true);
        }
      }
      if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        charge();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [assistantOpen, charge, sale]);

  function onSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        if (results.length === 0) return;
        if (!listFocused) {
          setListFocused(true);
          setActiveIndex(0);
        } else {
          setActiveIndex(Math.min(safeIndex + 1, results.length - 1));
        }
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        if (!listFocused) return;
        if (safeIndex === 0) setListFocused(false);
        else setActiveIndex(safeIndex - 1);
        break;
      }
      case 'ArrowLeft':
      case 'ArrowRight': {
        if (!listFocused || !active) return;
        const variants = active.product.variants;
        const current = variants.findIndex(
          (variant) => variant.id === selectedVariant(active).id,
        );
        if (current < 0) return;
        const next =
          event.key === 'ArrowRight'
            ? Math.min(current + 1, variants.length - 1)
            : Math.max(current - 1, 0);
        if (next === current) return;
        event.preventDefault();
        setVariantByProduct((previous) => ({
          ...previous,
          [active.product.id]: variants[next].id,
        }));
        break;
      }
      case 'Enter': {
        event.preventDefault();
        if (!active) return;
        addVariant(selectedVariant(active));
        break;
      }
      case 'Escape': {
        if (query) {
          setQuery('');
          setActiveIndex(0);
        } else setListFocused(false);
        break;
      }
      default: {
        if (event.key.length === 1) setListFocused(false);
      }
    }
  }

  const guide = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return `${results.length} productos frecuentes`;
    if (results.length === 0) return `Sin coincidencias para “${trimmed}”`;
    if (results.length === 1) {
      const hit = results[0];
      const variants = hit.product.variants;
      const span = `${variants[0].label} a ${variants[variants.length - 1].label}`;
      return `1 producto · ${hit.product.name} · ${hit.product.brand} · ${span}`;
    }
    const sameCategory = results.every(
      (hit) => hit.product.categoryId === results[0].product.categoryId,
    );
    const category = sameCategory ? categoryName(results[0].product.categoryId) : '';
    return `${results.length} productos${category ? ` · ${category}` : ''}`;
  }, [query, results]);

  const announcement = active
    ? `${active.product.name}, ${active.product.brand}, ${selectedVariant(active).label}, ${count(
        selectedVariant(active).stock,
      )} en stock, ${money(selectedVariant(active).price)}`
    : 'Sin resultados';

  return (
    <AppShell
      section="Punto de venta"
      guide={guide}
      assistantOpen={assistantOpen}
      onAssistantToggle={toggleAssistant}
    >
      <div className={s.pos} data-assistant={assistantOpen}>
        <section className={s.catalog} aria-label="Buscador de productos">
          <div className={s.searchRow}>
            <input
              ref={inputRef}
              id="pos-search"
              type="search"
              className={s.search}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={onSearchKeyDown}
              placeholder="Buscar por nombre, código o medida"
              aria-label="Buscar producto por nombre, código o medida"
              aria-describedby="pos-search-help"
              autoComplete="off"
              spellCheck={false}
            />
            <kbd id="pos-search-help">F2</kbd>
          </div>

          <div className={s.columns} aria-hidden="true">
            <span>Producto</span>
            <span>Medida</span>
            <span>Stock</span>
            <span>Precio</span>
          </div>

          <ol className={s.results} role="list" aria-label="Resultados de búsqueda">
            {results.map((hit, index) => {
              const variant = selectedVariant(hit);
              const isActive = listFocused && index === safeIndex;
              const state = stockState(variant);
              return (
                <li
                  key={hit.product.id}
                  ref={(node) => {
                    rowRefs.current[index] = node;
                  }}
                  className={s.row}
                  data-active={isActive}
                  aria-current={isActive ? 'true' : undefined}
                  onClick={() => {
                    setListFocused(true);
                    setActiveIndex(index);
                    inputRef.current?.focus();
                  }}
                >
                  <Thumb product={hit.product} />

                  <div className={s.identity}>
                    <span className={s.meta}>
                      <span className={s.code}>{hit.product.code}</span>
                      <span className={s.brand}>{hit.product.brand}</span>
                    </span>
                    <span className={s.name}>{hit.product.name}</span>
                  </div>

                  <div className={s.data}>
                    <span className={s.measureChip} data-kind={hit.product.kind}>
                      {variant.label}
                    </span>
                    <StockGauge variant={variant} />
                    <span className={s.price}>{money(variant.price)}</span>
                    <button
                      type="button"
                      className={s.add}
                      disabled={state === 'out'}
                      onClick={(event) => {
                        event.stopPropagation();
                        addVariant(variant);
                      }}
                    >
                      Agregar
                    </button>
                  </div>

                  {isActive && (
                    <MeasureScale
                      product={hit.product}
                      activeVariantId={variant.id}
                      stockOf={(id) =>
                        hit.product.variants.find((item) => item.id === id)?.stock ?? 0
                      }
                      onSelect={(id) =>
                        setVariantByProduct((previous) => ({
                          ...previous,
                          [hit.product.id]: id,
                        }))
                      }
                    />
                  )}
                </li>
              );
            })}

            {results.length === 0 && (
              <li className={s.noResults}>
                <p className={s.noResultsTitle}>Sin coincidencias</p>
                <p className={s.noResultsText}>
                  Probá con el código del producto o con la medida. Por ejemplo
                  <span className={s.mono}> clavo 2</span>.
                </p>
              </li>
            )}
          </ol>

          <p className="sr-only" aria-live="polite">
            {announcement}
          </p>

          <footer className={s.hints}>
            <span>
              <kbd>↓</kbd> recorrer
            </span>
            <span>
              <kbd>←</kbd>
              <kbd>→</kbd> medida
            </span>
            <span>
              <kbd>Enter</kbd> agregar
            </span>
            <span>
              <kbd>Ctrl</kbd>+<kbd>Enter</kbd> cobrar
            </span>
          </footer>
        </section>

        <aside className={s.ticket} aria-label="Nota de venta">
          <header className={s.ticketHead}>
            <span className={s.ticketTitle}>Nota de venta</span>
            <span className={s.ticketNumber}>{receiptNumber(sequence)}</span>
          </header>

          {lines.length === 0 ? (
            <div className={s.empty}>
              <p className={s.emptyTitle}>Sin artículos</p>
              <p className={s.emptyText}>
                Buscá un producto y presioná <kbd>Enter</kbd> para agregar la variante
                seleccionada.
              </p>
            </div>
          ) : (
            <ol className={s.lines}>
              {lines.map((line) => {
                const entry = variantIndex.get(line.variantId);
                if (!entry) return null;
                const { product, variant } = entry;
                return (
                  <li key={line.variantId} className={s.line}>
                    <div className={s.lineHead}>
                      <span className={s.lineName}>{product.name}</span>
                      <span className={s.lineMeasure}>{variant.label}</span>
                      <button
                        type="button"
                        className={s.remove}
                        onClick={() => changeQty(line.variantId, -line.qty)}
                        aria-label={`Quitar ${product.name} ${variant.label}`}
                      >
                        ×
                      </button>
                    </div>
                    <div className={s.lineBody}>
                      <span className={s.unit}>{money(line.unitPrice)} c/u</span>
                      <div className={s.qty}>
                        <button
                          type="button"
                          onClick={() => changeQty(line.variantId, -1)}
                          aria-label={`Restar uno de ${product.name} ${variant.label}`}
                        >
                          −
                        </button>
                        <QtyField
                          value={line.qty}
                          max={variant.stock}
                          onCommit={(qty) => setQty(line.variantId, qty)}
                          label={`Cantidad de ${product.name} ${variant.label}`}
                        />
                        <button
                          type="button"
                          onClick={() => changeQty(line.variantId, 1)}
                          disabled={line.qty >= variant.stock}
                          aria-label={`Sumar uno de ${product.name} ${variant.label}`}
                        >
                          +
                        </button>
                      </div>
                      <span className={s.subtotal}>{money(line.unitPrice * line.qty)}</span>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}

          <footer className={s.checkout}>
            <dl className={s.summary}>
              <div className={s.summaryRow}>
                <dt>Artículos</dt>
                <dd>{count(itemCount)}</dd>
              </div>
              <div className={s.totalRow}>
                <dt>Total</dt>
                <dd>{money(total)}</dd>
              </div>
            </dl>

            <fieldset className={s.payment}>
              <legend className={s.legend}>Forma de pago</legend>
              <div className={s.payGrid}>
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={s.payOption}
                    data-checked={payment === method.id}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={payment === method.id}
                      onChange={() => setPayment(method.id)}
                      className="sr-only"
                    />
                    {method.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <button
              type="button"
              className={s.charge}
              onClick={charge}
              disabled={lines.length === 0}
            >
              <span>Cobrar</span>
              <span className={s.chargeKeys}>
                <kbd>Ctrl</kbd>+<kbd>Enter</kbd>
              </span>
            </button>
          </footer>
        </aside>

        <FerrobotPanel
          open={assistantOpen}
          onClose={closeAssistant}
          onReveal={revealVariant}
        />
      </div>

      {sale && (
        <ReceiptSheet
          sale={sale}
          onClose={() => {
            setSale(null);
            setLines([]);
            setPayment('efectivo');
            setQuery('');
            setActiveIndex(0);
            inputRef.current?.focus();
          }}
        />
      )}
    </AppShell>
  );
}

/* --- Piezas ------------------------------------------------------------ */

function Thumb({ product }: { product: Product }) {
  return (
    <span className={s.thumb} aria-hidden="true">
      {product.image ? (
        <img src={product.image} alt="" width={40} height={40} />
      ) : (
        monogram(product.brand)
      )}
    </span>
  );
}

/**
 * Estampa de la marca: dos letras, como el troquel del fabricante.
 * Ocupa el lugar de la foto mientras D-30 siga sin resolver.
 */
function monogram(brand: string): string {
  const words = brand.split(/[\s+]+/).filter(Boolean);
  if (words.length > 1) {
    return words.map((word) => word[0]).join('').slice(0, 2).toUpperCase();
  }
  return brand.slice(0, 2).toUpperCase();
}

type QtyFieldProps = {
  value: number;
  max: number;
  onCommit: (qty: number) => void;
  label: string;
};

/**
 * Cantidad editable. Al enfocar se selecciona el número, así escribir "10"
 * reemplaza el 1 en lugar de agregarle un dígito. Escribe en vivo para que el
 * total y el cobro no queden atrasados; al salir, recorta al stock disponible.
 */
function QtyField({ value, max, onCommit, label }: QtyFieldProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const [lastValue, setLastValue] = useState(value);
  const startRef = useRef(value);
  const cancelRef = useRef(false);

  /* Si la cantidad cambia por fuera (botones − / +), el borrador no debe taparla.
     Se ajusta en el render: es estado derivado del ticket, no un efecto. */
  if (lastValue !== value) {
    setLastValue(value);
    setDraft(null);
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      autoComplete="off"
      spellCheck={false}
      className={s.qtyInput}
      /* El borrador manda solo mientras se escribe; después manda el ticket. */
      value={draft ?? String(value)}
      aria-label={label}
      onFocus={(event) => {
        startRef.current = value;
        cancelRef.current = false;
        setDraft(null);
        event.currentTarget.select();
      }}
      onChange={(event) => {
        const raw = event.target.value.replace(/\D/g, '').slice(0, 4);
        if (!raw) {
          setDraft('');
          return;
        }
        /* Se recorta al escribir: lo que se ve nunca supera lo que se cobra. */
        const next = Math.min(Number.parseInt(raw, 10), max);
        setDraft(String(next));
        /* El 0 se deja escribir, pero no borra la línea: recién al salir se decide. */
        if (next > 0) onCommit(next);
      }}
      onBlur={(event) => {
        if (cancelRef.current) {
          cancelRef.current = false;
          setDraft(null);
          onCommit(startRef.current);
          return;
        }
        const raw = event.target.value;
        setDraft(null);
        const parsed = Number.parseInt(raw, 10);
        if (Number.isFinite(parsed) && parsed > 0) onCommit(Math.min(parsed, max));
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          event.currentTarget.blur();
        }
        if (event.key === 'Escape') {
          event.preventDefault();
          cancelRef.current = true;
          event.currentTarget.blur();
        }
      }}
    />
  );
}

function StockGauge({ variant }: { variant: Variant }) {
  const state = stockState(variant);
  const scale = Math.max(variant.minStock * 2.5, variant.stock, 1);
  const fill = Math.min(100, (variant.stock / scale) * 100);
  const limit = Math.min(100, (variant.minStock / scale) * 100);

  const label =
    state === 'out'
      ? `Sin stock. Mínimo ${variant.minStock}.`
      : `${count(variant.stock)} en stock. Mínimo ${variant.minStock}.`;

  return (
    <span className={s.stock} role="img" aria-label={label}>
      <span className={s.stockNumber} data-state={state}>
        {count(variant.stock)}
      </span>
      <span className={s.gauge} data-state={state} aria-hidden="true">
        <span className={s.gaugeFill} style={{ width: `${fill}%` }} />
        <span className={s.gaugeLimit} style={{ left: `${limit}%` }} />
      </span>
    </span>
  );
}

type MeasureScaleProps = {
  product: Product;
  activeVariantId: string;
  stockOf: (variantId: string) => number;
  onSelect: (variantId: string) => void;
};

/**
 * La escala de medidas: el control central de la dirección Nonio.
 *
 * Se abre debajo de la fila activa porque comparar de un vistazo es la mitad
 * del trabajo del mostrador: qué medidas hay, cuánto stock tiene cada una y
 * cuál está agotada. Cada marca es un botón, así que se salta a cualquiera sin
 * recorrer las intermedias.
 *
 * Con atributos sin orden (color, terminación) degrada a fichas: una regla que
 * no mide nada sería una mentira.
 */
function MeasureScale({ product, activeVariantId, stockOf, onSelect }: MeasureScaleProps) {
  const grouped = `Variantes de ${product.name}`;

  if (product.kind === 'option') {
    return (
      <div className={s.scale} data-kind="option" role="group" aria-label={grouped}>
        {product.variants.map((variant) => {
          const out = stockOf(variant.id) <= 0;
          return (
            <button
              key={variant.id}
              type="button"
              className={s.chip}
              data-active={variant.id === activeVariantId}
              aria-pressed={variant.id === activeVariantId}
              disabled={out}
              onClick={(event) => {
                event.stopPropagation();
                onSelect(variant.id);
              }}
            >
              {variant.label}
              {out ? ' — sin stock' : ''}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={s.scale} data-kind="measure" role="group" aria-label={grouped}>
      {product.variants.map((variant) => {
        const out = stockOf(variant.id) <= 0;
        return (
          <button
            key={variant.id}
            type="button"
            className={s.tick}
            data-active={variant.id === activeVariantId}
            data-out={out}
            aria-pressed={variant.id === activeVariantId}
            aria-label={`${variant.label}${out ? ', sin stock' : ''}`}
            onClick={(event) => {
              event.stopPropagation();
              onSelect(variant.id);
            }}
          >
            <span className={s.tickMark} aria-hidden="true" />
            <span className={s.tickLabel} aria-hidden="true">
              {variant.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
