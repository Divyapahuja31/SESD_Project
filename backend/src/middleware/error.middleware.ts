import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  console.error(`[CRITICAL STUDIO ERROR] ${err.name}: ${err.message}`);
  if (err.stack) console.error(err.stack);
  
  res.status(500).json({ 
    error: "Studio Internal Engine Error", 
    details: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
};
