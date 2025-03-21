import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, CloudUpload, File } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { formatFileSize } from '@/lib/utils';

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export default function UploadWidget() {
  const { setUploadWidgetOpen } = useAppContext();
  const [files, setFiles] = useState<UploadingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      return await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/files'] });
    },
  });
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const newFiles = Array.from(event.target.files).map(file => ({
        id: Math.random().toString(36).substring(7),
        file,
        progress: 0,
        status: 'uploading' as const,
      }));
      
      setFiles(prev => [...prev, ...newFiles]);
      
      // Upload each file
      newFiles.forEach(fileData => {
        uploadFile(fileData);
      });
      
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const uploadFile = async (fileData: UploadingFile) => {
    try {
      // Simulate progress updates
      const interval = setInterval(() => {
        setFiles(prev => 
          prev.map(f => 
            f.id === fileData.id && f.progress < 90
              ? { ...f, progress: f.progress + 10 }
              : f
          )
        );
      }, 500);
      
      // Actual upload
      await uploadMutation.mutateAsync(fileData.file);
      
      clearInterval(interval);
      
      // Mark as success
      setFiles(prev => 
        prev.map(f => 
          f.id === fileData.id
            ? { ...f, progress: 100, status: 'success' }
            : f
        )
      );
      
      // Remove successful uploads after a delay
      setTimeout(() => {
        setFiles(prev => prev.filter(f => f.id !== fileData.id));
      }, 3000);
      
    } catch (error) {
      console.error('Upload error:', error);
      
      // Mark as error
      setFiles(prev => 
        prev.map(f => 
          f.id === fileData.id
            ? { ...f, status: 'error', error: 'Upload failed' }
            : f
        )
      );
    }
  };
  
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const newFiles = Array.from(event.dataTransfer.files).map(file => ({
        id: Math.random().toString(36).substring(7),
        file,
        progress: 0,
        status: 'uploading' as const,
      }));
      
      setFiles(prev => [...prev, ...newFiles]);
      
      // Upload each file
      newFiles.forEach(fileData => {
        uploadFile(fileData);
      });
    }
  };
  
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };
  
  return (
    <Card className="absolute bottom-24 right-6 w-96 glass-card rounded-xl p-4 shadow-xl z-10">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Upload Files</h3>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setUploadWidgetOpen(false)}
          className="text-muted-foreground hover:text-foreground transition-all"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div 
        className="border-2 border-dashed border-muted rounded-lg p-6 text-center mb-4"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <CloudUpload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Drag files here or click to browse</p>
        <Button 
          variant="outline" 
          className="mt-3 text-xs text-primary bg-primary bg-opacity-10 border-primary border-opacity-20"
          onClick={() => fileInputRef.current?.click()}
        >
          Select Files
        </Button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileChange}
          multiple
        />
      </div>
      
      {files.length > 0 && (
        <div className="space-y-3 max-h-40 overflow-y-auto mb-3">
          {files.map(fileData => (
            <div key={fileData.id} className="bg-accent p-2 rounded-lg">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  <File className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm truncate max-w-[180px]">
                    {fileData.file.name}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatFileSize(fileData.file.size)}
                </span>
              </div>
              <Progress 
                value={fileData.progress} 
                className="h-1.5"
                indicatorClassName={
                  fileData.status === 'error' 
                    ? 'bg-red-500' 
                    : fileData.status === 'success' 
                      ? 'bg-green-500' 
                      : undefined
                }
              />
              {fileData.error && (
                <p className="text-xs text-red-500 mt-1">{fileData.error}</p>
              )}
            </div>
          ))}
        </div>
      )}
      
      <div className="text-xs text-muted-foreground">
        Supported formats: PDF, JPG, PNG, MP3, MP4
      </div>
    </Card>
  );
}
