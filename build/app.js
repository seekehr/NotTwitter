import express from 'express';
import indexRouter from './api/routes/index.js';
import usersRouter from './api/routes/users.js';
import registerRouter from './api/routes/register.js';
import loginRouter from './api/routes/login.js';
import * as process from "node:process";
import * as console from "node:console";
import isAuth from "./api/middleware/isAuth.js";
import DatabaseCreator from "./db/DatabaseCreator.js";
import "dotenv/config";
import jwt from "jsonwebtoken";
const dbCreator = new DatabaseCreator();
let db;
let accDb;
let saltsDb;
try {
    db = dbCreator.createDb();
    [accDb, saltsDb] = await dbCreator.initDatabase(db);
}
catch (error) {
    console.log("Error during DB init: " + error);
    process.exit(1);
}
const app = express();
const secret = process.env["JWT_SECRET"];
if (typeof (secret) !== 'string') {
    console.log("Invalid session secret.");
    process.exit(1);
}
const test = jwt.sign("teewqewqewwqewqst", secret);
console.log(test);
console.log(Buffer.byteLength(test));
console.log(Buffer.byteLength(test, 'base64'));
// TODO: Work on JWT token auth.
app.use('/', indexRouter);
app.use('/feed', isAuth, usersRouter);
app.use('/register', registerRouter);
app.use('/login', loginRouter);
export default app;
