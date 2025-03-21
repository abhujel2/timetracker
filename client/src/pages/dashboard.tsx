import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';
import { Clock, Calendar, CheckCircle2, Clock4 } from 'lucide-react';
import { formatDuration } from '@/lib/utils';

export default function Dashboard() {
  const { tasks, timeEntries, projects } = useAppContext();
  
  // Calculate stats
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const upcomingTasks = tasks.filter(task => 
    task.status !== 'completed' && task.dueDate && new Date(task.dueDate) > new Date()
  ).length;
  
  // Calculate total time tracked
  const totalTrackedSeconds = timeEntries.reduce((acc, entry) => {
    return acc + (entry.duration || 0);
  }, 0);
  
  // Get tasks due today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const tasksToday = tasks.filter(task => {
    if (!task.dueDate) return false;
    const taskDate = new Date(task.dueDate);
    return taskDate >= today && taskDate < tomorrow;
  });
  
  return (
    <MainLayout title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Time Tracked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(totalTrackedSeconds)}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all projects</p>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active projects</p>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">Out of {tasks.length} total tasks</p>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">{tasksToday.length} due today</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <Card className="glass-card col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {timeEntries.slice(0, 5).map((entry, index) => {
                const task = tasks.find(t => t.id === entry.taskId);
                const project = projects.find(p => p.id === entry.projectId);
                
                return (
                  <div key={entry.id || index} className="flex">
                    <div className="mr-4 flex items-center">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {task?.title || "Unnamed Task"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {project?.name || "No Project"} • {formatDuration(entry.duration || 0)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(entry.startTime).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
              
              {timeEntries.length === 0 && (
                <div className="text-center py-8">
                  <Clock4 className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
                  <h3 className="mt-2 text-lg font-medium">No time entries yet</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Start tracking time to see your activity here
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Today's Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasksToday.slice(0, 5).map(task => (
                <div key={task.id} className="flex items-start">
                  <div className="mr-2 mt-0.5">
                    <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                      {task.status === 'completed' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className={`text-sm font-medium leading-none ${
                      task.status === 'completed' ? 'line-through text-muted-foreground' : ''
                    }`}>
                      {task.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {task.dueDate ? new Date(task.dueDate).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'No time set'}
                    </p>
                  </div>
                </div>
              ))}
              
              {tasksToday.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
                  <h3 className="mt-2 text-lg font-medium">No tasks due today</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Enjoy your day!
                  </p>
                </div>
              )}
            </div>
            
            <Button variant="outline" className="w-full mt-4">
              View All Tasks
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
