import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Search, Share2, Home, User, Bell, LogOut, List } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ThemeToggle } from './ThemeToggle';
import { NotificationBell } from './NotificationBell';
import { Button } from './ui/button';

export function Header() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            onClick={closeMobileMenu}
          >
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              Petflix
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                <Link
                  to="/search"
                  data-onboarding="search"
                  className="flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary"
                >
                  <Search className="h-4 w-4" />
                  <span>Search</span>
                </Link>
                <Link
                  to="/share"
                  data-onboarding="share"
                  className="flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </Link>
                <Link
                  to="/feed"
                  data-onboarding="feed"
                  className="flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary"
                >
                  <Home className="h-4 w-4" />
                  <span>Feed</span>
                </Link>
                <Link
                  to="/playlists"
                  className="flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary"
                >
                  <List className="h-4 w-4" />
                  <span>Playlists</span>
                </Link>
                <NotificationBell />
                <Link
                  to="/profile"
                  data-onboarding="profile"
                  className="flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary"
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/search"
                  className="flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary"
                >
                  <Search className="h-4 w-4" />
                  <span>Search</span>
                </Link>
                <ThemeToggle />
                <Link to="/auth">
                  <Button size="sm">Sign In</Button>
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 md:hidden">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t animate-in slide-in-from-top-5">
            <nav className="flex flex-col space-y-1 py-4">
              {user ? (
                <>
                  <Link
                    to="/search"
                    data-onboarding="search"
                    className="flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground rounded-md"
                    onClick={closeMobileMenu}
                  >
                    <Search className="h-5 w-5" />
                    <span>Search Videos</span>
                  </Link>
                  <Link
                    to="/share"
                    data-onboarding="share"
                    className="flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground rounded-md"
                    onClick={closeMobileMenu}
                  >
                    <Share2 className="h-5 w-5" />
                    <span>Share Video</span>
                  </Link>
                  <Link
                    to="/feed"
                    data-onboarding="feed"
                    className="flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground rounded-md"
                    onClick={closeMobileMenu}
                  >
                    <Home className="h-5 w-5" />
                    <span>My Feed</span>
                  </Link>
                  <Link
                    to="/playlists"
                    className="flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground rounded-md"
                    onClick={closeMobileMenu}
                  >
                    <List className="h-5 w-5" />
                    <span>Playlists</span>
                  </Link>
                  <Link
                    to="/notifications"
                    className="flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground rounded-md"
                    onClick={closeMobileMenu}
                  >
                    <Bell className="h-5 w-5" />
                    <span>Notifications</span>
                  </Link>
                  <Link
                    to="/profile"
                    data-onboarding="profile"
                    className="flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground rounded-md"
                    onClick={closeMobileMenu}
                  >
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground rounded-md text-left w-full"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/search"
                    className="flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground rounded-md"
                    onClick={closeMobileMenu}
                  >
                    <Search className="h-5 w-5" />
                    <span>Search Videos</span>
                  </Link>
                  <Link
                    to="/auth"
                    className="flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground rounded-md"
                    onClick={closeMobileMenu}
                  >
                    <User className="h-5 w-5" />
                    <span>Sign In</span>
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
