import process from "node:process";
import console from "node:console";
import {Kysely, MysqlDialect} from "kysely";
import {Database} from "./Database.js";
import {createPool} from "mysql2";
import AccountsDatabaseManager from "./managers/AccountsDatabaseManager.js";
import SaltsDatabaseManager from "./managers/SaltsDatabaseManager.js";
import "dotenv/config";
import PostsDatabaseManager from "./managers/PostsDatabaseManager.js";
import VerificationTokensDatabaseManager from "./managers/VerificationTokensDatabaseManager.js";
import redis from "redis";
import {inspect} from "util";

const DB_NAME = "nottwitter";
const DB_PORT = 3306;
const DB_HOST = "mysql";

const user = process.env["DB_USER"];
const password = process.env["DB_PASSWORD"];

if (typeof(user) !== 'string' || typeof(password) !== 'string') {
    console.log("Invalid username/password/session secret.")
    process.exit(1);
}

export default class DatabaseCreator {

    createDb(): Kysely<Database> {
        const dialect = new MysqlDialect({
            pool: createPool({
                database: DB_NAME,
                host: DB_HOST,
                user: user,
                password: password,
                port: DB_PORT,
                connectionLimit: 10,
            }),
        });
        console.log(inspect({
            database: DB_NAME,
            host: DB_HOST,
            user: user,
            password: password,
            port: DB_PORT,
            connectionLimit: 10,
        }));
        return new Kysely<Database>({
            dialect
        });
    }

    createRedisDb(): redis.RedisClientType {
        return redis.createClient({
            url: `redis://${process.env["REDIS_USER"]}:${process.env["REDIS_PASSWORD"]}@${process.env["REDIS_HOST"]}:${process.env["REDIS_PORT"]}`,
        });
    }

    async initDatabase(db: Kysely<Database>): Promise<[AccountsDatabaseManager, SaltsDatabaseManager, PostsDatabaseManager, VerificationTokensDatabaseManager]> {
        // TODO: Dynamic loading of managers
        const accDb = new AccountsDatabaseManager(db);
        const saltsDb = new SaltsDatabaseManager(db);
        const postsDb = new PostsDatabaseManager(db);
        const tokensDb = new VerificationTokensDatabaseManager(db);

        try {
            await Promise.all([
                accDb.init().then((result) => {
                    if (!result) {
                        throw new Error("Accounts Database cannot be initialised.");
                    }
                }),
                saltsDb.init().then((result) => {
                    if (!result) {
                        throw new Error("Salts Database cannot be initialised.");
                    }
                }),
                postsDb.init().then((result) => {
                    if (!result) {
                        throw new Error("Posts Database cannot be initialised.");
                    }
                }),
                tokensDb.init().then((result) => {
                    if (!result) {
                        throw new Error("Tokens Database cannot be initialised.");
                    }
                }),
            ]);
            return [accDb, saltsDb, postsDb, tokensDb];
        } catch (error) {
            throw new Error("Error caught during initialisation: " + error);
        }
    }
}
