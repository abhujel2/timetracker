import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
  duration_ms: number;
}

interface SpotifyState {
  isConnected: boolean;
  isPlaying: boolean;
  currentTrack: {
    id: string;
    title: string;
    artist: string;
    album: string;
    albumCover: string;
    duration: number;
    progress: number;
  } | null;
  volume: number;
  devices: { id: string; name: string }[];
  recentTracks: SpotifyTrack[];
  error: string | null;
}

export function useSpotify() {
  const queryClient = useQueryClient();
  const [spotifyState, setSpotifyState] = useState<SpotifyState>({
    isConnected: false,
    isPlaying: false,
    currentTrack: null,
    volume: 50,
    devices: [],
    recentTracks: [],
    error: null
  });

  // Check Spotify connection
  const { data: connectionData, refetch: checkConnection } = useQuery({
    queryKey: ['/api/spotify/status'],
    enabled: false,
  });

  // Get current playing track
  const { data: currentTrackData, refetch: getCurrentTrack } = useQuery({
    queryKey: ['/api/spotify/current-track'],
    enabled: spotifyState.isConnected,
    refetchInterval: spotifyState.isPlaying ? 5000 : false,
  });

  // Connect to Spotify
  const connectMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('GET', '/api/spotify/connect', undefined);
      return response.json();
    },
    onSuccess: (data) => {
      // Open the authorization URL in a new window
      const authWindow = window.open(data.authUrl, '_blank', 'width=500,height=700');
      
      // Add event listener for message from popup window
      const messageHandler = (event: MessageEvent) => {
        if (event.data === 'spotify-connected') {
          setSpotifyState(prev => ({ ...prev, isConnected: true }));
          queryClient.invalidateQueries({ queryKey: ['/api/spotify'] });
          window.removeEventListener('message', messageHandler);
        }
      };
      
      window.addEventListener('message', messageHandler);
      
      // Also poll for connection status in case the popup is closed or blocked
      const interval = setInterval(async () => {
        try {
          const { data } = await checkConnection();
          if (data?.connected) {
            setSpotifyState(prev => ({ ...prev, isConnected: true }));
            clearInterval(interval);
            queryClient.invalidateQueries({ queryKey: ['/api/spotify'] });
            window.removeEventListener('message', messageHandler);
          }
        } catch (error) {
          console.error('Error checking Spotify connection:', error);
        }
      }, 2000);
      
      // Clear interval after 2 minutes (if user doesn't complete auth)
      setTimeout(() => {
        clearInterval(interval);
        window.removeEventListener('message', messageHandler);
      }, 120000);
    },
  });

  // Play/Pause control
  const playPauseMutation = useMutation({
    mutationFn: async (play: boolean) => {
      const endpoint = play ? '/api/spotify/play' : '/api/spotify/pause';
      return await apiRequest('POST', endpoint, undefined);
    },
    onSuccess: () => {
      setSpotifyState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
      getCurrentTrack();
    },
  });

  // Skip track
  const skipTrackMutation = useMutation({
    mutationFn: async (next: boolean) => {
      const endpoint = next ? '/api/spotify/next' : '/api/spotify/previous';
      return await apiRequest('POST', endpoint, undefined);
    },
    onSuccess: () => {
      getCurrentTrack();
    },
  });

  // Set volume
  const setVolumeMutation = useMutation({
    mutationFn: async (volume: number) => {
      return await apiRequest('POST', '/api/spotify/volume', { volume });
    },
    onSuccess: (_, volume) => {
      setSpotifyState(prev => ({ ...prev, volume }));
    },
  });

  // Load the current track and player state on mount
  useEffect(() => {
    const loadSpotifyState = async () => {
      try {
        const { data } = await checkConnection();
        
        if (data?.connected) {
          setSpotifyState(prev => ({ ...prev, isConnected: true }));
          
          // Get current track if connected
          const trackData = await getCurrentTrack();
          if (trackData?.data) {
            const track = trackData.data;
            setSpotifyState(prev => ({
              ...prev,
              isPlaying: track.is_playing,
              currentTrack: track.item ? {
                id: track.item.id,
                title: track.item.name,
                artist: track.item.artists.map((a: any) => a.name).join(', '),
                album: track.item.album.name,
                albumCover: track.item.album.images[0]?.url,
                duration: track.item.duration_ms,
                progress: track.progress_ms
              } : null
            }));
          }
        }
      } catch (error) {
        console.error('Error loading Spotify state:', error);
      }
    };
    
    loadSpotifyState();
  }, []);

  const connect = () => connectMutation.mutate();
  const togglePlayPause = () => playPauseMutation.mutate(!spotifyState.isPlaying);
  const nextTrack = () => skipTrackMutation.mutate(true);
  const previousTrack = () => skipTrackMutation.mutate(false);
  const setVolume = (volume: number) => setVolumeMutation.mutate(volume);

  // Format milliseconds as MM:SS
  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    ...spotifyState,
    connect,
    togglePlayPause,
    nextTrack,
    previousTrack,
    setVolume,
    formatDuration,
    isLoading: 
      connectMutation.isPending || 
      playPauseMutation.isPending || 
      skipTrackMutation.isPending || 
      setVolumeMutation.isPending
  };
}
