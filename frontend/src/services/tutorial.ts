import { API_URL } from '../config/api';

class TutorialService {
  private async getAuthToken(): Promise<string> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }
    return token;
  }

  /**
   * Get tutorial status for current user
   */
  async getStatus(): Promise<{ completed: boolean; skipped: boolean }> {
    const token = await this.getAuthToken();
    const response = await fetch(`${API_URL}/api/tutorial/status`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get tutorial status');
    }

    return response.json();
  }

  /**
   * Mark tutorial as completed
   */
  async complete(): Promise<void> {
    const token = await this.getAuthToken();
    const response = await fetch(`${API_URL}/api/tutorial/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to mark tutorial as completed');
    }
  }

  /**
   * Mark tutorial as skipped
   */
  async skip(): Promise<void> {
    const token = await this.getAuthToken();
    const response = await fetch(`${API_URL}/api/tutorial/skip`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to mark tutorial as skipped');
    }
  }

  /**
   * Reset tutorial status
   */
  async reset(): Promise<void> {
    const token = await this.getAuthToken();
    const response = await fetch(`${API_URL}/api/tutorial/reset`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to reset tutorial status');
    }
  }
}

export const tutorialService = new TutorialService();

