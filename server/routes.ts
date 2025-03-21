import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertTaskSchema, 
  insertProjectSchema, 
  insertTimeEntrySchema, 
  insertFileSchema, 
  insertTrackSchema, 
  insertSettingsSchema
} from "@shared/schema";
import { setupAuth } from "./auth";
import { isAuthenticated, errorHandler } from "./middleware";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Setup authentication
  setupAuth(app);
  
  // The /api/user endpoint is defined in auth.ts
  // Redirect old endpoint to new one for backward compatibility
  app.get('/api/user/me', (req, res) => {
    res.redirect('/api/user');
  });

  // Projects API - require authentication
  app.get('/api/projects', isAuthenticated, async (req, res, next) => {
    try {
      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/projects', isAuthenticated, async (req, res, next) => {
    try {
      const userId = (req.user as any).id;
      const data = insertProjectSchema.parse({
        ...req.body,
        userId
      });
      const project = await storage.createProject(data);
      res.status(201).json(project);
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/projects/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const project = await storage.getProject(id);
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    res.json(project);
  });

  app.patch('/api/projects/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    try {
      const project = await storage.updateProject(id, req.body);
      res.json(project);
    } catch (error) {
      res.status(400).json({ message: "Invalid project data or project not found" });
    }
  });

  app.delete('/api/projects/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    try {
      await storage.deleteProject(id);
      res.status(204).end();
    } catch (error) {
      res.status(404).json({ message: "Project not found" });
    }
  });

  // Tasks API
  app.get('/api/tasks', async (req, res) => {
    const tasks = await storage.getAllTasks();
    res.json(tasks);
  });

  app.post('/api/tasks', async (req, res) => {
    try {
      const data = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(data);
      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ message: "Invalid task data" });
    }
  });

  app.get('/api/tasks/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const task = await storage.getTask(id);
    
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    res.json(task);
  });

  app.patch('/api/tasks/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    try {
      const task = await storage.updateTask(id, req.body);
      res.json(task);
    } catch (error) {
      res.status(400).json({ message: "Invalid task data or task not found" });
    }
  });

  app.delete('/api/tasks/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    try {
      await storage.deleteTask(id);
      res.status(204).end();
    } catch (error) {
      res.status(404).json({ message: "Task not found" });
    }
  });

  // Time Entries API
  app.get('/api/time-entries', async (req, res) => {
    const entries = await storage.getAllTimeEntries();
    res.json(entries);
  });

  app.get('/api/time-entries/current', async (req, res) => {
    const entry = await storage.getCurrentTimeEntry();
    if (!entry) {
      return res.status(404).json({ message: "No active time entry" });
    }
    res.json(entry);
  });

  app.post('/api/time-entries', async (req, res) => {
    try {
      const data = insertTimeEntrySchema.parse({
        ...req.body,
        userId: 1 // Demo user ID
      });
      const entry = await storage.createTimeEntry(data);
      res.status(201).json(entry);
    } catch (error) {
      res.status(400).json({ message: "Invalid time entry data" });
    }
  });

  app.patch('/api/time-entries/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    try {
      const entry = await storage.updateTimeEntry(id, req.body);
      res.json(entry);
    } catch (error) {
      res.status(400).json({ message: "Invalid time entry data or entry not found" });
    }
  });

  // Files API
  app.get('/api/files', async (req, res) => {
    const files = await storage.getAllFiles();
    res.json(files);
  });

  app.post('/api/files/upload', async (req, res) => {
    try {
      // This endpoint would handle file uploads with multer in a real app
      // Since we don't have actual file storage, simulate a file upload
      const mockFile = {
        userId: 1,
        taskId: req.body.taskId || null,
        projectId: req.body.projectId || null,
        filename: req.body.filename || "uploaded_file.txt",
        path: `/uploads/${Date.now()}_${req.body.filename || "uploaded_file.txt"}`,
        size: req.body.size || 1024,
        type: req.body.type || "text/plain"
      };
      
      const file = await storage.createFile(mockFile);
      res.status(201).json(file);
    } catch (error) {
      res.status(400).json({ message: "Invalid file data" });
    }
  });

  // Spotify API 
  // Mock implementation that can be easily replaced with a real Spotify API integration
  const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
  const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
  const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:5000/api/spotify/callback';
  
  // Keep track of if a user has connected their Spotify account
  // In a real implementation, this would be stored in the database
  let spotifyConnected = true;
  let spotifyTokens = {
    access_token: null,
    refresh_token: null
  };

  app.get('/api/spotify/status', (req, res) => {
    // Check if user is logged in before checking Spotify
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    res.json({ connected: spotifyConnected });
  });

  app.get('/api/spotify/connect', isAuthenticated, (req, res) => {
    // In a real implementation, this would use the Spotify Web API to get an auth URL
    const scopes = [
      'user-read-playback-state',
      'user-modify-playback-state',
      'user-read-currently-playing'
    ].join(' ');
    
    // If we have client ID, construct a real auth URL, otherwise use a mock
    let authUrl = "https://accounts.spotify.com/authorize";
    
    if (SPOTIFY_CLIENT_ID) {
      authUrl = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(SPOTIFY_REDIRECT_URI)}&scope=${encodeURIComponent(scopes)}`;
    }
    
    res.json({ authUrl });
  });

  app.get('/api/spotify/callback', (req, res) => {
    // This would handle the OAuth callback from Spotify
    // For now, we'll just set connected to true
    spotifyConnected = true;
    
    // Close the popup and redirect back to the music page
    res.send(`
      <script>
        window.opener.postMessage('spotify-connected', '*');
        window.close();
      </script>
    `);
  });

  app.get('/api/spotify/current-track', isAuthenticated, (req, res) => {
    // In a real implementation, this would call the Spotify API with the user's access token
    res.json({
      is_playing: true,
      progress_ms: 30000,
      item: {
        id: "spotify:track:123",
        name: "Midnight City",
        artists: [{ name: "M83" }],
        album: {
          name: "Hurry Up, We're Dreaming",
          images: [{ url: "https://i.scdn.co/image/ab67616d0000b273b3bb9066b9b3ac8e4bd73fbf" }]
        },
        duration_ms: 260000
      }
    });
  });

  app.post('/api/spotify/play', isAuthenticated, (req, res) => {
    // In a real implementation, this would call the Spotify API to play music
    res.status(200).json({ success: true });
  });

  app.post('/api/spotify/pause', isAuthenticated, (req, res) => {
    // In a real implementation, this would call the Spotify API to pause music
    res.status(200).json({ success: true });
  });

  app.post('/api/spotify/next', isAuthenticated, (req, res) => {
    // In a real implementation, this would call the Spotify API to skip to the next track
    res.status(200).json({ success: true });
  });

  app.post('/api/spotify/previous', isAuthenticated, (req, res) => {
    // In a real implementation, this would call the Spotify API to go to the previous track
    res.status(200).json({ success: true });
  });

  app.post('/api/spotify/volume', isAuthenticated, (req, res) => {
    const { volume } = req.body;
    // In a real implementation, this would call the Spotify API to set the volume
    res.status(200).json({ success: true, volume });
  });

  // Register the error handler middleware
  app.use(errorHandler);

  return httpServer;
}
