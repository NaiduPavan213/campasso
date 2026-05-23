"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import CollegeCard from "@/components/CollegeCard";
import FilterPanel from "@/components/FilterPanel";
import CompareBar from "@/components/CompareBar";

type College = {
  id: number;
  name: string;
  location: string;
  state: string;
  fees_per_year: number;
  rating: number;
  placement_pct: number;
  type: string;
};

// Grid icon
function GridIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1.5" fill={active ? "#00E5FF" : "rgba(255,255,255,0.3)"} />
      <rect x="9" y="1" width="6" height="6" rx="1.5" fill={active ? "#00E5FF" : "rgba(255,255,255,0.3)"} />
      <rect x="1" y="9" width="6" height="6" rx="1.5" fill={active ? "#00E5FF" : "rgba(255,255,255,0.3)"} />
      <rect x="9" y="9" width="6" height="6" rx="1.5" fill={active ? "#00E5FF" : "rgba(255,255,255,0.3)"} />
    </svg>
  );
}

// List icon
function ListIcon({ active }: { active: boolean }) {
  const c = active ? "#00E5FF" : "rgba(255,255,255,0.3)";
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="2" width="4" height="4" rx="1" fill={c} />
      <rect x="7" y="3" width="8" height="2" rx="1" fill={c} />
      <rect x="1" y="7" width="4" height="4" rx="1" fill={c} />
      <rect x="7" y="8" width="8" height="2" rx="1" fill={c} />
      <rect x="1" y="12" width="4" height="4" rx="1" fill={c} />
      <rect x="7" y="13" width="8" height="2" rx="1" fill={c} />
    </svg>
  );
}

// List row component
function CollegeListRow({
  college,
  compareIds,
  onCompareToggle,
}: {
  college: College;
  compareIds: number[];
  onCompareToggle: (id: number) => void;
}) {
  const isSelected = compareIds.includes(college.id);
  const isDisabled = compareIds.length >= 3 && !isSelected;

  const feesLabel = college.fees_per_year >= 100000
    ? `₹${(college.fees_per_year / 100000).toFixed(1)}L`
    : `₹${(college.fees_per_year / 1000).toFixed(0)}k`;

  const initials = college.name
    .split(" ")
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

  const avatarClass =
    college.type === "Government"
      ? "bg-cyan-500/10 text-cyan-400"
      : college.type === "Deemed"
      ? "bg-violet-500/10 text-violet-400"
      : "bg-amber-500/10 text-amber-400";

  const badgeClass =
    college.type === "Government"
      ? "bg-green-500/10 text-green-400 border border-green-500/20"
      : college.type === "Deemed"
      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
      : "bg-violet-500/10 text-violet-400 border border-violet-500/20";

  return (
    <div className={`flex items-center gap-4 px-5 py-3.5 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors ${
      isSelected ? "bg-cyan-400/[0.03]" : ""
    }`}>
      {/* Avatar */}
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-medium shrink-0 ${avatarClass}`}>
        {initials}
      </div>

      {/* Name + location */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Link
            href={`/colleges/${college.id}`}
            className="text-[13px] font-medium text-white hover:text-cyan-400 transition-colors truncate"
          >
            {college.name}
          </Link>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${badgeClass}`}>
            {college.type === "Government" ? "Govt" : college.type}
          </span>
        </div>
        <div className="text-[11px] text-white/35 mt-0.5 truncate">
          📍 {college.location}, {college.state}
        </div>
      </div>

      {/* Stats */}
      <div className="hidden sm:flex items-center gap-6 shrink-0">
        <div className="text-center">
          <div className="text-[10px] text-white/25 mb-0.5">Fees/yr</div>
          <div className="text-[13px] font-medium text-cyan-400">{feesLabel}</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-white/25 mb-0.5">Rating</div>
          <div className="text-[13px] font-medium text-amber-400">⭐ {college.rating}</div>
        </div>
        <div className="text-center w-24">
          <div className="text-[10px] text-white/25 mb-1">Placement</div>
          <div className="flex items-center gap-1.5">
            <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-green-400 rounded-full"
                style={{ width: `${college.placement_pct}%` }}
              />
            </div>
            <span className="text-[11px] text-green-400 font-medium shrink-0">
              {college.placement_pct}%
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <Link
          href={`/colleges/${college.id}`}
          className="text-[12px] px-3 py-1.5 rounded-lg border border-cyan-400/25 text-cyan-400 hover:bg-cyan-400/10 transition-colors"
        >
          View
        </Link>
        <button
          onClick={() => onCompareToggle(college.id)}
          disabled={isDisabled}
          className={`text-[12px] px-3 py-1.5 rounded-lg border transition-colors ${
            isSelected
              ? "!bg-cyan-400 text-[#071620] border-cyan-400"
              : isDisabled
              ? "bg-white/[0.02] text-white/20 border-white/[0.05] cursor-not-allowed"
              : "bg-white/[0.04] text-white/50 border-white/[0.08] hover:bg-white/[0.08]"
          }`}
        >
          {isSelected ? "✓" : "⇄"}
        </button>
      </div>
    </div>
  );
}

function CollegesPageClient() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");

  const [search, setSearch] = useState("");
  const [state, setState] = useState("");
  const [maxFees, setMaxFees] = useState("");
  const [sort, setSort] = useState("rating_desc");

  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [collegeNames, setCollegeNames] = useState<Record<number, string>>({});

  const fetchColleges = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (state) params.set("state", state);
    if (maxFees) params.set("maxFees", maxFees);
    if (sort) params.set("sort", sort);
    params.set("page", page.toString());
    params.set("limit", "12");

    const res = await fetch(`/api/colleges?${params.toString()}`);
    const data = await res.json();
    setColleges(data.data || []);
    setTotal(data.total || 0);
    setTotalPages(data.totalPages || 1);
    setLoading(false);
  }, [search, state, maxFees, sort, page]);

  useEffect(() => {
    const delay = setTimeout(fetchColleges, 300);
    return () => clearTimeout(delay);
  }, [fetchColleges]);

  useEffect(() => { setPage(1); }, [search, state, maxFees, sort]);

  const handleCompareToggle = (id: number) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) {
        const next = prev.filter((i) => i !== id);
        setCollegeNames((n) => { const copy = { ...n }; delete copy[id]; return copy; });
        return next;
      }
      if (prev.length >= 3) return prev;
      const college = colleges.find((c) => c.id === id);
      if (college) setCollegeNames((n) => ({ ...n, [id]: college.name }));
      return [...prev, id];
    });
  };

  // Skeleton
  const SkeletonGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="!bg-[#0d2137] border border-white/[0.06] rounded-xl p-5 h-52 animate-pulse">
          <div className="flex gap-3 mb-4">
            <div className="w-10 h-10 bg-white/[0.06] rounded-lg" />
            <div className="flex-1">
              <div className="h-3 bg-white/[0.06] rounded w-3/4 mb-2" />
              <div className="h-2.5 bg-white/[0.04] rounded w-1/2" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="h-14 bg-white/[0.04] rounded-lg" />
            <div className="h-14 bg-white/[0.04] rounded-lg" />
          </div>
          <div className="h-2 bg-white/[0.04] rounded-full" />
        </div>
      ))}
    </div>
  );

  const SkeletonList = () => (
    <div className="!bg-[#0d2137] border border-white/[0.06] rounded-xl overflow-hidden">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-white/[0.04] last:border-0 animate-pulse">
          <div className="w-9 h-9 bg-white/[0.06] rounded-lg shrink-0" />
          <div className="flex-1">
            <div className="h-3 bg-white/[0.06] rounded w-48 mb-2" />
            <div className="h-2.5 bg-white/[0.04] rounded w-32" />
          </div>
          <div className="hidden sm:flex gap-6">
            <div className="w-12 h-8 bg-white/[0.04] rounded" />
            <div className="w-12 h-8 bg-white/[0.04] rounded" />
            <div className="w-24 h-8 bg-white/[0.04] rounded" />
          </div>
          <div className="flex gap-2">
            <div className="w-12 h-7 bg-white/[0.04] rounded-lg" />
            <div className="w-8 h-7 bg-white/[0.04] rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen !bg-[#071620] pt-16">

      {/* Sticky filter bar */}
      <div className="sticky top-16 !bg-[#071620]/95 backdrop-blur-md z-10 border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <FilterPanel
            search={search}
            state={state}
            maxFees={maxFees}
            sort={sort}
            loading={loading}
            onSearch={setSearch}
            onState={setState}
            onMaxFees={setMaxFees}
            onSort={setSort}
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-6 pb-10">

        {/* Results bar + view toggle */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-[13px] text-white/35">
            {loading
              ? "Searching..."
              : `${total} college${total !== 1 ? "s" : ""} found`}
          </div>

          {/* Toggle */}
          <div className="flex items-center gap-1 !bg-[#0d2137] border border-white/[0.08] rounded-lg p-1">
            <button
              onClick={() => setView("grid")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-medium transition-all ${
                view === "grid"
                  ? "!bg-white/[0.08] text-cyan-400"
                  : "text-white/30 hover:text-white/60"
              }`}
              title="Grid view"
            >
              <GridIcon active={view === "grid"} />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-medium transition-all ${
                view === "list"
                  ? "!bg-white/[0.08] text-cyan-400"
                  : "text-white/30 hover:text-white/60"
              }`}
              title="List view"
            >
              <ListIcon active={view === "list"} />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>
        </div>

        {/* Empty state */}
        {!loading && colleges.length === 0 && (
          <div className="text-center py-24 !bg-[#0d2137] border border-white/[0.06] rounded-2xl">
            <div className="text-5xl mb-4">🎓</div>
            <p className="text-white/50 text-[15px] mb-1">No colleges found</p>
            <p className="text-white/25 text-[13px]">Try adjusting your filters</p>
          </div>
        )}

        {/* Grid view */}
        {loading && view === "grid" && <SkeletonGrid />}
        {!loading && view === "grid" && colleges.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {colleges.map((college) => (
              <CollegeCard
                key={college.id}
                {...college}
                compareIds={compareIds}
                onCompareToggle={handleCompareToggle}
              />
            ))}
          </div>
        )}

        {/* List view */}
        {loading && view === "list" && <SkeletonList />}
        {!loading && view === "list" && colleges.length > 0 && (
          <div className="!bg-[#0d2137] border border-white/[0.06] rounded-xl overflow-hidden">
            {/* List header */}
            <div className="hidden sm:flex items-center gap-4 px-5 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
              <div className="w-9 shrink-0" />
              <div className="flex-1 text-[10px] text-white/25 uppercase tracking-[0.06em]">College</div>
              <div className="flex items-center gap-6 shrink-0 pr-20">
                <div className="text-[10px] text-white/25 uppercase tracking-[0.06em] w-12 text-center">Fees</div>
                <div className="text-[10px] text-white/25 uppercase tracking-[0.06em] w-12 text-center">Rating</div>
                <div className="text-[10px] text-white/25 uppercase tracking-[0.06em] w-24 text-center">Placement</div>
              </div>
            </div>
            {colleges.map((college) => (
              <CollegeListRow
                key={college.id}
                college={college}
                compareIds={compareIds}
                onCompareToggle={handleCompareToggle}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-[13px] !bg-[#0d2137] border border-white/[0.08] rounded-lg text-white/50 disabled:opacity-30 hover:border-white/20 hover:text-white/70 transition-all"
            >
              ← Prev
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = totalPages <= 5 ? i + 1
                  : page <= 3 ? i + 1
                  : page >= totalPages - 2 ? totalPages - 4 + i
                  : page - 2 + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 text-[13px] rounded-lg transition-all ${
                      p === page
                        ? "!bg-cyan-500 text-[#071620] font-medium"
                        : "!bg-[#0d2137] border border-white/[0.08] text-white/40 hover:border-white/20 hover:text-white/70"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 text-[13px] !bg-[#0d2137] border border-white/[0.08] rounded-lg text-white/50 disabled:opacity-30 hover:border-white/20 hover:text-white/70 transition-all"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      <CompareBar
        compareIds={compareIds}
        collegeNames={collegeNames}
        onRemove={(id) => handleCompareToggle(id)}
        onClear={() => { setCompareIds([]); setCollegeNames({}); }}
      />
    </div>
  );
}

export default function CollegesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen !bg-[#071620]" />}>
      <CollegesPageClient />
    </Suspense>
  );
}