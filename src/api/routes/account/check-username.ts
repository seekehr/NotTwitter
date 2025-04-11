import express from 'express';
const router = express.Router();
import { inspect } from 'util';
import {accDb} from "../../../app.js";

/* GET home page. */
router.get('/', async function(req, res, next) {
    if ("username" in req.query && typeof(req.query["username"]) === "string") {
        const usernameExists = await accDb.checkUsername(req.query["username"]);
        if (usernameExists) {
            res.status(402).json({error: "Username already in use."});
        } else {
            res.status(200).json({message: "Username not in use."});
        }
    } else {
        res.status(400).json({error: "Invalid request."});
    }
});

export default router;