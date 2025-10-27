'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Poll, pollsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Heart, Users, RefreshCw } from 'lucide-react';
import { calculatePercentage, formatDate, generateUserId } from '@/lib/utils';
import { useWebSocket } from '@/hooks/useWebSocket';

export default function PollDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pollId = parseInt(params.id as string);
  
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [voted, setVoted] = useState(false);
  const [liked, setLiked] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [voting, setVoting] = useState(false);
  const [userId] = useState(() => generateUserId());

  const { on } = useWebSocket(pollId);

  useEffect(() => {
    fetchPoll();
  }, [pollId]);

  useEffect(() => {
    const unsubscribeVote = on('vote', (data: any) => {
      if (data.poll_id === pollId) {
        setPoll(data.data);
      }
    });

    const unsubscribeLike = on('like', (data: any) => {
      if (data.poll_id === pollId && poll) {
        setPoll({ ...poll, like_count: data.data.like_count });
      }
    });

    return () => {
      unsubscribeVote();
      unsubscribeLike();
    };
  }, [on, pollId, poll]);

  const fetchPoll = async () => {
    try {
      setLoading(true);
      const data = await pollsApi.getById(pollId);
      setPoll(data);

      const vote = await pollsApi.getUserVote(pollId, userId);
      if (vote) {
        setVoted(true);
        setSelectedOption(vote.option_id);
      }

      const isLiked = await pollsApi.checkUserLike(pollId, userId);
      setLiked(isLiked);

      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load poll');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (optionId: number) => {
    if (voted || voting) return;

    try {
      setVoting(true);
      await pollsApi.vote(pollId, { option_id: optionId, user_id: userId });
      setVoted(true);
      setSelectedOption(optionId);
      await fetchPoll();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to vote');
    } finally {
      setVoting(false);
    }
  };

  const handleLike = async () => {
    try {
      const result = await pollsApi.toggleLike(pollId, { user_id: userId });
      setLiked(result.is_liked);
      if (poll) {
        setPoll({ ...poll, like_count: result.like_count });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-destructive text-center mb-4">{error || 'Poll not found'}</p>
            <Button onClick={() => router.push('/')} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => router.push('/')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Polls
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{poll.title}</CardTitle>
            {poll.description && (
              <CardDescription className="text-base">{poll.description}</CardDescription>
            )}
            <CardDescription className="flex items-center gap-4 pt-2">
              <span>Created {formatDate(poll.created_at)}</span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {poll.total_votes} {poll.total_votes === 1 ? 'vote' : 'votes'}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className="gap-2 -ml-2"
              >
                <Heart className={`h-4 w-4 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
                {poll.like_count}
              </Button>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {poll.options.map((option) => {
              const percentage = calculatePercentage(option.vote_count || 0, poll.total_votes);
              const isSelected = selectedOption === option.id;

              return (
                <div key={option.id} className="space-y-2">
                  <Button
                    variant={voted ? "outline" : "default"}
                    className="w-full justify-between h-auto py-4"
                    onClick={() => !voted && handleVote(option.id!)}
                    disabled={voted || voting}
                  >
                    <span className={`text-left ${isSelected ? 'font-bold' : ''}`}>
                      {option.text}
                    </span>
                    {voted && (
                      <span className="text-sm ml-4">
                        {option.vote_count} votes ({percentage}%)
                      </span>
                    )}
                  </Button>
                  {voted && (
                    <div className="space-y-1">
                      <Progress value={percentage} className="h-3" />
                      <p className="text-xs text-muted-foreground text-right">
                        {percentage}% of total votes
                      </p>
                    </div>
                  )}
                </div>
              );
            })}

            {!voted && (
              <p className="text-sm text-muted-foreground text-center pt-4">
                Select an option to cast your vote
              </p>
            )}

            {voted && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
                <p className="text-sm text-green-800 text-center font-medium">
                  ✓ Your vote has been recorded! Results update in real-time.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}