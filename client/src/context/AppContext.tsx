import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTheme } from '@/hooks/use-theme';
import { useTimer } from '@/hooks/use-timer';
import { useSpotify } from '@/hooks/use-spotify';
import { useQuery } from '@tanstack/react-query';
import type { User, Project, Task, TimeEntry } from '@shared/schema';

interface AppContextType {
  user: User | null;
  projects: Project[];
  tasks: Task[];
  timeEntries: TimeEntry[];
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  isMinimized: boolean;
  setIsMinimized: (value: boolean) => void;
  uploadWidgetOpen: boolean;
  setUploadWidgetOpen: (value: boolean) => void;
  timer: ReturnType<typeof useTimer>;
  spotify: ReturnType<typeof useSpotify>;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [uploadWidgetOpen, setUploadWidgetOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const timer = useTimer();
  const spotify = useSpotify();
  
  // Fetch user data
  const { data: user, isLoading: userLoading } = useQuery<User | null>({
    queryKey: ['/api/user/me'],
    onError: () => null
  });

  // Fetch projects
  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
    onError: () => []
  });

  // Fetch tasks
  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
    onError: () => []
  });

  // Fetch time entries
  const { data: timeEntries = [], isLoading: timeEntriesLoading } = useQuery<TimeEntry[]>({
    queryKey: ['/api/time-entries'],
    onError: () => []
  });

  // Simulated minimize to system tray
  const handleMinimize = () => {
    setIsMinimized(true);
    // In a real desktop app, we would use Electron's API
    // For this web app, we'll just show/hide a notification indicator
  };

  const loading = userLoading || projectsLoading || tasksLoading || timeEntriesLoading;

  // Provide all context values
  const contextValue: AppContextType = {
    user,
    projects,
    tasks,
    timeEntries,
    theme,
    toggleTheme,
    isMinimized,
    setIsMinimized,
    uploadWidgetOpen,
    setUploadWidgetOpen,
    timer,
    spotify,
    loading
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
