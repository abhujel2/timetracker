import React from 'react';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';
import { Minimize2 } from 'lucide-react';

interface TrayIconProps {
  minimizeOnly?: boolean;
}

export default function TrayIcon({ minimizeOnly = false }: TrayIconProps) {
  const { setIsMinimized } = useAppContext();
  
  if (minimizeOnly) {
    return (
      <Button
        className="fixed bottom-6 right-6 p-2 rounded-full bg-primary shadow-lg cursor-pointer hover:bg-primary/90 transition-all z-50"
        onClick={() => setIsMinimized(true)}
      >
        <Minimize2 className="text-primary-foreground" />
      </Button>
    );
  }
  
  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-background/50 backdrop-blur-sm">
      <div className="glass-card p-6 rounded-xl max-w-sm w-full text-center space-y-4">
        <div className="rounded-full bg-primary w-16 h-16 flex items-center justify-center mx-auto">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-8 h-8 text-primary-foreground"
          >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        </div>
        <h3 className="text-xl font-bold gradient-text">Flow</h3>
        <p className="text-muted-foreground">Application is running in the background.</p>
        
        <div className="pt-2">
          <Button 
            className="w-full gradient-purple"
            onClick={() => setIsMinimized(false)}
          >
            Restore Application
          </Button>
        </div>
      </div>
    </div>
  );
}
