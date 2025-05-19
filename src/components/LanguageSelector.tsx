'use client'

import { useLanguageStore } from '@/lib/languageStore'

const languageOptions = [
  { label: '🇬🇧 English (UK)', value: 'English (UK)' },
  { label: '🇺🇸 English (US)', value: 'English (US)' },
  { label: '🇩🇰 Danish', value: 'Danish' },
  { label: '🇪🇸 Spanish', value: 'Spanish' },
  { label: '🇫🇷 French', value: 'French' },
  { label: '🇩🇪 German', value: 'German' },
  { label: '🇮🇹 Italian', value: 'Italian' },
  { label: '🇳🇱 Dutch', value: 'Dutch' },
  { label: '🇯🇵 Japanese', value: 'Japanese' },
]

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguageStore()

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="language" className="text-sm text-gray-600">🌍 Language:</label>
      <select
        id="language"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="text-sm border rounded px-2 py-1"
      >
        {languageOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
