import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ActiveTimer from '@/components/time-tracker/ActiveTimer';
import TabNavigation from '@/components/time-tracker/TabNavigation';
import TasksList from '@/components/time-tracker/TasksList';
import { useAppContext } from '@/context/AppContext';

export default function TimeTracker() {
  const { loading } = useAppContext();
  
  return (
    <MainLayout title="Time Tracker">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse text-primary text-lg">Loading time tracking data...</div>
        </div>
      ) : (
        <>
          <ActiveTimer />
          <TabNavigation />
          <TasksList />
        </>
      )}
    </MainLayout>
  );
}
