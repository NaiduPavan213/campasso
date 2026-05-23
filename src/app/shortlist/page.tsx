"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useWishlist } from "@/hooks/useShortlist";

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

export default function wishlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toggle, iswishlisted } = useWishlist();
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    if (status !== "authenticated") return;

    fetch("/api/wishlist")
      .then((r) => r.json())
      .then((data) => {
        setColleges(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, [status, router]);

  const handleRemove = async (id: number) => {
    await toggle(id);
    setColleges((prev) => prev.filter((c) => c.id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen !bg-[#071620] pt-16">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="animate-pulse space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="h-24 bg-white/5 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen !bg-[#071620] pt-16">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[22px] font-medium text-white mb-1">My wishlist</h1>
            <p className="text-[13px] text-white/35">
              {colleges.length === 0
                ? "No colleges saved yet"
                : `${colleges.length} college${colleges.length > 1 ? "s" : ""} saved`}
            </p>
          </div>
          <Link
            href="/colleges"
            className="text-[12px] text-cyan-400 border border-cyan-400/25 px-4 py-2 rounded-full hover:bg-cyan-400/10 transition-colors"
          >
            + Add more
          </Link>
        </div>

        {colleges.length === 0 ? (
          <div className="text-center py-24 border border-white/[0.06] rounded-2xl !bg-[#0d2137]">
            <div className="text-5xl mb-4">🎓</div>
            <p className="text-white/50 text-[15px] mb-2">Your wishlist is empty</p>
            <p className="text-white/25 text-[13px] mb-6">Save colleges you're interested in to compare them later</p>
            <Link
              href="/colleges"
              className="inline-flex items-center gap-2 px-5 py-2.5 !bg-cyan-500 text-[#071620] rounded-full text-[13px] font-medium hover:!bg-cyan-400 transition-colors"
            >
              Explore colleges →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {colleges.map((college) => {
              const feesLabel = college.fees_per_year >= 100000
                ? `₹${(college.fees_per_year / 100000).toFixed(1)}L`
                : `₹${(college.fees_per_year / 1000).toFixed(0)}k`;

              const badgeStyle =
                college.type === "Government"
                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                  : college.type === "Deemed"
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                  : "bg-violet-500/10 text-violet-400 border border-violet-500/20";

              return (
                <div
                  key={college.id}
                  className="!bg-[#0d2137] border border-white/[0.07] rounded-xl p-5 flex items-center gap-5 hover:border-cyan-400/20 transition-colors"
                >
                  {/* Initials */}
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-sm font-medium shrink-0">
                    {college.name.split(" ").filter(w => w.length > 2).slice(0, 2).map(w => w[0]).join("")}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-[14px] font-medium text-white truncate">{college.name}</h2>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${badgeStyle}`}>
                        {college.type === "Government" ? "Govt" : college.type}
                      </span>
                    </div>
                    <p className="text-[12px] text-white/35 mb-3">📍 {college.location}, {college.state}</p>
                    <div className="flex gap-4">
                      <span className="text-[12px] text-cyan-400 font-medium">{feesLabel}/yr</span>
                      <span className="text-[12px] text-amber-400">⭐ {college.rating}</span>
                      <span className="text-[12px] text-green-400">📊 {college.placement_pct}%</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/colleges/${college.id}`}
                      className="text-[12px] px-3 py-2 rounded-lg border border-cyan-400/25 text-cyan-400 hover:bg-cyan-400/10 transition-colors"
                    >
                      View →
                    </Link>
                    <button
                      onClick={() => handleRemove(college.id)}
                      className="text-[12px] px-3 py-2 rounded-lg border border-white/10 text-white/35 hover:text-red-400 hover:border-red-400/30 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Compare CTA if 2+ colleges */}
            {colleges.length >= 2 && (
              <Link
                href={`/compare?ids=${colleges.slice(0, 3).map(c => c.id).join(",")}`}
                className="mt-2 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-cyan-400/20 text-cyan-400 text-[13px] font-medium hover:bg-cyan-400/08 transition-colors !bg-cyan-400/04"
              >
                ⇄ Compare your wishlisted colleges
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
