// 'use client';

// import { useState, useEffect } from 'react';
// import { Poll, pollsApi } from '@/lib/api';
// import { calculatePercentage, formatDate, generateUserId } from '@/lib/utils';

// interface PollCardProps {
//   poll: Poll;
// }

// export function PollCard({ poll }: PollCardProps) {
//   const [userId] = useState(() => generateUserId());
//   const [voted, setVoted] = useState(false);
//   const [liked, setLiked] = useState(false);
//   const [selectedOption, setSelectedOption] = useState<number | null>(null);
//   const [voting, setVoting] = useState(false);
//   const [liking, setLiking] = useState(false);

//   // Check if user has already voted or liked
//   useEffect(() => {
//     checkUserStatus();
//   }, [poll.id]);

//   const checkUserStatus = async () => {
//     try {
//       // Check vote
//       const vote = await pollsApi.getUserVote(poll.id, userId);
//       if (vote) {
//         setVoted(true);
//         setSelectedOption(vote.option_id);
//       }

//       // Check like
//       const isLiked = await pollsApi.checkUserLike(poll.id, userId);
//       setLiked(isLiked);
//     } catch (error) {
//       console.error('Error checking user status:', error);
//     }
//   };

//   const handleVote = async (optionId: number) => {
//     if (voted || voting) return;

//     try {
//       setVoting(true);
//       console.log(`🗳️ Voting for option ${optionId} on poll ${poll.id}`);
      
//       await pollsApi.vote(poll.id, optionId, userId);
      
//       setVoted(true);
//       setSelectedOption(optionId);
//       console.log('✅ Vote submitted successfully');
//     } catch (error: any) {
//       console.error('❌ Error voting:', error);
//       alert(error.response?.data?.detail || 'Failed to vote');
//     } finally {
//       setVoting(false);
//     }
//   };

//   const handleLike = async () => {
//     if (liking) return;

//     try {
//       setLiking(true);
//       console.log(`❤️ Toggling like on poll ${poll.id}`);
      
//       const result = await pollsApi.toggleLike(poll.id, userId);
//       setLiked(result.is_liked);
      
//       console.log('✅ Like toggled successfully');
//     } catch (error) {
//       console.error('❌ Error toggling like:', error);
//     } finally {
//       setLiking(false);
//     }
//   };

//   return (
//     <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
//       {/* Header */}
//       <div className="mb-4">
//         <h3 className="text-xl font-bold text-gray-900 mb-2">
//           {poll.title}
//         </h3>
//         {poll.description && (
//           <p className="text-gray-600 text-sm mb-2">{poll.description}</p>
//         )}
//         <div className="flex items-center gap-4 text-xs text-gray-500">
//           <span>{formatDate(poll.created_at)}</span>
//           <span>{poll.total_votes} {poll.total_votes === 1 ? 'vote' : 'votes'}</span>
//         </div>
//       </div>

//       {/* Options */}
//       <div className="space-y-3 mb-4">
//         {poll.options.map((option) => {
//           const percentage = calculatePercentage(option.vote_count || 0, poll.total_votes);
//           const isSelected = selectedOption === option.id;

//           return (
//             <div key={option.id}>
//               <button
//                 onClick={() => !voted && handleVote(option.id!)}
//                 disabled={voted || voting}
//                 className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
//                   voted
//                     ? isSelected
//                       ? 'border-purple-500 bg-purple-50'
//                       : 'border-gray-200 bg-gray-50'
//                     : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50 cursor-pointer'
//                 } ${voting ? 'opacity-50 cursor-not-allowed' : ''}`}
//               >
//                 <div className="flex justify-between items-center mb-1">
//                   <span className={`font-medium ${isSelected ? 'text-purple-700' : 'text-gray-900'}`}>
//                     {option.text}
//                   </span>
//                   {voted && (
//                     <span className="text-sm text-gray-600">
//                       {option.vote_count} ({percentage}%)
//                     </span>
//                   )}
//                 </div>
                
//                 {/* Progress Bar */}
//                 {voted && (
//                   <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
//                     <div
//                       className={`h-2 rounded-full transition-all duration-500 ${
//                         isSelected ? 'bg-purple-600' : 'bg-gray-400'
//                       }`}
//                       style={{ width: `${percentage}%` }}
//                     />
//                   </div>
//                 )}
//               </button>
//             </div>
//           );
//         })}
//       </div>

//       {/* Vote Status */}
//       {!voted && (
//         <p className="text-sm text-gray-500 text-center mb-4">
//           Click an option to cast your vote
//         </p>
//       )}

//       {voted && (
//         <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
//           <p className="text-sm text-green-800 text-center font-medium">
//             ✓ You voted! Results update in real-time.
//           </p>
//         </div>
//       )}

//       {/* Like Button */}
//       <div className="flex items-center justify-between pt-4 border-t border-gray-200">
//         <button
//           onClick={handleLike}
//           disabled={liking}
//           className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
//             liked
//               ? 'text-red-600 bg-red-50 hover:bg-red-100'
//               : 'text-gray-600 bg-gray-50 hover:bg-gray-100'
//           } ${liking ? 'opacity-50 cursor-not-allowed' : ''}`}
//         >
//           <span className="text-lg">{liked ? '❤️' : '🤍'}</span>
//           <span className="font-medium">{poll.like_count}</span>
//         </button>

//         <span className="text-xs text-gray-500">
//           by {poll.created_by}
//         </span>
//       </div>
//     </div>
//   );
// }

'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from './ui/card';
import { Button } from './ui/button';
import { Poll, pollsApi } from '@/lib/api';
import {
  calculatePercentage,
  formatDate,
  generateUserId,
} from '@/lib/utils';
import {
  Heart,
  UsersRound,
  Clock,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import clsx from 'clsx';

// Pastel palette for progress bars
const PASTEL_PALETTE = [
  'bg-blue-500',
  'bg-pink-500',
  'bg-purple-500',
  'bg-indigo-500',
  'bg-rose-500',
  'bg-fuchsia-500',
  'bg-violet-500',
  'bg-emerald-500',
] as const;

function getOptionColor(index: number): string {
  return PASTEL_PALETTE[index % PASTEL_PALETTE.length];
}

interface PollCardProps {
  poll: Poll;
}

export function PollCard({ poll }: PollCardProps) {
  const [userId] = useState(() => generateUserId());
  const [voted, setVoted] = useState(false);
  const [liked, setLiked] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [voting, setVoting] = useState(false);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    checkUserStatus();
  }, [poll.id]);

  const checkUserStatus = async () => {
    try {
      const vote = await pollsApi.getUserVote(poll.id, userId);
      if (vote) {
        setVoted(true);
        setSelectedOption(vote.option_id);
      }

      const isLiked = await pollsApi.checkUserLike(poll.id, userId);
      setLiked(isLiked);
    } catch (error) {
      console.error('Error checking user status:', error);
    }
  };

  const handleVote = async (optionId: number) => {
    if (voted || voting) return;
    try {
      setVoting(true);
      await pollsApi.vote(poll.id, optionId, userId);
      setVoted(true);
      setSelectedOption(optionId);
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to vote');
    } finally {
      setVoting(false);
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (liking) return;
    try {
      setLiking(true);
      const result = await pollsApi.toggleLike(poll.id, userId);
      setLiked(result.is_liked);
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLiking(false);
    }
  };

  return (
    <Card className="relative flex flex-col h-full overflow-hidden rounded-2xl border border-gray-100 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer group">
      {/* subtle hover gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative flex flex-col flex-1">
        {/* ---------------------- HEADER ---------------------- */}
        <CardHeader
          className="p-6 pb-4"
        >
          <div className="flex items-start justify-between mb-2">
            <h3 className="flex-1 text-lg font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors leading-tight">
              {poll.title}
            </h3>
            {voted && (
              <CheckCircle2 className="ml-2 h-5 w-5 text-green-600" />
            )}
          </div>

          {poll.description && (
            <p className="mt-1 mb-4 text-sm text-gray-600 line-clamp-2">
              {poll.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatDate(poll.created_at)}
            </span>
            <span className="flex items-center gap-1 font-light">
              <UsersRound className="h-3.5 w-3.5" />
              {poll.total_votes} {poll.total_votes === 1 ? 'vote' : 'votes'}
            </span>
            {poll.total_votes > 50 && (
              <span className="flex items-center gap-1 text-indigo-600 font-light">
                <TrendingUp className="h-3.5 w-3.5" />
                Popular
              </span>
            )}
          </div>
        </CardHeader>

        {/* ---------------------- OPTIONS ---------------------- */}
        <CardContent className="px-6 pb-4 space-y-3">
          {poll.options.map((option, idx) => {
            const percentage = calculatePercentage(
              option.vote_count || 0,
              poll.total_votes
            );
            const isSelected = selectedOption === option.id;
            const isWinner =
              poll.total_votes > 0 &&
              option.vote_count ===
                Math.max(...poll.options.map((o) => o.vote_count || 0));

            const fillColor = getOptionColor(idx);

            return (
              <button
                key={option.id}
                onClick={() => !voted && handleVote(option.id!)}
                disabled={voted || voting}
                className={clsx(
                  'relative w-full rounded-xl overflow-hidden transition-all duration-200',
                  'bg-white',
                  !voted && 'hover:shadow-md hover:ring-1 hover:ring-indigo-500 cursor-pointer',
                  voted && 'cursor-default',
                  isWinner && voted && 'ring-2 ring-indigo-600 ring-offset-1'
                )}
              >
                <div
                  className={clsx(
                    'absolute inset-y-0 left-0 transition-all duration-700 ease-out',
                    fillColor
                  )}
                  style={{ width: `${percentage}%` }}
                />

                <div className="relative flex items-center justify-between px-4 py-3">
                  <span
                    className={clsx(
                      'z-10 text-base',
                      voted && isSelected ? 'text-indigo-900 font-medium' : 'text-gray-800'
                    )}
                  >
                    {option.text}
                  </span>

                  {voted && (
                    <span className="z-10 text-sm font-light text-gray-700">
                      {percentage}%
                    </span>
                  )}
                </div>

                {voted && percentage === 0 && (
                  <div className="absolute inset-x-0 bottom-0 h-px bg-gray-300" />
                )}
              </button>
            );
          })}
        </CardContent>

        {/* ---------------------- FOOTER ---------------------- */}
        <CardFooter className="mt-auto border-t border-gray-100 bg-gray-50 px-6 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={liking}
            className="gap-2 hover:scale-105 transition-transform"
          >
            <Heart
              className={clsx(
                'h-4 w-4 transition-all',
                liked ? 'fill-red-500 text-red-500 scale-110' : 'text-gray-500'
              )}
            />
            <span className={liked ? 'text-red-500 font-semibold' : 'text-gray-600'}>
              {poll.like_count}
            </span>
          </Button>

          {!voted && (
            <span className="text-xs font-medium text-gray-500">
              Click to vote
            </span>
          )}
        </CardFooter>
      </div>
    </Card>
  );
}
