"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useShortlist } from "@/hooks/useShortlist";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Course = {
  id: number;
  name: string;
  duration_yrs: number;
  fees: number;
};

type College = {
  id: number;
  name: string;
  location: string;
  state: string;
  fees_per_year: number;
  rating: number;
  placement_pct: number;
  type: string;
  established: number;
  overview: string;
  courses: Course[];
};

function CollegeDetailPageClient() {
  const { id } = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const [college, setCollege] = useState<College | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // ✅ Use the real shortlist hook
  const { isShortlisted, toggle, loading: shortlistLoading } = useShortlist();

  useEffect(() => {
    const fetch_ = async () => {
      const res = await fetch(`/api/colleges/${id}`);
      if (res.status === 404 || res.status === 400) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setCollege(data);
      setLoading(false);
    };
    fetch_();
  }, [id]);

  const handleShortlist = async () => {
    if (!session?.user) {
      // Redirect to login if not logged in
      router.push("/auth/login");
      return;
    }
    if (!college) return;
    await toggle(college.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen !bg-[#071620] pt-16">
        <div className="max-w-6xl mx-auto px-4 py-10 animate-pulse">
          <div className="h-4 bg-white/5 rounded w-32 mb-8" />
          <div className="h-48 bg-white/5 rounded-2xl mb-4" />
          <div className="grid grid-cols-4 gap-4 mb-4">
            {[1,2,3,4].map(i => <div key={i} className="h-20 bg-white/5 rounded-xl" />)}
          </div>
          <div className="h-64 bg-white/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen !bg-[#071620] pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🎓</div>
          <h1 className="text-xl font-medium text-white mb-2">College not found</h1>
          <p className="text-white/40 text-sm mb-6">The college you are looking for does not exist.</p>
          <Link href="/colleges" className="px-5 py-2.5 !bg-cyan-500 text-[#071620] rounded-full text-sm font-medium hover:!bg-cyan-400 transition-colors">
            Back to colleges
          </Link>
        </div>
      </div>
    );
  }

  if (!college) return null;

  // ✅ Read real shortlist state
  const saved = isShortlisted(college.id);

  const feesLabel = college.fees_per_year >= 100000
    ? `₹${(college.fees_per_year / 100000).toFixed(1)}L`
    : `₹${(college.fees_per_year / 1000).toFixed(0)}k`;

  const badgeStyle =
    college.type === "Government"
      ? "bg-green-500/10 text-green-400 border border-green-500/20"
      : college.type === "Deemed"
      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
      : "bg-violet-500/10 text-violet-400 border border-violet-500/20";

  const placements = [
    { label: "Overall placement rate", pct: college.placement_pct, color: "#1DB954" },
    { label: "Tech & software roles", pct: Math.round(college.placement_pct * 0.92), color: "#00E5FF" },
    { label: "Core engineering roles", pct: Math.round(college.placement_pct * 0.76), color: "#A78BFA" },
    { label: "Management & consulting", pct: Math.round(college.placement_pct * 0.65), color: "#F59E0B" },
  ];

  return (
    <div className="min-h-screen !bg-[#071620] pt-16">

      {/* Back bar */}
      <div className="border-b border-white/[0.06] !bg-[#071620]">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-2">
          <Link href="/colleges" className="flex items-center gap-1.5 text-[12px] text-white/40 hover:text-white/70 transition-colors">
            ← Back to colleges
          </Link>
          <span className="text-white/20 text-xs">›</span>
          <span className="text-[12px] text-white/25 truncate">{college.name}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">

        {/* Hero banner */}
        <div className="!bg-[#0d2137] border border-white/[0.06] rounded-2xl mt-6 p-7 mb-4 flex items-start justify-between gap-6">
          <div className="flex-1">
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1 rounded-full mb-4 ${badgeStyle}`}>
              🏛 {college.type} institute
            </span>
            <h1 className="text-[26px] font-medium text-white mb-2 leading-tight">{college.name}</h1>
            <p className="text-[13px] text-white/40 mb-4 flex items-center gap-1">
              📍 {college.location}, {college.state}
            </p>
            <p className="text-[13px] text-white/55 leading-relaxed max-w-xl mb-6">
              {college.overview}
            </p>
            <div className="flex gap-2.5 flex-wrap">

              {/* ✅ Fixed shortlist button */}
              <button
                onClick={handleShortlist}
                disabled={shortlistLoading}
                className={`flex items-center gap-2 text-[12px] font-medium px-4 py-2 rounded-[9px] border transition-all ${
                  saved
                    ? "!bg-violet-500/20 border-violet-500/40 text-violet-400"
                    : "bg-violet-500/10 border-violet-500/25 text-violet-400 hover:bg-violet-500/20"
                } ${shortlistLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {saved ? "♥ Shortlisted" : "♡ Shortlist"}
              </button>

              <Link
                href={`/compare?ids=${college.id}`}
                className="flex items-center gap-2 text-[12px] font-medium px-4 py-2 rounded-[9px] bg-cyan-500/[0.08] border border-cyan-500/25 text-cyan-400 hover:bg-cyan-500/15 transition-colors"
              >
                ⇄ Compare
              </Link>
              <button className="flex items-center gap-2 text-[12px] font-medium px-4 py-2 rounded-[9px] bg-white/[0.04] border border-white/10 text-white/50 hover:bg-white/[0.08] transition-colors">
                ↗ Official website
              </button>
            </div>
          </div>

          {/* NIRF rank box */}
          <div className="!bg-white/[0.04] border border-white/[0.08] rounded-2xl px-6 py-5 text-center shrink-0 hidden sm:block">
            <div className="text-[28px] font-medium text-amber-400">
              #{Math.ceil(college.id % 20) + 1}
            </div>
            <div className="text-[11px] text-white/30 mt-1">NIRF rank</div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            { label: "Fees / year", value: feesLabel, color: "#00E5FF", icon: "💰", bg: "rgba(0,229,255,0.06)" },
            { label: "Rating", value: `${college.rating} ★`, color: "#F59E0B", icon: "⭐", bg: "rgba(245,158,11,0.06)" },
            { label: "Placement", value: `${college.placement_pct}%`, color: "#1DB954", icon: "💼", bg: "rgba(29,185,84,0.06)" },
            { label: "Established", value: college.established.toString(), color: "#A78BFA", icon: "🏛", bg: "rgba(139,92,246,0.06)" },
          ].map((s) => (
            <div key={s.label} className="!bg-[#0d2137] border border-white/[0.06] rounded-xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-[9px] flex items-center justify-center text-base shrink-0" style={{ background: s.bg }}>
                {s.icon}
              </div>
              <div>
                <div className="text-[10px] text-white/30 uppercase tracking-[0.05em] mb-1">{s.label}</div>
                <div className="text-[16px] font-medium" style={{ color: s.color }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Main content + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4 pb-10">

          <div className="flex flex-col gap-4">
            <div className="!bg-[#0d2137] border border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-2">
                <span className="text-cyan-400">📚</span>
                <span className="text-[14px] font-medium text-white">Courses offered</span>
                <span className="ml-auto text-[11px] text-white/30 bg-white/[0.04] px-2.5 py-1 rounded-full">
                  {college.courses.length} programs
                </span>
              </div>
              {college.courses.length === 0 ? (
                <p className="text-white/30 text-sm p-6">No courses listed yet.</p>
              ) : (
                college.courses.map((course, i) => (
                  <div key={course.id} className={`flex items-center justify-between px-6 py-4 ${i < college.courses.length - 1 ? "border-b border-white/[0.04]" : ""}`}>
                    <div>
                      <div className="text-[13px] font-medium text-white mb-1">{course.name}</div>
                      <div className="text-[11px] text-white/35">
                        {course.duration_yrs} years · {course.duration_yrs <= 2 ? "Postgraduate" : "Undergraduate"}
                      </div>
                    </div>
                    <div className="text-[13px] font-medium text-cyan-400">
                      ₹{(course.fees / 1000).toFixed(0)}k / yr
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="!bg-[#0d2137] border border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-2">
                <span className="text-green-400">📊</span>
                <span className="text-[14px] font-medium text-white">Placement breakdown</span>
              </div>
              <div className="px-6 py-5 flex flex-col gap-5">
                {placements.map((p) => (
                  <div key={p.label} className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[12px] text-white/40">{p.label}</span>
                      <span className="text-[12px] font-medium" style={{ color: p.color }}>{p.pct}%</span>
                    </div>
                    <div className="h-[5px] bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${p.pct}%`, background: p.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="!bg-[#0d2137] border border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-white/[0.06]">
                <span className="text-white/40 text-[13px]">ℹ Quick facts</span>
              </div>
              {[
                { label: "Type", value: college.type, color: college.type === "Government" ? "#1DB954" : college.type === "Deemed" ? "#00BCD4" : "#A78BFA" },
                { label: "State", value: college.state, color: undefined },
                { label: "Location", value: college.location, color: undefined },
                { label: "Established", value: college.established.toString(), color: undefined },
                { label: "Courses", value: `${college.courses.length} programs`, color: undefined },
                { label: "Avg package", value: "₹18 LPA", color: "#00E5FF" },
              ].map((f) => (
                <div key={f.label} className="flex justify-between items-center px-5 py-3 border-b border-white/[0.04] last:border-0">
                  <span className="text-[11px] text-white/35">{f.label}</span>
                  <span className="text-[12px] font-medium" style={{ color: f.color || "rgba(255,255,255,0.75)" }}>
                    {f.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="!bg-[#0d2137] border border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-white/[0.06]">
                <span className="text-white/40 text-[13px]">📍 Location</span>
              </div>
              <div className="p-4">
                <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl h-28 flex flex-col items-center justify-center gap-2">
                  <span className="text-2xl opacity-20">🗺</span>
                  <span className="text-[11px] text-white/25">{college.location}, {college.state}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CollegeDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen !bg-[#071620]" />}>
      <CollegeDetailPageClient />
    </Suspense>
  );
}