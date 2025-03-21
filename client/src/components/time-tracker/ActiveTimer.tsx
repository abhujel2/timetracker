import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, MoreVertical, Pause, Play, Square } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Task } from '@shared/schema';

export default function ActiveTimer() {
  const { timer, tasks } = useAppContext();
  
  // Find the active task
  const activeTask = tasks.find(task => task.id === timer.activeTaskId);
  
  if (!activeTask && !timer.isRunning) {
    return null;
  }
  
  const placeholderTask: Task = {
    id: 0,
    title: "No task selected",
    description: "Start a task to track time",
    userId: 1,
    status: "pending",
    progress: 0,
    projectId: null,
    estimatedTime: null,
    dueDate: null,
    createdAt: new Date().toISOString(),
  };
  
  const task = activeTask || placeholderTask;
  const progress = task.progress || 0;
  
  return (
    <Card className="glass-card p-6 rounded-xl gradient-border">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="mb-4 md:mb-0">
          <h2 className="text-xl font-semibold mb-1">Currently Working On</h2>
          <p className="text-muted-foreground text-sm">
            Time elapsed: <span>{timer.formattedTime}</span>
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Button 
            size="icon" 
            variant="secondary" 
            className="bg-accent hover:bg-opacity-80 transition-all"
            onClick={timer.isRunning ? timer.pauseTimer : timer.resumeTimer}
            disabled={timer.isLoading}
          >
            {timer.isRunning ? (
              <Pause className="text-primary-foreground" />
            ) : (
              <Play className="text-primary-foreground" />
            )}
          </Button>
          
          <Button 
            size="icon" 
            variant="secondary" 
            className="bg-primary hover:bg-primary/90 transition-all"
            onClick={timer.stopTimer}
            disabled={timer.isLoading || !timer.isRunning}
          >
            <Stop className="text-primary-foreground" />
          </Button>
          
          <Button size="icon" variant="secondary" className="bg-accent hover:bg-opacity-80 transition-all">
            <MoreVertical className="text-primary-foreground" />
          </Button>
        </div>
      </div>
      
      <Card className="glass-card rounded-lg p-4 mb-4">
        <div className="flex items-start space-x-4">
          <div className="rounded-lg bg-primary bg-opacity-20 p-2 text-primary">
            <CodeIcon className="h-6 w-6" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-medium">{task.title}</h3>
            <p className="text-muted-foreground text-sm mb-3">
              {task.description}
            </p>
            
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-sm text-muted-foreground mr-4">
                  <Clock className="w-4 h-4 inline mr-1" />
                  <span>{task.estimatedTime ? `${Math.round(task.estimatedTime / 60)} hours` : 'No estimate'}</span>
                </span>
                <span className="text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  <span>{task.dueDate ? formatDate(task.dueDate, 'PPP') : 'No deadline'}</span>
                </span>
              </div>
              
              <div className="flex -space-x-2">
                <Avatar className="w-7 h-7 border-2 border-card">
                  <AvatarFallback className="text-xs">JS</AvatarFallback>
                </Avatar>
                <Avatar className="w-7 h-7 border-2 border-card">
                  <AvatarFallback className="text-xs">TK</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      <div>
        <div className="text-sm mb-2">Recent Activity</div>
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant="outline" className="bg-accent text-muted-foreground font-normal">
            Started timer at {formatDate(new Date(), 'h:mm a')}
          </Badge>
          <Badge variant="outline" className="bg-accent text-muted-foreground font-normal">
            Paused for 15m break
          </Badge>
          <Badge variant="outline" className="bg-accent text-muted-foreground font-normal">
            Resumed at {formatDate(new Date(), 'h:mm a')}
          </Badge>
        </div>
      </div>
    </Card>
  );
}

function CodeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}
