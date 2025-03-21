import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import MusicPlayer from '../music/MusicPlayer';
import UploadWidget from '../upload/UploadWidget';
import TrayIcon from '../notification/TrayIcon';
import { useAppContext } from '@/context/AppContext';

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function MainLayout({ children, title }: MainLayoutProps) {
  const { uploadWidgetOpen, isMinimized } = useAppContext();
  
  if (isMinimized) {
    return <TrayIcon />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header title={title} />
        
        {/* Main Content Wrapper */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {children}
        </div>
        
        {/* Music Player */}
        <MusicPlayer />
      </div>
      
      {/* Upload Widget */}
      {uploadWidgetOpen && <UploadWidget />}
      
      {/* Notification Tray Icon */}
      <TrayIcon minimizeOnly />
    </div>
  );
}
