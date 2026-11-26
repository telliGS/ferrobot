const moneyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** "$ 1.234,50" — siempre con dos decimales y separador de miles. */
export function money(value: number): string {
  return moneyFormatter.format(value);
}

/** "1.234" — para cantidades y conteos. */
export function count(value: number): string {
  return new Intl.NumberFormat('es-AR').format(value);
}

export function time(date: Date): string {
  return new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

/** "18/11/2026" — para la barra de estado, donde el espacio manda. */
export function numericDate(date: Date): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function shortDate(date: Date): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function dateTime(date: Date): string {
  return `${shortDate(date)} · ${time(date)}`;
}

/** Comprobante interno correlativo. No es un comprobante fiscal. */
export function receiptNumber(sequence: number): string {
  return `0001-${String(sequence).padStart(8, '0')}`;
}
