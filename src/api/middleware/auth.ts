import express, { Request, Response, NextFunction } from 'express';
import jwt from "jsonwebtoken";
import {jwtSecret} from "../../app.js";

export const router = express.Router();

router.get('/', function(req, res, next) {
    if (isAuthenticated(req, res, next)) {
        next();
    }
});

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
    if ("username" in req.headers && "token" in req.headers) {
        const [username, token] = [req.headers["username"], req.headers["token"]];
        if (typeof(token) === 'string') {
            const decode = jwt.verify(token, jwtSecret);
            if (typeof(decode) === 'string' && username === decode) {
                return true;
            } else {
                res.status(400).send("Invalid session id (or perhaps it does not match the username)? SessionID: " + JSON.stringify(decode));
            }
        } else {
            res.status(400).send("Invalid session id or username given in headers.");
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
                        res.status(400).send("Invalid session id (or perhaps it does not match the username)? SessionID: " + JSON.stringify(decode));
                    }
                }
            }
        } else {
            res.status(400).send("No session id or username given in headers.");
        }
        res.status(400).send("No session id or username given in headers.");
    }
    return false;
}