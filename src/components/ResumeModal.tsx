import React from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ResumeModalProps {
  isOpen: boolean;
  onChoice: (shouldResume: boolean) => void;
  timestamp: number;
}

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export const ResumeModal: React.FC<ResumeModalProps> = ({ isOpen, onChoice, timestamp }) => {
  return (
    <Dialog open={isOpen} onOpenChange={() => onChoice(false)}>
      <DialogContent className="sm:max-w-md bg-gradient-overlay border-player-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Resume Playback</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            You were watching this video. Would you like to continue from where you left off?
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 mt-4">
          <div className="text-center py-4">
            <div className="text-2xl font-mono text-player-accent mb-1">
              {formatTime(timestamp)}
            </div>
            <div className="text-sm text-muted-foreground">
              Last watched position
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={() => onChoice(true)}
              className="flex-1 bg-player-accent hover:bg-player-accent/90 text-player-bg"
            >
              <Play className="w-4 h-4 mr-2" fill="currentColor" />
              Resume from {formatTime(timestamp)}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => onChoice(false)}
              className="flex-1 border-player-border hover:bg-player-controls-hover"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Start from beginning
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};