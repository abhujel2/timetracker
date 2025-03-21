import { Request, Response, NextFunction } from 'express';

// Middleware to check if user is authenticated
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  
  res.status(401).json({ message: "Not authenticated" });
}

// Middleware for error handling
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(err.stack);
  
  // Handle specific types of errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  // Default error response
  res.status(500).json({ message: 'Something went wrong' });
}