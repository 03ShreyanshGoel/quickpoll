'use client';

import { useState } from 'react';
import { CreatePollForm } from '@/components/CreatePollForm';
import { PollList } from '@/components/PollList';
import { useRealtimePolls } from '@/hooks/useRealtimePolls';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  RefreshCw,
  Plus,
  BarChart3,
  UsersRound,
  Heart,
  AlignStartVertical,
} from 'lucide-react';

export default function Home() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { polls, loading, error, isConnected, refetch } = useRealtimePolls();

  const totalVotes = polls.reduce((sum, p) => sum + p.total_votes, 0);
  const totalLikes = polls.reduce((sum, p) => sum + p.like_count, 0);

  return (
    <main className="min-h-screen bg-linear-to-br from-white via-slate-50 to-indigo-50">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <header className="shadow-sm px-4 sm:px-7 py-4 sm:py-5 mb-3 relative">
          <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
            {/* Brand */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-indigo-600 p-1.5 sm:p-2 rounded-full transition-transform hover:scale-105">
                <AlignStartVertical className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  quick<span className="text-indigo-600">poll</span>
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5 hidden xs:block">
                  Real-time opinion polling platform
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-3">

              {/* WebSocket Status - Responsive */}
              <div className="flex items-center">
                {/* Mobile: Only dot */}
                <div className="sm:hidden">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                      }`}
                  />
                </div>

                {/* Tablet+: Full text + dot */}
                <div
                  className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${isConnected
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200 animate-pulse'
                    }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                      }`}
                  />
                  <span>{isConnected ? 'Live' : 'Connecting...'}</span>
                </div>
              </div>

              {/* Refresh */}
              <Button
                size="icon"
                variant="outline"
                onClick={refetch}
                disabled={loading}
                className="rounded-xl border border-gray-300 hover:border-indigo-500 hover:shadow-md transition-all h-9 w-9 sm:h-10 sm:w-10"
              >
                <RefreshCw
                  className={`h-4 w-4 sm:h-5 sm:w-5 ${loading ? 'animate-spin' : ''}`}
                />
              </Button>

              {/* Create Poll */}
              <Button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 text-sm sm:text-base px-3 sm:px-4 py-2 h-9 sm:h-10"
              >
                <Plus className="h-4 w-4 mr-1" />
                <span className="hidden xs:inline">
                  {showCreateForm ? 'Cancel' : 'Create your poll'}
                </span>
                <span className="xs:hidden">{showCreateForm ? 'Cancel' : 'Create'}</span>
              </Button>
            </div>
          </div>
        </header>

        {/* ✅ Create Poll Form */}
        {showCreateForm && (
          <div className="my-8 animate-in slide-in-from-top duration-300 mx-auto max-w-[90%] lg:max-w-1/2">
            <CreatePollForm onClose={() => setShowCreateForm(false)} />
          </div>
        )}


        {/* ✅ Polls Section */}
        <div className="px-9 py-10">
          <div className='flex justify-between items-baseline'>
            <h2 className="text-4xl font-semibold text-gray-900 mb-8">Active Polls</h2>
            {/* ✅ Stats Bar */}
            {polls.length > 0 && (
              <div className="flex items-center justify-center gap-8 sm:gap-12 mb-10 text-gray-700">
                <div className="flex items-center gap-1.5">
                  <BarChart3 className="h-5 w-5" />
                  <span className="text-sm sm:text-base">{polls.length}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <UsersRound className="h-5 w-5" />
                  <span className="text-sm sm:text-base">{totalVotes}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Heart className="h-5 w-5" />
                  <span className="text-sm sm:text-base">{totalLikes}</span>
                </div>
              </div>
            )}
          </div>


          {loading && polls.length === 0 ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Loading polls...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded inline-block mb-4">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
              <br />
              <Button onClick={refetch} variant="outline" className="border-2">
                Try Again
              </Button>
            </div>
          ) : (
            <PollList polls={polls} />
          )}
        </div>

        {/* ✅ Footer */}
        <footer className="mt-20 border-t border-gray-200">
          <div className="px-7 py-12">
            <div className="max-w-6xl mx-auto">
              {/* Top Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {/* Brand */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-indigo-600 p-1.5 rounded-full">
                      <AlignStartVertical className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                      quick<span className="text-indigo-600">poll</span>
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Create, share, and analyze polls in real-time with your audience.
                  </p>
                </div>

                {/* Quick Links */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Quick Links</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>
                      <a href="#" className="hover:text-indigo-600 transition-colors">
                        How It Works
                      </a>
                    </li>
                    <li>
                      <a href="#" className="hover:text-indigo-600 transition-colors">
                        Privacy Policy
                      </a>
                    </li>
                    <li>
                      <a href="#" className="hover:text-indigo-600 transition-colors">
                        Terms of Service
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Tech Stack */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Built With</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 shadow-xs bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                      FastAPI
                    </span>
                    <span className="px-3 py-1 shadow-xs bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                      Next.js
                    </span>
                    <span className="px-3 py-1 shadow-xs bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                      WebSockets
                    </span>
                    <span className="px-3 py-1 shadow-xs bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                      TypeScript
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Section */}
              <div className="pt-8 border-t border-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <p className="text-sm text-gray-600">
                    © {new Date().getFullYear()} quickpoll. Built with{' '}
                    <span className="text-red-500">♥</span> for better conversations.
                  </p>
                  <div className="flex items-center gap-4">
                    <a
                      href="#"
                      className="text-gray-600 hover:text-indigo-600 transition-colors"
                      aria-label="GitHub"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                    </a>
                    <a
                      href="#"
                      className="text-gray-600 hover:text-indigo-600 transition-colors"
                      aria-label="Twitter"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
