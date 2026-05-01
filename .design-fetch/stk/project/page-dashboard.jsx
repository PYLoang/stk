// Dashboard page

function Dashboard({ stocks, categories, movements, transactions, valueSeries, flowSeries, setRoute, openSheet }) {
  const totalValue = stocks.reduce((sum, s) => sum + s.quantity * s.price, 0);
  const totalSkus = stocks.length;
  const totalUnits = stocks.reduce((s, x) => s + x.quantity, 0);
  const lowItems = stocks.filter(isLow);
  const recentMovements = [...movements].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  const recentTxns = [...transactions].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);

  const todayImports = movements.filter(m => m.type === 'IMPORT' && m.createdAt.startsWith('2026-04-28')).length;
  const todayExports = movements.filter(m => m.type === 'EXPORT' && m.createdAt.startsWith('2026-04-28')).length;

  const valueDelta = ((valueSeries[valueSeries.length - 1] - valueSeries[0]) / valueSeries[0]) * 100;

  return (
    <div className="page">
      {/* Heading */}
      <div className="page-h">
        <div>
          <div className="eyebrow mb-8">Issue 04 — Week 18, 2026</div>
          <h1 className="h-display">Good morning, Cas.<br/>
            <span style={{ color: 'var(--ink-3)' }}>Three deliveries due, one wedding to ship.</span>
          </h1>
        </div>
        <div className="col" style={{ alignItems: 'flex-end', gap: 6 }}>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>THU · 30 APR · 2026</span>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>OPEN · 07:00 — 19:00</span>
        </div>
      </div>

      {/* Stat strip */}
      <div className="grid-bordered" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat">
          <div className="stat-lbl">Stock value</div>
          <div className="stat-val">{fmtMoney(totalValue)}</div>
          <div className="stat-sub">
            <span className={valueDelta >= 0 ? 'delta--pos' : 'delta--neg'}>
              {valueDelta >= 0 ? '↑' : '↓'} {Math.abs(valueDelta).toFixed(1)}%
            </span>
            <span>vs. 14 days ago</span>
          </div>
        </div>
        <div className="stat">
          <div className="stat-lbl">SKUs in stock</div>
          <div className="stat-val">{totalSkus}</div>
          <div className="stat-sub">
            <span className="mono">{fmtNum(totalUnits)}</span>
            <span>units across {categories.length} categories</span>
          </div>
        </div>
        <div className="stat">
          <div className="stat-lbl">Today's flow</div>
          <div className="stat-val">{todayImports}<span style={{ color: 'var(--ink-4)', fontSize: 22 }}> in </span>{todayExports}<span style={{ color: 'var(--ink-4)', fontSize: 22 }}> out</span></div>
          <div className="stat-sub"><span>movements posted since 06:00</span></div>
        </div>
        <div className="stat">
          <div className="stat-lbl">Low-stock alerts</div>
          <div className="stat-val" style={{ color: lowItems.length ? 'var(--warn)' : 'var(--ink)' }}>
            {String(lowItems.length).padStart(2, '0')}
          </div>
          <div className="stat-sub">
            <span>items below threshold —</span>
            <a onClick={() => setRoute('stocks')} style={{ color: 'var(--ink)', textDecoration: 'underline', cursor: 'pointer' }}>review</a>
          </div>
        </div>
      </div>

      {/* Two-up: chart + low stock */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 24, marginTop: 24 }}>
        <div className="panel">
          <div className="panel-h">
            <div>
              <div className="ttl">Daily flow · April 2026</div>
              <div className="muted" style={{ fontSize: 11.5, marginTop: 2 }}>Per-day income vs expenses · 30 days</div>
            </div>
            <div className="row gap-16">
              <div className="row gap-4" style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
                <span style={{ width: 10, height: 10, background: 'var(--ink)' }}></span> Income
              </div>
              <div className="row gap-4" style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
                <span style={{ width: 10, height: 10, background: 'oklch(from var(--ink) l c h / 0.30)' }}></span> Expenses
              </div>
            </div>
          </div>
          <div className="panel-body">
            <BarChart data={flowSeries} h={260} />
          </div>
        </div>

        <div className="panel">
          <div className="panel-h">
            <div className="ttl">Low stock</div>
            <span className="muted mono" style={{ fontSize: 11 }}>{lowItems.length} items</span>
          </div>
          <div>
            {lowItems.slice(0, 7).map(s => {
              const cat = categories.find(c => c.id === s.categoryId);
              return (
                <div key={s.id} className="row between" style={{ padding: '12px 18px', borderBottom: '1px solid var(--rule-2)' }}>
                  <div className="col" style={{ gap: 2 }}>
                    <span style={{ fontWeight: 500 }}>{s.name}</span>
                    <span className="muted" style={{ fontSize: 11 }}>{cat?.name} · <span className="mono">{s.sku}</span></span>
                  </div>
                  <div className="row gap-8">
                    <span className="mono tnum" style={{ color: 'var(--warn)' }}>{s.quantity} {s.unit}</span>
                    <span className="pill pill--low">low</span>
                  </div>
                </div>
              );
            })}
            {lowItems.length === 0 && (
              <div className="muted" style={{ padding: 24, textAlign: 'center', fontSize: 13 }}>
                Everything well stocked.
              </div>
            )}
          </div>
          <div className="panel-h" style={{ borderBottom: 0, borderTop: '1px solid var(--rule)' }}>
            <button className="btn btn--ghost btn--sm" onClick={() => openSheet('new-movement', { preset: 'IMPORT', presetItems: lowItems.slice(0, 5).map(s => s.id) })}>
              <Icon name="in" size={11} />
              Restock all low items
            </button>
            <span className="mono muted" style={{ fontSize: 11 }}>{lowItems.length} → cart</span>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24, marginTop: 24 }}>
        <div className="panel">
          <div className="panel-h">
            <div className="ttl">Recent movements</div>
            <a className="btn btn--ghost btn--sm" onClick={() => setRoute('movements')}>View all →</a>
          </div>
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: 30 }}></th>
                <th>Code</th>
                <th>Remark</th>
                <th className="right">Items</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentMovements.map(m => (
                <tr key={m.id}>
                  <td>
                    <Icon name={m.type === 'IMPORT' ? 'in' : 'out'} size={13} />
                  </td>
                  <td className="num">{m.code}</td>
                  <td className="nowrap" style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.remark}</td>
                  <td className="right num">{m.items.length}</td>
                  <td className="num muted">{fmtDate(m.createdAt)} · {fmtTime(m.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <div className="panel-h">
            <div className="ttl">Latest transactions</div>
            <a className="btn btn--ghost btn--sm" onClick={() => setRoute('transactions')}>View all →</a>
          </div>
          <div>
            {recentTxns.map(t => {
              const stock = stocks.find(s => s.id === t.stockId);
              const ttl = stock ? stock.name : t.subject;
              return (
                <div key={t.id} className="row between" style={{ padding: '12px 18px', borderBottom: '1px solid var(--rule-2)' }}>
                  <div className="row gap-8" style={{ flex: 1, minWidth: 0 }}>
                    <span className={t.type === 'IMPORT' ? 'pill pill--in' : 'pill pill--out'}>
                      {t.type === 'IMPORT' ? 'IN' : 'OUT'}
                    </span>
                    <div className="col" style={{ gap: 2, flex: 1, minWidth: 0 }}>
                      <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ttl}</span>
                      <span className="muted" style={{ fontSize: 11 }}>
                        {stock ? <>Stock · <span className="mono">{stock.sku}</span></> : 'Subject'}
                      </span>
                    </div>
                  </div>
                  <div className="col" style={{ alignItems: 'flex-end', gap: 2 }}>
                    <span className="mono tnum" style={{ fontWeight: 500 }}>{fmtMoney(t.quantity * t.price)}</span>
                    <span className="muted mono" style={{ fontSize: 11 }}>{t.quantity} × {fmtMoney(t.price)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

window.Dashboard = Dashboard;
