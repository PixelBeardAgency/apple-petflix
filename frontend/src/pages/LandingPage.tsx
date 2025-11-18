import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { ThemeToggle } from '../components/ThemeToggle';

export function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl sm:text-2xl font-bold text-foreground">
            🐾 Petflix
          </Link>
          <nav className="flex items-center space-x-2 sm:space-x-4">
            <ThemeToggle />
            {user ? (
              <>
                <Link to="/feed">
                  <Button variant="ghost" size="sm" className="text-xs sm:text-sm">Feed</Button>
                </Link>
                <Link to="/profile">
                  <Button variant="ghost" size="sm" className="text-xs sm:text-sm">Profile</Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-xs sm:text-sm">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="text-xs sm:text-sm">Get Started</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-8 sm:py-16">
        <div className="text-center max-w-3xl mx-auto space-y-6 sm:space-y-8">
          {/* Hero Text */}
          <div className="space-y-3 sm:space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
              Discover & Share
              <br />
              <span className="text-lightblue">Adorable Pet Videos</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground px-4">
              Join a community of pet lovers. Search, share, and enjoy the cutest pet videos
              from YouTube.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
            <Link to="/search" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-sm sm:text-base">
                🔍 Search for Pet Videos
              </Button>
            </Link>
            {!user && (
              <Link to="/register" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-sm sm:text-base">
                  Create Account
                </Button>
              </Link>
            )}
          </div>

          {/* Hero Image/Illustration Placeholder */}
          <div className="mt-8 sm:mt-12 rounded-lg bg-lightblue/20 p-8 sm:p-12 border border-lightblue/30">
            <div className="text-4xl sm:text-6xl">🐶 🐱 🐰 🐹 🦜 🐠</div>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground">
              Your favorite pet videos, all in one place
            </p>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 sm:mt-24 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
          <div className="text-center space-y-3 p-4">
            <div className="text-3xl sm:text-4xl">🔍</div>
            <h3 className="text-lg sm:text-xl font-semibold text-foreground">Search & Discover</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Find pet videos from YouTube with powerful search and filters
            </p>
          </div>
          <div className="text-center space-y-3 p-4">
            <div className="text-3xl sm:text-4xl">💬</div>
            <h3 className="text-lg sm:text-xl font-semibold text-foreground">Share & Engage</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Share your favorites and comment on videos with fellow pet lovers
            </p>
          </div>
          <div className="text-center space-y-3 p-4">
            <div className="text-3xl sm:text-4xl">👥</div>
            <h3 className="text-lg sm:text-xl font-semibold text-foreground">Follow & Connect</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Follow users with similar tastes and build your pet video community
            </p>
          </div>
        </div>

        {/* Additional Features */}
        <div className="mt-16 sm:mt-24 max-w-3xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-8 sm:mb-12">
            Why Petflix?
          </h2>
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-start space-x-3 sm:space-x-4">
              <div className="text-xl sm:text-2xl flex-shrink-0">📱</div>
              <div>
                <h4 className="font-semibold text-foreground text-sm sm:text-base">Progressive Web App</h4>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Install Petflix on your phone or desktop for a native app experience
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 sm:space-x-4">
              <div className="text-xl sm:text-2xl flex-shrink-0">🔔</div>
              <div>
                <h4 className="font-semibold text-foreground text-sm sm:text-base">Stay Updated</h4>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Get notifications when your favorite creators share new videos
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 sm:space-x-4">
              <div className="text-xl sm:text-2xl flex-shrink-0">📺</div>
              <div>
                <h4 className="font-semibold text-foreground text-sm sm:text-base">TV Casting</h4>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Cast videos to your TV with Chromecast or AirPlay
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 sm:space-x-4">
              <div className="text-xl sm:text-2xl flex-shrink-0">🎯</div>
              <div>
                <h4 className="font-semibold text-foreground text-sm sm:text-base">Create Playlists</h4>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Organize your favorite pet videos into custom playlists
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        {!user && (
          <div className="mt-16 sm:mt-24 text-center p-8 sm:p-12 rounded-lg bg-lightblue/10 border border-lightblue/30 mx-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Ready to join the fun?
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">
              Create your free account and start sharing pet videos today!
            </p>
            <Link to="/register">
              <Button size="lg" className="text-sm sm:text-base">Get Started Free</Button>
            </Link>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-charcoal/10 mt-16 sm:mt-24">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-3 sm:space-y-4 md:space-y-0">
            <div className="text-muted-foreground text-xs sm:text-sm">
              © 2025 Petflix. All rights reserved.
            </div>
            <div className="flex space-x-4 sm:space-x-6 text-xs sm:text-sm">
              <Link to="/terms" className="text-muted-foreground hover:text-foreground">
                Terms of Service
              </Link>
              <Link to="/privacy" className="text-muted-foreground hover:text-foreground">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

