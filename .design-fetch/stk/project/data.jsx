// Seed data — Marbled, an artisan cake shop
// Categories, Stocks, Movements, Transactions

const CATEGORIES = [
  { id: 'cat_flour',  name: 'Flours & Dry Goods',     code: '01' },
  { id: 'cat_dairy',  name: 'Dairy & Eggs',           code: '02' },
  { id: 'cat_choc',   name: 'Chocolate & Cocoa',      code: '03' },
  { id: 'cat_fruit',  name: 'Fruit & Preserves',      code: '04' },
  { id: 'cat_decor',  name: 'Decoration & Finishing', code: '05' },
  { id: 'cat_pack',   name: 'Packaging',              code: '06' },
];

const STOCKS = [
  // Flours & Dry Goods
  { id: 's_001', name: 'Type 00 Flour',           unit: 'kg',     quantity: 48,  price: 2.40,  categoryId: 'cat_flour', sku: 'FL-001' },
  { id: 's_002', name: 'Almond Flour',            unit: 'kg',     quantity: 12,  price: 18.20, categoryId: 'cat_flour', sku: 'FL-002' },
  { id: 's_003', name: 'Caster Sugar',            unit: 'kg',     quantity: 64,  price: 1.80,  categoryId: 'cat_flour', sku: 'FL-003' },
  { id: 's_004', name: 'Brown Sugar (Muscovado)', unit: 'kg',     quantity: 22,  price: 3.10,  categoryId: 'cat_flour', sku: 'FL-004' },
  { id: 's_005', name: 'Baking Powder',           unit: 'kg',     quantity: 4,   price: 6.40,  categoryId: 'cat_flour', sku: 'FL-005' },
  { id: 's_006', name: 'Sea Salt, Fine',          unit: 'kg',     quantity: 9,   price: 4.20,  categoryId: 'cat_flour', sku: 'FL-006' },

  // Dairy & Eggs
  { id: 's_010', name: 'Unsalted Butter',         unit: 'kg',     quantity: 28,  price: 9.60,  categoryId: 'cat_dairy', sku: 'DA-010' },
  { id: 's_011', name: 'Heavy Cream 36%',         unit: 'L',      quantity: 18,  price: 5.40,  categoryId: 'cat_dairy', sku: 'DA-011' },
  { id: 's_012', name: 'Whole Milk',              unit: 'L',      quantity: 36,  price: 1.30,  categoryId: 'cat_dairy', sku: 'DA-012' },
  { id: 's_013', name: 'Free-Range Eggs, Lg',     unit: 'tray',   quantity: 14,  price: 8.40,  categoryId: 'cat_dairy', sku: 'DA-013' },
  { id: 's_014', name: 'Mascarpone',              unit: 'kg',     quantity: 6,   price: 12.80, categoryId: 'cat_dairy', sku: 'DA-014' },
  { id: 's_015', name: 'Cream Cheese',            unit: 'kg',     quantity: 3,   price: 11.20, categoryId: 'cat_dairy', sku: 'DA-015' },

  // Chocolate & Cocoa
  { id: 's_020', name: 'Dark Couverture 70%',     unit: 'kg',     quantity: 16,  price: 22.50, categoryId: 'cat_choc',  sku: 'CH-020' },
  { id: 's_021', name: 'Milk Couverture 38%',     unit: 'kg',     quantity: 11,  price: 19.80, categoryId: 'cat_choc',  sku: 'CH-021' },
  { id: 's_022', name: 'White Chocolate',         unit: 'kg',     quantity: 7,   price: 17.40, categoryId: 'cat_choc',  sku: 'CH-022' },
  { id: 's_023', name: 'Dutch Cocoa Powder',      unit: 'kg',     quantity: 5,   price: 14.20, categoryId: 'cat_choc',  sku: 'CH-023' },
  { id: 's_024', name: 'Vanilla Pods, Bourbon',   unit: 'pc',     quantity: 80,  price: 3.20,  categoryId: 'cat_choc',  sku: 'CH-024' },

  // Fruit & Preserves
  { id: 's_030', name: 'Madagascan Vanilla Paste',unit: 'L',      quantity: 2,   price: 96.00, categoryId: 'cat_fruit', sku: 'FR-030' },
  { id: 's_031', name: 'Raspberry Purée',         unit: 'kg',     quantity: 8,   price: 14.60, categoryId: 'cat_fruit', sku: 'FR-031' },
  { id: 's_032', name: 'Lemon Curd',              unit: 'kg',     quantity: 4,   price: 9.80,  categoryId: 'cat_fruit', sku: 'FR-032' },
  { id: 's_033', name: 'Apricot Glaze',           unit: 'kg',     quantity: 6,   price: 7.20,  categoryId: 'cat_fruit', sku: 'FR-033' },
  { id: 's_034', name: 'Candied Orange Peel',     unit: 'kg',     quantity: 2,   price: 22.00, categoryId: 'cat_fruit', sku: 'FR-034' },

  // Decoration
  { id: 's_040', name: 'Edible Gold Leaf',        unit: 'book',   quantity: 6,   price: 38.00, categoryId: 'cat_decor', sku: 'DC-040' },
  { id: 's_041', name: 'Fondant, White',          unit: 'kg',     quantity: 9,   price: 6.40,  categoryId: 'cat_decor', sku: 'DC-041' },
  { id: 's_042', name: 'Sprinkles, Mixed',        unit: 'kg',     quantity: 3,   price: 8.90,  categoryId: 'cat_decor', sku: 'DC-042' },
  { id: 's_043', name: 'Piping Gel',              unit: 'kg',     quantity: 2,   price: 11.40, categoryId: 'cat_decor', sku: 'DC-043' },

  // Packaging
  { id: 's_050', name: 'Cake Box, 8" White',      unit: 'pc',     quantity: 220, price: 0.90,  categoryId: 'cat_pack',  sku: 'PK-050' },
  { id: 's_051', name: 'Cake Box, 10" White',     unit: 'pc',     quantity: 140, price: 1.20,  categoryId: 'cat_pack',  sku: 'PK-051' },
  { id: 's_052', name: 'Cake Drum, 10"',          unit: 'pc',     quantity: 60,  price: 2.40,  categoryId: 'cat_pack',  sku: 'PK-052' },
  { id: 's_053', name: 'Ribbon, Grosgrain',       unit: 'm',      quantity: 320, price: 0.45,  categoryId: 'cat_pack',  sku: 'PK-053' },
  { id: 's_054', name: 'Pastry Bag, 18"',         unit: 'pc',     quantity: 18,  price: 0.60,  categoryId: 'cat_pack',  sku: 'PK-054' },
];

// Low-stock thresholds (per category convention; here, simple per-item)
const LOW_STOCK_AT = {
  'kg': 5, 'L': 3, 'tray': 4, 'pc': 10, 'book': 2, 'm': 50,
};

const isLow = (s) => s.quantity <= (LOW_STOCK_AT[s.unit] || 5);

const MOVEMENTS = [
  { id: 'mv_001', code: 'MV-20260428-003', type: 'IMPORT', remark: 'Weekly delivery — Maison Demarle',
    createdAt: '2026-04-28T08:12:00', items: [
      { stockId: 's_001', quantity: 25 },
      { stockId: 's_010', quantity: 12 },
      { stockId: 's_013', quantity: 8 },
      { stockId: 's_020', quantity: 6 },
    ] },
  { id: 'mv_002', code: 'MV-20260428-002', type: 'EXPORT', remark: 'Wedding order — Aldridge',
    createdAt: '2026-04-28T06:40:00', items: [
      { stockId: 's_010', quantity: 4 },
      { stockId: 's_001', quantity: 6 },
      { stockId: 's_024', quantity: 12 },
      { stockId: 's_040', quantity: 1 },
    ] },
  { id: 'mv_003', code: 'MV-20260427-001', type: 'IMPORT', remark: 'Specialty chocolate restock',
    createdAt: '2026-04-27T14:22:00', items: [
      { stockId: 's_020', quantity: 10 },
      { stockId: 's_021', quantity: 8 },
      { stockId: 's_022', quantity: 5 },
      { stockId: 's_023', quantity: 4 },
    ] },
  { id: 'mv_004', code: 'MV-20260426-004', type: 'EXPORT', remark: 'Saturday market batch',
    createdAt: '2026-04-26T05:15:00', items: [
      { stockId: 's_001', quantity: 14 },
      { stockId: 's_003', quantity: 9 },
      { stockId: 's_010', quantity: 6 },
      { stockId: 's_011', quantity: 4 },
      { stockId: 's_050', quantity: 24 },
    ] },
  { id: 'mv_005', code: 'MV-20260425-002', type: 'IMPORT', remark: 'Packaging top-up',
    createdAt: '2026-04-25T11:00:00', items: [
      { stockId: 's_050', quantity: 100 },
      { stockId: 's_051', quantity: 80 },
      { stockId: 's_053', quantity: 200 },
    ] },
  { id: 'mv_006', code: 'MV-20260424-001', type: 'EXPORT', remark: 'Café wholesale — Brun & Co.',
    createdAt: '2026-04-24T09:30:00', items: [
      { stockId: 's_002', quantity: 3 },
      { stockId: 's_031', quantity: 2 },
      { stockId: 's_011', quantity: 6 },
    ] },
];

const TRANSACTIONS = [
  { id: 't_001', stockId: 's_010', subject: null, type: 'IMPORT', quantity: 12, price: 9.60, remark: 'Restock', createdAt: '2026-04-28T08:14:00' },
  { id: 't_002', stockId: null, subject: 'Equipment maintenance — KitchenAid', type: 'EXPORT', quantity: 1, price: 145.00, remark: 'Annual service', createdAt: '2026-04-28T10:02:00' },
  { id: 't_003', stockId: 's_020', subject: null, type: 'IMPORT', quantity: 10, price: 22.50, remark: '', createdAt: '2026-04-27T14:25:00' },
  { id: 't_004', stockId: null, subject: 'Utility — Electric, April', type: 'EXPORT', quantity: 1, price: 312.40, remark: 'Off-peak rate', createdAt: '2026-04-27T11:00:00' },
  { id: 't_005', stockId: 's_001', subject: null, type: 'EXPORT', quantity: 6,  price: 2.40, remark: 'Wedding order', createdAt: '2026-04-28T06:42:00' },
  { id: 't_006', stockId: null, subject: 'Marketing — Print menu', type: 'EXPORT', quantity: 1, price: 84.00, remark: 'Letterpress, 200pc', createdAt: '2026-04-26T13:30:00' },
  { id: 't_007', stockId: 's_013', subject: null, type: 'IMPORT', quantity: 8, price: 8.40, remark: 'Free-range', createdAt: '2026-04-28T08:18:00' },
  { id: 't_008', stockId: 's_050', subject: null, type: 'IMPORT', quantity: 100, price: 0.90, remark: 'Packaging top-up', createdAt: '2026-04-25T11:02:00' },
  { id: 't_009', stockId: null, subject: 'Refund — Customer mishap', type: 'EXPORT', quantity: 1, price: 42.00, remark: 'Goodwill credit', createdAt: '2026-04-24T16:20:00' },
  { id: 't_010', stockId: 's_011', subject: null, type: 'EXPORT', quantity: 4, price: 5.40, remark: '', createdAt: '2026-04-26T05:18:00' },
];

// Sparkline data — last 14 days, total stock value movement
const VALUE_SERIES = [
  18420, 18610, 18380, 18920, 19140, 19080, 18760,
  18540, 18810, 19340, 19610, 19420, 19180, 19580,
];

// 30-day flow for April 2026 (day 1 → 30)
// in = income $ (imports/restocks paid), out = expenses $ (exports/sales as cost-of-goods + overheads)
const FLOW_SERIES = [
  { day:  1, in:  820, out:  640 }, { day:  2, in:  340, out:  920 }, { day:  3, in: 1480, out:  410 },
  { day:  4, in:  210, out: 1820, note: 'wholesale' },
  { day:  5, in:  960, out:  720 }, { day:  6, in:  540, out:  480 },
  { day:  7, in:    0, out:  120 }, { day:  8, in: 2240, out:  680, note: 'choc restock' },
  { day:  9, in:  380, out: 1340 }, { day: 10, in:  720, out:  890 }, { day: 11, in: 1180, out:  430 },
  { day: 12, in:  290, out: 1860, note: 'market batch' },
  { day: 13, in:  640, out: 1020 }, { day: 14, in:  180, out:  240 },
  { day: 15, in: 1320, out:  780 }, { day: 16, in:  490, out: 1480 }, { day: 17, in:  920, out:  560 },
  { day: 18, in: 1640, out:  840 }, { day: 19, in:  240, out: 1720 }, { day: 20, in:  780, out:  640 },
  { day: 21, in:  120, out:  220 }, { day: 22, in: 1080, out:  490 }, { day: 23, in:  420, out: 1140 },
  { day: 24, in:  860, out: 1820, note: 'café wholesale' },
  { day: 25, in: 1980, out:  610, note: 'packaging' },
  { day: 26, in:  640, out: 1740, note: 'sat. market' },
  { day: 27, in: 1120, out:  720 }, { day: 28, in: 1840, out: 1260, note: 'wedding ship' },
  { day: 29, in:  520, out:  880 }, { day: 30, in: 1320, out:  490 },
];

Object.assign(window, {
  CATEGORIES, STOCKS, MOVEMENTS, TRANSACTIONS,
  LOW_STOCK_AT, isLow, VALUE_SERIES, FLOW_SERIES,
});
