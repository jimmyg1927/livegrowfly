'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FiTrash2, 
  FiMaximize2, 
  FiEdit, 
  FiX, 
  FiBookmark, 
  FiShare2, 
  FiSearch,
  FiCalendar,
  FiClock,
  FiFilter,
  FiGrid,
  FiList,
  FiStar,
  FiHeart
} from 'react-icons/fi';
import { 
  FaBookmark, 
  FaShareSquare,
  FaRegBookmark,
  FaRegStar,
  FaStar
} from 'react-icons/fa';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';

interface SavedItem {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  isPinned?: boolean;
  isFavorite?: boolean;
}

export default function SavedPage() {
  const [saved, setSaved] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<SavedItem | null>(null);
  const [showTooltip, setShowTooltip] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'favorites'>('date');
  const [filterBy, setFilterBy] = useState<'all' | 'pinned' | 'favorites'>('all');
  const router = useRouter();

  const token = typeof window !== 'undefined' ? localStorage.getItem('growfly_jwt') : null;
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Check if tooltip has been dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem('saved_tooltip_dismissed');
    if (dismissed) {
      setShowTooltip(false);
    }
  }, []);

  const dismissTooltip = () => {
    setShowTooltip(false);
    localStorage.setItem('saved_tooltip_dismissed', 'true');
  };

  useEffect(() => {
    if (!token || !API_BASE) {
      router.push('/login');
      return;
    }

    fetch(`${API_BASE}/api/saved`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then((data: SavedItem[]) => {
        setSaved(data);
      })
      .catch(() => alert('Failed to load saved responses'))
      .finally(() => setLoading(false));
  }, [token, router, API_BASE]);

  const handleDelete = async (id: string) => {
    if (!token || !API_BASE) return;
    if (!confirm('Delete this saved response?')) return;

    const res = await fetch(`${API_BASE}/api/saved/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      setSaved((prev) => prev.filter((item) => item.id !== id));
    } else {
      alert('Failed to delete');
    }
  };

  const handleRename = async (id: string) => {
    if (!token || !API_BASE) return;

    const res = await fetch(`${API_BASE}/api/saved/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: editedTitle }),
    });

    if (res.ok) {
      setSaved((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, title: editedTitle } : item
        )
      );
      setEditingId(null);
    } else {
      alert('Failed to rename');
    }
  };

  const handlePin = async (id: string) => {
    // For now, just update locally - you can add API call later
    setSaved((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isPinned: !item.isPinned } : item
      )
    );
  };

  const handleFavorite = async (id: string) => {
    // For now, just update locally - you can add API call later
    setSaved((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
  };

  const handleShareToCollab = async (item: SavedItem) => {
    if (!token || !API_BASE) return;

    const res = await fetch(`${API_BASE}/api/collab`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: item.title,
        content: item.content,
        type: 'document'
      }),
    });

    if (res.ok) {
      const newDoc = await res.json();
      router.push(`/collab-zone?document=${newDoc.id}`);
    } else {
      alert('Failed to share to Collab Zone.');
    }
  };

  // Enhanced filtering and sorting
  const filtered = saved
    .filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                          item.content.toLowerCase().includes(search.toLowerCase());
      
      if (filterBy === 'pinned') return matchesSearch && item.isPinned;
      if (filterBy === 'favorites') return matchesSearch && item.isFavorite;
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'favorites') return (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // Separate pinned items
  const pinnedItems = filtered.filter(item => item.isPinned);
  const regularItems = filtered.filter(item => !item.isPinned);

  const grouped = regularItems.reduce((acc: { [key: string]: SavedItem[] }, item) => {
    const date = format(new Date(item.createdAt), 'PPP');
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});

  const ItemCard = ({ item }: { item: SavedItem }) => (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5 shadow-sm hover:shadow-lg transition-all duration-200 hover:scale-[1.02] relative">
      {/* Pin/Favorite buttons */}
      <div className="absolute top-3 right-3 flex gap-2">
        <button
          onClick={() => handlePin(item.id)}
          className={`p-1 rounded-full transition-colors ${
            item.isPinned
              ? 'text-blue-600 hover:text-blue-700'
              : 'text-gray-400 hover:text-blue-600'
          }`}
          title={item.isPinned ? 'Unpin' : 'Pin'}
        >
          <FiBookmark className={`w-4 h-4 ${item.isPinned ? 'fill-current' : ''}`} />
        </button>
        <button
          onClick={() => handleFavorite(item.id)}
          className={`p-1 rounded-full transition-colors ${
            item.isFavorite
              ? 'text-yellow-500 hover:text-yellow-600'
              : 'text-gray-400 hover:text-yellow-500'
          }`}
          title={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {item.isFavorite ? <FaStar className="w-4 h-4" /> : <FaRegStar className="w-4 h-4" />}
        </button>
      </div>

      {editingId === item.id ? (
        <input
          className="mb-3 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          onBlur={() => handleRename(item.id)}
          onKeyDown={(e) => e.key === 'Enter' && handleRename(item.id)}
          autoFocus
        />
      ) : (
        <h3
          className="text-lg font-semibold cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors pr-16 mb-2"
          onClick={() => {
            setEditingId(item.id);
            setEditedTitle(item.title);
          }}
          title="Click to edit title"
        >
          {item.title}
        </h3>
      )}

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
        <FiClock className="w-4 h-4" />
        {format(new Date(item.createdAt), 'PPp')}
      </p>

      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-4 line-clamp-3">
        {item.content.slice(0, 150)}...
      </p>

      <div className="flex flex-wrap gap-2 justify-between items-center">
        <div className="flex gap-2 flex-wrap">
          <Dialog>
            <DialogTrigger asChild>
              <button
                onClick={() => setSelected(item)}
                className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
              >
                <FiMaximize2 className="w-4 h-4" /> View Full
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white dark:bg-slate-800">
              <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-white">{selected?.title}</DialogTitle>
              </DialogHeader>
              <div className="text-sm whitespace-pre-wrap mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                {selected?.content}
              </div>
            </DialogContent>
          </Dialog>

          <button
            onClick={() => handleShareToCollab(item)}
            className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white transition-all duration-200"
            title="Share to Collab Zone for editing and collaboration"
          >
            <FaShareSquare className="w-4 h-4" /> Share to Collab Zone
          </button>
        </div>

        <button
          onClick={() => handleDelete(item.id)}
          className="flex items-center gap-1 text-xs px-3 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
          title="Delete this saved response"
        >
          <FiTrash2 className="w-4 h-4" /> Delete
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-gray-900 dark:text-white transition-colors duration-300">
      <div className="p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              📁 Saved Responses
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Your personal collection of saved AI responses
            </p>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700">
            {saved.length} saved {saved.length === 1 ? 'response' : 'responses'}
          </div>
        </div>

        {/* Helpful Tooltip */}
        {showTooltip && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 relative">
            <button
              onClick={dismissTooltip}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FiX className="w-5 h-5" />
            </button>
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Why Save & Pin Responses?
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                  Bookmark your favorite AI responses to easily find them later! Pin important ones to keep them at the top, 
                  and use the star system to mark your absolute favorites.
                </p>
                <div className="flex items-center gap-4 text-xs text-blue-700 dark:text-blue-300">
                  <span className="flex items-center gap-1">
                    <FaBookmark className="w-3 h-3" /> Pin for quick access
                  </span>
                  <span className="flex items-center gap-1">
                    <FaStar className="w-3 h-3 text-yellow-500" /> Star your favorites
                  </span>
                  <span className="flex items-center gap-1">
                    <FaShareSquare className="w-3 h-3" /> Share to Collab Zone for editing & sharing
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search saved responses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2 items-center">
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as 'all' | 'pinned' | 'favorites')}
                className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="pinned">Pinned</option>
                <option value="favorites">Favorites</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'favorites')}
                className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">Sort by Date</option>
                <option value="title">Sort by Title</option>
                <option value="favorites">Sort by Favorites</option>
              </select>

              <div className="flex gap-1 bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-slate-600 text-blue-600 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-blue-600'
                  }`}
                >
                  <FiGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-slate-600 text-blue-600 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-blue-600'
                  }`}
                >
                  <FiList className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading your saved responses...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              No saved responses found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start saving responses from the dashboard to build your collection!
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Pinned Items */}
            {pinnedItems.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-4 flex items-center gap-2">
                  <FiBookmark className="w-5 h-5" />
                  Pinned ({pinnedItems.length})
                </h2>
                <div className={`grid gap-4 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                    : 'grid-cols-1'
                }`}>
                  {pinnedItems.map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {/* Regular Items by Date */}
            {Object.entries(grouped).map(([date, items]) => (
              <div key={date}>
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                  <FiCalendar className="w-5 h-5" />
                  {date} ({items.length})
                </h2>
                <div className={`grid gap-4 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                    : 'grid-cols-1'
                }`}>
                  {items.map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}