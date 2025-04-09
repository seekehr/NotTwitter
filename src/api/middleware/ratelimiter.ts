import { rateLimit } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis'

export default class RateLimiter {
    redisStore: RedisStore

    constructor(redisStore: RedisStore) {
        this.redisStore = redisStore;
    }

    getRegisterRateLimit() {
        return rateLimit({
            windowMs: 1440 * (60 * 1000), // 1 day
            limit: 2, // Limit each IP to 2 requests per `window` (here, per 1 day ).
            standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
            legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
            store: this.redisStore
        });
    }

    getLoginRateLimit() {
        return rateLimit({
            windowMs: 15 * (60 * 1000), // 15m
            limit: 5, // Limit each IP to 5 requests per `window` (here, per 15m ).
            standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
            legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
            store: this.redisStore
        });
    }

    getPostRateLimit() {
        return rateLimit({
            windowMs: 10 * (60 * 1000), // 10m
            limit: 4, // Limit each IP to 4 requests per `window` (here, per 10m ).
            standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
            legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
            store: this.redisStore
        });
    }


}