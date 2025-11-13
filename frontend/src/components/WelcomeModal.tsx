import React from 'react';
import { X, Sparkles, Search, Share2, Users, Bell } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface WelcomeModalProps {
  onStartTutorial: () => void;
  onSkip: () => void;
}

export function WelcomeModal({ onStartTutorial, onSkip }: WelcomeModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="max-w-2xl mx-4 shadow-2xl border-2">
        <CardHeader className="relative pb-4">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 h-8 w-8"
            onClick={onSkip}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-3 mb-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl">Welcome to Petflix! 🐾</CardTitle>
          </div>
          <p className="text-muted-foreground">
            Your home for discovering, sharing, and enjoying adorable pet videos
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Feature Highlights */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
              <Search className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground">Search & Discover</h3>
                <p className="text-sm text-muted-foreground">
                  Find millions of pet videos from YouTube
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
              <Share2 className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground">Share Videos</h3>
                <p className="text-sm text-muted-foreground">
                  Share your favorite finds with the community
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
              <Users className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground">Follow Friends</h3>
                <p className="text-sm text-muted-foreground">
                  See what pet lovers you follow are sharing
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
              <Bell className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground">Get Notified</h3>
                <p className="text-sm text-muted-foreground">
                  Never miss new videos and interactions
                </p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="space-y-3 pt-4">
            <Button
              onClick={onStartTutorial}
              className="w-full text-lg h-12"
              size="lg"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Take a Quick Tour
            </Button>
            <Button
              onClick={onSkip}
              variant="outline"
              className="w-full"
            >
              Skip for Now
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            You can restart this tour anytime from your profile settings
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

