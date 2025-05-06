"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiTrash2 } from "react-icons/fi";
import { format } from "date-fns";

interface SavedItem {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export default function SavedPage() {
  const [saved, setSaved] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [search, setSearch] = useState("");
  const router = useRouter();

  const token =
    typeof window !== "undefined" ? localStorage.getItem("growfly_jwt") : null;

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    fetch("/api/saved", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then((data: SavedItem[]) => setSaved(data))
      .catch(() => alert("Failed to load saved responses"))
      .finally(() => setLoading(false));
  }, [token, router]);

  const handleDelete = async (id: string) => {
    if (!token) return;
    const confirm = window.confirm("Are you sure you want to delete this saved item?");
    if (!confirm) return;

    const res = await fetch(`/api/saved/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setSaved((prev) => prev.filter((item) => item.id !== id));
    else alert("Failed to delete");
  };

  const handleRename = async (id: string) => {
    if (!token) return;
    const res = await fetch(`/api/saved/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: editedTitle }),
    });
    if (res.ok) {
      setSaved((prev) =>
        prev.map((item) => (item.id === id ? { ...item, title: editedTitle } : item))
      );
      setEditingId(null);
    } else {
      alert("Failed to rename");
    }
  };

  const filtered = saved.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce((acc: { [key: string]: SavedItem[] }, item) => {
    const date = format(new Date(item.createdAt), "PPP");
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-6 bg-background text-textPrimary">
      <h1 className="text-2xl font-bold">📁 Saved Responses</h1>

      <input
        type="text"
        placeholder="Search saved titles…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md px-4 py-2 border rounded bg-card border-muted focus:outline-none focus:ring-2 focus:ring-accent"
      />

      {loading ? (
        <p>Loading saved responses…</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground">No saved responses found.</p>
      ) : (
        Object.entries(grouped).map(([date, items]) => (
          <div key={date} className="space-y-3">
            <h2 className="text-lg font-semibold text-muted-foreground">{date}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-card border border-muted rounded-xl p-4 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    {editingId === item.id ? (
                      <input
                        className="mb-2 w-full px-3 py-1 rounded border border-muted bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        onBlur={() => handleRename(item.id)}
                        autoFocus
                      />
                    ) : (
                      <h3
                        className="text-lg font-semibold cursor-pointer hover:underline"
                        onClick={() => {
                          setEditingId(item.id);
                          setEditedTitle(item.title);
                        }}
                      >
                        {item.title}
                      </h3>
                    )}
                    <p className="mt-2 text-sm whitespace-pre-wrap text-muted-foreground">
                      {item.content.slice(0, 200)}…
                    </p>
                  </div>

                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="flex items-center gap-1 text-sm px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white transition"
                    >
                      <FiTrash2 /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}