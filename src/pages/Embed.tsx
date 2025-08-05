import React, { useState, useEffect } from 'react';
import { VideoPlayer } from '@/components/VideoPlayer';
import { useToast } from '@/hooks/use-toast';

const Embed = () => {
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [playButtonColor, setPlayButtonColor] = useState('#ff0000');
  const [playButtonSize, setPlayButtonSize] = useState(96);
  const { toast } = useToast();

  // Check for video parameter in URL on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const videoParam = urlParams.get('video');
    const colorParam = urlParams.get('playButtonColor');
    const sizeParam = urlParams.get('playButtonSize');
    
    if (videoParam) {
      setCurrentVideo(decodeURIComponent(videoParam));
    }
    if (colorParam) {
      setPlayButtonColor(decodeURIComponent(colorParam));
    }
    if (sizeParam) {
      setPlayButtonSize(parseInt(sizeParam) || 96);
    }
  }, []);

  const handleVideoError = (error: string) => {
    toast({
      title: "Video Error",
      description: error,
      variant: "destructive",
    });
  };

  if (!currentVideo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">No video specified</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <VideoPlayer 
        src={currentVideo} 
        onError={handleVideoError}
        playButtonColor={playButtonColor}
        playButtonSize={playButtonSize}
      />
    </div>
  );
};

export default Embed;