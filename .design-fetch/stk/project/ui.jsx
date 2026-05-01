// Shared UI: Sidebar, Topbar, Toasts, Modal, Sheet, Sparkline, BarChart, Icons

const FA_MAP = {
  'dash':     'fa-solid fa-table-cells-large',
  'box':      'fa-solid fa-box',
  'tag':      'fa-solid fa-tag',
  'arrows':   'fa-solid fa-right-left',
  'list':     'fa-solid fa-list',
  'plus':     'fa-solid fa-plus',
  'minus':    'fa-solid fa-minus',
  'in':       'fa-solid fa-arrow-right-to-bracket',
  'out':      'fa-solid fa-arrow-right-from-bracket',
  'search':   'fa-solid fa-magnifying-glass',
  'x':        'fa-solid fa-xmark',
  'check':    'fa-solid fa-check',
  'edit':     'fa-solid fa-pen',
  'trash':    'fa-solid fa-trash',
  'sun':      'fa-solid fa-sun',
  'moon':     'fa-solid fa-moon',
  'caret':    'fa-solid fa-chevron-down',
  'arrow-up': 'fa-solid fa-arrow-up',
  'arrow-dn': 'fa-solid fa-arrow-down',
  'circle':   'fa-regular fa-circle',
  'dot-fill': 'fa-solid fa-circle',
  'export':   'fa-solid fa-arrow-up-from-bracket',
  'filter':   'fa-solid fa-filter',
  'warn':     'fa-solid fa-triangle-exclamation',
};

const Icon = ({ name, size = 14 }) => {
  const cls = FA_MAP[name];
  if (!cls) return null;
  return <i className={cls} style={{ fontSize: size, width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }} aria-hidden="true"></i>;
};

// ── Sidebar ────────────────────────────────────────────────────────────────
function Sidebar({ route, setRoute, theme, setTheme, counts }) {
  const items = [
    { id: 'dashboard',    label: 'Dashboard',    num: '01', icon: 'dash',   ct: null },
    { id: 'stocks',       label: 'Stocks',       num: '02', icon: 'box',    ct: counts.stocks },
    { id: 'categories',   label: 'Categories',   num: '03', icon: 'tag',    ct: counts.categories },
    { id: 'movements',    label: 'Movements',    num: '04', icon: 'arrows', ct: counts.movements },
    { id: 'transactions', label: 'Transactions', num: '05', icon: 'list',   ct: counts.transactions },
  ];
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark" aria-hidden></div>
        <div>
          <div className="brand-name">Marbled</div>
          <div className="brand-sub">Stock System</div>
        </div>
      </div>

      <div className="nav-group">
        <div className="nav-group-h">Workspace</div>
        {items.map(it => (
          <div key={it.id} className="nav-item" data-active={route === it.id ? '1' : '0'}
               onClick={() => setRoute(it.id)}>
            <span className="nav-num">{it.num}</span>
            <span>{it.label}</span>
            {it.ct != null && <span className="nav-cnt">{String(it.ct).padStart(2, '0')}</span>}
          </div>
        ))}
      </div>

      <div className="sidebar-foot">
        <div className="col" style={{ gap: 2 }}>
          <span className="mono" style={{ fontSize: 11 }}>Apr 30, 2026</span>
          <span className="faint" style={{ fontSize: 10.5 }}>Thursday · open</span>
        </div>
        <button className="theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={12} />
          {theme === 'dark' ? 'Light' : 'Dark'}
        </button>
      </div>
    </aside>
  );
}

// ── Topbar ────────────────────────────────────────────────────────────────
function Topbar({ route, onAction }) {
  const titles = {
    dashboard: ['Marbled', 'Dashboard'],
    stocks: ['Inventory', 'Stocks'],
    categories: ['Inventory', 'Categories'],
    movements: ['Operations', 'Movements'],
    transactions: ['Operations', 'Transactions'],
  };
  const [parent, now] = titles[route] || ['', ''];

  const actionFor = {
    dashboard:    null,
    stocks:       { label: 'New stock',       to: 'new-stock' },
    categories:   { label: 'New category',    to: 'new-category' },
    movements:    { label: 'New movement',    to: 'new-movement' },
    transactions: { label: 'New transaction', to: 'new-transaction' },
  }[route];

  return (
    <div className="topbar">
      <div className="crumbs">
        <span>{parent}</span>
        <span className="sep">/</span>
        <span className="now">{now}</span>
      </div>
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────
function ToastStack({ toasts, dismiss }) {
  return (
    <div className="toasts">
      {toasts.map(t => (
        <div key={t.id} className="toast">
          <div className="ind" style={{ background: t.tone === 'neg' ? 'var(--neg)' : t.tone === 'pos' ? 'var(--pos)' : 'var(--accent)' }}></div>
          <div className="body">
            <div className="ttl">{t.title}</div>
            {t.desc && <div className="desc">{t.desc}</div>}
          </div>
          <button className="x" onClick={() => dismiss(t.id)}><Icon name="x" size={12} /></button>
        </div>
      ))}
    </div>
  );
}

// ── Confirm modal ─────────────────────────────────────────────────────────
function Confirm({ open, title, desc, confirmLabel = 'Confirm', tone = 'primary', onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="scrim" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-h">
          <h2 className="h-2">{title}</h2>
        </div>
        <div className="muted" style={{ fontSize: 13 }}>{desc}</div>
        <div className="modal-actions">
          <button className="btn btn--ghost" onClick={onCancel}>Cancel</button>
          <button className={tone === 'danger' ? 'btn btn--accent' : 'btn btn--primary'}
                  style={tone === 'danger' ? { background: 'var(--neg)', borderColor: 'var(--neg)' } : null}
                  onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ── Sheet (slide-in) ──────────────────────────────────────────────────────
function Sheet({ open, title, eyebrow, onClose, children, footer }) {
  if (!open) return null;
  return (
    <>
      <div className="scrim" onClick={onClose}></div>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-h">
          <div>
            {eyebrow && <div className="eyebrow mb-4">{eyebrow}</div>}
            <h2 className="h-1">{title}</h2>
          </div>
          <button className="btn btn--ghost btn--icon" onClick={onClose}><Icon name="x" size={12} /></button>
        </div>
        <div className="sheet-body">{children}</div>
        {footer && <div className="sheet-foot">{footer}</div>}
      </div>
    </>
  );
}

// ── Sparkline ─────────────────────────────────────────────────────────────
function Sparkline({ data, w = 260, h = 60 }) {
  const min = Math.min(...data), max = Math.max(...data);
  const pad = 2;
  const sx = (i) => pad + (i / (data.length - 1)) * (w - pad * 2);
  const sy = (v) => pad + (1 - (v - min) / (max - min || 1)) * (h - pad * 2);
  const points = data.map((v, i) => [sx(i), sy(v)]);
  const path = points.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
  const area = `${path} L${sx(data.length - 1)},${h} L${sx(0)},${h} Z`;
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <path className="area" d={area} />
      <path className="ln" d={path} />
      <circle cx={points[points.length - 1][0]} cy={points[points.length - 1][1]} r="2.5" fill="var(--accent)" />
    </svg>
  );
}

// ── Bar chart (paired in/out per day) ─────────────────────────────────────
function BarChart({ data, w = 960, h = 180 }) {
  const max = Math.max(1, ...data.map(d => Math.max(d.in || 0, d.out || 0)));
  const padL = 44, padR = 8, padT = 8, padB = 22;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const groupW = innerW / data.length;
  const gap = Math.max(1, groupW * 0.12);
  const barW = (groupW - gap * 3) / 2;
  const yOf = v => padT + innerH - (v / max) * innerH;

  // y-axis ticks (4 lines)
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(t => ({
    v: Math.round(t * max),
    y: padT + innerH - t * innerH,
  }));

  // x labels — show every 5th day + first + last
  const labelDays = data.map(d => d.day).filter(d => d === 1 || d === 30 || d % 5 === 0);

  return (
    <svg className="bar-chart" viewBox={`0 0 ${w} ${h}`}
         preserveAspectRatio="none"
         style={{ width: '100%', height: h, display: 'block' }}>
      {/* gridlines */}
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={padL} y1={t.y} x2={w - padR} y2={t.y}
                stroke="var(--rule-2)" strokeWidth="0.5" />
          <text x={padL - 6} y={t.y + 3} textAnchor="end"
                fontFamily="var(--mono)" fontSize="8.5" fill="var(--ink-4)">
            {t.v >= 1000 ? `$${(t.v / 1000).toFixed(t.v >= 10000 ? 0 : 1)}k` : `$${t.v}`}
          </text>
        </g>
      ))}
      {/* baseline */}
      <line x1={padL} y1={padT + innerH} x2={w - padR} y2={padT + innerH}
            stroke="var(--rule)" strokeWidth="0.5" />

      {data.map((d, i) => {
        const x0 = padL + i * groupW + gap;
        const inH  = ((d.in  || 0) / max) * innerH;
        const outH = ((d.out || 0) / max) * innerH;
        return (
          <g key={i}>
            <rect className="bar-in"  x={x0}                y={yOf(d.in  || 0)} width={barW} height={inH} />
            <rect className="bar-out" x={x0 + barW + gap}   y={yOf(d.out || 0)} width={barW} height={outH} />
          </g>
        );
      })}

      {/* x-axis day labels */}
      {data.map((d, i) => {
        if (!labelDays.includes(d.day)) return null;
        const x = padL + i * groupW + groupW / 2;
        return (
          <text key={i} x={x} y={h - 6} textAnchor="middle"
                fontFamily="var(--mono)" fontSize="9" fill="var(--ink-4)">
            {String(d.day).padStart(2, '0')}
          </text>
        );
      })}
    </svg>
  );
}

// ── Filter chips bar ──────────────────────────────────────────────────────
function ChipFilter({ value, options, onChange }) {
  return (
    <div className="row gap-8">
      {options.map(o => (
        <button key={o.value} className="chip"
                data-active={value === o.value ? '1' : '0'}
                onClick={() => onChange(o.value)}>
          {o.label}
          {o.count != null && <span className="ct">{String(o.count).padStart(2, '0')}</span>}
        </button>
      ))}
    </div>
  );
}

// ── Sortable header helper ────────────────────────────────────────────────
function SortableTH({ label, k, sort, setSort, align, width }) {
  const active = sort.key === k;
  const arr = active ? (sort.dir === 'asc' ? '↑' : '↓') : '';
  return (
    <th onClick={() => setSort(active ? { key: k, dir: sort.dir === 'asc' ? 'desc' : 'asc' } : { key: k, dir: 'asc' })}
        style={{ textAlign: align, width }}>
      {label}
      <span className="sort-arr">{arr}</span>
    </th>
  );
}

// ── Currency / number formatters ──────────────────────────────────────────
const fmtMoney  = (v, cur = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency: cur, minimumFractionDigits: 2 }).format(v);
const fmtNum    = (v) => new Intl.NumberFormat('en-US').format(v);
const fmtDate   = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
};
const fmtTime   = (iso) => {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
};

// expose
Object.assign(window, {
  Icon, Sidebar, Topbar, ToastStack, Confirm, Sheet,
  Sparkline, BarChart, ChipFilter, SortableTH,
  fmtMoney, fmtNum, fmtDate, fmtTime,
});
