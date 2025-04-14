'use client';

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { decodeToken } from "@/lib/decodeToken";

export default function DashboardPage() {
  const [message, setMessage] = useState("Loading...");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Step 1: Handle token in query param
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      sessionStorage.setItem("jwt", token);

      const url = new URL(window.location.href);
      url.searchParams.delete("token");
      window.history.replaceState({}, document.title, url.toString());
    }

    async function loadData() {
      const storedToken = sessionStorage.getItem("jwt");

      if (storedToken) {
        const decoded = await decodeToken(storedToken);
        if (decoded?.userId) {
          setUserId(decoded.userId);
        }
      }

      try {
        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/hello`);
        setMessage(res.message);
      } catch (err) {
        console.error("Failed to fetch:", err);
        setMessage("Error loading data");
      }
    }

    loadData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome to Growfly 🧠</h1>
      {userId && <p className="mb-2 text-green-600">👤 Logged in as User ID: <strong>{userId}</strong></p>}
      <p>{message}</p>
    </div>
  );
}
