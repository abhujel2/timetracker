import React from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { useAppContext } from '@/context/AppContext';
import { 
  Home, 
  Clock, 
  Calendar, 
  Folder, 
  Music, 
  Sun, 
  Moon, 
  Settings, 
  Activity 
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

export default function Sidebar() {
  const [location] = useLocation();
  const { user, theme, toggleTheme } = useAppContext();

  const navigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/', icon: <Home className="w-6 h-6" /> },
    { name: 'Time Tracker', href: '/time-tracker', icon: <Clock className="w-6 h-6" /> },
    { name: 'Calendar', href: '/calendar', icon: <Calendar className="w-6 h-6" /> },
    { name: 'Files', href: '/files', icon: <Folder className="w-6 h-6" /> },
    { name: 'Music', href: '/music', icon: <Music className="w-6 h-6" /> },
  ];

  return (
    <div className="w-16 md:w-64 h-full glass flex flex-col">
      {/* Logo */}
      <div className="flex items-center justify-center md:justify-start p-4 md:px-6">
        <div className="rounded-xl p-2 bg-primary bg-opacity-20">
          <Activity className="text-primary-foreground text-xl" />
        </div>
        <span className="hidden md:block ml-3 font-bold text-xl gradient-text">Flow</span>
      </div>
      
      {/* Navigation */}
      <nav className="mt-8 flex-1">
        <ul className="space-y-2 px-2">
          {navigation.map((item) => {
            const isActive = location === item.href || 
              (item.href !== '/' && location.startsWith(item.href));
              
            return (
              <li key={item.name}>
                <Link 
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-lg p-2 text-sm transition-all duration-200 relative",
                    isActive 
                      ? "bg-primary bg-opacity-10 text-primary hover:bg-primary hover:bg-opacity-20" 
                      : "text-foreground hover:bg-accent transition-all"
                  )}
                >
                  <div className="w-6 text-center">
                    {item.icon}
                  </div>
                  <span className="hidden md:block ml-3">{item.name}</span>
                  {isActive && <span className="absolute h-full w-1 bg-primary rounded-r-md left-0 top-0"></span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* User Profile */}
      <div className="p-4">
        <div className="hidden md:block mb-4">
          <Card className="glass-card rounded-lg p-3 space-y-1">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.displayName?.substring(0, 2) || user?.username?.substring(0, 2) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm font-medium">
                  {user?.displayName || user?.username || 'User'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {user?.email || ''}
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Theme Toggle */}
        <Button 
          variant="ghost" 
          className="w-full justify-start p-2 rounded-lg"
          onClick={toggleTheme}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-yellow-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-700" />
          )}
          <span className="hidden md:block ml-3 text-sm">
            Toggle Theme
          </span>
        </Button>
        
        {/* Settings */}
        <Button 
          variant="ghost" 
          className="w-full justify-start p-2 rounded-lg"
          asChild
        >
          <Link href="/settings">
            <Settings className="w-5 h-5 text-muted-foreground" />
            <span className="hidden md:block ml-3 text-sm">Settings</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
