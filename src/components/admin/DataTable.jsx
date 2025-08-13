import React, { useEffect, useMemo, useRef, useState } from 'react';

/**
 * Generic server-driven DataTable
 * Features: server pagination, sorting, search, row selection, bulk actions, CSV export
 *
 * Props:
 * - title?: string
 * - columns: Array<{ key?: string, header: string, sortable?: boolean, sortKey?: string, render?: (row) => ReactNode, width?: string }>
 * - fetcher: ({ page, pageSize, ordering, search, filters }) => Promise<{ items: any[], count: number }>
 * - initialPage?: number
 * - initialPageSize?: number (default 20)
 * - initialOrdering?: string (e.g. '-id')
 * - canSearch?: boolean (default true)
 * - selectable?: boolean (default true)
 * - renderRowActions?: (row) => ReactNode
 * - onBulkDelete?: (ids: (string|number)[]) => Promise<void>
 * - onExportCSV?: (rows: any[]) => void
 * - refreshKey?: any -> when changes, reloads data
 */
const DataTable = ({
  title,
  columns,
  fetcher,
  initialPage = 1,
  initialPageSize = 20,
  initialOrdering = '-id',
  canSearch = true,
  selectable = true,
  renderRowActions,
  onBulkDelete,
  onExportCSV,
  refreshKey,
  emptyStateText = 'No records found',
  onRowClick,
}) => {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [ordering, setOrdering] = useState(initialOrdering);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState([]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil((total || 0) / pageSize)), [total, pageSize]);

  // Debounce search
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(id);
  }, [search]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetcher({ page, pageSize, ordering, search: debouncedSearch, filters: {} });
      const list = Array.isArray(res?.items) ? res.items : [];
      const count = Number.isFinite(res?.count) ? res.count : list.length;
      setItems(list);
      setTotal(count);
      // Clear selection if data set changed
      setSelected([]);
    } catch (e) {
      setError(e?.message || 'Failed to load data');
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // Load on param changes
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, ordering, debouncedSearch, refreshKey]);

  const toggleAll = () => {
    if (selected.length === items.length) setSelected([]);
    else setSelected(items.map((r) => r.id));
  };

  const toggleOne = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleHeaderSort = (col) => {
    if (!col.sortable) return;
    const key = col.sortKey || col.key;
    if (!key) return;
    setPage(1);
    setOrdering((prev) => {
      if (prev === key) return `-${key}`; // toggle desc
      if (prev === `-${key}`) return key; // toggle asc
      return key; // start asc
    });
  };

  const defaultExportCSV = () => {
    if (!items?.length) return;
    const visibleCols = columns.filter((c) => c.key); // only simple keys
    const headers = visibleCols.map((c) => c.header);
    const rows = items.map((r) => visibleCols.map((c) => {
      const val = r[c.key];
      if (val === null || val === undefined) return '';
      if (typeof val === 'string') return `"${val.replaceAll('"', '""')}"`;
      return String(val);
    }).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${(title || 'export').toLowerCase().replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportCSV = () => {
    if (onExportCSV) onExportCSV(items);
    else defaultExportCSV();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <span className="text-sm text-gray-500">{total} total</span>
          </div>
          <div className="flex items-center gap-2">
            {canSearch && (
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); } }}
                placeholder="Search..."
                className="px-3 py-2 border rounded-lg text-sm"
              />
            )}
            <label className="text-sm text-gray-500">Page size</label>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="px-2 py-1 border rounded"
            >
              {[10, 20, 50, 100].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
      <button type="button" onClick={load} className="px-3 py-2 border rounded hover:bg-gray-50 text-sm">Refresh</button>
      <button type="button" onClick={exportCSV} className="px-3 py-2 border rounded hover:bg-gray-50 text-sm">Export CSV</button>
            {selectable && onBulkDelete && selected.length > 0 && (
              <button
        type="button"
                onClick={async () => { await onBulkDelete(selected); }}
                className="px-3 py-2 bg-red-600 text-white rounded text-sm"
              >
                Delete Selected ({selected.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-red-600 mb-2">{error}</p>
          <button type="button" onClick={load} className="px-3 py-2 border rounded text-sm">Retry</button>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📄</span>
          </div>
          <p className="text-gray-600">{emptyStateText}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {selectable && (
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={selected.length === items.length && items.length > 0}
                      onChange={toggleAll}
                    />
                  </th>
                )}
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider select-none"
                    style={{ width: col.width }}
                  >
                    <button
                      type="button"
                      onClick={() => handleHeaderSort(col)}
                      className={`flex items-center gap-1 ${col.sortable ? 'hover:text-gray-900' : ''}`}
                    >
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="text-gray-400 text-xs">
                          {ordering === (col.sortKey || col.key) ? '▲' : ordering === `-${col.sortKey || col.key}` ? '▼' : ''}
                        </span>
                      )}
                    </button>
                  </th>
                ))}
                {renderRowActions && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((row) => (
                <tr
                  key={row.id}
                  className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {selectable && (
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={selected.includes(row.id)}
                        onChange={() => toggleOne(row.id)}
                      />
                    </td>
                  )}
                  {columns.map((col, idx) => (
                    <td key={idx} className="px-6 py-4 text-sm text-gray-900">
                      {col.render ? col.render(row) : (row[col.key] ?? '—')}
                    </td>
                  ))}
                  {renderRowActions && (
                    <td className="px-6 py-4 text-sm">{renderRowActions(row)}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-600">Page {page} of {totalPages}</div>
        <div className="space-x-2">
          <button type="button" disabled={page <= 1} onClick={() => setPage(1)} className="px-3 py-1 border rounded disabled:opacity-50">First</button>
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
          <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
          <button type="button" disabled={page >= totalPages} onClick={() => setPage(totalPages)} className="px-3 py-1 border rounded disabled:opacity-50">Last</button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
