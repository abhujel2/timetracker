import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AppProvider } from "@/context/AppContext";
import NotFound from "@/pages/not-found";

// Import pages
import Dashboard from "@/pages/dashboard";
import TimeTracker from "@/pages/time-tracker";
import Calendar from "@/pages/calendar";
import Files from "@/pages/files";
import Music from "@/pages/music";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/time-tracker" component={TimeTracker} />
      <Route path="/calendar" component={Calendar} />
      <Route path="/files" component={Files} />
      <Route path="/music" component={Music} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <Router />
        <Toaster />
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
