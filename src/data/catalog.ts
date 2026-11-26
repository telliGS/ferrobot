/**
 * Datos de demostración.
 *
 * Todo el contenido de este archivo es ficticio. No proviene de ninguna
 * ferretería real: la cátedra pide datos masivos y creíbles, no datos
 * verdaderos. Las marcas son reales y se usan como texto de ejemplo.
 *
 * El modelo respeta el diagrama de clases del informe:
 * Producto 1 — 1..* Variante, con precio, stock y stock mínimo en la variante.
 *
 * `brand` (D-29), `image` (D-30) y `description` (D-25) están marcados como
 * propuesta en docs/decisiones.md: no figuran en el MER. La descripción existe
 * en el diagrama como `descripcionEnriquecidaIA` y es insumo del asistente,
 * no se muestra en el mostrador.
 */

export type Variant = {
  id: string;
  /** Atributo de la variante tal como lo define el informe: "2 pulgadas", "3/8" × 2"". */
  label: string;
  /** Valor numérico para ordenar la escala de medidas. */
  order: number;
  price: number;
  stock: number;
  minStock: number;
};

export type Product = {
  id: string;
  code: string;
  name: string;
  /** PROPUESTA D-29: no está en el diagrama de clases. */
  brand: string;
  /**
   * PROPUESTA D-25: insumo del asistente de IA. No se renderiza en el POS.
   * Escrita como la leería el índice de búsqueda del RAG.
   */
  description: string;
  /**
   * PROPUESTA D-30: ruta dentro de /public. Vacío hasta que el grupo defina
   * si las imágenes son fotos del proveedor o ilustraciones propias.
   */
  image?: string;
  categoryId: string;
  /** "measure": variantes ordenables por medida. "option": atributos sin orden. */
  kind: 'measure' | 'option';
  variants: Variant[];
};

export const categories = [
  { id: 'fijaciones', name: 'Fijaciones' },
  { id: 'herramientas', name: 'Herramientas de mano' },
  { id: 'medicion', name: 'Medición' },
  { id: 'quimicos', name: 'Químicos' },
  { id: 'electricidad', name: 'Electricidad' },
] as const;

const v = (
  id: string,
  label: string,
  order: number,
  price: number,
  stock: number,
  minStock: number,
): Variant => ({ id, label, order, price, stock, minStock });

export const products: Product[] = [
  {
    id: 'p-clavo',
    code: 'FIJ-CLA-001',
    name: 'Clavo cabeza plana',
    brand: 'Genérica',
    description:
      'Clavo de acero para unión de madera en carpintería y obra. Cabeza plana y vástago liso. Se vende por unidad y se identifica por su largo en pulgadas.',
    categoryId: 'fijaciones',
    kind: 'measure',
    variants: [
      v('v-clavo-1', '1"', 25.4, 14, 480, 200),
      v('v-clavo-15', '1 1/2"', 38.1, 19, 320, 200),
      v('v-clavo-2', '2"', 50.8, 24, 150, 200),
      v('v-clavo-25', '2 1/2"', 63.5, 31, 96, 150),
      v('v-clavo-3', '3"', 76.2, 38, 0, 150),
    ],
  },
  {
    id: 'p-tornillo',
    code: 'FIJ-TOR-014',
    name: 'Tornillo autoperforante punta mecha',
    brand: 'Bulit',
    description:
      'Tornillo autoperforante con punta mecha y cabeza hexagonal para fijar chapa, madera y perfiles sin perforación previa. Uso en techos, tinglados y estructuras livianas.',
    categoryId: 'fijaciones',
    kind: 'measure',
    variants: [
      v('v-tor-81', '8 × 1"', 25, 45, 640, 200),
      v('v-tor-82', '8 × 2"', 51, 62, 410, 200),
      v('v-tor-102', '10 × 2"', 51, 78, 88, 150),
      v('v-tor-103', '10 × 3"', 76, 96, 54, 150),
      v('v-tor-124', '12 × 4"', 102, 148, 0, 100),
    ],
  },
  {
    id: 'p-tarugo',
    code: 'FIJ-TAR-002',
    name: 'Tarugo plástico con tope',
    brand: 'Genérica',
    description:
      'Tarugo plástico con tope para fijaciones en mampostería hueca y hormigón. Se combina con tornillo del mismo diámetro. Se vende por unidad.',
    categoryId: 'fijaciones',
    kind: 'measure',
    variants: [
      v('v-tar-6', '6 mm', 6, 8, 1240, 500),
      v('v-tar-8', '8 mm', 8, 10, 980, 500),
      v('v-tar-10', '10 mm', 10, 14, 470, 500),
      v('v-tar-12', '12 mm', 12, 18, 260, 300),
    ],
  },
  {
    id: 'p-bulon',
    code: 'FIJ-BUL-031',
    name: 'Bulón hexagonal grado 2',
    brand: 'Acindar',
    description:
      'Bulón hexagonal grado 2 con rosca parcial, para uniones estructurales en madera y metal. Se acompaña de tuerca y arandela del mismo diámetro.',
    categoryId: 'fijaciones',
    kind: 'measure',
    variants: [
      v('v-bul-14', '1/4" × 1"', 25, 186, 240, 100),
      v('v-bul-516', '5/16" × 1 1/2"', 40, 264, 175, 100),
      v('v-bul-38', '3/8" × 2"', 51, 398, 92, 100),
      v('v-bul-12', '1/2" × 2 1/2"', 64, 624, 38, 80),
    ],
  },
  {
    id: 'p-arandela',
    code: 'FIJ-ARA-008',
    name: 'Arandela plana zincada',
    brand: 'Genérica',
    description:
      'Arandela plana de acero zincado para distribuir la carga de tornillos y tuercas y proteger la pieza. Se vende por unidad.',
    categoryId: 'fijaciones',
    kind: 'measure',
    variants: [
      v('v-ara-14', '1/4"', 6, 6, 2400, 800),
      v('v-ara-516', '5/16"', 8, 8, 1800, 800),
      v('v-ara-38', '3/8"', 10, 10, 1240, 800),
      v('v-ara-12', '1/2"', 13, 14, 610, 600),
    ],
  },
  {
    id: 'p-tuerca',
    code: 'FIJ-TUE-006',
    name: 'Tuerca hexagonal zincada',
    brand: 'Genérica',
    description:
      'Tuerca hexagonal de acero zincado para fijar bulones y espárragos. Rosca gruesa. Se vende por unidad.',
    categoryId: 'fijaciones',
    kind: 'measure',
    variants: [
      v('v-tue-14', '1/4"', 6, 9, 2100, 700),
      v('v-tue-516', '5/16"', 8, 12, 1420, 700),
      v('v-tue-38', '3/8"', 10, 16, 860, 600),
      v('v-tue-716', '7/16"', 11, 22, 340, 400),
    ],
  },
  {
    id: 'p-llave',
    code: 'HER-LLA-120',
    name: 'Llave combinada',
    brand: 'Bremen',
    description:
      'Llave combinada de acero cromo vanadio, con boca abierta de un lado y estrella del otro. Uso general en mecánica, plomería y armado de estructuras.',
    categoryId: 'herramientas',
    kind: 'measure',
    variants: [
      v('v-lla-8', '8 mm', 8, 3180, 24, 8),
      v('v-lla-10', '10 mm', 10, 3420, 18, 8),
      v('v-lla-11', '11 mm', 11, 3560, 6, 8),
      v('v-lla-13', '13 mm', 13, 4180, 21, 8),
      v('v-lla-14', '14 mm', 14, 4520, 12, 8),
      v('v-lla-17', '17 mm', 17, 5640, 9, 6),
      v('v-lla-19', '19 mm', 19, 6480, 4, 6),
    ],
  },
  {
    id: 'p-martillo',
    code: 'HER-MAR-210',
    name: 'Martillo galponero',
    brand: 'Stanley',
    description:
      'Martillo galponero con cabeza de acero forjado y mango de madera. Para clavar y retirar clavos en obra y carpintería.',
    categoryId: 'herramientas',
    kind: 'measure',
    variants: [
      v('v-mar-1', '1 lb', 1, 14800, 11, 4),
      v('v-mar-2', '2 lb', 2, 18900, 3, 4),
    ],
  },
  {
    id: 'p-cinta',
    code: 'MED-CIN-500',
    name: 'Cinta métrica con freno',
    brand: 'Bremen',
    description:
      'Cinta métrica con freno y cinta de acero. Lectura en milímetros y pulgadas. Para medición en obra, taller y carpintería.',
    categoryId: 'medicion',
    kind: 'measure',
    variants: [
      v('v-cin-3', '3 m', 3, 4200, 26, 10),
      v('v-cin-5', '5 m', 5, 5640, 14, 10),
      v('v-cin-8', '8 m', 8, 8920, 5, 8),
    ],
  },
  {
    id: 'p-sellador',
    code: 'QUI-SEL-045',
    name: 'Sellador acrílico interior',
    brand: 'Fadeco',
    description:
      'Sellador acrílico para juntas interiores y relleno de grietas antes de pintar. Diluible en agua, lavable y pintable. Se presenta en pomo de 500 ml y de 1 L.',
    categoryId: 'quimicos',
    kind: 'option',
    variants: [
      v('v-sel-b500', 'Blanco 500 ml', 0, 3860, 34, 12),
      v('v-sel-t500', 'Transparente 500 ml', 1, 3860, 9, 12),
      v('v-sel-b1', 'Blanco 1 L', 2, 6240, 16, 8),
    ],
  },
  {
    id: 'p-pegamento',
    code: 'QUI-PEG-012',
    name: 'Pegamento de contacto',
    brand: 'Ferrum',
    description:
      'Pegamento de contacto para uniones de madera, laminados y melamina. Se aplica en las dos superficies, se deja orear y se prensa. Presentaciones de 250 ml, 500 ml y 1 L.',
    categoryId: 'quimicos',
    kind: 'measure',
    variants: [
      v('v-peg-250', '250 ml', 250, 4720, 22, 10),
      v('v-peg-500', '500 ml', 500, 7980, 8, 10),
      v('v-peg-1', '1 L', 1000, 13400, 3, 6),
    ],
  },
  {
    id: 'p-taladro',
    code: 'ELE-TAL-650',
    name: 'Taladro percutor 13 mm',
    brand: 'Black+Decker',
    description:
      'Taladro percutor de 13 mm con selector de percusión, para mampostería, madera y metal. Incluye mango auxiliar y tope de profundidad.',
    categoryId: 'electricidad',
    kind: 'measure',
    variants: [
      v('v-tal-650', '650 W', 650, 118000, 7, 3),
      v('v-tal-800', '800 W', 800, 147000, 2, 3),
    ],
  },
];

/** Productos que el mostrador pide todo el tiempo: se muestran sin escribir nada. */
export const frequentProductIds = [
  'p-clavo',
  'p-tornillo',
  'p-tarugo',
  'p-arandela',
  'p-tuerca',
  'p-llave',
  'p-sellador',
  'p-cinta',
];
