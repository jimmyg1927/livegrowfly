export function getXPLabel(xp: number) {
  if (xp < 25) return '🐣 Early Nerd'
  if (xp < 150) return '🔬 MiniMind'
  if (xp < 500) return '⚡ Prompt Hacker'
  if (xp < 850) return '🤓 Nerdlord'
  return '🛸 Flymaster General'
}

export function getXPProgress(xp: number) {
  const levelCaps = [25, 150, 500, 850, 1000]
  for (let i = 0; i < levelCaps.length; i++) {
    if (xp < levelCaps[i]) {
      const prev = i === 0 ? 0 : levelCaps[i - 1]
      return ((xp - prev) / (levelCaps[i] - prev)) * 100
    }
  }
  return 100
}
