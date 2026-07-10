import type { User } from "./auth";
import type { Coin } from "./coins";

export type PostMediaType = "image" | "video";

export interface PostMedia {
  id: number;
  url: string;
  type: PostMediaType;
  mimeType: string;
  order: number;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  media: PostMedia[];
  userId: number;
  author: User;
  coinId?: number | null;
  coin?: Coin;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostPayload {
  title: string;
  content: string;
  coinId?: number;
  media?: File[];
}

export type UpdatePostPayload = Partial<CreatePostPayload>;
