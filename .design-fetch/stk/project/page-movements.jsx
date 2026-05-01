// Movements list + form

function MovementsPage({ movements, stocks, categories, filter, setFilter, openSheet, onDelete }) {
  const filtered = movements.filter(m => {
    if (filter.type !== 'all' && m.type !== filter.type) return false;
    if (filter.q) {
      const q = filter.q.toLowerCase();
      if (!m.code.toLowerCase().includes(q) && !(m.remark || '').toLowerCase().includes(q)) return false;
    }
    return true;
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const totalIn  = movements.filter(m => m.type === 'IMPORT').length;
  const totalOut = movements.filter(m => m.type === 'EXPORT').length;

  return (
    <div className="page">
      <div className="page-h">
        <div className="page-title">
          <span className="num">04</span>
          <h1 className="h-1">Movements</h1>
          <span className="muted mono" style={{ fontSize: 12 }}>· {movements.length} rounds</span>
        </div>
        <button className="btn btn--primary" onClick={() => openSheet('new-movement')}>
          <Icon name="plus" size={12} />New movement
        </button>
      </div>

      <div className="filterbar">
        <div className="search" style={{ width: 320 }}>
          <Icon name="search" size={12} />
          <input placeholder="Search by code or remark…" value={filter.q}
                 onChange={e => setFilter({ ...filter, q: e.target.value })} />
        </div>
        <div className="divider--v" style={{ height: 22 }}></div>
        <ChipFilter
          value={filter.type}
          onChange={(v) => setFilter({ ...filter, type: v })}
          options={[
            { value: 'all',    label: 'All',     count: movements.length },
            { value: 'IMPORT', label: 'Imports', count: totalIn },
            { value: 'EXPORT', label: 'Exports', count: totalOut },
          ]}
        />
      </div>

      <div className="col mt-16" style={{ gap: 0 }}>
        {filtered.map(m => {
          const itemList = m.items.map(it => stocks.find(s => s.id === it.stockId)).filter(Boolean);
          const totalQty = m.items.reduce((s, it) => s + it.quantity, 0);
          const value = m.items.reduce((sum, it) => {
            const st = stocks.find(s => s.id === it.stockId);
            return sum + (st ? st.price * it.quantity : 0);
          }, 0);
          return (
            <div key={m.id} style={{
              borderBottom: '1px solid var(--rule)',
              padding: '20px 0',
              display: 'grid',
              gridTemplateColumns: '90px 200px 1fr 140px 120px 80px',
              gap: 24,
              alignItems: 'center',
            }}>
              <div>
                <span className={m.type === 'IMPORT' ? 'pill pill--in' : 'pill pill--out'}>
                  <Icon name={m.type === 'IMPORT' ? 'in' : 'out'} size={9} />
                  {m.type}
                </span>
              </div>
              <div className="col" style={{ gap: 2 }}>
                <span className="mono" style={{ fontWeight: 500 }}>{m.code}</span>
                <span className="muted mono" style={{ fontSize: 11 }}>{fmtDate(m.createdAt)} · {fmtTime(m.createdAt)}</span>
              </div>
              <div className="col" style={{ gap: 6, minWidth: 0 }}>
                <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.remark || <span className="faint">No remark</span>}</span>
                <div className="row gap-4" style={{ flexWrap: 'wrap' }}>
                  {itemList.slice(0, 4).map(s => (
                    <span key={s.id} className="pill" style={{ fontSize: 10 }}>{s.name}</span>
                  ))}
                  {itemList.length > 4 && <span className="muted mono" style={{ fontSize: 11 }}>+{itemList.length - 4}</span>}
                </div>
              </div>
              <div className="col" style={{ gap: 2, alignItems: 'flex-end' }}>
                <span className="eyebrow">Items / Units</span>
                <span className="mono">{m.items.length} · {totalQty}</span>
              </div>
              <div className="col" style={{ gap: 2, alignItems: 'flex-end' }}>
                <span className="eyebrow">Value</span>
                <span className="mono" style={{ fontWeight: 500, fontSize: 14 }}>{fmtMoney(value)}</span>
              </div>
              <div className="row gap-4" style={{ justifyContent: 'flex-end' }}>
                <button className="btn btn--ghost btn--icon btn--sm" title="View" onClick={() => openSheet('view-movement', { id: m.id })}><Icon name="search" size={11} /></button>
                <button className="btn btn--ghost btn--icon btn--sm" title="Delete" onClick={() => onDelete(m.id, m.code)}><Icon name="trash" size={11} /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Movement form — multi-select stocks, qty preview, inline new stock
function MovementForm({ stocks, categories, onSubmit, onCancel, preset, presetItems, onCreateStockInline }) {
  const [type, setType] = React.useState(preset || 'IMPORT');
  const [remark, setRemark] = React.useState('');
  const [picker, setPicker] = React.useState('');
  const [pickerCat, setPickerCat] = React.useState('all');
  const [items, setItems] = React.useState(() => {
    if (presetItems && presetItems.length) {
      return presetItems.map(id => {
        const s = stocks.find(x => x.id === id);
        const reorderTarget = (LOW_STOCK_AT[s?.unit] || 5) * 4;
        return { stockId: id, quantity: Math.max(reorderTarget - (s?.quantity || 0), 1) };
      });
    }
    return [];
  });
  const [showInline, setShowInline] = React.useState(false);
  const [newStock, setNewStock] = React.useState({ name: '', unit: 'kg', price: '', categoryId: categories[0]?.id });

  // generate code
  const code = React.useMemo(() => {
    const d = new Date();
    return `MV-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 90) + 10).padStart(3, '0')}`;
  }, []);

  const filteredStocks = stocks.filter(s => {
    if (items.find(it => it.stockId === s.id)) return false;
    if (pickerCat !== 'all' && s.categoryId !== pickerCat) return false;
    if (picker) {
      const q = picker.toLowerCase();
      if (!s.name.toLowerCase().includes(q) && !s.sku.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const addItem = (id) => setItems(prev => [...prev, { stockId: id, quantity: 1 }]);
  const removeItem = (id) => setItems(prev => prev.filter(it => it.stockId !== id));
  const setQty = (id, q) => setItems(prev => prev.map(it => it.stockId === id ? { ...it, quantity: Math.max(0, q) } : it));

  const totalUnits = items.reduce((s, it) => s + it.quantity, 0);
  const totalValue = items.reduce((sum, it) => {
    const s = stocks.find(x => x.id === it.stockId);
    return sum + (s ? s.price * it.quantity : 0);
  }, 0);

  // validation: any item with quantity > current stock if EXPORT
  const errors = [];
  if (items.length === 0) errors.push('Add at least one stock to this movement.');
  if (type === 'EXPORT') {
    items.forEach(it => {
      const s = stocks.find(x => x.id === it.stockId);
      if (s && it.quantity > s.quantity) errors.push(`${s.name}: export ${it.quantity} exceeds stock ${s.quantity}.`);
    });
  }
  items.forEach(it => { if (it.quantity <= 0) errors.push(`Quantity must be > 0 for all items.`); });

  const submit = () => {
    if (errors.length) return;
    onSubmit({ code, type, remark, items });
  };

  const handleInlineCreate = () => {
    if (!newStock.name.trim() || !newStock.price) return;
    const id = onCreateStockInline({ ...newStock, price: parseFloat(newStock.price) });
    addItem(id);
    setShowInline(false);
    setNewStock({ name: '', unit: 'kg', price: '', categoryId: categories[0]?.id });
  };

  return (
    <>
      <div className="col gap-24">
        {/* type + code */}
        <div className="row gap-24">
          <div className="flex-1">
            <div className="field-lbl">Type <span className="req">·</span></div>
            <div style={{ display: 'flex', gap: 0, border: '1px solid var(--rule)', borderRadius: 'var(--r)', padding: 2, width: 'fit-content' }}>
              {['IMPORT', 'EXPORT'].map(t => (
                <button key={t}
                        onClick={() => setType(t)}
                        className="btn btn--sm"
                        style={{
                          background: type === t ? 'var(--ink)' : 'transparent',
                          color: type === t ? 'var(--bg)' : 'var(--ink-2)',
                          border: 0,
                        }}>
                  <Icon name={t === 'IMPORT' ? 'in' : 'out'} size={11} />
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1">
            <div className="field-lbl">Code · <span className="muted">auto</span></div>
            <input className="input mono" value={code} readOnly />
          </div>
        </div>

        {/* remark */}
        <div>
          <div className="field-lbl">Remark</div>
          <input className="input" placeholder="Free-form note (e.g. Wedding order — Aldridge)"
                 value={remark} onChange={e => setRemark(e.target.value)} />
        </div>

        <div className="divider"></div>

        {/* item picker */}
        <div>
          <div className="row between mb-8">
            <div className="field-lbl" style={{ marginBottom: 0 }}>Stocks <span className="req">·</span> <span className="muted">{items.length} added</span></div>
            <button className="btn btn--ghost btn--sm" onClick={() => setShowInline(v => !v)}>
              <Icon name="plus" size={11} /> {showInline ? 'Cancel' : 'New stock inline'}
            </button>
          </div>

          {showInline && (
            <div className="panel mb-16" style={{ background: 'var(--bg-2)', border: '1px dashed var(--hairline)' }}>
              <div className="panel-body">
                <div className="eyebrow mb-8">Create new stock & add to this movement</div>
                <div className="row gap-16">
                  <div className="flex-2">
                    <div className="field-lbl">Name</div>
                    <input className="input" placeholder="e.g. Pistachio paste" value={newStock.name}
                           onChange={e => setNewStock({ ...newStock, name: e.target.value })} />
                  </div>
                  <div style={{ width: 100 }}>
                    <div className="field-lbl">Unit</div>
                    <select className="select" value={newStock.unit} onChange={e => setNewStock({ ...newStock, unit: e.target.value })}>
                      {['kg', 'L', 'pc', 'tray', 'book', 'm'].map(u => <option key={u}>{u}</option>)}
                    </select>
                  </div>
                  <div style={{ width: 120 }}>
                    <div className="field-lbl">Unit price</div>
                    <input className="input mono" placeholder="0.00" value={newStock.price}
                           onChange={e => setNewStock({ ...newStock, price: e.target.value })} />
                  </div>
                  <div className="flex-1">
                    <div className="field-lbl">Category</div>
                    <select className="select" value={newStock.categoryId} onChange={e => setNewStock({ ...newStock, categoryId: e.target.value })}>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="row gap-8 mt-16" style={{ justifyContent: 'flex-end' }}>
                  <button className="btn btn--ghost btn--sm" onClick={() => setShowInline(false)}>Cancel</button>
                  <button className="btn btn--primary btn--sm" onClick={handleInlineCreate}>Create & add</button>
                </div>
              </div>
            </div>
          )}

          {/* search picker */}
          <div className="search mb-8" style={{ width: '100%' }}>
            <Icon name="search" size={12} />
            <input placeholder="Search stocks to add…" value={picker} onChange={e => setPicker(e.target.value)} />
          </div>
          <div className="row gap-4 mb-16" style={{ flexWrap: 'wrap' }}>
            <button className="chip" data-active={pickerCat === 'all' ? '1' : '0'} onClick={() => setPickerCat('all')}>All</button>
            {categories.map(c => (
              <button key={c.id} className="chip" data-active={pickerCat === c.id ? '1' : '0'} onClick={() => setPickerCat(c.id)}>{c.name}</button>
            ))}
          </div>

          {(picker || pickerCat !== 'all') && (
            <div className="grid-bordered mb-16" style={{ maxHeight: 200, overflow: 'auto' }}>
              {filteredStocks.slice(0, 20).map(s => (
                <div key={s.id} className="row between"
                     style={{ padding: '8px 14px', borderBottom: '1px solid var(--rule-2)', cursor: 'pointer' }}
                     onClick={() => addItem(s.id)}>
                  <div className="row gap-8">
                    <span style={{ fontWeight: 500 }}>{s.name}</span>
                    <span className="muted mono" style={{ fontSize: 11 }}>{s.sku}</span>
                  </div>
                  <div className="row gap-8">
                    <span className="muted mono" style={{ fontSize: 11 }}>{s.quantity} {s.unit}</span>
                    <Icon name="plus" size={11} />
                  </div>
                </div>
              ))}
              {filteredStocks.length === 0 && (
                <div className="muted" style={{ padding: 16, textAlign: 'center', fontSize: 12 }}>No matches.</div>
              )}
            </div>
          )}

          {/* items list with qty preview */}
          {items.length === 0 ? (
            <div className="muted" style={{ padding: 32, textAlign: 'center', border: '1px dashed var(--rule)', borderRadius: 'var(--r)', fontSize: 13 }}>
              No stocks added yet. Search or pick a category above.
            </div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Item</th>
                  <th className="right" style={{ width: 90 }}>Current</th>
                  <th className="right" style={{ width: 140 }}>Qty {type === 'IMPORT' ? 'in' : 'out'}</th>
                  <th className="right" style={{ width: 110 }}>After</th>
                  <th className="right" style={{ width: 110 }}>Subtotal</th>
                  <th style={{ width: 30 }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map(it => {
                  const s = stocks.find(x => x.id === it.stockId);
                  if (!s) return null;
                  const after = type === 'IMPORT' ? s.quantity + it.quantity : s.quantity - it.quantity;
                  const exceeds = type === 'EXPORT' && it.quantity > s.quantity;
                  return (
                    <tr key={it.stockId}>
                      <td>
                        <div className="col" style={{ gap: 2 }}>
                          <span style={{ fontWeight: 500 }}>{s.name}</span>
                          <span className="muted mono" style={{ fontSize: 11 }}>{s.sku} · {fmtMoney(s.price)}/{s.unit}</span>
                        </div>
                      </td>
                      <td className="right num">{s.quantity} {s.unit}</td>
                      <td className="right">
                        <div className="row gap-4" style={{ justifyContent: 'flex-end' }}>
                          <button className="btn btn--ghost btn--icon btn--sm" onClick={() => setQty(it.stockId, it.quantity - 1)}><Icon name="minus" size={11} /></button>
                          <input className="input mono" value={it.quantity}
                                 onChange={e => setQty(it.stockId, parseInt(e.target.value) || 0)}
                                 style={{ width: 56, textAlign: 'right', borderBottom: '1px solid var(--rule)', padding: '4px 6px' }} />
                          <button className="btn btn--ghost btn--icon btn--sm" onClick={() => setQty(it.stockId, it.quantity + 1)}><Icon name="plus" size={11} /></button>
                        </div>
                      </td>
                      <td className="right num">
                        <span style={{
                          color: exceeds ? 'var(--neg)' : (type === 'IMPORT' ? 'var(--pos)' : 'var(--ink-2)'),
                          fontWeight: 500,
                        }}>
                          {type === 'IMPORT' ? '+' : '−'}{it.quantity} <Icon name="caret" size={9} /> {after}
                        </span>
                      </td>
                      <td className="right num">{fmtMoney(s.price * it.quantity)}</td>
                      <td>
                        <button className="btn btn--ghost btn--icon btn--sm" onClick={() => removeItem(it.stockId)}><Icon name="x" size={11} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '1px solid var(--rule)', fontWeight: 500 }}>
                  <td colSpan="2" className="muted">Total</td>
                  <td className="right num">{totalUnits} units</td>
                  <td></td>
                  <td className="right num">{fmtMoney(totalValue)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          )}
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

      <div style={{ position: 'sticky', bottom: 0 }}></div>
      <div style={{ height: 60 }}></div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: 'var(--bg)', borderTop: '1px solid var(--rule)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="row gap-16">
          <div className="col" style={{ gap: 2 }}>
            <span className="eyebrow">Items</span>
            <span className="mono" style={{ fontSize: 14, fontWeight: 500 }}>{items.length}</span>
          </div>
          <div className="divider--v" style={{ height: 24 }}></div>
          <div className="col" style={{ gap: 2 }}>
            <span className="eyebrow">Total value</span>
            <span className="mono" style={{ fontSize: 14, fontWeight: 500 }}>{fmtMoney(totalValue)}</span>
          </div>
        </div>
        <div className="row gap-8">
          <button className="btn btn--ghost" onClick={onCancel}>Cancel</button>
          <button className="btn btn--primary" onClick={submit} disabled={errors.length > 0}
                  style={errors.length > 0 ? { opacity: 0.4, cursor: 'not-allowed' } : null}>
            Post {type.toLowerCase()}
          </button>
        </div>
      </div>
    </>
  );
}

window.MovementsPage = MovementsPage;
window.MovementForm  = MovementForm;
