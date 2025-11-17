import { API_URL } from '../config/api';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

class ProfileService {
  private async getAuthToken(): Promise<string> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }
    return token;
  }

  /**
   * Search for profiles by username
   */
  async searchProfiles(query: string): Promise<User[]> {
    const token = await this.getAuthToken();
    const response = await fetch(
      `${API_URL}/api/profiles/search?query=${encodeURIComponent(query)}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to search profiles');
    }

    return response.json();
  }

  /**
   * Get a profile by ID
   */
  async getProfile(userId: string): Promise<User> {
    const token = await this.getAuthToken();
    const response = await fetch(`${API_URL}/api/profiles/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to get profile');
    }

    return response.json();
  }

  /**
   * Update current user's profile
   */
  async updateProfile(updates: {
    username?: string;
    bio?: string;
    profile_picture_url?: string;
  }): Promise<User> {
    const token = await this.getAuthToken();
    const response = await fetch(`${API_URL}/api/profiles`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to update profile');
    }

    return response.json();
  }

  /**
   * Upload profile picture to Supabase Storage
   */
  async uploadProfilePicture(file: File, userId: string): Promise<string> {
    // Generate a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  /**
   * Delete old profile picture from storage
   */
  async deleteProfilePicture(pictureUrl: string): Promise<void> {
    try {
      // Extract file path from URL
      const urlParts = pictureUrl.split('/avatars/');
      if (urlParts.length !== 2) return; // Not a storage URL

      const filePath = urlParts[1];
      
      await supabase.storage
        .from('avatars')
        .remove([filePath]);
    } catch (error) {
      // Silently fail - old image cleanup is not critical
      console.error('Failed to delete old profile picture:', error);
    }
  }
}

export const profileService = new ProfileService();

