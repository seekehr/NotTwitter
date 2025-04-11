import express, {response} from 'express';

import indexRouter from './api/routes/index.js';
import usersRouter from './api/routes/users.js';
import registerRouter from './api/routes/account/register.js';
import loginRouter from './api/routes/account/login.js';
import postsRouter from './api/routes/post.js';
import viewPostsRouter from './api/routes/posts.js';
import checkUsernameRouter from "./api/routes/account/check-username.js";
import profileRouter from './api/routes/profile.js';

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
import RateLimiter from "./api/middleware/ratelimiter.js";
import {RedisClientType} from "redis";
import {RedisStore} from "rate-limit-redis";
import cors from "cors";

const dbCreator = new DatabaseCreator();
let db: Kysely<Database>;
let redisDb: RedisClientType;

export let accDb: AccountsDatabaseManager;
export let saltsDb: SaltsDatabaseManager;
export let postsDb: PostsDatabaseManager;

let rateLimiter: RateLimiter|undefined;

export const jwtSecret = process.env["JWT_SECRET"] ?? "";
if (jwtSecret === "") {
    console.log("Invalid session secret.");
    process.exit(1);
}

try {
    db = dbCreator.createDb();
    const connectToRedis = async () => {
        redisDb = dbCreator.createRedisDb();
        await redisDb.connect();
        if (!redisDb.isOpen) {
            throw new Error("Redis connection failed.");
        }
        redisDb.on('error', (err) => {
            console.error('Redis Client Error:', err);
            setTimeout(connectToRedis, 10000);
        });

        rateLimiter = new RateLimiter(redisDb);

        console.log("Redis Client Connected");
    };
    await connectToRedis();

    [accDb, saltsDb, postsDb] = await dbCreator.initDatabase(db);
} catch (error) {
    console.log("Error during DB init: " + error);
    process.exit(1);
}

export const app = express();
app.use(cors({
    origin: 'http://localhost:8080', // Frontend origin
    credentials: true,
}));

app.use(cookieParser());
app.use(express.json());

if (rateLimiter instanceof RateLimiter) {
    app.use('/', indexRouter);
    app.use('/feed', auth, usersRouter);
    // ===================== SIGN-UP ========================
    app.use('/register', rateLimiter.getRateLimitMiddleware("/register", 1440, 2 *1000), registerRouter);
    app.use('/check-username', rateLimiter.getRateLimitMiddleware("/check-username", 1440, 300 *1000), checkUsernameRouter);
    app.use('/login', rateLimiter.getRateLimitMiddleware("/login" ,10, 5 *1000), loginRouter);

    app.use('/profile', auth, rateLimiter.getRateLimitMiddleware("/profile", 10, 20 *1000), profileRouter);
    app.use('/post', auth, rateLimiter.getRateLimitMiddleware("/post", 10, 4 *1000), postsRouter);
    app.use('/posts', rateLimiter.getRateLimitMiddleware("/posts", 10, 4 *1000), viewPostsRouter);

}