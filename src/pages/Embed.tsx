import React, { useState, useEffect } from 'react';
import { VideoPlayer } from '@/components/VideoPlayer';
import { useToast } from '@/hooks/use-toast';

const Embed = () => {
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const { toast } = useToast();

  // Check for video parameter in URL on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const videoParam = urlParams.get('video');
    
    if (videoParam) {
      setCurrentVideo(decodeURIComponent(videoParam));
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
      />
    </div>
  );
};

export default Embed;