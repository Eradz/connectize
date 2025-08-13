import React, { useEffect, useMemo, useState } from 'react';

const DataTable = ({ 
  data = [], 
  columns = [], 
  title = "Data Table",
  searchable = true,
  sortable = true,
  filterable = false,
  pagination = true,
  pageSize = 10,
  onRowClick,
  onEdit,
  onDelete,
  getActions,
  onExport,
  // Selection control (optional controlled mode)
  selectedItems,
  onSelectionChange,
  // Bulk actions: [{ label, onClick, className }]
  bulkActions = [],
  // Server-side controls
  serverSide = false,
  currentPage: controlledPage,
  totalCount = 0,
  onPageChange,
  onSearchChange,
  onSortChange,
  loading = false,
  actions = true,
  // Client-side exhaustive search support (keys or dot paths or accessor fns)
  searchFields = [],
  // Debounce interval for server-side search
  serverSearchDebounceMs = 400,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [internalSelectedRows, setInternalSelectedRows] = useState([]);
  const [serverSearchTerm, setServerSearchTerm] = useState('');
  const selectedRows = selectedItems ?? internalSelectedRows;

  // Effective page for UI
  const effectivePage = serverSide && typeof controlledPage === 'number' ? controlledPage : currentPage;

  // Helper to get nested value by path (e.g., 'recipient.username')
  const getByPath = (obj, path) => {
    if (!obj || !path) return undefined;
    if (typeof path === 'function') {
      try { return path(obj); } catch { return undefined; }
    }
    if (typeof path !== 'string') return undefined;
    if (!path.includes('.')) return obj[path];
    return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj);
  };

  // Filter data based on search term (client-side only)
  const filteredData = useMemo(() => {
    if (serverSide) return data;
    if (!searchTerm) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(row =>
      (
        // Search across visible columns
        columns.some(column => {
        // Allow per-column accessor for nested/computed search
        if (typeof column.searchAccessor === 'function') {
          try {
            const v = column.searchAccessor(row);
            return (v ?? '').toString().toLowerCase().includes(term);
          } catch (_) {
            return false;
          }
        }
        const value = row[column.key];
        return value && value.toString().toLowerCase().includes(term);
        })
        ||
        // Also search extra fields provided via searchFields
        (Array.isArray(searchFields) && searchFields.some((sf) => {
          const v = getByPath(row, sf);
          return (v ?? '').toString().toLowerCase().includes(term);
        }))
      )
    );
  }, [data, searchTerm, columns, serverSide, searchFields]);

  // Sort data
  const sortedData = useMemo(() => {
    if (serverSide) return filteredData;
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig, serverSide]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    if (serverSide) return sortedData; // already server-paged
    const startIndex = (effectivePage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, effectivePage, pageSize, pagination, serverSide]);

  const totalPages = useMemo(() => {
    if (!pagination) return 1;
    if (serverSide) return Math.max(1, Math.ceil((totalCount || 0) / pageSize));
    return Math.ceil(sortedData.length / pageSize);
  }, [pagination, serverSide, totalCount, pageSize, sortedData.length]);

  // Debounce server-side search input -> onSearchChange
  useEffect(() => {
    if (!serverSide || !onSearchChange) return;
    const id = setTimeout(() => {
      onSearchChange(serverSearchTerm);
      // Reset to page 1 when search changes
      onPageChange && onPageChange(1);
    }, serverSearchDebounceMs);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverSide, serverSearchTerm, onSearchChange, serverSearchDebounceMs]);

  const handleSort = (key) => {
    if (!sortable) return;
    const next = {
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    };
    if (serverSide && onSortChange) {
      onSortChange(next);
    } else {
      setSortConfig(next);
    }
  };

  const handleSelectAll = (checked) => {
    const ids = checked ? paginatedData.map(row => row.id) : [];
    if (onSelectionChange) onSelectionChange(ids);
    else setInternalSelectedRows(ids);
  };

  const handleSelectRow = (id, checked) => {
    if (onSelectionChange) {
      const next = checked ? [...selectedRows, id] : selectedRows.filter(rowId => rowId !== id);
      onSelectionChange(next);
    } else {
      setInternalSelectedRows((prev) => checked ? [...prev, id] : prev.filter(rowId => rowId !== id));
    }
  };

  const formatCellValue = (row, column) => {
    // If consumer provided a custom renderer, pass the full row for flexibility
    if (column.render) {
      return column.render(row);
    }

    const value = row[column.key];

    if (column.type === 'date') {
      return value ? new Date(value).toLocaleDateString() : '-';
    }

    if (column.type === 'datetime') {
      return value ? new Date(value).toLocaleString() : '-';
    }

    if (column.type === 'boolean') {
      return (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Yes' : 'No'}
        </span>
      );
    }

    if (column.type === 'currency') {
      return `$${parseFloat(value || 0).toLocaleString()}`;
    }

    if (column.type === 'badge') {
      return (
        <span className={`px-2 py-1 rounded-full text-xs ${
          column.badgeColors?.[value] || 'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      );
    }

  return value ?? '-';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <div className="flex items-center space-x-2">
            {selectedRows.length > 0 && (
              <span className="text-sm text-gray-600">
                {selectedRows.length} selected
              </span>
            )}
            {bulkActions && bulkActions.length > 0 && selectedRows.length > 0 && (
              <div className="flex items-center space-x-2">
                {bulkActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => action.onClick && action.onClick(selectedRows)}
                    className={action.className || 'px-3 py-1 text-sm border rounded hover:bg-gray-50'}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
            {onExport && (
              <button
                onClick={() => {
                  const selectedObjects = sortedData.filter(r => selectedRows.includes(r.id));
                  onExport(selectedRows.length > 0 ? selectedObjects : sortedData);
                }}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Export
              </button>
            )}
          </div>
        </div>
        
        {searchable && (
          <div className="mt-4">
            <input
              type="text"
              placeholder="Search..."
              value={serverSide ? serverSearchTerm : searchTerm}
              onChange={(e) => {
                if (serverSide) setServerSearchTerm(e.target.value);
                else setSearchTerm(e.target.value);
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); } }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {actions && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={paginatedData.length > 0 && selectedRows.length === paginatedData.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {sortable && sortConfig.key === column.key && (
                      <span className="text-blue-600">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {(onEdit || onDelete || getActions) && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((row, index) => (
              <tr
                key={row.id || index}
                className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {actions && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(row.id)}
                      onChange={(e) => handleSelectRow(row.id, e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded border-gray-300"
                    />
                  </td>
                )}
        {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {formatCellValue(row, column)}
                  </td>
                ))}
                {(onEdit || onDelete || getActions) && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                      {getActions ? (
                        Array.isArray(getActions(row))
                          ? getActions(row).map((act, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => act.onClick && act.onClick()}
                                className={act.className || 'text-blue-600 hover:text-blue-900'}
                              >
                                {act.label}
                              </button>
                            ))
                          : getActions(row)
                      ) : (
                        <>
                          {onEdit && (
                            <button
                              type="button"
                              onClick={() => onEdit(row)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </button>
                          )}
                          {onDelete && (
                            <button
                              type="button"
                              onClick={() => onDelete(row)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {paginatedData.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-lg font-medium">No data found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              {serverSide ? (
                <>Showing {Math.min((effectivePage - 1) * pageSize + 1, totalCount)} to {Math.min(effectivePage * pageSize, totalCount)} of {totalCount} results</>
              ) : (
                <>Showing {Math.min((effectivePage - 1) * pageSize + 1, sortedData.length)} to {Math.min(effectivePage * pageSize, sortedData.length)} of {sortedData.length} results</>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  if (serverSide && onPageChange) onPageChange(effectivePage - 1);
                  else setCurrentPage(effectivePage - 1);
                }}
                disabled={effectivePage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Previous
              </button>
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const page = i + 1;
                return (
          <button
                    key={page}
                    onClick={() => {
                      if (serverSide && onPageChange) onPageChange(page);
                      else setCurrentPage(page);
                    }}
                    className={`px-3 py-1 text-sm border rounded ${
                      effectivePage === page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
        <button
                onClick={() => {
                  if (serverSide && onPageChange) onPageChange(effectivePage + 1);
                  else setCurrentPage(effectivePage + 1);
                }}
                disabled={effectivePage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
