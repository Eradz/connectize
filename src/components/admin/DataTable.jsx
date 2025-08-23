import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  WarningIcon,
  DocumentIcon,
  SortIcon,
  RefreshIcon,
  ExportIcon,
  SearchIcon,
  LoadingIcon,
  DotsIcon,
} from '../ui/ModernIcon';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Select from '../ui/Select';
import Checkbox from '../ui/Checkbox';

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
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-soft border border-gray-200/60 dark:border-gray-700/60 overflow-hidden">
      {/* Modern Header */}
      <div className="px-8 py-6 border-b border-gray-200/60 dark:border-gray-700/60 bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-gray-900/50 dark:to-gray-800/50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-10 w-1 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full" />
            <div>
              <h3 className="text-xl font-display font-semibold text-gray-900 dark:text-white">{title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">{total} total records</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            {canSearch && (
              <div className="relative">
                <Input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); } }}
                  placeholder="Search records..."
                  className="w-64 pl-11 pr-4 !py-2.5 bg-white/80 dark:bg-gray-800/80 border-gray-200/60 dark:border-gray-700/60 backdrop-blur-sm"
                  icon={SearchIcon}
                />
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 dark:text-gray-400 font-medium">Show</label>
              <Select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="w-20 !py-2 bg-white/80 dark:bg-gray-800/80 border-gray-200/60 dark:border-gray-700/60"
              >
                {[10, 20, 50, 100].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={load}
                className="!p-2.5 !h-10 !w-10"
                title="Refresh data"
              >
                <RefreshIcon size={18} />
              </Button>
              
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={exportCSV}
                className="!p-2.5 !h-10 !w-10"
                title="Export CSV"
              >
                <ExportIcon size={18} />
              </Button>
              
              {selectable && onBulkDelete && selected.length > 0 && (
                <Button
                  type="button"
                  variant="minimal"
                  size="sm"
                  onClick={async () => { await onBulkDelete(selected); }}
                  className="text-error-600 hover:text-error-700 hover:bg-error-50 dark:hover:bg-error-900/20 ml-2"
                >
                  Delete ({selected.length})
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 mx-auto mb-4 text-primary-600">
            <LoadingIcon size={48} className="animate-spin" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading records...</p>
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-400">
            <WarningIcon size={32} />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Failed to load data</h4>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button type="button" variant="outline" size="sm" onClick={load}>
            <RefreshIcon size={16} className="mr-2" />
            Try Again
          </Button>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-500 dark:text-gray-400">
            <DocumentIcon size={32} />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No records found</h4>
          <p className="text-gray-600 dark:text-gray-400">{emptyStateText}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50/80 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-700/30 backdrop-blur-sm">
              <tr>
                {selectable && (
                  <th className="px-8 py-4 text-left">
                    <Checkbox
                      id="select-all"
                      checked={selected.length === items.length && items.length > 0}
                      onChange={toggleAll}
                    />
                  </th>
                )}
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    className="px-8 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide select-none"
                    style={{ width: col.width }}
                  >
                    <button
                      type="button"
                      onClick={() => handleHeaderSort(col)}
                      className={`flex items-center gap-2 group transition-colors duration-200 ${
                        col.sortable 
                          ? 'hover:text-gray-900 dark:hover:text-white cursor-pointer' 
                          : ''
                      }`}
                    >
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-200">
                          <SortIcon 
                            size={14} 
                            direction={
                              ordering === (col.sortKey || col.key) ? 'asc' :
                              ordering === `-${col.sortKey || col.key}` ? 'desc' : 'none'
                            }
                          />
                        </span>
                      )}
                    </button>
                  </th>
                ))}
                {renderRowActions && (
                  <th className="px-8 py-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                    <DotsIcon size={16} className="mx-auto" />
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm divide-y divide-gray-200/60 dark:divide-gray-700/60">
              {items.map((row, rowIndex) => (
                <tr
                  key={row.id}
                  className={`group hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-all duration-200 ${
                    onRowClick ? 'cursor-pointer' : ''
                  } ${rowIndex % 2 === 0 ? 'bg-white/40 dark:bg-gray-900/40' : 'bg-gray-50/30 dark:bg-gray-800/30'}`}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {selectable && (
                    <td className="px-8 py-5">
                      <div onClick={(e) => { e.stopPropagation(); }}>
                        <Checkbox
                          id={`row-select-${row.id}`}
                          checked={selected.includes(row.id)}
                          onChange={() => toggleOne(row.id)}
                        />
                      </div>
                    </td>
                  )}
                  {columns.map((col, idx) => (
                    <td key={idx} className="px-8 py-5 text-sm text-gray-900 dark:text-gray-100 font-medium">
                      {col.render ? col.render(row) : (row[col.key] ?? '—')}
                    </td>
                  ))}
                  {renderRowActions && (
                    <td className="px-8 py-5 text-center">
                      <div onClick={(e) => { e.stopPropagation(); }} className="flex items-center justify-center gap-1">
                        {renderRowActions(row)}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modern Pagination */}
      <div className="px-8 py-6 border-t border-gray-200/60 dark:border-gray-700/60 bg-gradient-to-r from-gray-50/30 to-white/30 dark:from-gray-900/30 dark:to-gray-800/30 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            Page <span className="font-semibold text-gray-900 dark:text-white">{page}</span> of{' '}
            <span className="font-semibold text-gray-900 dark:text-white">{totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              disabled={page <= 1} 
              onClick={() => setPage(1)}
              className="!px-3 !py-2"
            >
              First
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              disabled={page <= 1} 
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="!px-3 !py-2"
            >
              Previous
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              disabled={page >= totalPages} 
              onClick={() => setPage((p) => p + 1)}
              className="!px-3 !py-2"
            >
              Next
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              disabled={page >= totalPages} 
              onClick={() => setPage(totalPages)}
              className="!px-3 !py-2"
            >
              Last
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
