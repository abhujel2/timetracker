import { 
  User, InsertUser, 
  Project, InsertProject, 
  Task, InsertTask, 
  TimeEntry, InsertTimeEntry, 
  File, InsertFile, 
  Event, InsertEvent, 
  Track, InsertTrack, 
  Settings, InsertSettings
} from "@shared/schema";

// Interface defining all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Project operations
  getAllProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, data: Partial<Project>): Promise<Project>;
  deleteProject(id: number): Promise<void>;
  
  // Task operations
  getAllTasks(): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  getTasksByProject(projectId: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, data: Partial<Task>): Promise<Task>;
  deleteTask(id: number): Promise<void>;
  
  // Time entry operations
  getAllTimeEntries(): Promise<TimeEntry[]>;
  getTimeEntry(id: number): Promise<TimeEntry | undefined>;
  getTimeEntriesByTask(taskId: number): Promise<TimeEntry[]>;
  getTimeEntriesByProject(projectId: number): Promise<TimeEntry[]>;
  getCurrentTimeEntry(): Promise<TimeEntry | undefined>;
  createTimeEntry(entry: InsertTimeEntry): Promise<TimeEntry>;
  updateTimeEntry(id: number, data: Partial<TimeEntry>): Promise<TimeEntry>;
  
  // File operations
  getAllFiles(): Promise<File[]>;
  getFile(id: number): Promise<File | undefined>;
  getFilesByTask(taskId: number): Promise<File[]>;
  getFilesByProject(projectId: number): Promise<File[]>;
  createFile(file: InsertFile): Promise<File>;
  deleteFile(id: number): Promise<void>;
  
  // Event operations
  getAllEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, data: Partial<Event>): Promise<Event>;
  deleteEvent(id: number): Promise<void>;
  
  // Track operations
  getAllTracks(): Promise<Track[]>;
  getTrack(id: number): Promise<Track | undefined>;
  createTrack(track: InsertTrack): Promise<Track>;
  deleteTrack(id: number): Promise<void>;
  
  // Settings operations
  getSettings(userId: number): Promise<Settings | undefined>;
  updateSettings(userId: number, data: Partial<Settings>): Promise<Settings>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private tasks: Map<number, Task>;
  private timeEntries: Map<number, TimeEntry>;
  private files: Map<number, File>;
  private events: Map<number, Event>;
  private tracks: Map<number, Track>;
  private settings: Map<number, Settings>;
  
  private userId: number = 1;
  private projectId: number = 1;
  private taskId: number = 1;
  private timeEntryId: number = 1;
  private fileId: number = 1;
  private eventId: number = 1;
  private trackId: number = 1;
  
  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.tasks = new Map();
    this.timeEntries = new Map();
    this.files = new Map();
    this.events = new Map();
    this.tracks = new Map();
    this.settings = new Map();
    
    // Initialize with some data
    this.initializeDemoData();
  }
  
  private initializeDemoData() {
    // Create demo user
    const user: User = {
      id: 1,
      username: "demouser",
      password: "password", // In a real app, this would be hashed
      email: "user@example.com",
      displayName: "Demo User",
      avatar: null
    };
    this.users.set(1, user);
    
    // Create demo projects
    const projects: Project[] = [
      {
        id: 1,
        name: "Flow App UI/UX Design",
        description: "Design and implement the user interface for the Flow application",
        userId: 1,
        color: "#8B5CF6"
      },
      {
        id: 2,
        name: "Client Project",
        description: "Work for client X",
        userId: 1,
        color: "#EC4899"
      },
      {
        id: 3,
        name: "Personal",
        description: "Personal tasks and activities",
        userId: 1,
        color: "#3B82F6"
      }
    ];
    
    projects.forEach(project => {
      this.projects.set(project.id, project);
      this.projectId = Math.max(this.projectId, project.id) + 1;
    });
    
    // Create demo tasks
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    
    const tasks: Task[] = [
      {
        id: 1,
        title: "Implement Time Tracker UI",
        description: "Create the user interface for time tracking feature",
        userId: 1,
        projectId: 1,
        status: "in-progress",
        estimatedTime: 180, // 3 hours
        progress: 62,
        dueDate: tomorrow.toISOString(),
        createdAt: now.toISOString()
      },
      {
        id: 2,
        title: "Create wireframes for dashboard",
        description: "Design wireframes for the main dashboard",
        userId: 1,
        projectId: 1,
        status: "pending",
        estimatedTime: 120, // 2 hours
        progress: 0,
        dueDate: now.toISOString(),
        createdAt: now.toISOString()
      },
      {
        id: 3,
        title: "Client feedback meeting",
        description: "Discuss progress and get feedback from the client",
        userId: 1,
        projectId: 2,
        status: "upcoming",
        estimatedTime: 60, // 1 hour
        progress: 0,
        dueDate: now.toISOString(),
        createdAt: now.toISOString()
      },
      {
        id: 4,
        title: "Research design trends",
        description: "Research current design trends for UI/UX",
        userId: 1,
        projectId: 1,
        status: "completed",
        estimatedTime: 90, // 1.5 hours
        progress: 100,
        dueDate: yesterday().toISOString(),
        createdAt: yesterday().toISOString()
      }
    ];
    
    tasks.forEach(task => {
      this.tasks.set(task.id, task);
      this.taskId = Math.max(this.taskId, task.id) + 1;
    });
    
    // Create demo time entries
    const timeEntries: TimeEntry[] = [
      {
        id: 1,
        userId: 1,
        taskId: 1,
        projectId: 1,
        startTime: new Date(now.getTime() - 90 * 60000).toISOString(), // 1.5 hours ago
        endTime: null,
        duration: 5400, // 1.5 hours in seconds
        description: "Working on time tracker UI"
      },
      {
        id: 2,
        userId: 1,
        taskId: 4,
        projectId: 1,
        startTime: yesterday().toISOString(),
        endTime: new Date(yesterday().getTime() + 75 * 60000).toISOString(), // 1.25 hours later
        duration: 4500, // 1.25 hours in seconds
        description: "Completed research on design trends"
      }
    ];
    
    timeEntries.forEach(entry => {
      this.timeEntries.set(entry.id, entry);
      this.timeEntryId = Math.max(this.timeEntryId, entry.id) + 1;
    });
    
    // Create demo settings
    const settings: Settings = {
      id: 1,
      userId: 1,
      theme: "dark",
      notificationsEnabled: true,
      minimizeToTray: true,
      preferences: {}
    };
    
    this.settings.set(1, settings);
    
    // Helper function to get yesterday's date
    function yesterday() {
      const date = new Date();
      date.setDate(date.getDate() - 1);
      return date;
    }
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      user => user.username === username
    );
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser: User = { id, ...user };
    this.users.set(id, newUser);
    return newUser;
  }
  
  // Project methods
  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }
  
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }
  
  async createProject(project: InsertProject): Promise<Project> {
    const id = this.projectId++;
    const newProject: Project = { id, ...project };
    this.projects.set(id, newProject);
    return newProject;
  }
  
  async updateProject(id: number, data: Partial<Project>): Promise<Project> {
    const project = this.projects.get(id);
    if (!project) {
      throw new Error("Project not found");
    }
    
    const updatedProject = { ...project, ...data };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }
  
  async deleteProject(id: number): Promise<void> {
    if (!this.projects.has(id)) {
      throw new Error("Project not found");
    }
    
    this.projects.delete(id);
    
    // Delete related tasks
    const tasksToDelete = Array.from(this.tasks.values())
      .filter(task => task.projectId === id)
      .map(task => task.id);
    
    tasksToDelete.forEach(taskId => this.tasks.delete(taskId));
    
    // Delete related time entries
    const entriesToDelete = Array.from(this.timeEntries.values())
      .filter(entry => entry.projectId === id)
      .map(entry => entry.id);
    
    entriesToDelete.forEach(entryId => this.timeEntries.delete(entryId));
  }
  
  // Task methods
  async getAllTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }
  
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }
  
  async getTasksByProject(projectId: number): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter(task => task.projectId === projectId);
  }
  
  async createTask(task: InsertTask): Promise<Task> {
    const id = this.taskId++;
    const now = new Date();
    const newTask: Task = { 
      id, 
      ...task, 
      createdAt: task.createdAt || now.toISOString() 
    };
    this.tasks.set(id, newTask);
    return newTask;
  }
  
  async updateTask(id: number, data: Partial<Task>): Promise<Task> {
    const task = this.tasks.get(id);
    if (!task) {
      throw new Error("Task not found");
    }
    
    const updatedTask = { ...task, ...data };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }
  
  async deleteTask(id: number): Promise<void> {
    if (!this.tasks.has(id)) {
      throw new Error("Task not found");
    }
    
    this.tasks.delete(id);
    
    // Delete related time entries
    const entriesToDelete = Array.from(this.timeEntries.values())
      .filter(entry => entry.taskId === id)
      .map(entry => entry.id);
    
    entriesToDelete.forEach(entryId => this.timeEntries.delete(entryId));
  }
  
  // Time entry methods
  async getAllTimeEntries(): Promise<TimeEntry[]> {
    return Array.from(this.timeEntries.values());
  }
  
  async getTimeEntry(id: number): Promise<TimeEntry | undefined> {
    return this.timeEntries.get(id);
  }
  
  async getTimeEntriesByTask(taskId: number): Promise<TimeEntry[]> {
    return Array.from(this.timeEntries.values())
      .filter(entry => entry.taskId === taskId);
  }
  
  async getTimeEntriesByProject(projectId: number): Promise<TimeEntry[]> {
    return Array.from(this.timeEntries.values())
      .filter(entry => entry.projectId === projectId);
  }
  
  async getCurrentTimeEntry(): Promise<TimeEntry | undefined> {
    return Array.from(this.timeEntries.values())
      .find(entry => entry.endTime === null);
  }
  
  async createTimeEntry(entry: InsertTimeEntry): Promise<TimeEntry> {
    // End any current time entry
    const currentEntry = await this.getCurrentTimeEntry();
    if (currentEntry) {
      const now = new Date();
      const duration = Math.floor((now.getTime() - new Date(currentEntry.startTime).getTime()) / 1000);
      await this.updateTimeEntry(currentEntry.id, { 
        endTime: now.toISOString(),
        duration
      });
    }
    
    const id = this.timeEntryId++;
    const newEntry: TimeEntry = { id, ...entry };
    this.timeEntries.set(id, newEntry);
    return newEntry;
  }
  
  async updateTimeEntry(id: number, data: Partial<TimeEntry>): Promise<TimeEntry> {
    const entry = this.timeEntries.get(id);
    if (!entry) {
      throw new Error("Time entry not found");
    }
    
    const updatedEntry = { ...entry, ...data };
    this.timeEntries.set(id, updatedEntry);
    return updatedEntry;
  }
  
  // File methods
  async getAllFiles(): Promise<File[]> {
    return Array.from(this.files.values());
  }
  
  async getFile(id: number): Promise<File | undefined> {
    return this.files.get(id);
  }
  
  async getFilesByTask(taskId: number): Promise<File[]> {
    return Array.from(this.files.values())
      .filter(file => file.taskId === taskId);
  }
  
  async getFilesByProject(projectId: number): Promise<File[]> {
    return Array.from(this.files.values())
      .filter(file => file.projectId === projectId);
  }
  
  async createFile(file: InsertFile): Promise<File> {
    const id = this.fileId++;
    const now = new Date();
    const newFile: File = { 
      id, 
      ...file, 
      uploadedAt: file.uploadedAt || now.toISOString() 
    };
    this.files.set(id, newFile);
    return newFile;
  }
  
  async deleteFile(id: number): Promise<void> {
    if (!this.files.has(id)) {
      throw new Error("File not found");
    }
    
    this.files.delete(id);
  }
  
  // Event methods
  async getAllEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }
  
  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }
  
  async createEvent(event: InsertEvent): Promise<Event> {
    const id = this.eventId++;
    const newEvent: Event = { id, ...event };
    this.events.set(id, newEvent);
    return newEvent;
  }
  
  async updateEvent(id: number, data: Partial<Event>): Promise<Event> {
    const event = this.events.get(id);
    if (!event) {
      throw new Error("Event not found");
    }
    
    const updatedEvent = { ...event, ...data };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }
  
  async deleteEvent(id: number): Promise<void> {
    if (!this.events.has(id)) {
      throw new Error("Event not found");
    }
    
    this.events.delete(id);
  }
  
  // Track methods
  async getAllTracks(): Promise<Track[]> {
    return Array.from(this.tracks.values());
  }
  
  async getTrack(id: number): Promise<Track | undefined> {
    return this.tracks.get(id);
  }
  
  async createTrack(track: InsertTrack): Promise<Track> {
    const id = this.trackId++;
    const now = new Date();
    const newTrack: Track = { 
      id, 
      ...track, 
      addedAt: track.addedAt || now.toISOString() 
    };
    this.tracks.set(id, newTrack);
    return newTrack;
  }
  
  async deleteTrack(id: number): Promise<void> {
    if (!this.tracks.has(id)) {
      throw new Error("Track not found");
    }
    
    this.tracks.delete(id);
  }
  
  // Settings methods
  async getSettings(userId: number): Promise<Settings | undefined> {
    return Array.from(this.settings.values())
      .find(settings => settings.userId === userId);
  }
  
  async updateSettings(userId: number, data: Partial<Settings>): Promise<Settings> {
    let settings = await this.getSettings(userId);
    
    if (!settings) {
      // Create new settings if they don't exist
      settings = {
        id: userId,
        userId,
        theme: "dark",
        notificationsEnabled: true,
        minimizeToTray: true,
        preferences: {}
      };
    }
    
    const updatedSettings = { ...settings, ...data };
    this.settings.set(updatedSettings.id, updatedSettings);
    return updatedSettings;
  }
}

export const storage = new MemStorage();
