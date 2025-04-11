import express, { Request, Response, NextFunction } from 'express';
import jwt from "jsonwebtoken";
import {accDb, jwtSecret} from "../../app.js";

export const auth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    isAuthenticated(req, res, next).then(((result) => {
        if (result) next();
    })).catch((err) => console.log(err));
}

export default auth;

async function isAuthenticated(req: Request, res: Response, next: NextFunction): Promise<boolean> {
    if ("token" in req.headers) {
        const token = req.headers["token"];
        if (typeof(token) === 'string') {
            const decode = jwt.verify(token, jwtSecret);
            if (typeof(decode) === 'string') {
                const checkUsername = await accDb.checkUsername(decode);
                if (checkUsername) {
                    return true;
                } else {
                    res.status(401).json({error: "Invalid session id (or perhaps it does not match the username)? SessionID: " + JSON.stringify(decode)});
                }
            } else {
                res.status(401).json({error: "Invalid JWT token supplied."});
            }
        } else {
            console.log('21312321312');
            res.status(401).json({error: "Invalid session id or username given in headers."});
        }
    } else {
        console.log('dsasdasdasd');
        if ("token" in req.cookies) {
            const token = req.cookies["token"];
            if (typeof(token) === 'string') {
                const decode = jwt.verify(token, jwtSecret);
                if (typeof(decode) === 'string') {
                    return true;
                } else {
                    res.status(401).json({error: "Invalid session id (or perhaps it does not match the username)? SessionID: " + JSON.stringify(decode)});
                    return false;
                }
            }
        }
        res.status(401).json({error: "No session id or username given in headers."});
    }

    return false;
}