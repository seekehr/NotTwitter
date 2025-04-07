import express from 'express';
import {accDb, jwtSecret, saltsDb} from "../../../app.js";
import security from "../../../db/SecurityGuard.js";
import jwt from "jsonwebtoken";

export const router = express.Router();

/* GET home page. */
router.post('/', async function(req, res, next) {
    if ("username" in req.headers && "password" in req.headers && "displayname" in req.headers) {
        const [username, password, displayName] = [req.headers["username"], req.headers["password"], req.headers["displayname"]];
        if (typeof (username) === 'string' && typeof (password) === 'string' && typeof (displayName) === 'string') {
            if (!security.verifyName(username)) {
                res.status(400).json({error: "Invalid username (<= 30 characters, only a-z, no spaces)"});
                return;
            } else if(!security.verifyPassword(password)) {
                res.status(400).json({error: "Invalid password (8-30 characters, one number, one special character, one letter minimum)."});
                return;
            } else if (displayName.length > 60) {
                res.status(400).json({error: "Invalid display name (<= 60 characters)"});
                return;
            }

            await createAccount(username, password, displayName, req, res);
        } else {
            res.status(401).json({error: "Invalid header types."});
            return;
        }
    } else {
        res.status(401).json({error: "Header values missing."});
    }
});

async function createAccount(username: string, password: string, displayName: string, req: express.Request, res: express.Response) {
    try {
        const usernameExists = await accDb.checkUsername(username);
        if (usernameExists) {
            return res.status(400).json({error: "Username already in use."});
        }
        const saltResult = await saltsDb.createSalt(username, undefined);

        const hashedPassword = await security.getHash(password, saltResult.salt);
        const account = {
            username,
            password: hashedPassword,
            displayName
        };
       await accDb.createAccount(account);
       const tokenResult = jwt.sign(username, jwtSecret);

        // Save cookie browser
        const acceptHeader = req.headers.accept || "";
        if (acceptHeader.includes('text/html')) {
            res.cookie('token', tokenResult, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 20 * 24 * 60 * 60 * 1000, // 20 days in milliseconds
            });
        }

        return res.status(200).json({token: `Token ID: ${tokenResult}`});

    } catch (err) {
        return res.status(400).json({error: err});
    }
}



// TODO: Get signup user / password as URL params and create account
export default router;