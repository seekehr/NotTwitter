import express, { Request, Response, NextFunction } from 'express';
import jwt from "jsonwebtoken";
import {jwtSecret} from "../../app.js";

export const auth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (isAuthenticated(req, res, next)) {
        next();
    } else {
        res.redirect("/register");
    }
}

export default auth;

function isAuthenticated(req: Request, res: Response, next: NextFunction) {
    if ("username" in req.headers && "token" in req.headers) {
        const [username, token] = [req.headers["username"], req.headers["token"]];
        if (typeof(token) === 'string') {
            const decode = jwt.verify(token, jwtSecret);
            if (typeof(decode) === 'string' && username === decode) {
                return true;
            } else {
                res.status(400).json({error: "Invalid session id (or perhaps it does not match the username)? SessionID: " + JSON.stringify(decode)});
            }
        } else {
            res.status(400).json({error: "Invalid session id or username given in headers."});
        }
    } else {
        // if the request is thru browser
        const acceptHeader = req.headers.accept || "";
        if (acceptHeader.includes('text/html')) {
            if ("token" in req.cookies) {
                const token = req.cookies["token"];
                if (typeof(token) === 'string') {
                    const decode = jwt.verify(token, jwtSecret);
                    if (typeof(decode) === 'string') {
                        return true;
                    } else {
                        res.status(400).json({error: "Invalid session id (or perhaps it does not match the username)? SessionID: " + JSON.stringify(decode)});
                    }
                }
            }
        }
        res.status(400).json({error: "No session id or username given in headers."});
    }
    return false;
}