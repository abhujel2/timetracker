import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAppContext } from '@/context/AppContext';
import { formatDate } from '@/lib/utils';

export default function Calendar() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const { tasks, events } = useAppContext();
  
  // Get events for the selected date
  const selectedDateEvents = React.useMemo(() => {
    if (!date) return [];
    
    const selectedDay = new Date(date);
    selectedDay.setHours(0, 0, 0, 0);
    const nextDay = new Date(selectedDay);
    nextDay.setDate(nextDay.getDate() + 1);
    
    // Combine tasks with due dates and events
    const taskEvents = tasks
      .filter(task => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        return taskDate >= selectedDay && taskDate < nextDay;
      })
      .map(task => ({
        id: `task-${task.id}`,
        title: task.title,
        time: task.dueDate ? new Date(task.dueDate) : null,
        type: 'task',
        status: task.status,
      }));
    
    // Add actual events if there are any
    const calendarEvents = events
      ? events
          .filter(event => {
            const eventDate = new Date(event.startDate);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate.getTime() === selectedDay.getTime();
          })
          .map(event => ({
            id: `event-${event.id}`,
            title: event.title,
            description: event.description,
            time: new Date(event.startDate),
            endTime: event.endDate ? new Date(event.endDate) : null,
            type: 'event',
          }))
      : [];
    
    return [...taskEvents, ...calendarEvents].sort((a, b) => {
      if (!a.time || !b.time) return 0;
      return a.time.getTime() - b.time.getTime();
    });
  }, [date, tasks, events]);
  
  return (
    <MainLayout title="Calendar">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass-card lg:col-span-2">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="month">
              <TabsList className="mb-4">
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="day">Day</TabsTrigger>
              </TabsList>
              
              <TabsContent value="month" className="space-y-4">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                />
              </TabsContent>
              
              <TabsContent value="week">
                <div className="p-8 text-center text-muted-foreground">
                  Week view coming soon
                </div>
              </TabsContent>
              
              <TabsContent value="day">
                <div className="p-8 text-center text-muted-foreground">
                  Day view coming soon
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>
              {date ? formatDate(date, 'EEEE, MMMM d, yyyy') : 'Select a date'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateEvents.length > 0 ? (
              <div className="space-y-4">
                {selectedDateEvents.map((event) => (
                  <div key={event.id} className="flex space-x-3">
                    <div className="w-16 text-right flex-shrink-0">
                      <span className="text-sm text-muted-foreground">
                        {event.time ? formatDate(event.time, 'h:mm a') : '—'}
                      </span>
                    </div>
                    
                    <div className="w-px bg-muted/30 self-stretch"></div>
                    
                    <div className={`p-2 rounded-lg flex-1 ${
                      event.type === 'task' 
                        ? event.status === 'completed'
                          ? 'bg-blue-500/10 border border-blue-500/20' 
                          : 'bg-primary/10 border border-primary/20'
                        : 'bg-accent'
                    }`}>
                      <div className={`text-sm font-medium ${
                        event.type === 'task' 
                          ? event.status === 'completed'
                            ? 'text-blue-400' 
                            : 'text-primary'
                          : ''
                      }`}>
                        {event.title}
                      </div>
                      
                      {event.description && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {event.description}
                        </div>
                      )}
                      
                      {event.endTime && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Until {formatDate(event.endTime, 'h:mm a')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No events scheduled for this day
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
