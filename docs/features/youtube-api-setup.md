# YouTube API Setup Guide

This guide provides step-by-step instructions for obtaining and configuring a YouTube Data API v3 key for the Petflix backend.

## Prerequisites

- A Google account
- Access to Google Cloud Console

## Steps

### 1. Navigate to Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account if not already signed in

### 2. Create a New Project (or Select Existing)

1. Click on the project dropdown in the top navigation bar
2. Click "NEW PROJECT" button
3. Enter a project name (e.g., "Petflix")
4. Select your organization (if applicable)
5. Click "CREATE"
6. Wait for the project to be created (this may take a few moments)

### 3. Enable YouTube Data API v3

1. In the left sidebar, navigate to "APIs & Services" > "Library"
2. In the search bar, type "YouTube Data API v3"
3. Click on "YouTube Data API v3" from the search results
4. Click the "ENABLE" button
5. Wait for the API to be enabled

### 4. Create API Credentials

1. After enabling the API, you'll be redirected to the API dashboard
2. Click "CREATE CREDENTIALS" button at the top
3. Select "API key" from the dropdown
4. Your API key will be generated and displayed in a popup

### 5. Restrict Your API Key (Recommended for Security)

1. In the API key popup, click "EDIT API KEY" or navigate to "APIs & Services" > "Credentials"
2. Click on your API key to edit it
3. Under "API restrictions":
   - Select "Restrict key"
   - Check "YouTube Data API v3"
4. Under "Application restrictions" (for production):
   - Select "HTTP referrers (web sites)"
   - Add your backend server's domain/IP
   - For development, you can use "None" but remember to restrict it later
5. Click "SAVE"

### 6. Set Daily Quota Limits

The YouTube Data API v3 has a free tier quota of **10,000 units per day**. Understanding quota costs:

- **Search requests**: 100 units each
- **Video details requests**: 1 unit each
- **Trending videos**: 100 units each

**Important**: The Petflix backend implements aggressive caching to minimize API calls:
- Trending videos: Cached for 1 hour
- Search results: Cached for 5 minutes
- Video details: Cached for 1 hour

### 7. Add API Key to Backend Environment

1. Copy your API key
2. Navigate to your Petflix backend directory
3. Create a `.env` file (if it doesn't exist):
   ```bash
   cp env.example .env
   ```
4. Open `.env` and add your API key:
   ```
   YOUTUBE_API_KEY=your_api_key_here
   ```
5. **Important**: Never commit your `.env` file to version control

### 8. Verify API Key Works

1. Start your backend server:
   ```bash
   cd backend
   npm run dev
   ```
2. Test the YouTube API by making a search request to your backend
3. Check the logs for successful API calls

## Monitoring Quota Usage

The Petflix backend tracks quota usage automatically:

- Current usage is logged with each API call
- Warnings are issued at 80% quota usage (8,000 units)
- Requests are blocked if quota exceeds 10,000 units
- Quota resets automatically at midnight (Pacific Time)

To check current quota usage:
- View backend logs for quota usage messages
- Access the Google Cloud Console > APIs & Services > Dashboard
- Click on "YouTube Data API v3" to see usage graphs

## Troubleshooting

### "API key not valid" Error

1. Verify the API key is correctly copied to `.env`
2. Check that YouTube Data API v3 is enabled
3. Ensure API restrictions allow your server's requests
4. Wait a few minutes for changes to propagate

### "Quota Exceeded" Error

1. Check your quota usage in Google Cloud Console
2. Wait until midnight Pacific Time for quota reset
3. Consider implementing more aggressive caching
4. For production, request a quota increase from Google

### "Access Not Configured" Error

1. Ensure YouTube Data API v3 is enabled for your project
2. Verify billing is set up (required for some features)
3. Check that the correct project is selected

## Best Practices

1. **Never expose your API key publicly**
   - Don't commit it to version control
   - Don't include it in client-side code
   - Keep it in environment variables only

2. **Implement caching**
   - Cache search results to reduce API calls
   - Use longer cache times for trending/popular content
   - The backend implements this by default

3. **Monitor usage**
   - Set up alerts in Google Cloud Console
   - Review daily usage patterns
   - Optimize frequently-called endpoints

4. **Secure your key**
   - Use API restrictions (IP/HTTP referrer limits)
   - Rotate keys periodically
   - Revoke compromised keys immediately

5. **For production deployment**
   - Request quota increase if needed
   - Enable billing for higher limits
   - Set up proper monitoring and alerting

## Additional Resources

- [YouTube Data API v3 Documentation](https://developers.google.com/youtube/v3)
- [YouTube API Quota Calculator](https://developers.google.com/youtube/v3/determine_quota_cost)
- [Google Cloud Console](https://console.cloud.google.com/)
- [API Key Best Practices](https://cloud.google.com/docs/authentication/api-keys)

## Support

If you encounter issues not covered in this guide:

1. Check the [YouTube API Error Codes](https://developers.google.com/youtube/v3/docs/errors)
2. Review backend logs for detailed error messages
3. Consult the Google Cloud Console for quota and billing information

