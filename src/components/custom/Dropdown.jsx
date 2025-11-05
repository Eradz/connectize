import React, { useState, useRef, useEffect, useMemo } from "react";
import PropTypes from "prop-types";

/**
 * Reusable Dropdown component
 * Props:
 * - placeholder: string shown when nothing selected
 * - options: array of strings or { label, value }
 * - value: (optional) controlled value
 * - onChange: (optional) function(value, option)
 * - disabled: boolean
 * - className: optional extra className for root
 *
 * Usage:
 * <Dropdown placeholder="Choose" options={["A","B"]} onChange={(v)=>{}} />
 */

const styles = {
    root: {
        position: "relative",
        display: "inline-block",
        minWidth: 160,
        fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
        fontSize: 14,
    },
    toggle: {
        width: "100%",
        textAlign: "left",
        padding: "8px 12px",
        borderRadius: 6,
        border: "1px solid #ccc",
        background: "#fff",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
    },
    placeholder: { color: "#888" },
    list: {
        position: "absolute",
        top: "calc(100% + 6px)",
        left: 0,
        right: 0,
        maxHeight: 220,
        overflow: "auto",
        border: "1px solid #ddd",
        background: "#fff",
        borderRadius: 6,
        boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
        zIndex: 1000,
        padding: 6,
    },
    item: {
        padding: "8px 10px",
        borderRadius: 4,
        cursor: "pointer",
    },
    itemHover: { background: "#f0f4ff" },
    itemSelected: { fontWeight: 600 },
    chevron: { marginLeft: 8, opacity: 0.75, transform: "rotate(0deg)" },
    chevronOpen: { transform: "rotate(180deg)" },
};

export default function Dropdown({
    placeholder = "Select...",
    options = [],
    value: controlledValue,
    onChange,
    disabled = false,
    className = "",
}) {
    const rootRef = useRef(null);
    const listRef = useRef(null);

    const normalized = useMemo(
        () =>
            (options || []).map((o) =>
                typeof o === "string" ? { label: o, value: o } : { label: o.label ?? String(o.value), value: o.value }
            ),
        [options]
    );

    const isControlled = controlledValue !== undefined && controlledValue !== null;
    const [internalValue, setInternalValue] = useState(
        isControlled ? controlledValue : normalized.length ? normalized[0]?.value ?? null : null
    );
    const selectedValue = isControlled ? controlledValue : internalValue;

    // update internal when controlledValue or options change
    useEffect(() => {
        if (isControlled) return;
        // if current internal value not in options, clear it
        const found = normalized.find((o) => o.value === internalValue);
        if (!found) setInternalValue(normalized[0]?.value ?? null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [options]);

    useEffect(() => {
        if (isControlled) setInternalValue(controlledValue);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [controlledValue]);

    const [open, setOpen] = useState(false);
    const [highlight, setHighlight] = useState(null);

    useEffect(() => {
        if (open) {
            const idx = normalized.findIndex((o) => o.value === selectedValue);
            setHighlight(idx >= 0 ? idx : 0);
        } else {
            setHighlight(null);
        }
        // focus management not forcing rerenders of items
    }, [open, selectedValue, normalized]);

    // click outside to close
    useEffect(() => {
        function onDoc(e) {
            if (!rootRef.current) return;
            if (!rootRef.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener("mousedown", onDoc);
        return () => document.removeEventListener("mousedown", onDoc);
    }, []);

    function handleSelect(option) {
        if (disabled) return;
        if (!isControlled) setInternalValue(option.value);
        onChange?.(option.value, option);
        setOpen(false);
    }

    function handleKeyDown(e) {
        if (disabled) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            setHighlight((h) => {
                const next = h === null ? 0 : Math.min(normalized.length - 1, h + 1);
                scrollIntoView(next);
                return next;
            });
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setOpen(true);
            setHighlight((h) => {
                const prev = h === null ? normalized.length - 1 : Math.max(0, h - 1);
                scrollIntoView(prev);
                return prev;
            });
        } else if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!open) {
                setOpen(true);
            } else if (highlight !== null) {
                handleSelect(normalized[highlight]);
            }
        } else if (e.key === "Escape") {
            setOpen(false);
        }
    }

    function scrollIntoView(index) {
        const list = listRef.current;
        if (!list) return;
        const el = list.children[index];
        if (el) el.scrollIntoView({ block: "nearest" });
    }

    const selectedOption = normalized.find((o) => o.value === selectedValue);

    return (
        <div
            ref={rootRef}
            className={className}
            style={styles.root}
            onKeyDown={handleKeyDown}
            tabIndex={-1}
            aria-haspopup="listbox"
            aria-expanded={open}
        >
            <button
                type="button"
                aria-disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={() => !disabled && setOpen((s) => !s)}
                style={{
                    ...styles.toggle,
                    opacity: disabled ? 0.6 : 1,
                }}
                className="dropdown-toggle"
            >
                <span style={selectedOption ? undefined : styles.placeholder}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    style={{ ...styles.chevron, ...(open ? styles.chevronOpen : {}) }}
                    aria-hidden
                >
                    <path d="M7 10l5 5 5-5H7z" fill="currentColor" />
                </svg>
            </button>

            {open && (
                <ul
                    role="listbox"
                    tabIndex={-1}
                    ref={listRef}
                    style={styles.list}
                    aria-activedescendant={highlight !== null ? `opt-${highlight}` : undefined}
                >
                    {normalized.map((opt, i) => {
                        const isSelected = opt.value === selectedValue;
                        const isHighlighted = i === highlight;
                        return (
                            <li
                                id={`opt-${i}`}
                                role="option"
                                aria-selected={isSelected}
                                key={String(opt.value) + "-" + i}
                                onMouseEnter={() => setHighlight(i)}
                                onMouseLeave={() => setHighlight(null)}
                                onClick={() => handleSelect(opt)}
                                style={{
                                    ...styles.item,
                                    ...(isHighlighted ? styles.itemHover : {}),
                                    ...(isSelected ? styles.itemSelected : {}),
                                }}
                            >
                                {opt.label}
                            </li>
                        );
                    })}
                    {normalized.length === 0 && (
                        <li style={{ padding: 10, color: "#666" }} aria-disabled>
                            No options
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
}

Dropdown.propTypes = {
    placeholder: PropTypes.string,
    options: PropTypes.arrayOf(
        PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.shape({
                label: PropTypes.node,
                value: PropTypes.any,
            }),
        ])
    ),
    value: PropTypes.any,
    onChange: PropTypes.func,
    disabled: PropTypes.bool,
    className: PropTypes.string,
};