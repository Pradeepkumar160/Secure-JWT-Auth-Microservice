import { Request, Response, NextFunction } from "express";
import { RateLimiterMemory } from "rate-limiter-flexible";

// In-memory rate limiter for demo purposes. 
// In production, use RateLimiterRedis with ioredis.
const rateLimiter = new RateLimiterMemory({
  points: 10, // 10 requests
  duration: 60, // per 60 seconds
});

export const rateLimitMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await rateLimiter.consume(req.ip || "unknown");
    next();
  } catch (rejRes) {
    res.status(429).json({
      success: false,
      message: "Too many requests, please try again later.",
    });
  }
};

const loginRateLimiter = new RateLimiterMemory({
  points: 5, // 5 attempts
  duration: 60 * 15, // per 15 minutes
});

export const bruteForceMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await loginRateLimiter.consume(req.ip || "unknown");
    next();
  } catch (rejRes) {
    res.status(429).json({
      success: false,
      message: "Too many login attempts, please try again in 15 minutes.",
    });
  }
};
