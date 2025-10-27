import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Option {
  id?: number;
  text: string;
  vote_count?: number;
}

export interface Poll {
  id: number;
  title: string;
  description?: string;
  created_by: string;
  created_at: string;
  like_count: number;
  options: Option[];
  total_votes: number;
}

export interface CreatePollData {
  title: string;
  description?: string;
  created_by: string;
  options: { text: string }[];
}

export const pollsApi = {
  getAll: async (): Promise<Poll[]> => {
    const response = await api.get('/polls/');
    return response.data;
  },

  getById: async (id: number): Promise<Poll> => {
    const response = await api.get(`/polls/${id}`);
    return response.data;
  },

  create: async (data: CreatePollData): Promise<Poll> => {
    const response = await api.post('/polls/', data);
    return response.data;
  },

  vote: async (pollId: number, optionId: number, userId: string): Promise<void> => {
    await api.post(`/polls/${pollId}/votes`, {
      option_id: optionId,
      user_id: userId
    });
  },

  getUserVote: async (pollId: number, userId: string): Promise<{ option_id: number } | null> => {
    try {
      const response = await api.get(`/polls/${pollId}/votes/${userId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      throw error;
    }
  },

  toggleLike: async (pollId: number, userId: string): Promise<{ is_liked: boolean; like_count: number }> => {
    const response = await api.post(`/polls/${pollId}/likes`, { user_id: userId });
    return response.data;
  },

  checkUserLike: async (pollId: number, userId: string): Promise<boolean> => {
    const response = await api.get(`/polls/${pollId}/likes/${userId}`);
    return response.data.is_liked;
  },
};