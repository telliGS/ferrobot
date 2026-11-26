import type { Product, Variant } from './catalog';

export type PaymentMethod = 'efectivo' | 'transferencia' | 'tarjeta';

/**
 * PROPUESTA — D-13 está pendiente del grupo.
 * Estas tres formas de pago no están definidas en el informe; se eligen para
 * poder diseñar la pantalla. Cuando el grupo decida, se reemplaza esta lista.
 */
export const paymentMethods: { id: PaymentMethod; label: string }[] = [
  { id: 'efectivo', label: 'Efectivo' },
  { id: 'transferencia', label: 'Transferencia' },
  { id: 'tarjeta', label: 'Tarjeta' },
];

export type SaleLine = {
  product: Product;
  variant: Variant;
  qty: number;
  /**
   * Precio congelado al agregar la línea.
   * El diagrama de clases no guarda precio unitario en DetalleVenta (D-20):
   * esto es exactamente lo que el backend debería persistir.
   */
  unitPrice: number;
};

export type Sale = {
  number: string;
  at: Date;
  lines: SaleLine[];
  total: number;
  payment: PaymentMethod;
};
