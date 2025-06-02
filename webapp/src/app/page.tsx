'use client';

import ChatInterface from '@/components/ChatInterface';

export default function Home() {
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <ChatInterface className="flex-1" />
    </div>
  );
}
