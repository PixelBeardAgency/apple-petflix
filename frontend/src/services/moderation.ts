import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export class ModerationService {
  private async getAuthToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  }

  async getReports(limit: number = 50, offset: number = 0, status: string = 'pending') {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('You must be logged in');
    }

    const response = await fetch(
      `${API_URL}/api/moderation/reports?limit=${limit}&offset=${offset}&status=${status}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get reports');
    }

    return response.json();
  }

  async updateReport(reportId: string, status: string, resolutionNotes?: string) {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('You must be logged in');
    }

    const response = await fetch(`${API_URL}/api/moderation/reports/${reportId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status, resolution_notes: resolutionNotes }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to update report');
    }

    return response.json();
  }

  async getStats() {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('You must be logged in');
    }

    const response = await fetch(`${API_URL}/api/moderation/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get stats');
    }

    return response.json();
  }
}

export const moderationService = new ModerationService();

