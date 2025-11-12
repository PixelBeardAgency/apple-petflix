# Petflix Frontend

React + TypeScript PWA for Petflix.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy the example environment file:

```bash
cp env.example .env
```

Edit `.env` and fill in your values:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:3001
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
```

### 3. Run Development Server

```bash
npm run dev
```

The app will start on http://localhost:5173

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

### Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   │   └── ui/        # Shadcn UI components
│   ├── pages/         # Page components
│   ├── services/      # API services (auth, videos, etc.)
│   ├── contexts/      # React contexts (Auth)
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utilities and helpers
│   ├── types/         # TypeScript type definitions
│   ├── App.tsx        # Main app component with routing
│   ├── main.tsx       # Entry point
│   └── index.css      # Global styles
├── public/            # Static assets
└── index.html         # HTML template
```

## Features Implemented

### Phase 2: Authentication ✅
- User registration with validation
- User login
- Protected routes
- Profile viewing and editing
- Supabase Auth integration

### Coming Soon
- Phase 3: Video search and sharing
- Phase 4: Social features (following, comments)
- Phase 5: Playlists and tags
- Phase 6: PWA features (offline support, install prompts)
- Phase 7: TV casting
- Phase 8: Push notifications
- And more...

## UI Components

The app uses Shadcn UI components built on Radix UI primitives. Components include:

- Button
- Input
- Label
- Card
- Dialog (coming soon)
- Toast (coming soon)
- And more...

## Styling

- **Framework**: TailwindCSS
- **Color Palette**:
  - Primary: Light Blue (#ADD8E6)
  - Secondary: Charcoal (#36454F)
  - Background: Cream (#F0F0DC)

## Routes

- `/` - Landing page
- `/login` - Login page
- `/register` - Registration page
- `/feed` - User feed (protected)
- `/search` - Search videos
- `/profile` - User profile (protected)
- `/terms` - Terms of Service
- `/privacy` - Privacy Policy

## Authentication Flow

1. User registers or logs in
2. Supabase Auth creates session
3. JWT token stored in browser
4. Token sent with API requests
5. Protected routes check for valid session

## Building for Production

```bash
npm run build
```

Output will be in `dist/` directory.

### Deployment

Recommended platforms:
- Vercel (recommended)
- Netlify
- Cloudflare Pages

All platforms support automatic deployments from Git.

### Environment Variables for Production

Set these in your hosting platform:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL` (your production backend URL)
- `VITE_VAPID_PUBLIC_KEY`

## PWA Features (Phase 6)

The app is configured as a Progressive Web App:

- Installable on desktop and mobile
- Offline support for cached content
- App shortcuts
- Push notifications support

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Development Tips

### Hot Reload

Vite provides instant hot module replacement (HMR) for fast development.

### Type Checking

TypeScript is configured in strict mode. Run type checking:

```bash
npx tsc --noEmit
```

### Code Quality

- ESLint for linting
- Prettier (via ESLint) for formatting

## Troubleshooting

### "Module not found" errors

Make sure all dependencies are installed:
```bash
npm install
```

### Environment variables not working

Environment variables must be prefixed with `VITE_` to be accessible in the app.

### Supabase connection issues

1. Verify your Supabase URL and anon key in `.env`
2. Check that your Supabase project is active
3. Verify the database migrations have been run

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

ISC
