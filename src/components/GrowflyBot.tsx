'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function GrowflyBot() {
  return (
    <div className="relative w-40 h-40 md:w-48 md:h-48">
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="w-full h-full"
      >
        <Image src="/growflybot.png" alt="Growfly Bot" layout="fill" objectFit="contain" priority />
      </motion.div>
    </div>
  );
}
