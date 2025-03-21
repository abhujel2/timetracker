import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AppProvider, useAppContext } from "@/context/AppContext";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import React, { useEffect } from "react";

// Import pages
import Dashboard from "@/pages/dashboard";
import TimeTracker from "@/pages/time-tracker";
import Calendar from "@/pages/calendar";
import Files from "@/pages/files";
import Music from "@/pages/music";
import AuthPage from "@/pages/auth-page";

// Protected route component
const ProtectedRoute = ({ component: Component, ...rest }: any) => {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  React.useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return user ? <Component {...rest} /> : null;
};

function Router() {
  const { user } = useAuth();
  
  // Handle redirect to auth page
  const RedirectToAuth = () => {
    const [, setLocation] = useLocation();
    useEffect(() => {
      if (!user) {
        setLocation("/auth");
      } else {
        setLocation("/dashboard");
      }
    }, [setLocation, user]);
    return null;
  };

  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/login">
        {() => <Redirect to="/auth" />}
      </Route>
      <Route path="/signup">
        {() => <Redirect to="/auth" />}
      </Route>
      <Route path="/" component={RedirectToAuth} />
      <Route path="/dashboard">
        {(params) => <ProtectedRoute component={Dashboard} params={params} />}
      </Route>
      <Route path="/time-tracker">
        {(params) => <ProtectedRoute component={TimeTracker} params={params} />}
      </Route>
      <Route path="/calendar">
        {(params) => <ProtectedRoute component={Calendar} params={params} />}
      </Route>
      <Route path="/files">
        {(params) => <ProtectedRoute component={Files} params={params} />}
      </Route>
      <Route path="/music">
        {(params) => <ProtectedRoute component={Music} params={params} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProvider>
          <Router />
          <Toaster />
        </AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
