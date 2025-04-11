import { rateLimit } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis'
import {RedisClientType} from "redis";

export default class RateLimiter {
    redisDb: RedisClientType;

    constructor(redisDb: RedisClientType) {
        this.redisDb = redisDb;
    }

    /**
     * Time in minutes, limit(s) per window/time
     * @param id
     * @param time
     * @param limit
     */
    getRateLimitMiddleware(id: string, time: number, limit: number) {
        return rateLimit({
            windowMs: time * (60 * 1000), // 1 day
            limit: limit, // Limit each IP to `limit` requests per `window` (here, per 1 day ).
            standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
            legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
            store: new RedisStore({
                sendCommand: (...args: string[]) => this.redisDb.sendCommand(args),
                prefix: id
            }),
            message: JSON.stringify({error: "Too many requests, please try again later."}),
        });
        //TODO: Error handling for if redis server goes down unexpectedly; gotta make sure middleware doesnt mess up all routes
    }
}