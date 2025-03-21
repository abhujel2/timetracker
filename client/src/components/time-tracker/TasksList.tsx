import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useAppContext } from '@/context/AppContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Play, PenSquare, RotateCcw, Trash2, Filter, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Task } from '@shared/schema';

export default function TasksList() {
  const { tasks, projects, timer } = useAppContext();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  
  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<Task> }) => {
      return await apiRequest('PATCH', `/api/tasks/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
  });
  
  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/tasks/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
  });
  
  // Filter and sort tasks
  const filteredTasks = tasks
    .filter(task => {
      // Apply project filter
      if (projectFilter !== 'all' && task.projectId !== parseInt(projectFilter)) {
        return false;
      }
      
      // Apply search filter
      if (search && !task.title.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort by status first (completed last)
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      
      // Then sort by due date
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      
      // Tasks with due dates come before tasks without
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
      
      return 0;
    });
  
  const handleStatusToggle = (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    updateTaskMutation.mutate({ 
      id: task.id, 
      data: { status: newStatus } 
    });
  };
  
  const handleStartTimer = (task: Task) => {
    timer.startTimer(task.id, task.projectId || undefined);
  };
  
  const getProjectName = (projectId: number | null) => {
    if (!projectId) return '';
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : '';
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-blue-500 bg-opacity-10 text-blue-400">Completed</Badge>;
      case 'in-progress':
        return <Badge className="bg-green-500 bg-opacity-10 text-green-400">In Progress</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 bg-opacity-10 text-yellow-400">Pending</Badge>;
      default:
        return <Badge className="bg-gray-500 bg-opacity-10 text-gray-400">{status}</Badge>;
    }
  };
  
  return (
    <Card className="glass-card p-6 rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Tasks</h2>
        
        <div className="flex space-x-2">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search tasks..."
              className="bg-accent focus:ring-1 focus:ring-primary rounded-lg text-sm px-4 py-2 pl-9 w-64 focus:outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-muted-foreground text-sm h-4 w-4" />
          </div>
          
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="bg-accent focus:ring-1 focus:ring-primary rounded-lg text-sm focus:outline-none w-40">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map(project => (
                <SelectItem key={project.id} value={project.id.toString()}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            size="icon" 
            variant="outline" 
            className="p-2 bg-accent hover:bg-accent/80 transition-all rounded-lg"
          >
            <Filter className="text-muted-foreground h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="space-y-3">
        {filteredTasks.length > 0 ? (
          filteredTasks.map(task => {
            const isCompleted = task.status === 'completed';
            
            return (
              <Card 
                key={task.id} 
                className="glass-card rounded-lg p-4 hover:bg-accent transition-all cursor-pointer flex items-start space-x-4"
              >
                <Checkbox 
                  className="mt-1.5 h-4 w-4" 
                  checked={isCompleted}
                  onCheckedChange={() => handleStatusToggle(task)}
                />
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={cn(
                        "text-base font-medium",
                        isCompleted && "line-through text-muted-foreground"
                      )}>
                        {task.title}
                      </h3>
                      <p className={cn(
                        "text-sm text-muted-foreground",
                        isCompleted && "text-muted-foreground/60"
                      )}>
                        {getProjectName(task.projectId)}
                      </p>
                    </div>
                    <div className="ml-4">
                      {getStatusBadge(task.status)}
                    </div>
                  </div>
                  
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center text-xs text-muted-foreground space-x-3">
                      <span>
                        <Clock className="w-3 h-3 inline mr-1" />
                        {task.dueDate ? formatRelative(new Date(task.dueDate)) : 'No deadline'}
                      </span>
                      <span>
                        <Timer className="w-3 h-3 inline mr-1" />
                        Est: {task.estimatedTime ? formatDuration(task.estimatedTime * 60) : 'None'}
                      </span>
                      {task.progress > 0 && (
                        <span>
                          <CheckSquare className="w-3 h-3 inline mr-1" />
                          {task.progress}% completed
                        </span>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      {!isCompleted ? (
                        <>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleStartTimer(task)}
                            className="p-1.5 rounded bg-accent hover:bg-accent/80 transition-all h-7"
                          >
                            <Play className="text-primary h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="p-1.5 rounded bg-accent hover:bg-accent/80 transition-all h-7"
                          >
                            <PenSquare className="text-muted-foreground h-3 w-3" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleStatusToggle(task)}
                            className="p-1.5 rounded bg-accent hover:bg-accent/80 transition-all h-7"
                          >
                            <RotateCcw className="text-muted-foreground h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => deleteTaskMutation.mutate(task.id)}
                            className="p-1.5 rounded bg-accent hover:bg-accent/80 transition-all h-7"
                          >
                            <Trash2 className="text-muted-foreground h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No tasks found. Create a new task to get started.
          </div>
        )}
      </div>
      
      {filteredTasks.length > 5 && (
        <div className="mt-4 flex justify-center">
          <Button variant="ghost" className="text-sm text-muted-foreground hover:text-foreground transition-all">
            <span>View All Tasks</span>
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </Card>
  );
}

function formatRelative(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (date < today) {
    return 'Overdue';
  } else if (date.getDate() === today.getDate() &&
             date.getMonth() === today.getMonth() &&
             date.getFullYear() === today.getFullYear()) {
    return 'Due Today';
  } else if (date.getDate() === tomorrow.getDate() &&
             date.getMonth() === tomorrow.getMonth() &&
             date.getFullYear() === tomorrow.getFullYear()) {
    return 'Due Tomorrow';
  } else {
    return `Due ${formatDistanceToNow(date, { addSuffix: true })}`;
  }
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours === 0) {
    return `${minutes} min`;
  }
  
  return `${hours} hour${hours !== 1 ? 's' : ''}`;
}

function Clock(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function Timer(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function CheckSquare(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

function ChevronDown(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
