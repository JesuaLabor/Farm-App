import type { Role } from './auth';

export type PostCategory =
  | 'general'
  | 'crop_advice'
  | 'pest_control'
  | 'market_talk'
  | 'equipment';

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  authorPhotoUrl?: string;
  title: string;
  body: string;
  category: PostCategory;
  imageUrl?: string;
  upvotes: number;
  commentsCount: number;
  isFlagged: boolean;
  isRemoved: boolean;
  createdAt: string;
  updatedAt: string;
  isUpvotedByMe?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  authorPhotoUrl?: string;
  body: string;
  isFlagged: boolean;
  isRemoved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostPayload {
  title: string;
  body: string;
  category: PostCategory;
  imageUrl?: string;
}

export interface CreateCommentPayload {
  body: string;
}
