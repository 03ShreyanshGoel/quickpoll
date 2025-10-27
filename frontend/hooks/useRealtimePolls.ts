'use client';

import { useState, useEffect, useCallback } from 'react';
import { Poll, pollsApi } from '@/lib/api';
import { wsManager } from '@/lib/websocket';

export function useRealtimePolls() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Fetch initial polls from API
  const fetchPolls = useCallback(async () => {
    try {
      setLoading(true);
      console.log('📥 Fetching polls from API...');
      const data = await pollsApi.getAll();
      console.log(`✅ Fetched ${data.length} polls`);
      setPolls(data);
      setError(null);
    } catch (err: any) {
      console.error('❌ Error fetching polls:', err);
      setError(err.message || 'Failed to fetch polls');
    } finally {
      setLoading(false);
    }
  }, []);

  // Update or add poll in local state
  const updatePollInState = useCallback((updatedPoll: Poll) => {
    console.log(`🔄 Updating poll ${updatedPoll.id} in state`);
    
    setPolls(prevPolls => {
      const index = prevPolls.findIndex(p => p.id === updatedPoll.id);
      
      if (index >= 0) {
        // Update existing poll
        const newPolls = [...prevPolls];
        newPolls[index] = updatedPoll;
        console.log(`✅ Updated existing poll at index ${index}`);
        return newPolls;
      } else {
        // Add new poll at the beginning
        console.log(`✅ Added new poll to the list`);
        return [updatedPoll, ...prevPolls];
      }
    });
  }, []);

  useEffect(() => {
    // Fetch initial data
    fetchPolls();

    // Monitor WebSocket connection status
    const checkConnection = setInterval(() => {
      const connected = wsManager.isConnected();
      setIsConnected(connected);
    }, 1000);

    // Define WebSocket event handlers
    const handlePollCreated = (data: Poll) => {
      console.log('🆕 NEW POLL CREATED:', data);
      updatePollInState(data);
    };

    const handleVoteUpdate = (data: Poll) => {
      console.log('🗳️ VOTE UPDATE:', data);
      updatePollInState(data);
    };

    const handleLikeUpdate = (data: Poll) => {
      console.log('❤️ LIKE UPDATE:', data);
      updatePollInState(data);
    };

    // Register WebSocket listeners
    console.log('🎧 Registering WebSocket event listeners...');
    wsManager.on('poll_created', handlePollCreated);
    wsManager.on('vote_update', handleVoteUpdate);
    wsManager.on('like_update', handleLikeUpdate);
    console.log('✅ All listeners registered');

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up useRealtimePolls hook');
      clearInterval(checkConnection);
      wsManager.off('poll_created', handlePollCreated);
      wsManager.off('vote_update', handleVoteUpdate);
      wsManager.off('like_update', handleLikeUpdate);
    };
  }, [fetchPolls, updatePollInState]);

  return {
    polls,
    loading,
    error,
    isConnected,
    refetch: fetchPolls,
  };
}