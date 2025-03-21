import express, {response} from 'express';

import indexRouter from './api/routes/index.js';
import usersRouter from './api/routes/users.js';
import registerRouter from './api/routes/register.js';
import loginRouter from './api/routes/login.js';
import AccountsDatabaseManager from "./db/managers/AccountsDatabaseManager.js";
import * as process from "node:process";
import * as console from "node:console";
import session from "express-session";
import security from "./db/SecurityGuard.js";
import crypto from "crypto";
import isAuth from "./api/middleware/isAuth.js";
import {Database} from "./db/Database.js";
import {Kysely, MysqlDialect} from "kysely";
import {createPool} from "mysql2";
import SaltsDatabaseManager from "./db/managers/SaltsDatabaseManager.js";
import DatabaseCreator from "./db/DatabaseCreator.js";
import "dotenv/config";
import jwt from "jsonwebtoken";

const dbCreator = new DatabaseCreator();
let db: Kysely<Database>;
let accDb: AccountsDatabaseManager;
let saltsDb: SaltsDatabaseManager;

try {
    db = dbCreator.createDb();
    [accDb, saltsDb] = await dbCreator.initDatabase(db);
} catch (error) {
    console.log("Error during DB init: " + error);
    process.exit(1);
}

const app = express();

const secret = process.env["JWT_SECRET"];
if (typeof(secret) !== 'string') {
    console.log("Invalid session secret.")
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