import { useEffect, useRef } from 'react';
import s from './ReceiptSheet.module.css';
import { paymentMethods, type Sale } from '../data/sale';
import { dateTime, money } from '../lib/format';

type ReceiptSheetProps = {
  sale: Sale;
  onClose: () => void;
};

/**
 * Comprobante interno de mostrador.
 * No es un comprobante fiscal: el informe no incluye facturación electrónica.
 * Es la única superficie que ve el cliente, y la única con borde y color.
 */
export function ReceiptSheet({ sale, onClose }: ReceiptSheetProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !dialog) return;

      const focusable = dialog.querySelectorAll<HTMLElement>('button:not([disabled])');
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const payment = paymentMethods.find((method) => method.id === sale.payment)?.label ?? '';

  return (
    <div className={s.backdrop} role="presentation">
      <div
        className={s.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="receipt-dialog-title"
        ref={dialogRef}
      >
        <div className={s.sheet} data-receipt-sheet>
          <header className={s.head}>
            <h2 id="receipt-dialog-title" className="sr-only">
              Comprobante de venta
            </h2>
            <p className={s.business}>Ferretería</p>
            <p className={s.businessMeta}>Comprobante interno de mostrador</p>
          </header>

          <dl className={s.meta}>
            <div className={s.metaRow}>
              <dt>Comprobante</dt>
              <dd>{sale.number}</dd>
            </div>
            <div className={s.metaRow}>
              <dt>Fecha</dt>
              <dd>{dateTime(sale.at)}</dd>
            </div>
            <div className={s.metaRow}>
              <dt>Forma de pago</dt>
              <dd>{payment}</dd>
            </div>
          </dl>

          <table className={s.table}>
            <thead>
              <tr>
                <th scope="col" className={s.colQty}>
                  Cant.
                </th>
                <th scope="col">Descripción</th>
                <th scope="col" className={s.colAmount}>
                  Importe
                </th>
              </tr>
            </thead>
            <tbody>
              {sale.lines.map((line) => (
                <tr key={line.variant.id}>
                  <td className={s.colQty}>{line.qty}</td>
                  <td>
                    <span className={s.itemName}>{line.product.name}</span>
                    <span className={s.itemMeta}>
                      {line.variant.label} · {money(line.unitPrice)} c/u
                    </span>
                  </td>
                  <td className={s.colAmount}>{money(line.unitPrice * line.qty)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <footer className={s.foot}>
            <p className={s.total}>
              <span>Total</span>
              <strong>{money(sale.total)}</strong>
            </p>
            <p className={s.legal}>
              Documento no válido como factura. Comprobante interno de mostrador, sin
              validez fiscal.
            </p>
          </footer>
        </div>

        <div className={s.actions}>
          <button type="button" className={s.ghost} onClick={() => window.print()}>
            Imprimir
          </button>
          <button type="button" className={s.primary} onClick={onClose} ref={closeRef}>
            Nueva venta
          </button>
        </div>
      </div>
    </div>
  );
}
