import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  File as FileIcon, 
  Image, 
  FileText, 
  Music as MusicIcon, 
  Video, 
  Upload, 
  Trash2,
  Search as SearchIcon,
  Filter,
  Grid,
  List
} from 'lucide-react';
import { formatFileSize, formatDate } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import type { File } from '@shared/schema';

export default function Files() {
  const { setUploadWidgetOpen, projects } = useAppContext();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const queryClient = useQueryClient();
  
  // Fetch files
  const { data: files = [], isLoading } = useQuery<File[]>({
    queryKey: ['/api/files'],
  });
  
  // Delete file mutation
  const deleteFileMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/files/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/files'] });
    }
  });
  
  // Filter files
  const filteredFiles = files.filter(file => {
    // Apply type filter
    if (filter !== 'all') {
      if (filter === 'images' && !file.type.startsWith('image/')) return false;
      if (filter === 'documents' && !file.type.startsWith('application/')) return false;
      if (filter === 'audio' && !file.type.startsWith('audio/')) return false;
      if (filter === 'video' && !file.type.startsWith('video/')) return false;
    }
    
    // Apply search
    if (search && !file.filename.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // Get file icon based on file type
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-10 w-10 text-blue-500" />;
    if (type.startsWith('application/pdf')) return <FileText className="h-10 w-10 text-red-500" />;
    if (type.startsWith('application/')) return <FileText className="h-10 w-10 text-green-500" />;
    if (type.startsWith('audio/')) return <MusicIcon className="h-10 w-10 text-purple-500" />;
    if (type.startsWith('video/')) return <Video className="h-10 w-10 text-yellow-500" />;
    return <FileIcon className="h-10 w-10 text-gray-500" />;
  };
  
  // Get project name
  const getProjectName = (projectId: number | null) => {
    if (!projectId) return null;
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : null;
  };
  
  return (
    <MainLayout title="Files">
      <Card className="glass-card mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Files</CardTitle>
            <Button 
              className="gradient-purple"
              onClick={() => setUploadWidgetOpen(true)}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Files
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between space-y-3 md:space-y-0 mb-6">
            <div className="relative w-full md:w-1/3">
              <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex space-x-3">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Files" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Files</SelectItem>
                  <SelectItem value="images">Images</SelectItem>
                  <SelectItem value="documents">Documents</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex border rounded-md">
                <Button 
                  variant={view === 'grid' ? 'secondary' : 'ghost'} 
                  size="icon" 
                  className="rounded-r-none"
                  onClick={() => setView('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" />
                <Button 
                  variant={view === 'list' ? 'secondary' : 'ghost'} 
                  size="icon" 
                  className="rounded-l-none"
                  onClick={() => setView('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Progress value={80} className="w-1/3" />
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-12">
              <FileIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-medium">No files found</h3>
              <p className="text-muted-foreground mt-1">
                {search || filter !== 'all' 
                  ? 'Try adjusting your search or filter' 
                  : 'Upload files to get started'}
              </p>
              {(search || filter !== 'all') && (
                <Button 
                  variant="link" 
                  onClick={() => {
                    setSearch('');
                    setFilter('all');
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <>
              {view === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredFiles.map((file) => (
                    <Card key={file.id} className="glass-card overflow-hidden">
                      <div className="h-32 flex items-center justify-center bg-accent">
                        {getFileIcon(file.type)}
                      </div>
                      <CardContent className="p-3 space-y-2">
                        <div className="text-sm font-medium truncate">{file.filename}</div>
                        <div className="flex justify-between items-center">
                          <div className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => deleteFileMutation.mutate(file.id)}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                        {getProjectName(file.projectId) && (
                          <Badge variant="outline" className="text-xs bg-primary/10 border-primary/20">
                            {getProjectName(file.projectId)}
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="overflow-hidden rounded-md border">
                  <table className="w-full">
                    <thead className="border-b bg-muted/50">
                      <tr>
                        <th className="py-3 px-4 text-left font-medium text-muted-foreground">Name</th>
                        <th className="py-3 px-4 text-left font-medium text-muted-foreground">Type</th>
                        <th className="py-3 px-4 text-left font-medium text-muted-foreground">Size</th>
                        <th className="py-3 px-4 text-left font-medium text-muted-foreground">Project</th>
                        <th className="py-3 px-4 text-left font-medium text-muted-foreground">Date</th>
                        <th className="py-3 px-4 text-left font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFiles.map((file) => (
                        <tr key={file.id} className="border-b hover:bg-accent/50 transition-colors">
                          <td className="py-3 px-4 flex items-center">
                            <div className="mr-2">
                              {getFileIcon(file.type)}
                            </div>
                            <span className="truncate max-w-[200px]">{file.filename}</span>
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {file.type.split('/')[1]}
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {formatFileSize(file.size)}
                          </td>
                          <td className="py-3 px-4">
                            {getProjectName(file.projectId) ? (
                              <Badge variant="outline" className="text-xs bg-primary/10 border-primary/20">
                                {getProjectName(file.projectId)}
                              </Badge>
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {formatDate(file.uploadedAt, 'PPP')}
                          </td>
                          <td className="py-3 px-4">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => deleteFileMutation.mutate(file.id)}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
}
