/**
 * Ferrobot — motor de respuestas del asistente de mostrador.
 *
 * Es determinístico y local: no hay modelo, ni red, ni embeddings. Responde
 * únicamente con el catálogo cargado. No modifica el ticket, no muestra costo
 * ni margen (D-28) y no habla de ventas, proveedores ni facturación (D-04).
 *
 * La interfaz es una libreta de mostrador, no un chat de personaje: cada
 * respuesta se apoya en una variante concreta o pide precisión.
 */

import { products, type Product, type Variant } from '../data/catalog';
import { count, money } from './format';
import { normalize, stockState } from './search';

export type FerrobotCard = {
  productId: string;
  variantId: string;
};

export type FerrobotChoice = {
  label: string;
  query: string;
};

export type FerrobotReply = {
  /** La respuesta en una o dos frases. */
  lead: string;
  /** Variantes concretas: la respuesta siempre se apoya en una. */
  cards?: FerrobotCard[];
  choicePrompt?: string;
  choices?: FerrobotChoice[];
  /** Límite, aclaración o advertencia. */
  note?: string;
};

export const catalogStats = {
  products: products.length,
  variants: products.reduce((total, product) => total + product.variants.length, 0),
};

export const ferrobotIntro = {
  lead: 'Precio, stock y medidas del catálogo local.',
  note: 'No modifico la nota de venta. Respuestas sobre datos de demostración.',
};

export const suggestions: FerrobotChoice[] = [
  { label: 'clavo 2"', query: 'clavo 2"' },
  { label: '¿qué hay en 5/16?', query: '¿qué hay en 5/16?' },
  { label: '¿qué está bajo mínimo?', query: '¿qué está bajo mínimo?' },
];

/* --- Vocabulario ------------------------------------------------------- */

const FRACTIONS: Record<string, string> = {
  '¼': '1/4',
  '½': '1/2',
  '¾': '3/4',
  '⅛': '1/8',
  '⅜': '3/8',
  '⅝': '5/8',
  '⅞': '7/8',
  '⅓': '1/3',
  '⅔': '2/3',
};

/**
 * Palabras que no identifican ni producto ni medida. Se sacan antes de
 * comparar: "precio del clavo de 2" tiene que quedar en "clavo 2".
 */
const STOPWORDS = new Set(
  [
    'a', 'al', 'algo', 'algun', 'alguna', 'algunas', 'algunos', 'asi', 'bajo',
    'bien', 'buen', 'buena', 'buenas', 'bueno', 'buenos', 'cada', 'como', 'con',
    'cual', 'cuales', 'cuando', 'cuanta', 'cuantas', 'cuanto', 'cuantos', 'de',
    'decime', 'del', 'desde', 'dia', 'dias', 'donde', 'el', 'ella', 'ellas',
    'ellos', 'en', 'entre', 'era', 'es', 'esa', 'ese', 'eso', 'esta', 'estan',
    'estas', 'este', 'esto', 'estos', 'favor', 'gracias', 'hay', 'hola', 'la',
    'las', 'le', 'les', 'listo', 'lo', 'los', 'mas', 'me', 'menos', 'mi', 'mis',
    'mucho', 'muy', 'necesito', 'no', 'nos', 'noche', 'noches', 'o', 'otra',
    'otro', 'para', 'pero', 'poco', 'por', 'precio', 'precios', 'puedo',
    'pulgada', 'pulgadas', 'pulg', 'que', 'quien', 'quienes', 'quiero', 'se',
    'sea', 'ser', 'si', 'sin', 'sobre', 'son', 'su', 'sus', 'tal', 'tambien',
    'tarde', 'tardes', 'te', 'tenemos', 'tenes', 'tengo', 'tiene', 'tienen',
    'toda', 'todo', 'todos', 'tu', 'tus', 'un', 'una', 'unas', 'unos', 'valor',
    'vende', 'venden', 'vendes', 'ver', 'vos', 'y', 'ya', 'yo', 'busca',
    'buscame', 'buscar', 'busco', 'cuesta', 'cuestan', 'dame', 'fijate',
    'mostrame', 'muestrame', 'pasame', 'sale', 'salen', 'sabes', 'saber',
    'stock', 'existencias', 'disponibilidad', 'disponible', 'disponibles',
    'marca', 'marcas', 'minimo', 'minima', 'venta', 'nota', 'ticket',
    'carrito', 'pedido', 'comprobante',
    /* Verbos y estados de las intenciones: no son producto ni medida. */
    'agrega', 'agregar', 'agregame', 'suma', 'sumar', 'sumame', 'pone', 'poner',
    'poneme', 'carga', 'cargar', 'cargame', 'anade', 'anadir', 'cobra', 'cobrar',
    'cobrame', 'cobro', 'finaliza', 'finalizar', 'cerrar', 'falta', 'faltan',
    'faltante', 'faltantes', 'reponer', 'reposicion', 'acaba', 'acabando',
    'queda', 'quedan', 'agotado', 'agotada', 'agotados', 'agotadas',
  ].map(stem),
);

function stem(word: string): string {
  return word.length > 3 && word.endsWith('s') ? word.slice(0, -1) : word;
}

function tokenize(value: string): string[] {
  let text = normalize(value);

  text = text.replace(/[¼½¾⅛⅜⅝⅞⅓⅔]/g, (fraction) => ` ${FRACTIONS[fraction] ?? fraction} `);
  text = text.replace(/["'″”“]/g, '');
  text = text.replace(/([\d/]+)\s*[x×]\s*([\d/]+)/g, '$1 x $2');
  text = text.replace(/(\d),(\d)/g, '$1.$2');
  text = text.replace(/(\d)([a-z])/g, '$1 $2');

  return text
    .replace(/[^a-z0-9/.]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
}

function isStop(token: string): boolean {
  return STOPWORDS.has(token) || STOPWORDS.has(stem(token));
}

function isAlpha(token: string): boolean {
  return /^[a-z]+$/.test(token);
}

function wordsMatch(left: string, right: string): boolean {
  const a = stem(left);
  const b = stem(right);
  if (a === b) return true;
  return a.length >= 5 && b.length >= 5 && (a.startsWith(b) || b.startsWith(a));
}

type ProductWords = {
  product: Product;
  name: string[];
  brand: string[];
  code: string;
};

const productWords: ProductWords[] = products.map((product) => ({
  product,
  name: tokenize(product.name).filter(isAlpha).map(stem),
  brand: tokenize(product.brand).filter(isAlpha).map(stem),
  code: product.code.toLowerCase().replace(/[^a-z0-9]/g, ''),
}));

/** Todas las palabras que nombran un producto o una marca. No son medidas. */
const catalogWords = [...new Set(productWords.flatMap((entry) => [...entry.name, ...entry.brand]))];

function isCatalogWord(token: string): boolean {
  return catalogWords.some((word) => wordsMatch(token, word));
}

/* --- Resolución de producto y medida ---------------------------------- */

type Resolved = {
  candidates: Product[];
  brandOnly: boolean;
  code?: Product;
};

function matchCode(raw: string): Product | undefined {
  const alnum = normalize(raw).replace(/[^a-z0-9]/g, '');
  return products.find((product) => {
    const code = product.code.toLowerCase().replace(/[^a-z0-9]/g, '');
    return code.length > 5 && alnum.includes(code);
  });
}

function resolveProducts(raw: string, tokens: string[]): Resolved {
  const code = matchCode(raw);
  if (code) return { candidates: [code], brandOnly: false, code };

  const nameMatches: { product: Product; score: number }[] = [];
  const brandMatches: { product: Product; score: number }[] = [];

  for (const entry of productWords) {
    let nameScore = 0;
    let brandScore = 0;

    for (const token of tokens) {
      if (isStop(token) || !isAlpha(token)) continue;
      if (entry.name.some((word) => wordsMatch(token, word))) nameScore += 1;
      else if (entry.brand.some((word) => wordsMatch(token, word))) brandScore += 1;
    }

    if (nameScore > 0) nameMatches.push({ product: entry.product, score: nameScore });
    else if (brandScore > 0) brandMatches.push({ product: entry.product, score: brandScore });
  }

  if (nameMatches.length > 0) {
    return {
      candidates: nameMatches
        .sort((left, right) => right.score - left.score)
        .map((entry) => entry.product),
      brandOnly: false,
    };
  }

  return {
    candidates: brandMatches.map((entry) => entry.product),
    brandOnly: brandMatches.length > 0,
  };
}

function measureTokens(tokens: string[], resolved: Resolved): string[] {
  const codeTokens = new Set(resolved.code ? tokenize(resolved.code.code) : []);

  return tokens.filter(
    (token) =>
      !isStop(token) &&
      !isCatalogWord(token) &&
      !codeTokens.has(token),
  );
}

const isInteger = (token: string) => /^\d+$/.test(token);
const isFraction = (token: string) => /^\d+\/\d+$/.test(token);

/**
 * Cuánto se parece la etiqueta de una variante a la medida pedida.
 * El corte importa: "2" no debe matchear "2 1/2", ni "1/2" dentro de "2 1/2".
 */
function measureScore(label: string, measure: string[]): number {
  const labelTokens = tokenize(label);
  if (measure.length === 0 || labelTokens.length === 0) return 0;

  for (let start = 0; start <= labelTokens.length - measure.length; start += 1) {
    let same = true;

    for (let offset = 0; offset < measure.length; offset += 1) {
      if (labelTokens[start + offset] !== measure[offset]) {
        same = false;
        break;
      }
    }
    if (!same) continue;

    const previous = labelTokens[start - 1];
    const next = labelTokens[start + measure.length];

    /* 1/2 dentro de 2 1/2 es un número mixto, no una medida suelta. */
    if (isFraction(measure[0]) && previous && isInteger(previous)) continue;
    /* 2 dentro de 2 1/2 también forma parte del número mixto. */
    if (isInteger(measure[measure.length - 1]) && next && isFraction(next)) continue;

    if (start === 0 && measure.length === labelTokens.length) return 100;
    if (start === 0) return 90;
    return 80;
  }

  return 0;
}

type Entry = { product: Product; variant: Variant };

function entriesOf(candidates: Product[]): Entry[] {
  const list = candidates.length > 0 ? candidates : products;
  return list.flatMap((product) =>
    product.variants.map((variant) => ({ product, variant })),
  );
}

function matchingEntries(candidates: Product[], measure: string[]): Entry[] {
  return entriesOf(candidates)
    .map((entry) => ({ entry, score: measureScore(entry.variant.label, measure) }))
    .filter((item) => item.score > 0)
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.entry.product.name.localeCompare(right.entry.product.name, 'es') ||
        left.entry.variant.order - right.entry.variant.order,
    )
    .map((item) => item.entry);
}

/* --- Armado de respuestas --------------------------------------------- */

const MAX_CARDS = 8;

function cardOf(entry: Entry): FerrobotCard {
  return { productId: entry.product.id, variantId: entry.variant.id };
}

function cardsOf(entries: Entry[]): FerrobotCard[] {
  return entries.slice(0, MAX_CARDS).map(cardOf);
}

function plural(value: number, one: string, many: string): string {
  return value === 1 ? one : many;
}

function commonBrand(candidates: Product[]): string | undefined {
  if (candidates.length === 0) return undefined;
  const [first] = candidates;
  return candidates.every((product) => product.brand === first.brand) ? first.brand : undefined;
}

function variantReply(entry: Entry): FerrobotReply {
  const { product, variant } = entry;
  const state = stockState(variant);

  let stockText: string;
  if (state === 'out') stockText = 'Está sin stock.';
  else if (state === 'low') {
    stockText = `Quedan ${count(variant.stock)} y el mínimo es ${count(variant.minStock)}.`;
  } else stockText = `Quedan ${count(variant.stock)} en stock.`;

  return {
    lead: `${product.name} ${variant.label} sale ${money(variant.price)}. ${stockText}`,
    cards: [cardOf(entry)],
  };
}

function productReply(product: Product): FerrobotReply {
  const out = product.variants.filter((variant) => stockState(variant) === 'out').length;
  const low = product.variants.filter((variant) => stockState(variant) === 'low').length;
  const exceptions = [
    out > 0 ? `${count(out)} sin stock` : '',
    low > 0 ? `${count(low)} en o bajo el mínimo` : '',
  ].filter(Boolean);

  const lead = `${product.name} (${product.code}, ${product.brand}): ${product.variants.length} ${plural(
    product.variants.length,
    'variante',
    'variantes',
  )}.${exceptions.length > 0 ? ` Hay ${exceptions.join(' y ')}.` : ''}`;

  return {
    lead,
    cards: cardsOf(
      product.variants.map((variant) => ({ product, variant })),
    ),
    note: product.variants.length > MAX_CARDS ? `Mostrando ${MAX_CARDS} de ${product.variants.length}.` : undefined,
  };
}

function choicesReply(candidates: Product[], lead?: string): FerrobotReply {
  const brand = commonBrand(candidates);
  const text =
    lead ??
    (brand
      ? `Hay ${candidates.length} productos de ${brand} en el catálogo.`
      : `Hay ${candidates.length} productos que coinciden.`);

  return {
    lead: text,
    choicePrompt: '¿Cuál querés ver?',
    choices: candidates.map((product) => ({
      label: product.name,
      query: product.name,
    })),
  };
}

function noMeasureReply(candidates: Product[]): FerrobotReply {
  if (candidates.length === 1) {
    const product = candidates[0];
    return {
      lead: `No encontré esa medida en ${product.name}.`,
      cards: cardsOf(
        product.variants.map((variant) => ({ product, variant })),
      ),
      note: 'Estas son las medidas cargadas.',
    };
  }

  if (candidates.length > 1) {
    return choicesReply(candidates, 'No encontré esa medida en esos productos.');
  }

  return {
    lead: 'No encontré esa medida en el catálogo.',
    note: 'Busco por nombre, marca, código o medida. Probá con 5/16, 3/8 o 2".',
    choices: suggestions,
  };
}

function catalogReply(resolved: Resolved, measure: string[]): FerrobotReply {
  const candidates = resolved.candidates;

  if (measure.length > 0) {
    const matches = matchingEntries(candidates, measure);

    if (matches.length === 0) return noMeasureReply(candidates);
    if (matches.length === 1) return variantReply(matches[0]);

    const brand = commonBrand(candidates);
    const scope =
      candidates.length === 1
        ? ` de ${candidates[0].name}`
        : brand
          ? ` de ${brand}`
          : ' del catálogo';

    return {
      lead: `${matches.length} variantes${scope} coinciden con esa medida.`,
      cards: cardsOf(matches),
      note: matches.length > MAX_CARDS ? `Mostrando ${MAX_CARDS} de ${matches.length}.` : undefined,
    };
  }

  if (candidates.length === 1) return productReply(candidates[0]);
  if (candidates.length > 1) return choicesReply(candidates);

  return {
    lead: 'Necesito un producto o una medida para buscar.',
    note: 'Puedo consultar precio, stock y medidas. No invento datos.',
    choices: suggestions,
  };
}

type StockTarget = 'low' | 'out';

function stockStateCopy(target: StockTarget): string {
  return target === 'out' ? 'sin stock' : 'en o bajo el mínimo';
}

function stockListReply(
  target: StockTarget,
  resolved: Resolved,
  measure: string[],
): FerrobotReply {
  const candidates = resolved.candidates;
  const copy = stockStateCopy(target);
  const other: StockTarget = target === 'out' ? 'low' : 'out';
  const otherCopy = stockStateCopy(other);

  if (measure.length > 0) {
    const matches = matchingEntries(candidates, measure);
    if (matches.length === 0) return catalogReply(resolved, measure);

    if (matches.length === 1) return variantReply(matches[0]);

    const hits = matches.filter((entry) => stockState(entry.variant) === target);

    if (hits.length === 0) {
      return {
        lead: `Ninguna de las ${matches.length} variantes con esa medida está ${copy}.`,
        cards: cardsOf(matches),
      };
    }

    return {
      lead: `${hits.length} de ${matches.length} variantes con esa medida ${hits.length === 1 ? 'está' : 'están'} ${copy}.`,
      cards: cardsOf(hits),
      note: hits.length > MAX_CARDS ? `Mostrando ${MAX_CARDS} de ${hits.length}.` : undefined,
    };
  }

  const pool = entriesOf(candidates);
  const hits = pool.filter((entry) => stockState(entry.variant) === target);

  if (target === 'low') {
    hits.sort(
      (left, right) =>
        left.variant.stock / Math.max(left.variant.minStock, 1) -
          right.variant.stock / Math.max(right.variant.minStock, 1) ||
        left.product.name.localeCompare(right.product.name, 'es'),
    );
  } else {
    hits.sort(
      (left, right) =>
        left.product.name.localeCompare(right.product.name, 'es') ||
        left.variant.order - right.variant.order,
    );
  }

  const brand = commonBrand(candidates);
  const where =
    candidates.length === 1
      ? ` de ${candidates[0].name}`
      : brand
        ? ` de ${brand}`
        : ' del catálogo';

  const otherCount = pool.filter((entry) => stockState(entry.variant) === other).length;
  const productQuery = candidates.length === 1 ? `${candidates[0].name} ` : '';
  const otherChoice: FerrobotChoice[] = otherCount
    ? [
        {
          label: other === 'out' ? 'Ver sin stock' : 'Ver bajo mínimo',
          query: `${productQuery}${otherCopy}`,
        },
      ]
    : [];

  if (hits.length === 0) {
    return {
      lead: `No hay variantes${where} ${copy}.`,
      choices: otherChoice.length > 0 ? otherChoice : undefined,
    };
  }

  return {
    lead: `${hits.length} ${plural(hits.length, 'variante', 'variantes')}${where} ${hits.length === 1 ? 'está' : 'están'} ${copy}.`,
    cards: cardsOf(hits),
    note:
      hits.length > MAX_CARDS
        ? `Mostrando ${MAX_CARDS} de ${hits.length}. Pedime un producto para ver su detalle.`
        : undefined,
    choices: otherChoice.length > 0 ? otherChoice : undefined,
  };
}

function stockSummaryReply(): FerrobotReply {
  const entries = entriesOf([]);
  const out = entries.filter((entry) => stockState(entry.variant) === 'out').length;
  const low = entries.filter((entry) => stockState(entry.variant) === 'low').length;

  return {
    lead: `${catalogStats.variants} variantes cargadas: ${out} sin stock y ${low} en o bajo el mínimo.`,
    choices: [
      { label: 'Ver sin stock', query: '¿qué hay sin stock?' },
      { label: 'Ver bajo mínimo', query: '¿qué está bajo mínimo?' },
    ],
  };
}

function unknownReply(raw: string): FerrobotReply {
  const quoted = raw.trim().replace(/\s+/g, ' ').slice(0, 48);
  return {
    lead: quoted ? `No encontré “${quoted}” en el catálogo.` : 'No encontré eso en el catálogo.',
    note: 'Busco por nombre, marca, código o medida. No invento precios ni stock.',
    choices: suggestions,
  };
}

/* --- Intenciones fuera de alcance ------------------------------------- */

const OUT_OF_SCOPE: { test: RegExp; copy: string }[] = [
  {
    test: /factur|\biva\b|\bafip\b/,
    copy: 'No emito ni consulto facturas: el sistema no incluye facturación fiscal.',
  },
  {
    test: /proveedor|proveedores/,
    copy: 'No tengo datos de proveedores ni de compras.',
  },
  {
    test: /\bcosto|\bcostos|\bmargen|\bmargenes|\bganancia|\butilidad|\brentabilidad/,
    copy: 'No muestro costos ni márgenes en el mostrador.',
  },
  {
    test: /\bventas\b|\bvendi|\bvendido|\brecaudacion|\breporte|\bmetric|\bestadistica|\bcierre de caja\b/,
    copy: 'No veo ventas ni reportes desde el mostrador.',
  },
  {
    test: /backup|respaldo|copia de seguridad/,
    copy: 'Las copias de seguridad no se manejan desde acá.',
  },
  {
    test: /\busuario|\bcontrasena|\bpermiso|\brol\b|\broles\b/,
    copy: 'No administro usuarios ni permisos.',
  },
];

const ADD_INTENT =
  /\b(agrega|agregar|agregame|suma|sumar|sumame|pone|poner|poneme|carga|cargar|cargame|anade|anadir)\b/;

const CHARGE_INTENT = /\b(cobra|cobrar|cobrame|cobro|finaliza|finalizar|cerrar la venta)\b/;

const OUT_INTENT = /\b(sin stock|agotad[oa]s?|no hay|no queda|no quedan|stock cero|cero stock)\b/;

const LOW_INTENT =
  /\b(bajo minimo|bajo el minimo|reponer|reposicion|faltante|faltantes|se esta acabando|quedan pocos|falta)\b/;

const STOCK_INTENT = /\b(stock|existencias|disponibilidad)\b/;

const GREETING_INTENT = /\b(hola|buenas|buen dia|que tal)\b/;

const THANKS_INTENT = /\b(gracias|genial|perfecto|listo)\b/;

/* --- Entrada ----------------------------------------------------------- */

export function answerFor(raw: string): FerrobotReply {
  const phrase = normalize(raw)
    .replace(/[^a-z0-9/.]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const tokens = tokenize(raw);
  const resolved = resolveProducts(raw, tokens);
  const measure = measureTokens(tokens, resolved);

  const outOfScope = OUT_OF_SCOPE.find((item) => item.test.test(phrase));
  if (outOfScope) {
    return {
      lead: outOfScope.copy,
      note: 'Solo consulto el catálogo local: precio, stock y medidas.',
      choices: [suggestions[0], suggestions[2]],
    };
  }

  if (ADD_INTENT.test(phrase)) {
    const base = catalogReply(resolved, measure);
    return {
      ...base,
      lead: `No agrego artículos a la nota. ${base.lead}`,
      note: base.note ?? 'Abrí la variante en el catálogo y presioná Enter para agregarla.',
    };
  }

  if (CHARGE_INTENT.test(phrase)) {
    return {
      lead: 'El cobro se hace desde la nota de venta.',
      note: 'Ctrl+Enter cobra la nota completa. El asistente no toca el ticket.',
      choices: [suggestions[0]],
    };
  }

  if (OUT_INTENT.test(phrase)) return stockListReply('out', resolved, measure);
  if (LOW_INTENT.test(phrase)) return stockListReply('low', resolved, measure);

  if (
    STOCK_INTENT.test(phrase) &&
    resolved.candidates.length === 0 &&
    measure.length === 0
  ) {
    return stockSummaryReply();
  }

  if (
    GREETING_INTENT.test(phrase) &&
    resolved.candidates.length === 0 &&
    measure.length === 0
  ) {
    return {
      lead: 'Hola. Consulto precio, stock y medidas del catálogo local.',
      note: 'No modifico la nota de venta.',
      choices: suggestions,
    };
  }

  if (
    THANKS_INTENT.test(phrase) &&
    resolved.candidates.length === 0 &&
    measure.length === 0
  ) {
    return {
      lead: 'De nada. Si necesitás otra medida, preguntá.',
      choices: suggestions,
    };
  }

  if (resolved.candidates.length > 0 || measure.length > 0) {
    return catalogReply(resolved, measure);
  }

  return unknownReply(raw);
}
