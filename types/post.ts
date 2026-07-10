import type { User } from "./auth";
import type { Coin } from "./coins";

export interface Post {
  id: number;
  title: string;
  content: string;
  image?: string | null;
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
  image?: File;
}

export type UpdatePostPayload = Partial<CreatePostPayload>;
