import express from 'express';
import security from "../../../db/SecurityGuard.js";
import {accDb, jwtSecret, saltsDb} from "../../../app.js";
import jwt from "jsonwebtoken";

export const router = express.Router();

/* GET home page. */
router.post('/', async function (req, res, next) {
    if ("username" in req.headers && "password" in req.headers) {
        const [username, password] = [req.headers["username"], req.headers["password"]];
        if (typeof (username) === 'string' && typeof (password) === 'string') {
            if (!security.verifyName(username)) {
                res.status(400).json({error: "Invalid username (<= 30 characters, only a-z, no spaces)"});
                return;
            } else if(!security.verifyPassword(password)) {
                res.status(400).json({error: "Invalid password (8-30 characters, one number, one special character, one letter minimum)."});
                return;
            }

            await loginHandler(username, password, req, res);
        } else {
            res.status(400).json({error: "Invalid header types."});
            return;
        }
    } else {
        res.status(400).json({error: "Header values missing."});
    }
});

async function loginHandler(username: string, password: string, req: express.Request, res: express.Response) {
    try {
        const saltResult = await saltsDb.getSalt(username);
        if (saltResult instanceof Error) {
            return res.status(402).json({error: `Salt not found. Error: ${saltResult.message}`});
        }

        const hashedPassword = await security.getHash(password, saltResult.salt);

        const account = await accDb.getAccount(username, hashedPassword);

        if (!account) {
            return res.status(402).json({error: "Invalid username or password."});
        }

        const tokenResult = jwt.sign(username, jwtSecret);
        return res.status(200).json({token: tokenResult});

    } catch (error) {
        return res.status(400).json({error: `Login failed. Error: ${error instanceof Error ? error.message : 'Unknown error'}`});
    }
}

export default router;