import { apiClient } from './index';
import type { Comment, CreateCommentPayload, CreatePostPayload, Post } from '../types/community';

export const communityApi = {
  listPosts: async (category?: string): Promise<Post[]> => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    const res = await apiClient.get<Post[]>(`/api/community/posts?${params.toString()}`);
    return res.data;
  },

  getPostByID: async (id: string): Promise<Post> => {
    const res = await apiClient.get<Post>(`/api/community/posts/${id}`);
    return res.data;
  },

  createPost: async (payload: CreatePostPayload): Promise<Post> => {
    const res = await apiClient.post<Post>('/api/community/posts', payload);
    return res.data;
  },

  toggleUpvote: async (postId: string): Promise<{ isUpvoted: boolean }> => {
    const res = await apiClient.post<{ isUpvoted: boolean }>(`/api/community/posts/${postId}/upvote`);
    return res.data;
  },

  listComments: async (postId: string): Promise<Comment[]> => {
    const res = await apiClient.get<Comment[]>(`/api/community/posts/${postId}/comments`);
    return res.data;
  },

  createComment: async (postId: string, payload: CreateCommentPayload): Promise<Comment> => {
    const res = await apiClient.post<Comment>(`/api/community/posts/${postId}/comments`, payload);
    return res.data;
  },
};
