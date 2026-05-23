"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type Suggestion = {
  id: number;
  name: string;
  location: string;
  state: string;
  type: string;
};

type Props = {
  search: string;
  state: string;
  maxFees: string;
  sort: string;
  loading?: boolean;
  onSearch: (v: string) => void;
  onState: (v: string) => void;
  onMaxFees: (v: string) => void;
  onSort: (v: string) => void;
};

const STATES = [
  "All States", "Maharashtra", "Delhi", "Tamil Nadu", "Rajasthan",
  "West Bengal", "Karnataka", "Telangana", "Uttar Pradesh",
  "Andhra Pradesh", "Kerala",
];

const FEES = [
  { label: "Any fees", value: "" },
  { label: "Under ₹50k", value: "50000" },
  { label: "Under ₹1L", value: "100000" },
  { label: "Under ₹2L", value: "200000" },
  { label: "Under ₹3L", value: "300000" },
  { label: "Under ₹5L", value: "500000" },
];

const SORTS = [
  { label: "Highest rated", value: "rating_desc" },
  { label: "Lowest fees", value: "fees_per_year_asc" },
  { label: "Best placement", value: "placement_pct_desc" },
  { label: "Newest", value: "established_desc" },
];

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function FilterPanel({
  search, state, maxFees, sort, loading,
  onSearch, onState, onMaxFees, onSort,
}: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [fetching, setFetching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebounce(search, 280);

  // Fetch suggestions
  useEffect(() => {
    if (debouncedSearch.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const controller = new AbortController();
    setFetching(true);

    fetch(`/api/colleges/suggestions?q=${encodeURIComponent(debouncedSearch)}`, {
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((data) => {
        setSuggestions(Array.isArray(data) ? data : []);
        setShowDropdown(true);
        setActiveIndex(-1);
      })
      .catch(() => {})
      .finally(() => setFetching(false));

    return () => controller.abort();
  }, [debouncedSearch]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = useCallback((suggestion: Suggestion) => {
    onSearch(suggestion.name);
    setShowDropdown(false);
    setSuggestions([]);
    setActiveIndex(-1);
  }, [onSearch]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      setActiveIndex(-1);
    }
  }, [showDropdown, suggestions, activeIndex, handleSelect]);

  const typeBadgeStyle = (type: string) =>
    type === "Government"
      ? "bg-green-500/10 text-green-400"
      : type === "Deemed"
      ? "bg-cyan-500/10 text-cyan-400"
      : "bg-violet-500/10 text-violet-400";

  const highlight = (text: string, query: string) => {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span className="text-cyan-400 font-medium">
          {text.slice(idx, idx + query.length)}
        </span>
        {text.slice(idx + query.length)}
      </>
    );
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">

      {/* Search with autocomplete */}
      <div className="relative flex-1">
        <div className={`flex items-center !bg-[#0d2137] border rounded-xl px-3 py-2.5 gap-2 transition-all ${
          showDropdown
            ? "border-cyan-400/40 ring-1 ring-cyan-400/20"
            : "border-white/[0.08] hover:border-white/20"
        }`}>
          {/* Search icon */}
          <svg className="w-4 h-4 text-white/30 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>

          <input
            ref={inputRef}
            type="text"
            placeholder="Search colleges..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-sm text-white placeholder-white/30 focus:outline-none"
          />

          {/* Spinner or clear */}
          {fetching || loading ? (
            <svg className="animate-spin w-4 h-4 text-cyan-400/60 shrink-0" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : search ? (
            <button
              onClick={() => { onSearch(""); setSuggestions([]); setShowDropdown(false); }}
              className="text-white/25 hover:text-white/60 transition-colors shrink-0"
              aria-label="Clear search"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : null}
        </div>

        {/* Dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-1.5 !bg-[#0d2137] border border-white/[0.08] rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            {suggestions.map((s, i) => (
              <div
                key={s.id}
                onMouseDown={() => handleSelect(s)}
                onMouseEnter={() => setActiveIndex(i)}
                className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${
                  i < suggestions.length - 1 ? "border-b border-white/[0.04]" : ""
                } ${
                  activeIndex === i
                    ? "!bg-cyan-400/[0.08]"
                    : "hover:!bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Icon */}
                  <div className="w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] text-white/90 truncate">
                      {highlight(s.name, search)}
                    </div>
                    <div className="text-[11px] text-white/35 truncate">
                      📍 {s.location}, {s.state}
                    </div>
                  </div>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ml-2 ${typeBadgeStyle(s.type)}`}>
                  {s.type === "Government" ? "Govt" : s.type}
                </span>
              </div>
            ))}

            {/* Footer hint */}
            <div className="px-4 py-2 border-t border-white/[0.04] flex items-center gap-3">
              <span className="text-[10px] text-white/20">↑↓ navigate</span>
              <span className="text-[10px] text-white/20">↵ select</span>
              <span className="text-[10px] text-white/20">esc close</span>
            </div>
          </div>
        )}
      </div>

      {/* State filter */}
      <select
        value={state || "All States"}
        onChange={(e) => onState(e.target.value === "All States" ? "" : e.target.value)}
        className="px-3 py-2.5 !bg-[#0d2137] border border-white/[0.08] hover:border-white/20 rounded-xl text-sm text-white/70 focus:outline-none focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/20 transition-all appearance-none cursor-pointer"
      >
        {STATES.map((s) => <option key={s} className="bg-[#0d2137]">{s}</option>)}
      </select>

      {/* Fees filter */}
      <select
        value={maxFees}
        onChange={(e) => onMaxFees(e.target.value)}
        className="px-3 py-2.5 !bg-[#0d2137] border border-white/[0.08] hover:border-white/20 rounded-xl text-sm text-white/70 focus:outline-none focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/20 transition-all appearance-none cursor-pointer"
      >
        {FEES.map((f) => (
          <option key={f.value} value={f.value} className="bg-[#0d2137]">{f.label}</option>
        ))}
      </select>

      {/* Sort filter */}
      <select
        value={sort}
        onChange={(e) => onSort(e.target.value)}
        className="px-3 py-2.5 !bg-[#0d2137] border border-white/[0.08] hover:border-white/20 rounded-xl text-sm text-white/70 focus:outline-none focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/20 transition-all appearance-none cursor-pointer"
      >
        {SORTS.map((s) => (
          <option key={s.value} value={s.value} className="bg-[#0d2137]">{s.label}</option>
        ))}
      </select>

    </div>
  );
}