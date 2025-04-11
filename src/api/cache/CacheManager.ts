import { rateLimit } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis'
import {RedisClientType} from "redis";
import * as stream from "node:stream";

export default class RateLimiter {
    redisDb: RedisClientType;
    cacheDirectory: Map<string, number>;

    constructor(redisDb: RedisClientType) {
        this.redisDb = redisDb;
        this.cacheDirectory = new Map<string, number>();
    }

    addCache(key: string, expiresAt: number | undefined) {
        const minutes = expiresAt ?? 60; // default to 60 minutes
        const expirationTime = new Date(Date.now() + minutes * 60 * 1000);
        this.cacheDirectory.set(key, expirationTime.getTime());
    }

    getCache(key: string): number|undefined {
        return this.cacheDirectory.get(key);
    }
}