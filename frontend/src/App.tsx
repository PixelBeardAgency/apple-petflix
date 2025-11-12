import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { SearchPage } from './pages/SearchPage';
import { ShareVideoPage } from './pages/ShareVideoPage';
import { FeedPage } from './pages/FeedPage';
import { VideoDetailPage } from './pages/VideoDetailPage';
import { PlaylistsPage } from './pages/PlaylistsPage';
import { PlaylistDetailPage } from './pages/PlaylistDetailPage';
import './index.css';

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Public Route wrapper (redirect to feed if logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/feed" replace />;
  }

  return <>{children}</>;
}

function TermsPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-6">Terms of Service</h1>
        <div className="text-muted-foreground space-y-4">
          <p>Last updated: November 12, 2024</p>
          <p>
            By using Petflix, you agree to these terms. Please read them carefully.
          </p>
          <h2 className="text-xl font-semibold text-foreground mt-6">Acceptance of Terms</h2>
          <p>
            By accessing and using Petflix, you accept and agree to be bound by these Terms of Service.
          </p>
          <h2 className="text-xl font-semibold text-foreground mt-6">User Conduct</h2>
          <p>
            You agree to use Petflix responsibly and not to share inappropriate content or engage in harmful behavior.
          </p>
          <h2 className="text-xl font-semibold text-foreground mt-6">Content</h2>
          <p>
            All videos are sourced from YouTube. Petflix is not responsible for the content of third-party videos.
          </p>
        </div>
      </div>
    </div>
  );
}

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-6">Privacy Policy</h1>
        <div className="text-muted-foreground space-y-4">
          <p>Last updated: November 12, 2024</p>
          <p>
            This Privacy Policy describes how Petflix collects, uses, and shares your personal information.
          </p>
          <h2 className="text-xl font-semibold text-foreground mt-6">Information We Collect</h2>
          <p>
            We collect information you provide directly to us, such as your email, username, and profile information.
          </p>
          <h2 className="text-xl font-semibold text-foreground mt-6">How We Use Your Information</h2>
          <p>
            We use your information to provide and improve our services, and to communicate with you.
          </p>
          <h2 className="text-xl font-semibold text-foreground mt-6">Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information.
          </p>
        </div>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      
      {/* Auth routes (redirect if logged in) */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* Protected routes */}
      <Route
        path="/feed"
        element={
          <ProtectedRoute>
            <FeedPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/share"
        element={
          <ProtectedRoute>
            <ShareVideoPage />
          </ProtectedRoute>
        }
      />
      <Route path="/video/:videoId" element={<VideoDetailPage />} />
      <Route
        path="/playlists"
        element={
          <ProtectedRoute>
            <PlaylistsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/playlists/:playlistId"
        element={
          <ProtectedRoute>
            <PlaylistDetailPage />
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
