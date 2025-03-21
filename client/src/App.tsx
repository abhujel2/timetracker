import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AppProvider, useAppContext } from "@/context/AppContext";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import React from "react";

// Import pages
import Dashboard from "@/pages/dashboard";
import TimeTracker from "@/pages/time-tracker";
import Calendar from "@/pages/calendar";
import Files from "@/pages/files";
import Music from "@/pages/music";
import Login from "@/pages/login";
import Signup from "@/pages/signup";

// Protected route component
const ProtectedRoute = ({ component: Component, ...rest }: any) => {
  const { user } = useAppContext();
  const [, setLocation] = useLocation();
  
  React.useEffect(() => {
    if (!user) {
      setLocation("/login");
    }
  }, [user, setLocation]);

  return user ? <Component {...rest} /> : null;
};

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/">
        {() => <Redirect to="/dashboard" />}
      </Route>
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
      <AppProvider>
        <Router />
        <Toaster />
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
