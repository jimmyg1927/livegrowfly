'use client';

import React from 'react';
import Image from 'next/image';

export interface GrowflyBotProps {
  /** idle: standing; thinking: bounce; responded: calm */
  status?: 'idle' | 'thinking' | 'responded';
  /** width in pixels (height will be 1.2× width) */
  size?: number;
}

export default function GrowflyBot({
  status = 'idle',
  size = 200,
}: GrowflyBotProps) {
  const width = size;
  const height = Math.round(size * 1.2);

  return (
    <div style={{ width, height }} className="relative">
      <Image
        src="/growfly-bot.png"
        alt="Growfly Bot"
        width={width}
        height={height}
        className={`object-contain transition-transform ${
          status === 'thinking' ? 'animate-bounce' : ''
        }`}
      />
    </div>
  );
}
