import React from 'react';
import { Search, X, ChevronDown, Calendar } from 'lucide-react';

/**
 * Reusable, branded filter components for all dashboard pages.
 * Design language: rounded-xl, #173b35 focus rings, slate borders, consistent sizing.
 */

// ─── Shared base styles ───────────────────────────────────────────────────────

const BASE_INPUT =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm ' +
  'placeholder:text-slate-400 ' +
  'transition-all duration-150 ' +
  'focus:border-[#173b35] focus:outline-none focus:ring-2 focus:ring-[#173b35]/20';

const BASE_SELECT =
  'w-full appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-9 py-2.5 text-sm text-slate-800 shadow-sm ' +
  'transition-all duration-150 ' +
  'focus:border-[#173b35] focus:outline-none focus:ring-2 focus:ring-[#173b35]/20';

const BASE_DATE =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm ' +
  'transition-all duration-150 ' +
  'focus:border-[#173b35] focus:outline-none focus:ring-2 focus:ring-[#173b35]/20';

// ─── FilterSelect ─────────────────────────────────────────────────────────────

/**
 * Branded <select> dropdown with custom chevron.
 *
 * @param {string}   label       - Optional floating label text
 * @param {string}   value       - Selected value
 * @param {function} onChange    - Change handler (receives event)
 * @param {Array}    options     - [{value, label}] or [{value, label, disabled}]
 * @param {string}   placeholder - Placeholder option text
 * @param {string}   className   - Additional wrapper classes
 * @param {object}   rest        - Passed to <select>
 */
export function FilterSelect({
  label,
  value,
  onChange,
  options = [],
  placeholder,
  className = '',
  ...rest
}) {
  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="mb-1.5 block text-xs font-medium text-slate-500 uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className={BASE_SELECT}
          {...rest}
        >
          {placeholder && (
            <option value="">{placeholder}</option>
          )}
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              disabled={opt.disabled}
            >
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      </div>
    </div>
  );
}

// ─── FilterSearchInput ────────────────────────────────────────────────────────

/**
 * Branded search input with magnifying-glass icon and optional clear button.
 *
 * @param {string}   value       - Input value
 * @param {function} onChange    - Change handler (receives event)
 * @param {string}   placeholder - Placeholder text
 * @param {function} onClear    - Optional clear callback
 * @param {string}   label      - Optional label text
 * @param {string}   className  - Additional wrapper classes
 * @param {object}   rest       - Passed to <input>
 */
export function FilterSearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  onClear,
  label,
  className = '',
  ...rest
}) {
  return (
    <div className={className}>
      {label && (
        <label className="mb-1.5 block text-xs font-medium text-slate-500 uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${BASE_INPUT} pl-9 ${value ? 'pr-9' : ''}`}
          {...rest}
        />
        {value && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── FilterDateInput ──────────────────────────────────────────────────────────

/**
 * Branded date input with optional label.
 *
 * @param {string}   label     - Optional label text
 * @param {string}   value     - Date value (YYYY-MM-DD)
 * @param {function} onChange  - Change handler (receives event)
 * @param {string}   min      - Min date
 * @param {string}   max      - Max date
 * @param {string}   className - Additional wrapper classes
 * @param {object}   rest     - Passed to <input>
 */
export function FilterDateInput({
  label,
  value,
  onChange,
  min,
  max,
  className = '',
  ...rest
}) {
  return (
    <div className={className}>
      {label && (
        <label className="mb-1.5 block text-xs font-medium text-slate-500 uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="date"
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          className={BASE_DATE}
          {...rest}
        />
      </div>
    </div>
  );
}

// ─── DateRangeFilter ──────────────────────────────────────────────────────────

/**
 * Start + End date pair with inline labels and cross-validation.
 *
 * @param {string}   startDate      - Start date value
 * @param {string}   endDate        - End date value
 * @param {function} onStartChange  - Start date change handler (receives event)
 * @param {function} onEndChange    - End date change handler (receives event)
 * @param {string}   startLabel     - Label for start (default "From")
 * @param {string}   endLabel       - Label for end (default "To")
 * @param {string}   className      - Additional wrapper classes
 */
export function DateRangeFilter({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  startLabel = 'From',
  endLabel = 'To',
  className = '',
}) {
  return (
    <div className={`flex flex-col sm:flex-row gap-3 ${className}`}>
      <FilterDateInput
        label={startLabel}
        value={startDate}
        onChange={onStartChange}
        max={endDate || undefined}
        className="flex-1"
      />
      <FilterDateInput
        label={endLabel}
        value={endDate}
        onChange={onEndChange}
        min={startDate || undefined}
        className="flex-1"
      />
    </div>
  );
}

// ─── FilterButton ─────────────────────────────────────────────────────────────

/**
 * Branded filter action button (Apply, Clear, Export, etc.)
 *
 * @param {'primary'|'secondary'|'danger'} variant - Button style
 * @param {React.ReactNode} children - Button content
 * @param {string}   className - Additional classes
 * @param {object}   rest      - Passed to <button>
 */
export function FilterButton({
  variant = 'primary',
  children,
  className = '',
  ...rest
}) {
  const variants = {
    primary:
      'bg-[#173b35] text-white hover:bg-[#1e4d45] active:bg-[#122f2a] shadow-sm',
    secondary:
      'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 active:bg-slate-100 shadow-sm',
    danger:
      'bg-white text-red-600 border border-red-200 hover:bg-red-50 active:bg-red-100 shadow-sm',
  };

  return (
    <button
      type="button"
      className={
        `inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium ` +
        `transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#173b35]/20 ` +
        `disabled:opacity-50 disabled:cursor-not-allowed ` +
        `${variants[variant] || variants.primary} ${className}`
      }
      {...rest}
    >
      {children}
    </button>
  );
}

// ─── FilterBar ────────────────────────────────────────────────────────────────

/**
 * Container that wraps a row of filter controls with consistent spacing and layout.
 *
 * @param {React.ReactNode} children - Filter controls
 * @param {string}   title    - Optional section title
 * @param {number}   activeCount - Number of active filters (shows badge)
 * @param {function} onReset  - Reset callback (shows reset button)
 * @param {string}   className - Additional wrapper classes
 */
export function FilterBar({
  children,
  title,
  activeCount = 0,
  onReset,
  className = '',
}) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-slate-50/50 p-4 ${className}`}>
      {(title || activeCount > 0 || onReset) && (
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {title && (
              <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
            )}
            {activeCount > 0 && (
              <span className="inline-flex items-center justify-center rounded-full bg-[#173b35] px-2 py-0.5 text-xs font-medium text-white">
                {activeCount}
              </span>
            )}
          </div>
          {onReset && activeCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-red-600 transition-colors"
            >
              <X className="h-3 w-3" />
              Clear all
            </button>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {children}
      </div>
    </div>
  );
}

// ─── FilterTabGroup ───────────────────────────────────────────────────────────

/**
 * Branded tab/toggle group for filter modes (e.g., Active/History, All/Pending).
 *
 * @param {Array}    tabs       - [{value, label, count?}]
 * @param {string}   activeTab  - Currently selected tab value
 * @param {function} onChange   - Tab change handler (receives value)
 * @param {string}   className  - Additional wrapper classes
 */
export function FilterTabGroup({
  tabs = [],
  activeTab,
  onChange,
  className = '',
}) {
  return (
    <div className={`inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1 ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.value === activeTab;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={
              `inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150 ` +
              (isActive
                ? 'bg-[#173b35] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-800 hover:bg-white/60')
            }
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={
                  `inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-semibold ` +
                  (isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600')
                }
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
