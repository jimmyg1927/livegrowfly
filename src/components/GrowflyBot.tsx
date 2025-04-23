'use client';

import React from 'react';
import Image from 'next/image';

interface GrowflyBotProps {
  status: 'idle' | 'loading' | 'success' | 'error';
}

const GrowflyBot: React.FC<GrowflyBotProps> = ({ status }) => {
  const getAnimation = () => {
    switch (status) {
      case 'loading':
        return 'animate-bounce';
      case 'success':
        return 'animate-pulse';
      case 'error':
        return 'animate-shake';
      default:
        return '';
    }
  };

  return (
    <div className={`flex justify-center items-center p-4 ${getAnimation()}`}>
      <Image
        src="/growfly-bot.png"
        alt="Growfly Bot"
        width={150}
        height={150}
        priority
        className="rounded-full"
      />
    </div>
  );
};

export default GrowflyBot;
