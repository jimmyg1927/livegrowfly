'use client';

import { useState } from 'react';

export default function CollabZone() {
  const [documentContent, setDocumentContent] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(documentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow p-6 text-black dark:text-white">
      <h2 className="text-xl font-bold mb-4">📄 Collab-Zone: Shared Document</h2>
      <textarea
        className="w-full border border-gray-300 dark:border-gray-700 rounded-xl p-4 bg-gray-100 dark:bg-[#2a2a2a] text-black dark:text-white mb-4 min-h-[200px]"
        placeholder="Start writing your document here or paste AI responses..."
        value={documentContent}
        onChange={(e) => setDocumentContent(e.target.value)}
      ></textarea>
      <div className="flex items-center justify-between">
        <button
          onClick={handleCopy}
          className="bg-blue-600 hover:bg-blue-800 text-white px-4 py-2 rounded-xl transition"
        >
          {copied ? '✅ Copied!' : 'Copy Document'}
        </button>
        <p className="text-sm opacity-70">Shareable links & invites coming soon…</p>
      </div>
    </div>
  );
}
