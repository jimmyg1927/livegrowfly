'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import PromptTracker from '@/components/PromptTracker';

type UserProps = {
  name?: string | null;
  email: string;
  promptsUsed: number;
  subscriptionType: string;
};

export default function DashboardClient({ user }: { user: UserProps | null }) {
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-600">User not found.</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white text-gray-900">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header name={user.email} />

        <main className="p-6 overflow-y-auto">
          <PromptTracker used={user.promptsUsed} limit={200} />

          <div className="mt-6">
            <h2 className="text-xl font-semibold">Subscription: {user.subscriptionType}</h2>
            <p className="text-gray-600">Welcome to your dashboard, {user.email}.</p>
          </div>
        </main>
      </div>
    </div>
  );
}
