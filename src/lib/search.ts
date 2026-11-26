import { frequentProductIds, products, type Product, type Variant } from '../data/catalog';

export type Hit = {
  product: Product;
  /** Variante que queda seleccionada al aparecer el resultado. */
  variant: Variant;
};

export function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function productHaystack(product: Product): string {
  return normalize(
    [
      product.name,
      product.brand,
      product.code,
      ...product.variants.map((variant) => variant.label),
    ].join(' '),
  );
}

/**
 * Busca por nombre, código o medida. El informe pide "texto o código";
 * la medida entra porque es la forma en que el mostrador nombra el producto
 * ("dame clavo de dos").
 */
export function searchProducts(query: string): Hit[] {
  const needle = normalize(query).trim();

  if (!needle) {
    return frequentProductIds
      .map((id) => products.find((product) => product.id === id))
      .filter((product): product is Product => Boolean(product))
      .map((product) => ({ product, variant: bestVariant(product, '') }));
  }

  const terms = needle.split(/\s+/).filter(Boolean);

  return products
    .filter((product) => {
      const haystack = productHaystack(product);
      return terms.every((term) => haystack.includes(term));
    })
    .map((product) => ({ product, variant: bestVariant(product, needle) }));
}

/**
 * Variante que mejor coincide con lo escrito. Buscar "clavo 2" y que quede
 * seleccionado el de 2" evita un paso en el mostrador.
 */
function bestVariant(product: Product, needle: string): Variant {
  if (!needle) return product.variants[0];

  const matches = product.variants.filter((variant) =>
    needle.includes(normalize(variant.label)),
  );

  if (matches.length > 0) return matches[0];

  const numeric = needle.match(/(\d+(?:[.,]\d+)?)/);
  if (numeric) {
    const wanted = Number(numeric[1].replace(',', '.'));
    const exact = product.variants.find((variant) => variant.order === wanted);
    if (exact) return exact;
  }

  return product.variants[0];
}

export type StockState = 'out' | 'low' | 'ok';

export function stockState(variant: Variant): StockState {
  if (variant.stock <= 0) return 'out';
  if (variant.stock <= variant.minStock) return 'low';
  return 'ok';
}
