import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAppContext } from '@/context/AppContext';
import { formatDuration, formatTime } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

type TabValue = 'today' | 'week' | 'month' | 'projects';

export default function TabNavigation() {
  const [activeTab, setActiveTab] = useState<TabValue>('today');
  const { timeEntries, tasks, projects } = useAppContext();
  
  // Calculate daily stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayEntries = timeEntries.filter(entry => {
    const entryDate = new Date(entry.startTime);
    return entryDate >= today;
  });
  
  const totalTrackedSeconds = todayEntries.reduce((acc, entry) => {
    return acc + (entry.duration || 0);
  }, 0);
  
  const totalTrackedHours = totalTrackedSeconds / 3600;
  const formattedTotal = formatDuration(totalTrackedSeconds);
  
  // Calculate project breakdown
  const projectBreakdown = projects.map(project => {
    const projectEntries = timeEntries.filter(entry => entry.projectId === project.id);
    const totalProjectSeconds = projectEntries.reduce((acc, entry) => acc + (entry.duration || 0), 0);
    const percentage = Math.round((totalProjectSeconds / totalTrackedSeconds) * 100) || 0;
    
    return {
      ...project,
      duration: totalProjectSeconds,
      percentage,
      formattedDuration: formatDuration(totalProjectSeconds)
    };
  }).sort((a, b) => b.duration - a.duration).slice(0, 3);
  
  // Get today's schedule
  const todaySchedule = tasks
    .filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      const taskDate = new Date(dueDate);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === today.getTime();
    })
    .sort((a, b) => {
      if (!a.dueDate || !b.dueDate) return 0;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    })
    .slice(0, 4);
    
  // Define target work hours (e.g., 8 hours per day)
  const targetHours = 8;
  const progressPercentage = Math.min(Math.round((totalTrackedHours / targetHours) * 100), 100);
  
  return (
    <Card className="glass-card p-4 rounded-xl">
      <Tabs defaultValue="today" onValueChange={(value) => setActiveTab(value as TabValue)}>
        <TabsList className="border-b border-white/10 pb-2 mb-4">
          <TabsTrigger value="today" className="px-4 py-2 text-sm font-medium">Today</TabsTrigger>
          <TabsTrigger value="week" className="px-4 py-2 text-sm font-medium">Week</TabsTrigger>
          <TabsTrigger value="month" className="px-4 py-2 text-sm font-medium">Month</TabsTrigger>
          <TabsTrigger value="projects" className="px-4 py-2 text-sm font-medium">Projects</TabsTrigger>
        </TabsList>
        
        <TabsContent value="today" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Time Summary */}
            <Card className="glass-card rounded-lg p-4">
              <h3 className="text-sm text-muted-foreground mb-4">Today's Summary</h3>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-2xl font-semibold">{formattedTotal}</div>
                  <div className="text-xs text-muted-foreground">Total tracked</div>
                </div>
                <div className="h-16 w-16">
                  <div className="w-full h-full rounded-full bg-background flex items-center justify-center relative">
                    <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-primary border-opacity-20"></div>
                    <div 
                      className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-transparent border-t-primary" 
                      style={{ transform: `rotate(${progressPercentage * 3.6}deg)` }}
                    ></div>
                    <span className="text-sm font-medium">{progressPercentage}%</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Start Time</span>
                  <span className="text-muted-foreground">
                    {todayEntries.length > 0 
                      ? formatTime(todayEntries[0].startTime) 
                      : 'Not started'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Break Time</span>
                  <span className="text-muted-foreground">45 minutes</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Most Productive</span>
                  <span className="text-muted-foreground">10:00 - 11:30 AM</span>
                </div>
              </div>
            </Card>
            
            {/* Project Breakdown */}
            <Card className="glass-card rounded-lg p-4">
              <h3 className="text-sm text-muted-foreground mb-4">Project Breakdown</h3>
              
              <div className="space-y-3">
                {projectBreakdown.length > 0 ? (
                  projectBreakdown.map(project => (
                    <div key={project.id} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{project.name}</span>
                        <span>{project.formattedDuration}</span>
                      </div>
                      <Progress 
                        value={project.percentage} 
                        className="h-1.5" 
                        // Alternate colors for different projects
                        indicatorClassName={cn(
                          project.id % 3 === 0 && "bg-gradient-to-r from-primary to-primary-foreground",
                          project.id % 3 === 1 && "bg-gradient-to-r from-secondary to-secondary-foreground",
                          project.id % 3 === 2 && "bg-blue-500"
                        )}
                      />
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-6">
                    No projects tracked today
                  </div>
                )}
              </div>
            </Card>
            
            {/* Today's Schedule */}
            <Card className="glass-card rounded-lg p-4">
              <h3 className="text-sm text-muted-foreground mb-4">Today's Schedule</h3>
              
              <div className="space-y-3">
                {todaySchedule.length > 0 ? (
                  todaySchedule.map(event => {
                    const time = event.dueDate ? formatTime(event.dueDate) : '';
                    const isActive = event.status === 'in-progress';
                    
                    return (
                      <div key={event.id} className="flex items-start space-x-3">
                        <div className="text-xs text-right w-16 pt-0.5 text-muted-foreground">{time}</div>
                        <div className="w-px bg-white/10 h-full self-stretch"></div>
                        <div className={cn(
                          "p-2 rounded-lg flex-1", 
                          isActive 
                            ? "bg-primary bg-opacity-10 border border-primary border-opacity-20" 
                            : "bg-accent"
                        )}>
                          <div className={cn(
                            "text-sm font-medium",
                            isActive && "text-primary"
                          )}>
                            {event.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {event.estimatedTime ? formatDuration(event.estimatedTime * 60) : 'No estimate'}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-6">
                    No events scheduled for today
                  </div>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="week">
          <div className="p-8 text-center text-muted-foreground">
            Weekly time tracking data will be displayed here
          </div>
        </TabsContent>
        
        <TabsContent value="month">
          <div className="p-8 text-center text-muted-foreground">
            Monthly time tracking data will be displayed here
          </div>
        </TabsContent>
        
        <TabsContent value="projects">
          <div className="p-8 text-center text-muted-foreground">
            Projects overview will be displayed here
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
