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

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);

  // Users API
  app.get('/api/user/me', async (req, res) => {
    // For demo purposes, return a fixed user
    const user = await storage.getUser(1);
    res.json(user);
  });

  // Projects API
  app.get('/api/projects', async (req, res) => {
    const projects = await storage.getAllProjects();
    res.json(projects);
  });

  app.post('/api/projects', async (req, res) => {
    try {
      const data = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(data);
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({ message: "Invalid project data" });
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

  // Spotify API (mock implementation since we don't have actual Spotify credentials)
  app.get('/api/spotify/status', (req, res) => {
    res.json({ connected: true });
  });

  app.get('/api/spotify/connect', (req, res) => {
    res.json({ 
      authUrl: "https://accounts.spotify.com/authorize" // Mock URL
    });
  });

  app.get('/api/spotify/current-track', (req, res) => {
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

  app.post('/api/spotify/play', (req, res) => {
    res.status(200).json({ success: true });
  });

  app.post('/api/spotify/pause', (req, res) => {
    res.status(200).json({ success: true });
  });

  app.post('/api/spotify/next', (req, res) => {
    res.status(200).json({ success: true });
  });

  app.post('/api/spotify/previous', (req, res) => {
    res.status(200).json({ success: true });
  });

  app.post('/api/spotify/volume', (req, res) => {
    const { volume } = req.body;
    res.status(200).json({ success: true, volume });
  });

  return httpServer;
}
