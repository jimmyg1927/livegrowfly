'use client'

import React from 'react'
import Image from 'next/image'
import botPng from '@/public/growfly-bot.png'

export interface GrowflyBotProps {
  size?: number
}

const GrowflyBot: React.FC<GrowflyBotProps> = ({ size = 80 }) => (
  <div style={{ width: size, height: size }} className="relative flex-shrink-0">
    <Image
      src={botPng}
      alt="Growfly Bot"
      fill
      style={{ objectFit: 'contain' }}
    />
  </div>
)

export default GrowflyBot
