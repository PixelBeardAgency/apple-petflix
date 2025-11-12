import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export class CommentService {
  private async getAuthToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  }

  async getComments(videoId: string, limit: number = 20, offset: number = 0) {
    const response = await fetch(
      `${API_URL}/api/comments/video/${videoId}?limit=${limit}&offset=${offset}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get comments');
    }

    return response.json();
  }

  async createComment(videoId: string, text: string) {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('You must be logged in to comment');
    }

    const response = await fetch(`${API_URL}/api/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ videoId, text }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to create comment');
    }

    return response.json();
  }

  async updateComment(commentId: string, text: string) {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('You must be logged in to update comments');
    }

    const response = await fetch(`${API_URL}/api/comments/${commentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to update comment');
    }

    return response.json();
  }

  async deleteComment(commentId: string): Promise<void> {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('You must be logged in to delete comments');
    }

    const response = await fetch(`${API_URL}/api/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to delete comment');
    }
  }
}

export const commentService = new CommentService();

