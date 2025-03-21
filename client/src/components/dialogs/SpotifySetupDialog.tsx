import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FaSpotify } from 'react-icons/fa';
import { useToast } from '@/hooks/use-toast';

interface SpotifySetupDialogProps {
  children: React.ReactNode;
}

export default function SpotifySetupDialog({ children }: SpotifySetupDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);

  const askForSpotifyCredentials = async () => {
    toast({
      title: "Spotify Setup Request Sent",
      description: "For actual Spotify integration, your application would need a real Spotify Developer account with client ID and client secret.",
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FaSpotify className="mr-2 h-5 w-5 text-green-500" />
            Connect to Spotify
          </DialogTitle>
          <DialogDescription>
            To enable full Spotify connectivity, you'll need to add your Spotify Developer credentials.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-sm">
            <p className="font-medium mb-2">Setting up Spotify requires:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>A Spotify Developer account</li>
              <li>Creating an application in the Spotify Developer Dashboard</li>
              <li>Setting the correct redirect URI</li>
              <li>Adding your client ID and client secret to the app</li>
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={askForSpotifyCredentials}>
            <FaSpotify className="mr-2 h-4 w-4" />
            Request Setup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}