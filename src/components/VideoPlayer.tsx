import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ResumeModal } from './ResumeModal';
import { YouTubePlayer } from './YouTubePlayer';
import { useVideoProgress } from '@/hooks/useVideoProgress';
import { extractVideoUrl, isYouTubeUrl, getYouTubeId } from '@/lib/videoUtils';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  src: string;
  onError?: (error: string) => void;
  playButtonColor?: string;
  playButtonSize?: number;
}

interface VideoState {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  isFullscreen: boolean;
  showControls: boolean;
  isLoading: boolean;
  error: string | null;
  shouldSeekTo?: number;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  src, 
  onError, 
  playButtonColor = '#ff0000', 
  playButtonSize = 96 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Extract the actual video URL (handles URLs with video parameters)
  const actualVideoUrl = extractVideoUrl(src);
  console.log('Original URL:', src);
  console.log('Extracted URL:', actualVideoUrl);
  
  const { savedProgress, saveProgress, clearProgress, showResumeModal, setShowResumeModal } = useVideoProgress(src);
  
  const [state, setState] = useState<VideoState>({
    isPlaying: false,
    isMuted: false,
    volume: 0.8,
    isFullscreen: false,
    showControls: true,
    isLoading: true,
    error: null
  });

  // Detect if source is YouTube using the extracted URL
  const isYoutube = isYouTubeUrl(actualVideoUrl);
  const youtubeId = isYoutube ? getYouTubeId(actualVideoUrl) : null;

  // Video event handlers for regular HTML5 videos
  const handlePlay = () => {
    if (videoRef.current) {
      if (state.isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleVolumeToggle = () => {
    if (videoRef.current) {
      const newMuted = !state.isMuted;
      videoRef.current.muted = newMuted;
      setState(prev => ({ ...prev, isMuted: newMuted }));
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const volume = value[0] / 100;
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = volume === 0;
      setState(prev => ({ 
        ...prev, 
        volume,
        isMuted: volume === 0
      }));
    }
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const showControlsTemporarily = () => {
    setState(prev => ({ ...prev, showControls: true }));
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    controlsTimeoutRef.current = setTimeout(() => {
      setState(prev => ({ ...prev, showControls: false }));
    }, 3000);
  };

  const handleMouseMove = () => {
    if (state.isPlaying) {
      showControlsTemporarily();
    }
  };

  const handleResumeChoice = (shouldResume: boolean) => {
    setShowResumeModal(false);
    if (shouldResume && savedProgress) {
      if (isYoutube) {
        // For YouTube videos, we'll trigger the seek through a state change
        setState(prev => ({ ...prev, shouldSeekTo: savedProgress }));
      } else if (videoRef.current) {
        videoRef.current.currentTime = savedProgress;
      }
    }
  };

  // YouTube player event handlers
  const handleYouTubeStateChange = (isPlaying: boolean) => {
    setState(prev => ({ ...prev, isPlaying }));
  };

  const handleYouTubeVolumeChange = (volume: number, isMuted: boolean) => {
    setState(prev => ({ ...prev, volume, isMuted }));
  };

  const handleYouTubeError = (error: string) => {
    setState(prev => ({ ...prev, error, isLoading: false }));
    onError?.(error);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          handlePlay();
          break;
        case 'KeyF':
          e.preventDefault();
          handleFullscreen();
          break;
        case 'KeyM':
          e.preventDefault();
          handleVolumeToggle();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [state.isPlaying]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setState(prev => ({ 
        ...prev, 
        isFullscreen: !!document.fullscreenElement 
      }));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Video event listeners for HTML5 videos
  useEffect(() => {
    if (isYoutube) return; // Skip for YouTube videos
    
    const video = videoRef.current;
    if (!video) return;

    const handleLoadStart = () => setState(prev => ({ ...prev, isLoading: true, error: null }));
    const handleCanPlay = () => setState(prev => ({ ...prev, isLoading: false }));
    const handlePlaying = () => setState(prev => ({ ...prev, isPlaying: true }));
    const handlePause = () => setState(prev => ({ ...prev, isPlaying: false }));
    const handleError = () => {
      const error = 'Failed to load video. Please check the URL and try again.';
      setState(prev => ({ ...prev, error, isLoading: false }));
      onError?.(error);
    };

    // Progress saving
    const handleTimeUpdate = () => {
      if (video.currentTime > 0) {
        saveProgress(video.currentTime);
      }
    };

    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('pause', handlePause);
    video.addEventListener('error', handleError);
    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('error', handleError);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [saveProgress, onError, isYoutube]);

  // Initialize volume for HTML5 videos
  useEffect(() => {
    if (videoRef.current && !isYoutube) {
      videoRef.current.volume = state.volume;
    }
  }, [state.volume, isYoutube]);

  if (state.error) {
    return (
      <div className="w-full aspect-video bg-player-bg border border-player-border rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-2">Video Error</p>
          <p className="text-muted-foreground text-sm">{state.error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div 
        ref={containerRef}
        className={cn(
          "relative w-full aspect-video bg-player-bg border border-player-border rounded-lg overflow-hidden shadow-player group",
          state.isFullscreen && "rounded-none"
        )}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => state.isPlaying && setState(prev => ({ ...prev, showControls: false }))}
      >
        {/* Video Element */}
        {isYoutube && youtubeId ? (
          <YouTubePlayer
            videoId={youtubeId}
            onStateChange={handleYouTubeStateChange}
            onVolumeChange={handleYouTubeVolumeChange}
            onError={handleYouTubeError}
            savedProgress={savedProgress || undefined}
            onProgressUpdate={saveProgress}
            showControls={state.showControls || !state.isPlaying}
            onFullscreen={handleFullscreen}
            playButtonColor={playButtonColor}
            playButtonSize={playButtonSize}
            shouldSeekTo={state.shouldSeekTo}
            onSeekComplete={() => setState(prev => ({ ...prev, shouldSeekTo: undefined }))}
          />
        ) : (
          <>
            <video
              ref={videoRef}
              src={actualVideoUrl}
              className="w-full h-full object-contain"
              preload="metadata"
              playsInline
            />

            {/* Loading Overlay */}
            {state.isLoading && (
              <div className="absolute inset-0 bg-player-overlay flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-player-accent animate-spin" />
              </div>
            )}

            {/* Controls Overlay for HTML5 Videos */}
            <div
              className={cn(
                "absolute inset-0 transition-opacity duration-300",
                state.showControls || !state.isPlaying ? "opacity-100" : "opacity-0"
              )}
            >
              {/* Play/Pause Center Button - YouTube Style */}
              {!state.isPlaying && !state.isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePlay}
                    className="rounded-full border-0 shadow-xl transition-all duration-200 hover:scale-110 p-0"
                    style={{
                      width: `${playButtonSize}px`,
                      height: `${playButtonSize}px`,
                      backgroundColor: playButtonColor,
                    }}
                  >
                    <div className="relative">
                      <Play 
                        className="text-white ml-1" 
                        fill="currentColor" 
                        style={{ 
                          width: `${playButtonSize * 0.4}px`, 
                          height: `${playButtonSize * 0.4}px` 
                        }}
                      />
                    </div>
                  </Button>
                </div>
              )}

              {/* Bottom Controls Bar */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-controls p-4">
                <div className="flex items-center gap-4">
                  {/* Play/Pause */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePlay}
                    className="text-foreground hover:text-player-accent hover:bg-player-controls-hover"
                  >
                    {state.isPlaying ? (
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
                      {state.isMuted || state.volume === 0 ? (
                        <VolumeX className="w-5 h-5" />
                      ) : (
                        <Volume2 className="w-5 h-5" />
                      )}
                    </Button>
                    <div className="w-20">
                      <Slider
                        value={[state.isMuted ? 0 : state.volume * 100]}
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
                    onClick={handleFullscreen}
                    className="text-foreground hover:text-player-accent hover:bg-player-controls-hover"
                  >
                    <Maximize className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Resume Modal - Works for both YouTube and HTML5 videos */}
      {showResumeModal && savedProgress && (
        <ResumeModal
          isOpen={showResumeModal}
          onChoice={handleResumeChoice}
          timestamp={savedProgress}
        />
      )}
    </>
  );
};