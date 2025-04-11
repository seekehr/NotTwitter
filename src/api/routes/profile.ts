import express from 'express';
const router = express.Router();
import { inspect } from 'util';
import {accDb, jwtSecret} from "../../app.js";
import jwt from "jsonwebtoken";

/* GET home page. */
router.get('/', async function(req, res, next) {
    if ("token" in req.headers && typeof(req.headers["token"]) === "string") {
        const username = jwt.verify(req.headers["token"], jwtSecret);
        if (typeof(username) === 'string' && username.length < 30 && username.length > 7) {
            const account = await accDb.getAccountFromUsername(username);
            if (account) {
                res.status(200).json({message: "Username is valid.", account: account});
            } else {
                res.status(404).json({error: "Username not found."});
            }

        } else {
            res.status(400).json({error: "Username is invalid."});
        }
    } else {
        res.status(400).json({error: "Invalid request."});
    }
});

export default router;