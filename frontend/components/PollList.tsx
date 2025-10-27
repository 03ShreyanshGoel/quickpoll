'use client';

import { Poll } from '@/lib/api';
import { PollCard } from './PollCard';

interface PollListProps {
  polls: Poll[];
}

export function PollList({ polls }: PollListProps) {
  if (polls.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">No polls yet</h3>
        <p className="text-gray-600">
          Be the first to create a poll!
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {polls.map((poll) => (
        <PollCard key={poll.id} poll={poll} />
      ))}
    </div>
  );
}