import { useState, useEffect, useCallback } from "react";

export function useWishlist() {
  const [wishlistedIds, setwishlistedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchwishlist = useCallback(async () => {
    try {
      const res = await fetch("/api/wishlist");
      if (!res.ok) return;
      const colleges = await res.json();
      setwishlistedIds(colleges.map((c: { id: number }) => c.id));
    } catch {
      // not logged in or error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchwishlist();
  }, [fetchwishlist]);

  const toggle = useCallback(async (collegeId: number) => {
    const iswishlisted = wishlistedIds.includes(collegeId);

    // Optimistic update
    setwishlistedIds((prev) =>
      iswishlisted ? prev.filter((id) => id !== collegeId) : [...prev, collegeId]
    );

    try {
      await fetch("/api/wishlist", {
        method: iswishlisted ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collegeId }),
      });
    } catch {
      // Revert on error
      setwishlistedIds((prev) =>
        iswishlisted ? [...prev, collegeId] : prev.filter((id) => id !== collegeId)
      );
    }
  }, [wishlistedIds]);

  const iswishlisted = useCallback(
    (collegeId: number) => wishlistedIds.includes(collegeId),
    [wishlistedIds]
  );

  return { wishlistedIds, iswishlisted, toggle, loading };
}
