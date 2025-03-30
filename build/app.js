import express from 'express';
import indexRouter from './api/routes/index.js';
import usersRouter from './api/routes/users.js';
import registerRouter from './api/routes/register.js';
import loginRouter from './api/routes/login.js';
import * as process from "node:process";
import * as console from "node:console";
import isAuth from "./api/middleware/auth.js";
import DatabaseCreator from "./db/DatabaseCreator.js";
import "dotenv/config";
import jwt from "jsonwebtoken";
const dbCreator = new DatabaseCreator();
let db;
export let accDb;
export let saltsDb;
export const jwtSecret = process.env["JWT_SECRET"] ?? "";
if (jwtSecret === "") {
    console.log("Invalid session secret.");
    process.exit(1);
}
try {
    db = dbCreator.createDb();
    [accDb, saltsDb] = await dbCreator.initDatabase(db);
}
catch (error) {
    console.log("Error during DB init: " + error);
    process.exit(1);
}
export const app = express();
const test = jwt.sign("e@".repeat(15), jwtSecret);
// TODO: Use express-session for browser users.
app.use('/', indexRouter);
app.use('/feed', isAuth, usersRouter);
app.use('/register', registerRouter);
app.use('/login', loginRouter);
