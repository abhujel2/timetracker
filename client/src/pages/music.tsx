import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useSpotify } from '@/hooks/use-spotify';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  PlayIcon, 
  PauseIcon, 
  SkipBackIcon, 
  SkipForwardIcon, 
  SearchIcon, 
  MusicIcon,
  Heart,
  ListMusic,
  Clock,
  LayoutGrid,
  Disc3,
} from 'lucide-react';
import { FaSpotify } from 'react-icons/fa';
import SpotifySetupDialog from '@/components/dialogs/SpotifySetupDialog';

export default function Music() {
  const { spotify } = useAppContext();
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // These would be fetched from Spotify in a real implementation
  const playlists = [
    { id: '1', name: 'Chill Vibes', tracks: 23, cover: 'https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?auto=format&fit=crop&w=200&h=200&q=80' },
    { id: '2', name: 'Focus Flow', tracks: 15, cover: 'https://images.unsplash.com/photo-1519682577862-22b62b24e493?auto=format&fit=crop&w=200&h=200&q=80' },
    { id: '3', name: 'Workout Mix', tracks: 32, cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=200&h=200&q=80' },
    { id: '4', name: 'Coding Beats', tracks: 18, cover: 'https://images.unsplash.com/photo-1558021212-51b6ecfa0db9?auto=format&fit=crop&w=200&h=200&q=80' },
    { id: '5', name: 'Relaxation', tracks: 26, cover: 'https://images.unsplash.com/photo-1594623930572-300a3011d9ae?auto=format&fit=crop&w=200&h=200&q=80' },
    { id: '6', name: 'Weekend Vibes', tracks: 19, cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=200&h=200&q=80' },
  ];
  
  const recentTracks = [
    { id: '1', title: 'Midnight City', artist: 'M83', album: 'Hurry Up, We\'re Dreaming', duration: 260, albumCover: 'https://i.scdn.co/image/ab67616d0000b273b3bb9066b9b3ac8e4bd73fbf' },
    { id: '2', title: 'Starboy', artist: 'The Weeknd, Daft Punk', album: 'Starboy', duration: 230, albumCover: 'https://i.scdn.co/image/ab67616d0000b273a048415db06a5b6fa7ec4e1a' },
    { id: '3', title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', duration: 200, albumCover: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36' },
    { id: '4', title: 'Levitating', artist: 'Dua Lipa', album: 'Future Nostalgia', duration: 203, albumCover: 'https://i.scdn.co/image/ab67616d0000b273bd26ede1ae69327010d49946' },
    { id: '5', title: 'Take on Me', artist: 'a-ha', album: 'Hunting High and Low', duration: 225, albumCover: 'https://i.scdn.co/image/ab67616d0000b273c1e8023ace24e668e7d0a3f9' },
  ];
  
  // Format duration as mm:ss
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <MainLayout title="Music">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left sidebar with playlists */}
        <Card className="glass-card lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <ListMusic className="mr-2 h-5 w-5" />
              Your Library
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {spotify.isConnected ? (
              <>
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search playlists..." 
                    className="pl-9" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                  {playlists.map(playlist => (
                    <div 
                      key={playlist.id} 
                      className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent/50 cursor-pointer transition-colors"
                    >
                      <div className="w-10 h-10 rounded-md overflow-hidden">
                        <img src={playlist.cover} alt={playlist.name} className="object-cover w-full h-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{playlist.name}</div>
                        <div className="text-xs text-muted-foreground">{playlist.tracks} tracks</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Connected to Spotify</span>
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                    <FaSpotify className="mr-1 h-3 w-3" />
                    Active
                  </Badge>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <FaSpotify className="h-16 w-16 mx-auto text-primary opacity-20 mb-4" />
                <h3 className="text-lg font-medium">Connect to Spotify</h3>
                <p className="text-muted-foreground text-sm mt-2 mb-6">
                  Link your Spotify account to play your music library and playlists directly from the app.
                </p>
                <SpotifySetupDialog>
                  <Button onClick={spotify.connect} className="w-full">
                    <FaSpotify className="mr-2 h-4 w-4" />
                    Connect Spotify Account
                  </Button>
                </SpotifySetupDialog>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Main content area */}
        <Card className="glass-card lg:col-span-3">
          <CardHeader className="pb-3 border-b">
            <Tabs defaultValue="featured">
              <TabsList>
                <TabsTrigger value="featured">Featured</TabsTrigger>
                <TabsTrigger value="recent">Recently Played</TabsTrigger>
                <TabsTrigger value="favorites">Favorites</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="featured">
              <TabsContent value="featured">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-4">Featured Playlists</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {playlists.slice(0, 6).map(playlist => (
                      <Card key={playlist.id} className="glass-card overflow-hidden">
                        <div className="aspect-square w-full overflow-hidden">
                          <img 
                            src={playlist.cover} 
                            alt={playlist.name} 
                            className="object-cover w-full h-full transition-transform hover:scale-105"
                          />
                        </div>
                        <CardContent className="p-4">
                          <div className="font-semibold">{playlist.name}</div>
                          <div className="text-sm text-muted-foreground">{playlist.tracks} tracks</div>
                          <div className="mt-3 flex justify-between items-center">
                            <Badge variant="secondary" className="bg-primary/20 text-primary border-none">
                              Playlist
                            </Badge>
                            <Button size="icon" variant="secondary" className="rounded-full h-8 w-8">
                              <PlayIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold mb-4">Top Tracks</h2>
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 text-xs font-medium text-muted-foreground uppercase tracking-wider py-2 border-b">
                      <div className="col-span-1">#</div>
                      <div className="col-span-5">Title</div>
                      <div className="col-span-4">Album</div>
                      <div className="col-span-2 text-right">Duration</div>
                    </div>
                    
                    {recentTracks.map((track, index) => (
                      <div 
                        key={track.id} 
                        className="grid grid-cols-12 py-2 items-center hover:bg-accent/50 rounded-md transition-colors cursor-pointer"
                      >
                        <div className="col-span-1 text-muted-foreground">{index + 1}</div>
                        <div className="col-span-5 flex items-center space-x-3">
                          <Avatar className="rounded-md h-10 w-10">
                            <img src={track.albumCover} alt={track.album} />
                          </Avatar>
                          <div>
                            <div className="font-medium">{track.title}</div>
                            <div className="text-sm text-muted-foreground">{track.artist}</div>
                          </div>
                        </div>
                        <div className="col-span-4 text-sm text-muted-foreground">{track.album}</div>
                        <div className="col-span-2 flex items-center justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100"
                          >
                            <Heart className="h-4 w-4" />
                          </Button>
                          <span className="text-sm text-muted-foreground">{formatDuration(track.duration)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="recent">
                <div className="text-center py-12">
                  <Disc3 className="h-16 w-16 mx-auto text-muted-foreground opacity-20 mb-4" />
                  <h3 className="text-lg font-medium">Connect to Spotify to view your recent plays</h3>
                  <p className="text-muted-foreground mt-2 mb-6">
                    Your recently played tracks will appear here
                  </p>
                  <SpotifySetupDialog>
                    <Button onClick={spotify.connect}>
                      <FaSpotify className="mr-2 h-4 w-4" />
                      Connect to Spotify
                    </Button>
                  </SpotifySetupDialog>
                </div>
              </TabsContent>
              
              <TabsContent value="favorites">
                <div className="text-center py-12">
                  <Heart className="h-16 w-16 mx-auto text-muted-foreground opacity-20 mb-4" />
                  <h3 className="text-lg font-medium">No favorites yet</h3>
                  <p className="text-muted-foreground mt-2 mb-6">
                    Tracks you like will appear here
                  </p>
                  <Button variant="outline">Browse Music</Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      {/* Now playing section */}
      <Card className="glass-card mt-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4 w-full md:w-1/3">
              {spotify.currentTrack ? (
                <>
                  <Avatar className="w-16 h-16 rounded-md">
                    <img src={spotify.currentTrack.albumCover} alt="Album cover" />
                  </Avatar>
                  <div>
                    <div className="font-semibold text-lg">{spotify.currentTrack.title}</div>
                    <div className="text-muted-foreground">{spotify.currentTrack.artist}</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-md bg-accent flex items-center justify-center">
                    <MusicIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg">Not Playing</div>
                    <div className="text-muted-foreground">Select a track to play</div>
                  </div>
                </>
              )}
            </div>
            
            <div className="w-full md:w-2/3 space-y-3">
              <div className="flex justify-center items-center space-x-6">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-muted-foreground hover:text-foreground"
                  onClick={spotify.previousTrack}
                  disabled={!spotify.isConnected}
                >
                  <SkipBackIcon className="h-6 w-6" />
                </Button>
                
                <Button 
                  className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 transition-all"
                  onClick={spotify.isConnected ? spotify.togglePlayPause : spotify.connect}
                >
                  {spotify.isPlaying ? (
                    <PauseIcon className="h-6 w-6" />
                  ) : (
                    <PlayIcon className="h-6 w-6" />
                  )}
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-muted-foreground hover:text-foreground"
                  onClick={spotify.nextTrack}
                  disabled={!spotify.isConnected}
                >
                  <SkipForwardIcon className="h-6 w-6" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="text-xs text-muted-foreground w-10 text-right">
                  {spotify.currentTrack 
                    ? spotify.formatDuration(spotify.currentTrack.progress) 
                    : '0:00'}
                </span>
                <Slider 
                  className="flex-1" 
                  value={[spotify.currentTrack ? (spotify.currentTrack.progress / spotify.currentTrack.duration) * 100 : 0]} 
                  max={100}
                  step={1}
                  disabled={!spotify.isConnected}
                />
                <span className="text-xs text-muted-foreground w-10">
                  {spotify.currentTrack 
                    ? spotify.formatDuration(spotify.currentTrack.duration) 
                    : '0:00'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
