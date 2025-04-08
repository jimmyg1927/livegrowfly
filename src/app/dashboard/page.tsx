'use client';

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

export default function DashboardPage() {
  const [message, setMessage] = useState("Loading...");

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

    // Step 2: Fetch data from backend using JWT
    async function loadData() {
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
      <p>{message}</p>
    </div>
  );
}
