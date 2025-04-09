import express from 'express';
import indexRouter from './api/routes/index.js';
import usersRouter from './api/routes/users.js';
import registerRouter from './api/routes/account/register.js';
import loginRouter from './api/routes/account/login.js';
import postsRouter from './api/routes/post.js';
import viewPostsRouter from './api/routes/posts.js';
import verifyEmailRouter from "./api/routes/account/create-token.js";
import * as process from "node:process";
import * as console from "node:console";
import auth from "./api/middleware/auth.js";
import DatabaseCreator from "./db/DatabaseCreator.js";
import "dotenv/config";
import cookieParser from 'cookie-parser';
import './utils/polyfills.js';
const dbCreator = new DatabaseCreator();
let db;
export let accDb;
export let saltsDb;
export let postsDb;
export let tokensDb;
export const jwtSecret = process.env["JWT_SECRET"] ?? "";
if (jwtSecret === "") {
    console.log("Invalid session secret.");
    process.exit(1);
}
try {
    db = dbCreator.createDb();
    [accDb, saltsDb, postsDb, tokensDb] = await dbCreator.initDatabase(db);
}
catch (error) {
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
app.use('/verify-email', verifyEmailRouter);
