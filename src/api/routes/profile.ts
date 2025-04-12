import express from 'express';
const router = express.Router();
import { inspect } from 'util';
import {accDb, jwtSecret} from "../../app.js";
import jwt from "jsonwebtoken";
import SecurityGuard from "../../db/SecurityGuard.js";

/* GET home page. */
router.get('/', async function(req, res, next) {
    if ("username" in req.query && typeof(req.query["username"]) === "string") {
        const username = req.query["username"];
        await profileHandler(res, username);
    } else if ("account_id" in req.query && typeof(req.query["account_id"]) === 'string' && BigInt(req.query["account_id"]) > 0) {
        const account = await accDb.getAccountFromID(BigInt(req.query["account_id"]));
        if (account) {
            res.status(200).json({account: account});
        } else {
            res.status(404).json({error: "Account not found."});
        }
    } else {
        if ("token" in req.headers && typeof(req.headers["token"]) === "string") {
            const token = req.headers["token"];
            const decode = jwt.verify(token, jwtSecret);
            if (typeof(decode) !== 'string') {
                res.status(400).json({error: "Invalid JWT token."});
                return;
            }

            await profileHandler(res, decode);
        }
    }
});

async function profileHandler(res: express.Response, username: string) {
    if (SecurityGuard.verifyName(username)) {
        const account = await accDb.getAccountFromUsername(username);
        if (account) {
            res.status(200).json({account: account});
        } else {
            res.status(404).json({error: "Username not found."});
        }

    } else {
        res.status(400).json({error: "Username is invalid."});
    }
}

export default router;