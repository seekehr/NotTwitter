import { Request, Response, NextFunction } from 'express';

export default function isAuthenticated(req: Request, res: Response, next: NextFunction) {
    console.log("Hi")
    next()
}