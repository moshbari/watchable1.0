import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface YouTubePlayerProps {
  videoId: string;
  onStateChange?: (isPlaying: boolean) => void;
  onVolumeChange?: (volume: number, isMuted: boolean) => void;
  onError?: (error: string) => void;
  savedProgress?: number;
  onProgressUpdate?: (currentTime: number) => void;
  showControls: boolean;
  onFullscreen: () => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  onStateChange,
  onVolumeChange,
  onError,
  savedProgress,
  onProgressUpdate,
  showControls,
  onFullscreen
}) => {
  const playerRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const progressIntervalRef = useRef<NodeJS.Timeout>();

  // Load YouTube API
  useEffect(() => {
    const loadYouTubeAPI = () => {
      if (window.YT && window.YT.Player) {
        initializePlayer();
        return;
      }

      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        script.async = true;
        document.head.appendChild(script);
      }

      window.onYouTubeIframeAPIReady = initializePlayer;
    };

    const initializePlayer = () => {
      if (playerRef.current && !ytPlayerRef.current) {
        try {
          ytPlayerRef.current = new window.YT.Player(playerRef.current, {
            videoId: videoId,
            width: '100%',
            height: '100%',
            playerVars: {
              controls: 0,
              disablekb: 1,
              fs: 0,
              modestbranding: 1,
              rel: 0,
              showinfo: 0,
              iv_load_policy: 3,
              cc_load_policy: 0,
              autohide: 1,
              playsinline: 1,
              origin: window.location.origin
            },
            events: {
              onReady: (event: any) => {
                console.log('YouTube player ready');
                setIsLoading(false);
                event.target.setVolume(volume);
                if (savedProgress && savedProgress > 10) {
                  event.target.seekTo(savedProgress, true);
                }
              },
              onStateChange: (event: any) => {
                const isCurrentlyPlaying = event.data === window.YT.PlayerState.PLAYING;
                setIsPlaying(isCurrentlyPlaying);
                onStateChange?.(isCurrentlyPlaying);

                if (isCurrentlyPlaying) {
                  startProgressTracking();
                } else {
                  stopProgressTracking();
                }
              },
              onError: (event: any) => {
                console.error('YouTube player error:', event.data);
                setIsLoading(false);
                onError?.('YouTube video failed to load. Please check the URL and try again.');
              }
            }
          });
        } catch (error) {
          console.error('Error initializing YouTube player:', error);
          setIsLoading(false);
          onError?.('Failed to initialize YouTube player.');
        }
      }
    };

    loadYouTubeAPI();

    return () => {
      stopProgressTracking();
      if (ytPlayerRef.current && ytPlayerRef.current.destroy) {
        ytPlayerRef.current.destroy();
      }
    };
  }, [videoId]);

  const startProgressTracking = () => {
    if (progressIntervalRef.current) return;
    
    progressIntervalRef.current = setInterval(() => {
      if (ytPlayerRef.current && ytPlayerRef.current.getCurrentTime) {
        const currentTime = ytPlayerRef.current.getCurrentTime();
        onProgressUpdate?.(currentTime);
      }
    }, 5000);
  };

  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = undefined;
    }
  };

  const handlePlay = () => {
    if (!ytPlayerRef.current) return;
    
    try {
      if (isPlaying) {
        ytPlayerRef.current.pauseVideo();
      } else {
        ytPlayerRef.current.playVideo();
      }
    } catch (error) {
      console.error('Error controlling YouTube playback:', error);
    }
  };

  const handleVolumeToggle = () => {
    if (!ytPlayerRef.current) return;
    
    try {
      if (isMuted) {
        ytPlayerRef.current.unMute();
        ytPlayerRef.current.setVolume(volume);
        setIsMuted(false);
        onVolumeChange?.(volume / 100, false);
      } else {
        ytPlayerRef.current.mute();
        setIsMuted(true);
        onVolumeChange?.(0, true);
      }
    } catch (error) {
      console.error('Error controlling YouTube volume:', error);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    if (!ytPlayerRef.current) return;
    
    try {
      const newVolume = value[0];
      setVolume(newVolume);
      ytPlayerRef.current.setVolume(newVolume);
      
      if (newVolume === 0) {
        ytPlayerRef.current.mute();
        setIsMuted(true);
        onVolumeChange?.(0, true);
      } else {
        ytPlayerRef.current.unMute();
        setIsMuted(false);
        onVolumeChange?.(newVolume / 100, false);
      }
    } catch (error) {
      console.error('Error setting YouTube volume:', error);
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* YouTube Player Container */}
      <div 
        ref={playerRef}
        className="w-full h-full"
        style={{ pointerEvents: 'none' }}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-player-overlay flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-player-accent animate-spin" />
        </div>
      )}

      {/* Custom Controls Overlay */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-300 pointer-events-none",
          showControls || !isPlaying ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Play/Pause Center Button */}
        {!isPlaying && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePlay}
              className="w-20 h-20 rounded-full bg-player-overlay hover:bg-player-controls-hover border border-player-border"
            >
              <Play className="w-8 h-8 text-player-accent" fill="currentColor" />
            </Button>
          </div>
        )}

        {/* Bottom Controls Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-controls p-4 pointer-events-auto">
          <div className="flex items-center gap-4">
            {/* Play/Pause */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePlay}
              className="text-foreground hover:text-player-accent hover:bg-player-controls-hover"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" fill="currentColor" />
              )}
            </Button>

            {/* Volume Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleVolumeToggle}
                className="text-foreground hover:text-player-accent hover:bg-player-controls-hover"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </Button>
              <div className="w-20">
                <Slider
                  value={[isMuted ? 0 : volume]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                  className="cursor-pointer"
                />
              </div>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Fullscreen */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onFullscreen}
              className="text-foreground hover:text-player-accent hover:bg-player-controls-hover"
            >
              <Maximize className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};