import React, { useState } from 'react';
import { useSpotify } from '@/hooks/use-spotify';
import { useAppContext } from '@/context/AppContext';
import { 
  PlayIcon, 
  PauseIcon, 
  SkipBackIcon, 
  SkipForwardIcon, 
  Volume2, 
  Repeat, 
  Disc3 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Avatar } from '@/components/ui/avatar';
import { FaSpotify } from 'react-icons/fa';

export default function MusicPlayer() {
  const { spotify } = useAppContext();
  const [volume, setVolume] = useState(50);
  
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    spotify.setVolume(newVolume);
  };
  
  // Calculate progress percentage
  const progressPercentage = spotify.currentTrack 
    ? (spotify.currentTrack.progress / spotify.currentTrack.duration) * 100
    : 0;
  
  return (
    <div className="glass h-20 border-t border-white/5 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        {spotify.currentTrack ? (
          <>
            <Avatar className="w-12 h-12 rounded-md overflow-hidden bg-card flex-shrink-0">
              <img 
                src={spotify.currentTrack.albumCover} 
                alt="Album Cover" 
                className="w-full h-full object-cover" 
              />
            </Avatar>
            
            <div>
              <div className="font-medium">{spotify.currentTrack.title}</div>
              <div className="text-xs text-muted-foreground">{spotify.currentTrack.artist}</div>
            </div>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-md overflow-hidden bg-card flex-shrink-0 flex items-center justify-center">
              <Disc3 className="text-muted-foreground" />
            </div>
            
            <div>
              <div className="font-medium">Not Playing</div>
              <div className="text-xs text-muted-foreground">
                {spotify.isConnected ? 'Select a track to play' : 'Connect to Spotify'}
              </div>
            </div>
          </>
        )}
      </div>
      
      <div className="flex-1 max-w-xl px-8">
        <div className="flex items-center justify-center space-x-4">
          <Button 
            size="icon" 
            variant="ghost" 
            className="text-muted-foreground hover:text-foreground transition-all"
            onClick={spotify.previousTrack}
            disabled={!spotify.isConnected || !spotify.currentTrack}
          >
            <SkipBackIcon className="h-5 w-5" />
          </Button>
          
          <Button 
            size="icon" 
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center"
            onClick={spotify.isConnected ? spotify.togglePlayPause : spotify.connect}
            disabled={spotify.isLoading}
          >
            {spotify.isConnected ? (
              spotify.isPlaying ? (
                <PauseIcon className="h-4 w-4" />
              ) : (
                <PlayIcon className="h-4 w-4" />
              )
            ) : (
              <FaSpotify className="h-4 w-4" />
            )}
          </Button>
          
          <Button 
            size="icon" 
            variant="ghost" 
            className="text-muted-foreground hover:text-foreground transition-all"
            onClick={spotify.nextTrack}
            disabled={!spotify.isConnected || !spotify.currentTrack}
          >
            <SkipForwardIcon className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-3 mt-1">
          <span className="text-xs text-muted-foreground">
            {spotify.currentTrack 
              ? spotify.formatDuration(spotify.currentTrack.progress) 
              : '0:00'}
          </span>
          <div className="h-1 flex-1 bg-card rounded-full">
            <div 
              className="h-full bg-primary rounded-full relative"
              style={{ width: `${progressPercentage}%` }}
            >
              <div className="absolute w-3 h-3 bg-white rounded-full -right-1.5 -top-1 shadow-lg"></div>
            </div>
          </div>
          <span className="text-xs text-muted-foreground">
            {spotify.currentTrack 
              ? spotify.formatDuration(spotify.currentTrack.duration) 
              : '0:00'}
          </span>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Volume2 className="h-4 w-4 text-muted-foreground" />
          <Slider 
            className="w-24"
            value={[volume]} 
            max={100} 
            step={1}
            onValueChange={handleVolumeChange}
          />
        </div>
        
        <Button 
          size="icon" 
          variant="ghost" 
          className="text-muted-foreground hover:text-foreground transition-all"
        >
          <Repeat className="h-4 w-4" />
        </Button>
        
        <Button
          variant="link"
          className="flex items-center text-sm space-x-1 text-primary"
          onClick={spotify.isConnected ? undefined : spotify.connect}
        >
          <FaSpotify className="h-4 w-4 mr-1" />
          <span>Spotify</span>
        </Button>
      </div>
    </div>
  );
}
