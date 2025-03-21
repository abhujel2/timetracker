import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { TimeEntry, InsertTimeEntry } from '@shared/schema';

export function useTimer() {
  const queryClient = useQueryClient();
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [currentEntryId, setCurrentEntryId] = useState<number | null>(null);
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null);

  // Get current time entry if any
  const { data: currentEntry } = useQuery({
    queryKey: ['/api/time-entries/current'],
    enabled: false, // We'll manually trigger this
  });

  // Start timer mutation
  const startTimerMutation = useMutation({
    mutationFn: async ({ taskId, projectId }: { taskId?: number, projectId?: number }) => {
      const data: Partial<InsertTimeEntry> = {
        startTime: new Date(),
        taskId: taskId || null,
        projectId: projectId || null,
      };
      return await apiRequest('POST', '/api/time-entries', data);
    },
    onSuccess: async (response) => {
      const data = await response.json();
      setCurrentEntryId(data.id);
      setStartTime(new Date(data.startTime));
      queryClient.invalidateQueries({ queryKey: ['/api/time-entries'] });
    },
  });

  // Stop timer mutation
  const stopTimerMutation = useMutation({
    mutationFn: async () => {
      if (!currentEntryId) return;
      const data = {
        endTime: new Date(),
        duration: elapsedTime,
      };
      return await apiRequest('PATCH', `/api/time-entries/${currentEntryId}`, data);
    },
    onSuccess: () => {
      setCurrentEntryId(null);
      setStartTime(null);
      setElapsedTime(0);
      setActiveTaskId(null);
      setActiveProjectId(null);
      queryClient.invalidateQueries({ queryKey: ['/api/time-entries'] });
    },
  });

  // Pause timer mutation
  const pauseTimerMutation = useMutation({
    mutationFn: async () => {
      if (!currentEntryId) return;
      const data = {
        paused: true,
        pausedAt: new Date(),
      };
      return await apiRequest('PATCH', `/api/time-entries/${currentEntryId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/time-entries'] });
    },
  });

  // Resume timer
  const resumeTimerMutation = useMutation({
    mutationFn: async () => {
      if (!currentEntryId) return;
      const data = {
        paused: false,
        resumedAt: new Date(),
      };
      return await apiRequest('PATCH', `/api/time-entries/${currentEntryId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/time-entries'] });
    },
  });

  const startTimer = (taskId?: number, projectId?: number) => {
    if (taskId) setActiveTaskId(taskId);
    if (projectId) setActiveProjectId(projectId);
    
    startTimerMutation.mutate({ taskId, projectId });
    setIsRunning(true);
  };

  const stopTimer = () => {
    stopTimerMutation.mutate();
    setIsRunning(false);
  };

  const pauseTimer = () => {
    pauseTimerMutation.mutate();
    setIsRunning(false);
  };

  const resumeTimer = () => {
    resumeTimerMutation.mutate();
    setIsRunning(true);
  };

  // Format time as HH:MM:SS
  const formatTime = (timeInSeconds: number): string => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  };

  // Update elapsed time every second when timer is running
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && startTime) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  return {
    isRunning,
    elapsedTime,
    formattedTime: formatTime(elapsedTime),
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    activeTaskId,
    activeProjectId,
    isLoading: startTimerMutation.isPending || stopTimerMutation.isPending || pauseTimerMutation.isPending || resumeTimerMutation.isPending
  };
}
