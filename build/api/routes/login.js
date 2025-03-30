import express from 'express';
import security from "../../db/SecurityGuard.js";
import { accDb, jwtSecret, saltsDb } from "../../app.js";
import jwt from "jsonwebtoken";
export const router = express.Router();
/* GET home page. */
router.post('/', async function (req, res, next) {
    if ("username" in req.headers && "password" in req.headers) {
        const [username, password] = [req.headers["username"], req.headers["password"]];
        if (typeof (username) === 'string' && typeof (password) === 'string') {
            if (!security.verifyName(username)) {
                res.status(400).send("Invalid username (<= 30 characters, only a-z, no spaces)");
                return;
            }
            else if (!security.verifyPassword(password)) {
                res.status(400).send("Invalid password (8-30 characters, one number, one special character, one letter minimum).");
                return;
            }
            await loginHandler(username, password, res);
        }
        else {
            res.status(401).send("Invalid header types.");
            return;
        }
    }
    else {
        res.status(401).send("Header values missing.");
    }
});
async function loginHandler(username, password, res) {
    try {
        // Retrieve salt
        const saltResult = await saltsDb.getSalt(username);
        if (saltResult instanceof Error) {
            return res.status(401).send(`Salt not found. Error: ${saltResult.message}`);
        }
        // Hash password with salt
        const hashedPassword = await security.getHash(password, saltResult.salt);
        // Attempt to retrieve account
        const account = await accDb.getAccount(username, hashedPassword);
        if (!account) {
            return res.status(401).send("Invalid username or password.");
        }
        // Create new session
        const tokenResult = jwt.sign(username, jwtSecret);
        // Successful login
        return res.status(200).send(`Session ID: ${tokenResult}`);
    }
    catch (error) {
        console.error('Login error: ', error);
        return res.status(401).send(`Login failed. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
// TODO: Get signup user / password as URL params and create account
export default router;
