import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Plus, Loader2, X } from "lucide-react";

/**
 * A searchable dropdown with inline creation support.
 *
 * Props:
 *  - options: Array of { id, name } objects
 *  - value: currently selected id (or "")
 *  - onChange: (id) => void
 *  - onCreateNew: async (name) => newOption  — if provided, shows "Create" button
 *  - placeholder: string
 *  - label: string (field label)
 *  - required: boolean
 *  - loading: boolean (external loading state)
 */
export default function SearchableSelect({
  options = [],
  value,
  onChange,
  onCreateNew,
  placeholder = "Select...",
  label,
  required = false,
  loading = false,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const selectedOption = options.find(
    (o) => String(o.id) === String(value)
  );

  const filtered = options.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase())
  );

  const exactMatch = options.some(
    (o) => o.name.toLowerCase() === search.toLowerCase()
  );

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (id) => {
    onChange(id);
    setSearch("");
    setOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
    setSearch("");
  };

  const handleCreate = async () => {
    if (!search.trim() || !onCreateNew) return;
    setCreating(true);
    try {
      const newOption = await onCreateNew(search.trim());
      if (newOption?.id) {
        onChange(String(newOption.id));
      }
      setSearch("");
      setOpen(false);
    } catch (err) {
      console.error("Error creating category:", err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && "*"}
        </label>
      )}

      {/* Trigger */}
      <div
        onClick={() => {
          setOpen(!open);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className="w-full border rounded-lg px-4 py-2 flex items-center justify-between cursor-pointer bg-white hover:border-gray-400 transition"
      >
        <span className={selectedOption ? "text-gray-900" : "text-gray-400"}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <div className="flex items-center gap-1">
          {selectedOption && (
            <button
              type="button"
              onClick={handleClear}
              className="p-0.5 hover:bg-gray-100 rounded"
            >
              <X size={14} className="text-gray-400" />
            </button>
          )}
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-64 overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-gold"
                placeholder="Search..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (filtered.length === 1) {
                      handleSelect(String(filtered[0].id));
                    } else if (!exactMatch && search.trim() && onCreateNew) {
                      handleCreate();
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Options list */}
          <div className="overflow-y-auto max-h-44">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 size={20} className="animate-spin text-gray-400" />
              </div>
            ) : filtered.length === 0 && !search.trim() ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                No options available
              </div>
            ) : (
              <>
                {filtered.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelect(String(opt.id))}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gold/10 transition ${
                      String(opt.id) === String(value)
                        ? "bg-gold/5 text-gold font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    {opt.name}
                  </button>
                ))}

                {/* Create new option */}
                {onCreateNew &&
                  search.trim() &&
                  !exactMatch && (
                    <button
                      type="button"
                      onClick={handleCreate}
                      disabled={creating}
                      className="w-full text-left px-4 py-2 text-sm text-gold hover:bg-gold/10 border-t flex items-center gap-2 font-medium"
                    >
                      {creating ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Plus size={14} />
                      )}
                      Create "{search.trim()}"
                    </button>
                  )}

                {filtered.length === 0 && search.trim() && !onCreateNew && (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                    No matches found
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Hidden input for form validation */}
      {required && (
        <input
          type="text"
          required
          value={value || ""}
          onChange={() => {}}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
