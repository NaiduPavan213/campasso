import { useState, useEffect, useCallback } from "react";

export function useShortlist() {
  const [shortlistedIds, setShortlistedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchShortlist = useCallback(async () => {
    try {
      const res = await fetch("/api/shortlist");
      if (!res.ok) return;
      const colleges = await res.json();
      setShortlistedIds(colleges.map((c: { id: number }) => c.id));
    } catch {
      // not logged in or error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShortlist();
  }, [fetchShortlist]);

  const toggle = useCallback(async (collegeId: number) => {
    const isShortlisted = shortlistedIds.includes(collegeId);

    // Optimistic update
    setShortlistedIds((prev) =>
      isShortlisted ? prev.filter((id) => id !== collegeId) : [...prev, collegeId]
    );

    try {
      await fetch("/api/shortlist", {
        method: isShortlisted ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collegeId }),
      });
    } catch {
      // Revert on error
      setShortlistedIds((prev) =>
        isShortlisted ? [...prev, collegeId] : prev.filter((id) => id !== collegeId)
      );
    }
  }, [shortlistedIds]);

  const isShortlisted = useCallback(
    (collegeId: number) => shortlistedIds.includes(collegeId),
    [shortlistedIds]
  );

  return { shortlistedIds, isShortlisted, toggle, loading };
}