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
    <div className="bg-gradient-to-br from-white via-white to-gray-50/50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-700/50 border border-gray-200/50 dark:border-slate-700/50 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 relative backdrop-blur-sm">
      {/* Pin/Favorite buttons */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={() => handlePin(item.id)}
          className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
            item.isPinned
              ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 hover:text-blue-700 shadow-md'
              : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
          }`}
          title={item.isPinned ? 'Unpin' : 'Pin'}
        >
          <FiBookmark className={`w-4 h-4 ${item.isPinned ? 'fill-current' : ''}`} />
        </button>
        <button
          onClick={() => handleFavorite(item.id)}
          className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
            item.isFavorite
              ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/30 hover:text-yellow-600 shadow-md'
              : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
          }`}
          title={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {item.isFavorite ? <FaStar className="w-4 h-4" /> : <FaRegStar className="w-4 h-4" />}
        </button>
      </div>

      {editingId === item.id ? (
        <input
          className="mb-4 w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          onBlur={() => handleRename(item.id)}
          onKeyDown={(e) => e.key === 'Enter' && handleRename(item.id)}
          autoFocus
        />
      ) : (
        <h3
          className="text-lg font-bold cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors pr-20 mb-3 line-clamp-2 leading-tight"
          onClick={() => {
            setEditingId(item.id);
            setEditedTitle(item.title);
          }}
          title="Click to edit title"
        >
          {item.title}
        </h3>
      )}

      <div className="flex items-center gap-2 mb-4 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-slate-700 rounded-lg">
          <FiClock className="w-3.5 h-3.5" />
          <span className="font-medium">{format(new Date(item.createdAt), 'MMM d, yyyy')}</span>
        </div>
        <div className="text-xs text-gray-400">
          {format(new Date(item.createdAt), 'h:mm a')}
        </div>
      </div>

      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-6 line-clamp-3 leading-relaxed">
        {item.content.slice(0, 180)}...
      </p>

      <div className="flex flex-wrap gap-3 justify-between items-center">
        <div className="flex gap-2 flex-wrap">
          <Dialog>
            <DialogTrigger asChild>
              <button
                onClick={() => setSelected(item)}
                className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
              >
                <FiMaximize2 className="w-3.5 h-3.5" /> View Full
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-white dark:bg-slate-800 rounded-xl">
              <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-white text-xl font-bold">{selected?.title}</DialogTitle>
              </DialogHeader>
              <div className="text-sm whitespace-pre-wrap mt-6 text-gray-700 dark:text-gray-300 leading-relaxed">
                {selected?.content}
              </div>
            </DialogContent>
          </Dialog>

          <button
            onClick={() => handleShareToCollab(item)}
            className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
            title="Share to Collab Zone for editing and collaboration"
          >
            <FaShareSquare className="w-3.5 h-3.5" /> Share to Collab
          </button>
        </div>

        <button
          onClick={() => handleDelete(item.id)}
          className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-lg bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
          title="Delete this saved response"
        >
          <FiTrash2 className="w-3.5 h-3.5" /> Delete
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900 text-gray-900 dark:text-white transition-colors duration-300">
      <div className="p-6 space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent mb-3">
              📁 Saved Responses
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
              Your personal collection of saved AI responses
            </p>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 bg-gradient-to-r from-white to-gray-50 dark:from-slate-800 dark:to-slate-700 px-6 py-3 rounded-xl border border-gray-200/50 dark:border-slate-700/50 shadow-lg">
            <span className="font-bold text-blue-600 dark:text-blue-400">{saved.length}</span> saved {saved.length === 1 ? 'response' : 'responses'}
          </div>
        </div>

        {/* Helpful Tooltip */}
        {showTooltip && (
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border border-blue-200/50 dark:border-blue-800/50 rounded-xl p-6 relative shadow-lg backdrop-blur-sm">
            <button
              onClick={dismissTooltip}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-lg transition-all duration-200"
            >
              <FiX className="w-5 h-5" />
            </button>
            <div className="flex items-start gap-4">
              <div className="text-3xl">💡</div>
              <div>
                <h3 className="font-bold text-xl text-blue-900 dark:text-blue-100 mb-3">
                  Why Save & Pin Responses?
                </h3>
                <p className="text-blue-800 dark:text-blue-200 mb-4 leading-relaxed">
                  Bookmark your favorite AI responses to easily find them later! Pin important ones to keep them at the top, 
                  and use the star system to mark your absolute favorites.
                </p>
                <div className="flex items-center gap-6 text-sm text-blue-700 dark:text-blue-300">
                  <span className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <FaBookmark className="w-3.5 h-3.5" /> Pin for quick access
                  </span>
                  <span className="flex items-center gap-2 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <FaStar className="w-3.5 h-3.5 text-yellow-600" /> Star your favorites
                  </span>
                  <span className="flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <FaShareSquare className="w-3.5 h-3.5" /> Share to Collab Zone
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-gradient-to-r from-white via-white to-gray-50/50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-700/50 rounded-xl p-6 border border-gray-200/50 dark:border-slate-700/50 shadow-lg backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search saved responses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-3 items-center flex-wrap">
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as 'all' | 'pinned' | 'favorites')}
                className="px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm min-w-[120px]"
              >
                <option value="all">All Items</option>
                <option value="pinned">Pinned</option>
                <option value="favorites">Favorites</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'favorites')}
                className="px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm min-w-[140px]"
              >
                <option value="date">Sort by Date</option>
                <option value="title">Sort by Title</option>
                <option value="favorites">Sort by Favorites</option>
              </select>

              <div className="flex gap-1 bg-gray-100 dark:bg-slate-700 rounded-lg p-1 shadow-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-lg transition-all duration-200 ${
                    viewMode === 'grid'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-600'
                  }`}
                >
                  <FiGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-lg transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-600'
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
            <div className="flex flex-col items-center gap-6">
              <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">Loading your saved responses...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-8xl mb-6">📭</div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
              No saved responses found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg max-w-md mx-auto leading-relaxed">
              Start saving responses from the dashboard to build your collection!
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold text-lg"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Pinned Items */}
            {pinnedItems.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <FiBookmark className="w-6 h-6" />
                  </div>
                  Pinned ({pinnedItems.length})
                </h2>
                <div className={`grid gap-6 ${
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
                <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded-lg">
                    <FiCalendar className="w-5 h-5" />
                  </div>
                  {date} ({items.length})
                </h2>
                <div className={`grid gap-6 ${
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