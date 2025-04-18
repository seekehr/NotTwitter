import express from 'express';
import { accDb, jwtSecret, saltsDb } from "../../app.js";
import security from "../../db/SecurityGuard.js";
import jwt from "jsonwebtoken";
export const router = express.Router();
/* GET home page. */
router.post('/', async function (req, res, next) {
    console.log("hi");
    if ("username" in req.headers && "password" in req.headers && "displayname" in req.headers) {
        const [username, password, displayName] = [req.headers["username"], req.headers["password"], req.headers["displayname"]];
        if (typeof (username) === 'string' && typeof (password) === 'string' && typeof (displayName) === 'string') {
            if (!security.verifyName(username)) {
                res.status(400).send("Invalid username (<= 30 characters, only a-z, no spaces)");
                return;
            }
            else if (!security.verifyPassword(password)) {
                res.status(400).send("Invalid password (8-30 characters, one number, one special character, one letter minimum).");
                return;
            }
            else if (displayName.length > 60) {
                res.status(400).send("Invalid display name (<= 60 characters)");
                return;
            }
            await createAccount(username, password, displayName, res);
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
async function createAccount(username, password, displayName, res) {
    try {
        const usernameExists = await accDb.checkUsername(username);
        if (usernameExists) {
            return res.status(400).send("Username already in use.");
        }
        const saltResult = await saltsDb.createSalt(username, undefined);
        if (saltResult instanceof Error) {
            return res.status(400).send(`Error during creation: ${saltResult.message}`);
        }
        const hashedPassword = await security.getHash(password, saltResult.salt);
        const account = {
            username,
            password: hashedPassword,
            displayName
        };
        const accountCreationResult = await accDb.createAccount(account);
        if (accountCreationResult instanceof Error) {
            await saltsDb.deleteSalt(username);
            return res.status(400).send(`Error during creation of account: ${accountCreationResult.message}`);
        }
        const tokenResult = jwt.sign(username, jwtSecret);
        // Success
        return res.status(200).send(`Session ID: ${tokenResult}`);
    }
    catch (error) {
        // Catch any unexpected errors
        console.error('Unexpected error in account creation:', error);
        return res.status(500).send('Internal server error');
    }
}
// TODO: Get signup user / password as URL params and create account
export default router;
