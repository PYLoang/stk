// Transactions list + form (XOR stock vs subject)

function TransactionsPage({ transactions, stocks, filter, setFilter, openSheet, onDelete }) {
  const filtered = transactions.filter(t => {
    if (filter.type !== 'all' && t.type !== filter.type) return false;
    if (filter.mode === 'stock' && !t.stockId) return false;
    if (filter.mode === 'subject' && !t.subject) return false;
    if (filter.q) {
      const q = filter.q.toLowerCase();
      const stock = stocks.find(s => s.id === t.stockId);
      const haystack = ((stock?.name || '') + ' ' + (t.subject || '') + ' ' + (t.remark || '')).toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const totalIn  = filtered.filter(t => t.type === 'IMPORT').reduce((s, t) => s + t.quantity * t.price, 0);
  const totalOut = filtered.filter(t => t.type === 'EXPORT').reduce((s, t) => s + t.quantity * t.price, 0);
  const stockCount = transactions.filter(t => t.stockId).length;
  const subjectCount = transactions.filter(t => t.subject).length;

  return (
    <div className="page">
      <div className="page-h">
        <div className="page-title">
          <span className="num">05</span>
          <h1 className="h-1">Transactions</h1>
          <span className="muted mono" style={{ fontSize: 12 }}>· {transactions.length} entries</span>
        </div>
        <button className="btn btn--primary" onClick={() => openSheet('new-transaction')}>
          <Icon name="plus" size={12} />New transaction
        </button>
      </div>

      <div className="grid-bordered mb-24" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
        <div className="stat" style={{ padding: '18px 22px' }}>
          <div className="stat-lbl">In</div>
          <div className="mono" style={{ fontSize: 22, fontWeight: 500, marginTop: 8, color: 'var(--pos)' }}>+{fmtMoney(totalIn)}</div>
        </div>
        <div className="stat" style={{ padding: '18px 22px' }}>
          <div className="stat-lbl">Out</div>
          <div className="mono" style={{ fontSize: 22, fontWeight: 500, marginTop: 8, color: 'var(--neg)' }}>−{fmtMoney(totalOut)}</div>
        </div>
        <div className="stat" style={{ padding: '18px 22px' }}>
          <div className="stat-lbl">Net</div>
          <div className="mono" style={{ fontSize: 22, fontWeight: 500, marginTop: 8 }}>{fmtMoney(totalIn - totalOut)}</div>
        </div>
      </div>

      <div className="filterbar">
        <div className="search" style={{ width: 320 }}>
          <Icon name="search" size={12} />
          <input placeholder="Search…" value={filter.q} onChange={e => setFilter({ ...filter, q: e.target.value })} />
        </div>
        <div className="divider--v" style={{ height: 22 }}></div>
        <ChipFilter
          value={filter.type}
          onChange={(v) => setFilter({ ...filter, type: v })}
          options={[
            { value: 'all',    label: 'All',     count: transactions.length },
            { value: 'IMPORT', label: 'In',      count: transactions.filter(t => t.type === 'IMPORT').length },
            { value: 'EXPORT', label: 'Out',     count: transactions.filter(t => t.type === 'EXPORT').length },
          ]}
        />
        <div className="divider--v" style={{ height: 22 }}></div>
        <ChipFilter
          value={filter.mode}
          onChange={(v) => setFilter({ ...filter, mode: v })}
          options={[
            { value: 'all',     label: 'Any',     count: transactions.length },
            { value: 'stock',   label: 'Stock',   count: stockCount },
            { value: 'subject', label: 'Subject', count: subjectCount },
          ]}
        />
      </div>

      <table className="tbl mt-16">
        <thead>
          <tr>
            <th style={{ width: 70 }}>Type</th>
            <th>Reference</th>
            <th>Remark</th>
            <th className="right">Qty</th>
            <th className="right">Price</th>
            <th className="right">Amount</th>
            <th>Date</th>
            <th style={{ width: 60 }}></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(t => {
            const s = stocks.find(x => x.id === t.stockId);
            return (
              <tr key={t.id}>
                <td>
                  <span className={t.type === 'IMPORT' ? 'pill pill--in' : 'pill pill--out'}>
                    {t.type === 'IMPORT' ? 'IN' : 'OUT'}
                  </span>
                </td>
                <td>
                  {s ? (
                    <div className="col" style={{ gap: 2 }}>
                      <span style={{ fontWeight: 500 }}>{s.name}</span>
                      <span className="muted mono" style={{ fontSize: 11 }}>Stock · {s.sku}</span>
                    </div>
                  ) : (
                    <div className="col" style={{ gap: 2 }}>
                      <span className="serif" style={{ fontStyle: 'italic', fontSize: 14 }}>{t.subject}</span>
                      <span className="muted" style={{ fontSize: 11 }}>Subject (free-form)</span>
                    </div>
                  )}
                </td>
                <td className="muted" style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.remark || '—'}</td>
                <td className="right num">{t.quantity}</td>
                <td className="right num">{fmtMoney(t.price)}</td>
                <td className="right num" style={{ fontWeight: 500, color: t.type === 'IMPORT' ? 'var(--pos)' : 'var(--neg)' }}>
                  {t.type === 'IMPORT' ? '+' : '−'}{fmtMoney(t.quantity * t.price)}
                </td>
                <td className="num muted">{fmtDate(t.createdAt)} · {fmtTime(t.createdAt)}</td>
                <td>
                  <div className="row-actions">
                    <button className="btn btn--ghost btn--icon btn--sm" onClick={() => onDelete(t.id, s ? s.name : t.subject)}><Icon name="trash" size={11} /></button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {filtered.length === 0 && (
        <div className="muted" style={{ padding: 60, textAlign: 'center', fontSize: 13 }}>No transactions match these filters.</div>
      )}
    </div>
  );
}

function TransactionForm({ stocks, categories, onSubmit, onCancel }) {
  const [mode, setMode] = React.useState('stock'); // 'stock' | 'subject'
  const [type, setType] = React.useState('EXPORT');
  const [stockId, setStockId] = React.useState('');
  const [subject, setSubject] = React.useState('');
  const [stockSearch, setStockSearch] = React.useState('');
  const [quantity, setQuantity] = React.useState(1);
  const [price, setPrice] = React.useState('');
  const [remark, setRemark] = React.useState('');

  const selectedStock = stocks.find(s => s.id === stockId);

  // auto-fill price when stock selected
  React.useEffect(() => {
    if (selectedStock && !price) setPrice(selectedStock.price.toFixed(2));
  }, [stockId]);

  const filteredStocks = stocks.filter(s => {
    if (!stockSearch) return true;
    const q = stockSearch.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.sku.toLowerCase().includes(q);
  }).slice(0, 6);

  const errors = [];
  if (mode === 'stock' && !stockId) errors.push('Pick a stock.');
  if (mode === 'subject' && !subject.trim()) errors.push('Enter a subject.');
  if (!quantity || quantity <= 0) errors.push('Quantity must be > 0.');
  if (!price || parseFloat(price) <= 0) errors.push('Price must be > 0.');
  if (mode === 'stock' && type === 'EXPORT' && selectedStock && quantity > selectedStock.quantity) {
    errors.push(`Export ${quantity} exceeds stock ${selectedStock.quantity}.`);
  }

  const total = (parseFloat(price) || 0) * quantity;

  const submit = () => {
    if (errors.length) return;
    onSubmit({
      stockId: mode === 'stock' ? stockId : null,
      subject: mode === 'subject' ? subject.trim() : null,
      type, quantity, price: parseFloat(price), remark,
    });
  };

  return (
    <>
      <div className="col gap-24">
        {/* type */}
        <div>
          <div className="field-lbl">Type <span className="req">·</span></div>
          <div style={{ display: 'flex', gap: 0, border: '1px solid var(--rule)', borderRadius: 'var(--r)', padding: 2, width: 'fit-content' }}>
            {['IMPORT', 'EXPORT'].map(t => (
              <button key={t} onClick={() => setType(t)} className="btn btn--sm"
                      style={{
                        background: type === t ? 'var(--ink)' : 'transparent',
                        color: type === t ? 'var(--bg)' : 'var(--ink-2)',
                        border: 0,
                      }}>
                <Icon name={t === 'IMPORT' ? 'in' : 'out'} size={11} />
                {t === 'IMPORT' ? 'In' : 'Out'}
              </button>
            ))}
          </div>
        </div>

        {/* XOR mode toggle */}
        <div>
          <div className="field-lbl">Reference <span className="req">·</span> <span className="muted">choose one</span></div>
          <div className="grid-bordered" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div onClick={() => setMode('stock')}
                 style={{
                   padding: '14px 18px',
                   borderRight: '1px solid var(--rule)',
                   cursor: 'pointer',
                   background: mode === 'stock' ? 'var(--accent-soft)' : 'transparent',
                   position: 'relative',
                 }}>
              {mode === 'stock' && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: 'var(--accent)' }}></div>}
              <div className="row gap-8 mb-4">
                <div style={{
                  width: 14, height: 14, borderRadius: '50%',
                  border: '1.5px solid ' + (mode === 'stock' ? 'var(--accent)' : 'var(--hairline)'),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {mode === 'stock' && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }}></div>}
                </div>
                <span style={{ fontWeight: 500 }}>Existing stock</span>
              </div>
              <div className="muted" style={{ fontSize: 11.5, paddingLeft: 22 }}>
                Tied to inventory · auto-adjusts quantity
              </div>
            </div>
            <div onClick={() => setMode('subject')}
                 style={{
                   padding: '14px 18px',
                   cursor: 'pointer',
                   background: mode === 'subject' ? 'var(--accent-soft)' : 'transparent',
                   position: 'relative',
                 }}>
              {mode === 'subject' && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: 'var(--accent)' }}></div>}
              <div className="row gap-8 mb-4">
                <div style={{
                  width: 14, height: 14, borderRadius: '50%',
                  border: '1.5px solid ' + (mode === 'subject' ? 'var(--accent)' : 'var(--hairline)'),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {mode === 'subject' && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }}></div>}
                </div>
                <span style={{ fontWeight: 500 }}>Free-form subject</span>
              </div>
              <div className="muted" style={{ fontSize: 11.5, paddingLeft: 22 }}>
                Utilities, services, refunds — no stock impact
              </div>
            </div>
          </div>
        </div>

        {/* stock or subject input */}
        {mode === 'stock' ? (
          <div>
            <div className="field-lbl">Stock <span className="req">·</span></div>
            {selectedStock ? (
              <div className="row between" style={{ padding: '12px 14px', border: '1px solid var(--hairline)', borderRadius: 'var(--r)', background: 'var(--bg-2)' }}>
                <div className="col" style={{ gap: 2 }}>
                  <span style={{ fontWeight: 500 }}>{selectedStock.name}</span>
                  <span className="muted mono" style={{ fontSize: 11 }}>{selectedStock.sku} · in stock: {selectedStock.quantity} {selectedStock.unit}</span>
                </div>
                <button className="btn btn--ghost btn--sm" onClick={() => { setStockId(''); setPrice(''); }}>Change</button>
              </div>
            ) : (
              <>
                <div className="search mb-8" style={{ width: '100%' }}>
                  <Icon name="search" size={12} />
                  <input placeholder="Search stock by name or SKU…" value={stockSearch} onChange={e => setStockSearch(e.target.value)} autoFocus />
                </div>
                <div className="grid-bordered">
                  {filteredStocks.map(s => (
                    <div key={s.id} className="row between"
                         style={{ padding: '8px 14px', borderBottom: '1px solid var(--rule-2)', cursor: 'pointer' }}
                         onClick={() => setStockId(s.id)}>
                      <div className="col" style={{ gap: 2 }}>
                        <span style={{ fontWeight: 500 }}>{s.name}</span>
                        <span className="muted mono" style={{ fontSize: 11 }}>{s.sku}</span>
                      </div>
                      <span className="mono muted" style={{ fontSize: 11 }}>{s.quantity} {s.unit} · {fmtMoney(s.price)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div>
            <div className="field-lbl">Subject <span className="req">·</span></div>
            <input className="input" placeholder="e.g. Utility — Electric, May" value={subject} onChange={e => setSubject(e.target.value)} autoFocus />
            <div className="field-help">Suggested: Utilities, equipment service, marketing, refunds.</div>
          </div>
        )}

        {/* quantity + price */}
        <div className="row gap-24">
          <div className="flex-1">
            <div className="field-lbl">Quantity <span className="req">·</span></div>
            <input className="input mono" type="number" value={quantity}
                   onChange={e => setQuantity(parseInt(e.target.value) || 0)} />
          </div>
          <div className="flex-1">
            <div className="field-lbl">Unit price <span className="req">·</span></div>
            <input className="input mono" type="number" step="0.01" value={price}
                   onChange={e => setPrice(e.target.value)} placeholder="0.00" />
          </div>
          <div className="flex-1">
            <div className="field-lbl">Total</div>
            <div className="mono" style={{ fontSize: 22, fontWeight: 500, paddingTop: 4 }}>{fmtMoney(total)}</div>
          </div>
        </div>

        <div>
          <div className="field-lbl">Remark</div>
          <input className="input" placeholder="Optional note" value={remark} onChange={e => setRemark(e.target.value)} />
        </div>

        {errors.length > 0 && (
          <div className="col gap-4" style={{ padding: 12, border: '1px solid oklch(from var(--neg) l c h / 0.3)', background: 'oklch(from var(--neg) l c h / 0.06)', borderRadius: 'var(--r)' }}>
            {errors.map((e, i) => (
              <div key={i} className="field-error" style={{ marginTop: 0 }}>
                <Icon name="warn" size={11} />
                {e}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ height: 60 }}></div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: 'var(--bg)', borderTop: '1px solid var(--rule)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="col" style={{ gap: 2 }}>
          <span className="eyebrow">Net</span>
          <span className="mono" style={{ fontSize: 14, fontWeight: 500, color: type === 'IMPORT' ? 'var(--pos)' : 'var(--neg)' }}>
            {type === 'IMPORT' ? '+' : '−'}{fmtMoney(total)}
          </span>
        </div>
        <div className="row gap-8">
          <button className="btn btn--ghost" onClick={onCancel}>Cancel</button>
          <button className="btn btn--primary" onClick={submit} disabled={errors.length > 0}
                  style={errors.length > 0 ? { opacity: 0.4, cursor: 'not-allowed' } : null}>
            Post transaction
          </button>
        </div>
      </div>
    </>
  );
}

// Simple stock form (create / edit)
function StockForm({ stock, categories, onSubmit, onCancel }) {
  const [name, setName] = React.useState(stock?.name || '');
  const [sku, setSku] = React.useState(stock?.sku || '');
  const [quantity, setQuantity] = React.useState(stock?.quantity ?? 0);
  const [price, setPrice] = React.useState(stock?.price?.toFixed(2) || '');
  const [unit, setUnit] = React.useState(stock?.unit || 'kg');
  const [categoryId, setCategoryId] = React.useState(stock?.categoryId || categories[0]?.id);

  const errors = [];
  if (!name.trim()) errors.push('Name is required.');
  if (!price || parseFloat(price) <= 0) errors.push('Price must be > 0.');

  const submit = () => {
    if (errors.length) return;
    onSubmit({ name: name.trim(), sku: sku.trim(), quantity: parseInt(quantity) || 0, price: parseFloat(price), unit, categoryId });
  };

  return (
    <>
      <div className="col gap-24">
        <div>
          <div className="field-lbl">Name <span className="req">·</span></div>
          <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Pistachio paste" autoFocus />
        </div>
        <div className="row gap-24">
          <div className="flex-1">
            <div className="field-lbl">SKU</div>
            <input className="input mono" value={sku} onChange={e => setSku(e.target.value)} placeholder="auto" />
          </div>
          <div className="flex-1">
            <div className="field-lbl">Category <span className="req">·</span></div>
            <select className="select" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <div className="row gap-24">
          <div className="flex-1">
            <div className="field-lbl">Quantity</div>
            <input className="input mono" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} />
          </div>
          <div className="flex-1">
            <div className="field-lbl">Unit</div>
            <select className="select" value={unit} onChange={e => setUnit(e.target.value)}>
              {['kg', 'L', 'pc', 'tray', 'book', 'm'].map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <div className="field-lbl">Unit price <span className="req">·</span></div>
            <input className="input mono" type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" />
          </div>
        </div>

        {errors.length > 0 && (
          <div className="col gap-4">
            {errors.map((e, i) => <div key={i} className="field-error"><Icon name="warn" size={11} />{e}</div>)}
          </div>
        )}
      </div>

      <div style={{ height: 60 }}></div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: 'var(--bg)', borderTop: '1px solid var(--rule)', padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button className="btn btn--ghost" onClick={onCancel}>Cancel</button>
        <button className="btn btn--primary" onClick={submit} disabled={errors.length > 0}
                style={errors.length > 0 ? { opacity: 0.4, cursor: 'not-allowed' } : null}>
          {stock ? 'Save changes' : 'Create stock'}
        </button>
      </div>
    </>
  );
}

function CategoryForm({ category, onSubmit, onCancel }) {
  const [name, setName] = React.useState(category?.name || '');
  const [code, setCode] = React.useState(category?.code || '');
  const errors = [];
  if (!name.trim()) errors.push('Name is required.');

  return (
    <>
      <div className="col gap-24">
        <div>
          <div className="field-lbl">Name <span className="req">·</span></div>
          <input className="input" value={name} onChange={e => setName(e.target.value)} autoFocus />
        </div>
        <div>
          <div className="field-lbl">Code</div>
          <input className="input mono" value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. 07" />
        </div>
        {errors.length > 0 && errors.map((e, i) => <div key={i} className="field-error"><Icon name="warn" size={11} />{e}</div>)}
      </div>

      <div style={{ height: 60 }}></div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: 'var(--bg)', borderTop: '1px solid var(--rule)', padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button className="btn btn--ghost" onClick={onCancel}>Cancel</button>
        <button className="btn btn--primary" onClick={() => !errors.length && onSubmit({ name: name.trim(), code: code.trim() })}>
          {category ? 'Save changes' : 'Create category'}
        </button>
      </div>
    </>
  );
}

window.TransactionsPage = TransactionsPage;
window.TransactionForm  = TransactionForm;
window.StockForm = StockForm;
window.CategoryForm = CategoryForm;
