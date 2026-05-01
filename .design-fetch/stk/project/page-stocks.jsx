// Stocks list + Categories list

function StocksPage({ stocks, categories, sort, setSort, filter, setFilter, selected, setSelected, openSheet, onDelete }) {
  const filtered = stocks.filter(s => {
    if (filter.categoryId !== 'all' && s.categoryId !== filter.categoryId) return false;
    if (filter.lowOnly && !isLow(s)) return false;
    if (filter.q) {
      const q = filter.q.toLowerCase();
      if (!s.name.toLowerCase().includes(q) && !s.sku.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const dir = sort.dir === 'asc' ? 1 : -1;
    const k = sort.key;
    if (k === 'value') return dir * ((a.quantity * a.price) - (b.quantity * b.price));
    if (k === 'category') {
      const ca = categories.find(c => c.id === a.categoryId)?.name || '';
      const cb = categories.find(c => c.id === b.categoryId)?.name || '';
      return dir * ca.localeCompare(cb);
    }
    if (typeof a[k] === 'string') return dir * a[k].localeCompare(b[k]);
    return dir * ((a[k] || 0) - (b[k] || 0));
  });

  const totalValue = filtered.reduce((s, x) => s + x.quantity * x.price, 0);
  const lowCount = stocks.filter(isLow).length;

  const allSelected = sorted.length > 0 && sorted.every(s => selected.has(s.id));
  const toggleAll = () => {
    const next = new Set(selected);
    if (allSelected) sorted.forEach(s => next.delete(s.id));
    else sorted.forEach(s => next.add(s.id));
    setSelected(next);
  };
  const toggleOne = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  return (
    <div className="page">
      <div className="page-h">
        <div className="page-title">
          <span className="num">02</span>
          <h1 className="h-1">Stocks</h1>
          <span className="muted mono" style={{ fontSize: 12 }}>· {filtered.length} of {stocks.length}</span>
        </div>
        <div className="row gap-16">
          <div className="col" style={{ gap: 2, alignItems: 'flex-end' }}>
            <span className="eyebrow">Filtered value</span>
            <span className="mono" style={{ fontSize: 16, fontWeight: 500 }}>{fmtMoney(totalValue)}</span>
          </div>
          <div className="divider--v"></div>
          <button className="btn btn--ghost"><Icon name="export" size={12} />Export CSV</button>
          <button className="btn btn--primary" onClick={() => openSheet('new-stock')}>
            <Icon name="plus" size={12} />New stock
          </button>
        </div>
      </div>

      <div className="filterbar">
        <div className="search" style={{ width: 320 }}>
          <Icon name="search" size={12} />
          <input placeholder="Search by name or SKU…"
                 value={filter.q}
                 onChange={e => setFilter({ ...filter, q: e.target.value })} />
        </div>
        <div className="divider--v" style={{ height: 22 }}></div>
        <ChipFilter
          value={filter.categoryId}
          onChange={(v) => setFilter({ ...filter, categoryId: v })}
          options={[
            { value: 'all', label: 'All categories', count: stocks.length },
            ...categories.map(c => ({ value: c.id, label: c.name, count: stocks.filter(s => s.categoryId === c.id).length })),
          ]}
        />
        <div style={{ marginLeft: 'auto' }}>
          <button className={filter.lowOnly ? 'chip' : 'chip'}
                  data-active={filter.lowOnly ? '1' : '0'}
                  onClick={() => setFilter({ ...filter, lowOnly: !filter.lowOnly })}>
            <Icon name="warn" size={11} /> Low stock only
            <span className="ct">{String(lowCount).padStart(2, '0')}</span>
          </button>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="row between" style={{ padding: '14px 0', borderBottom: '1px solid var(--rule)' }}>
          <span className="row gap-8">
            <span className="mono" style={{ fontSize: 12, fontWeight: 500 }}>{selected.size} selected</span>
            <span className="muted" style={{ fontSize: 12 }}>·</span>
            <button className="btn btn--ghost btn--sm" onClick={() => setSelected(new Set())}>Clear</button>
          </span>
          <div className="row gap-8">
            <button className="btn btn--ghost btn--sm"
                    onClick={() => openSheet('new-movement', { presetItems: [...selected] })}>
              <Icon name="arrows" size={11} /> Add to movement
            </button>
            <button className="btn btn--ghost btn--sm"><Icon name="tag" size={11} /> Recategorize</button>
          </div>
        </div>
      )}

      <table className="tbl mt-16">
        <thead>
          <tr>
            <th style={{ width: 36 }}>
              <input type="checkbox" className="chk" checked={allSelected} onChange={toggleAll} />
            </th>
            <SortableTH label="Item"     k="name"     sort={sort} setSort={setSort} />
            <SortableTH label="Category" k="category" sort={sort} setSort={setSort} />
            <th>SKU</th>
            <SortableTH label="Qty"      k="quantity" sort={sort} setSort={setSort} align="right" width="100" />
            <th className="right">Unit</th>
            <SortableTH label="Price"    k="price"    sort={sort} setSort={setSort} align="right" width="120" />
            <SortableTH label="Value"    k="value"    sort={sort} setSort={setSort} align="right" width="140" />
            <th style={{ width: 100 }}></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(s => {
            const cat = categories.find(c => c.id === s.categoryId);
            const low = isLow(s);
            return (
              <tr key={s.id} data-selected={selected.has(s.id) ? '1' : '0'}>
                <td>
                  <input type="checkbox" className="chk" checked={selected.has(s.id)} onChange={() => toggleOne(s.id)} />
                </td>
                <td>
                  <div className="col" style={{ gap: 2 }}>
                    <span style={{ fontWeight: 500 }}>{s.name}</span>
                    {low && <span className="pill pill--low" style={{ width: 'fit-content' }}><Icon name="warn" size={9} /> Reorder</span>}
                  </div>
                </td>
                <td><span className="cat-tag">{cat?.name}</span></td>
                <td className="num muted">{s.sku}</td>
                <td className="right num" style={{ color: low ? 'var(--warn)' : 'inherit' }}>{s.quantity}</td>
                <td className="right muted">{s.unit}</td>
                <td className="right num">{fmtMoney(s.price)}</td>
                <td className="right num" style={{ fontWeight: 500 }}>{fmtMoney(s.quantity * s.price)}</td>
                <td>
                  <div className="row-actions">
                    <button className="btn btn--ghost btn--icon btn--sm" onClick={() => openSheet('edit-stock', { id: s.id })}><Icon name="edit" size={11} /></button>
                    <button className="btn btn--ghost btn--icon btn--sm" onClick={() => onDelete(s.id, s.name)}><Icon name="trash" size={11} /></button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {sorted.length === 0 && (
        <div className="muted" style={{ padding: 60, textAlign: 'center', fontSize: 13 }}>
          No stocks match these filters.
        </div>
      )}
    </div>
  );
}

function CategoriesPage({ categories, stocks, openSheet, onDelete }) {
  return (
    <div className="page">
      <div className="page-h">
        <div className="page-title">
          <span className="num">03</span>
          <h1 className="h-1">Categories</h1>
          <span className="muted mono" style={{ fontSize: 12 }}>· {categories.length}</span>
        </div>
        <button className="btn btn--primary" onClick={() => openSheet('new-category')}>
          <Icon name="plus" size={12} />New category
        </button>
      </div>

      <div className="grid-bordered" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {categories.map((c, i) => {
          const items = stocks.filter(s => s.categoryId === c.id);
          const value = items.reduce((sum, s) => sum + s.quantity * s.price, 0);
          const lowCt = items.filter(isLow).length;
          return (
            <div key={c.id} style={{
              padding: 22,
              borderRight: (i % 3 !== 2) ? '1px solid var(--rule)' : 0,
              borderBottom: i < categories.length - 3 ? '1px solid var(--rule)' : 0,
              position: 'relative',
            }}>
              <div className="row between mb-16">
                <span className="eyebrow">{c.code}</span>
                <div className="row-actions" style={{ opacity: 1 }}>
                  <button className="btn btn--ghost btn--icon btn--sm" onClick={() => openSheet('edit-category', { id: c.id })}><Icon name="edit" size={11} /></button>
                  <button className="btn btn--ghost btn--icon btn--sm" onClick={() => onDelete(c.id, c.name)}><Icon name="trash" size={11} /></button>
                </div>
              </div>
              <h2 className="h-2 mb-16">{c.name}</h2>
              <div className="row gap-24">
                <div className="col" style={{ gap: 4 }}>
                  <span className="eyebrow">SKUs</span>
                  <span className="mono" style={{ fontSize: 18 }}>{items.length}</span>
                </div>
                <div className="col" style={{ gap: 4 }}>
                  <span className="eyebrow">Value</span>
                  <span className="mono" style={{ fontSize: 18 }}>{fmtMoney(value)}</span>
                </div>
                <div className="col" style={{ gap: 4 }}>
                  <span className="eyebrow">Low</span>
                  <span className="mono" style={{ fontSize: 18, color: lowCt ? 'var(--warn)' : 'var(--ink)' }}>{lowCt}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

window.StocksPage = StocksPage;
window.CategoriesPage = CategoriesPage;
