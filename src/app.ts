import express, {response} from 'express';

import indexRouter from './api/routes/index.js';
import usersRouter from './api/routes/users.js';
import registerRouter from './api/routes/account/register.js';
import loginRouter from './api/routes/account/login.js';
import postsRouter from './api/routes/post.js';
import viewPostsRouter from './api/routes/posts.js';
import AccountsDatabaseManager from "./db/managers/AccountsDatabaseManager.js";
import * as process from "node:process";
import * as console from "node:console";
import session from "express-session";
import security from "./db/SecurityGuard.js";
import crypto from "crypto";
import auth from "./api/middleware/auth.js";
import {Database} from "./db/Database.js";
import {Kysely, MysqlDialect} from "kysely";
import {createPool} from "mysql2";
import SaltsDatabaseManager from "./db/managers/SaltsDatabaseManager.js";
import DatabaseCreator from "./db/DatabaseCreator.js";
import "dotenv/config";
import jwt from "jsonwebtoken";
import cookieParser from 'cookie-parser';
import PostsDatabaseManager from "./db/managers/PostsDatabaseManager.js";
import './utils/polyfills.js';

const dbCreator = new DatabaseCreator();
let db: Kysely<Database>;
export let accDb: AccountsDatabaseManager;
export let saltsDb: SaltsDatabaseManager;
export let postsDb: PostsDatabaseManager;

export const jwtSecret = process.env["JWT_SECRET"] ?? "";
if (jwtSecret === "") {
    console.log("Invalid session secret.");
    process.exit(1);
}

try {
    db = dbCreator.createDb();
    [accDb, saltsDb, postsDb] = await dbCreator.initDatabase(db);
} catch (error) {
    console.log("Error during DB init: " + error);
    process.exit(1);
}

export const app = express();
app.use(cookieParser());
app.use(express.json());

app.use('/', indexRouter);
app.use('/feed', auth, usersRouter);
app.use('/register', registerRouter);
app.use('/login', loginRouter);
app.use('/post', auth, postsRouter);
app.use('/posts', auth, viewPostsRouter);