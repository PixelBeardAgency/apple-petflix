import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { ThemeToggle } from './ThemeToggle';
import { NotificationBell } from './NotificationBell';

export function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-foreground">
          🐾 Petflix
        </Link>
        <nav className="flex items-center space-x-2 sm:space-x-4">
          <ThemeToggle />
          {user ? (
            <>
              <NotificationBell />
              <Link to="/search">
                <Button variant="ghost" size="sm">
                  Search
                </Button>
              </Link>
              <Link to="/share">
                <Button variant="ghost" size="sm">
                  Share
                </Button>
              </Link>
              <Link to="/feed">
                <Button variant="ghost" size="sm">
                  Feed
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="ghost" size="sm">
                  Profile
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/search">
                <Button variant="ghost" size="sm">
                  Search
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

