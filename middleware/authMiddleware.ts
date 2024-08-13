// authMiddleware.js
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken'; 
import dotenv from "dotenv";
// Load environment variables from .env.local file
dotenv.config({ path: ".env.local" });

const authenticateToken = (    
    req: Request,
    res: Response,
    next: NextFunction) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, 'your-jwt-secret', (err:any, user:any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

export default authenticateToken;