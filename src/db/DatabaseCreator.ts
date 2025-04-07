import process from "node:process";
import console from "node:console";
import {Kysely, MysqlDialect} from "kysely";
import {Database} from "./Database.js";
import {createPool} from "mysql2";
import AccountsDatabaseManager from "./managers/AccountsDatabaseManager.js";
import SaltsDatabaseManager from "./managers/SaltsDatabaseManager.js";
import "dotenv/config";
import {jwtSecret} from "../app.js";
import PostsDatabaseManager from "./managers/PostsDatabaseManager.js";

const DB_NAME = "nottwitter";
const DB_PORT = 3306;
const DB_HOST = "localhost";

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
        return new Kysely<Database>({
            dialect,
            /*log(event) {
                if (event.level === 'query') {
                    console.log("=======================");
                    console.log('Query executed:', event.query.sql);
                    console.log('Parameters:', event.query.parameters);
                    console.log(`Duration: ${event.queryDurationMillis}ms`);
                    console.log("=======================");
                } else if (event.level === 'error') {
                    console.error('Query error:', event.error);
                }
            }*/
        }); // mem leak unless i clone it due to the reference to this.db as this class will be initialised once and never-reused
    }

    async initDatabase(db: Kysely<Database>): Promise<[AccountsDatabaseManager, SaltsDatabaseManager, PostsDatabaseManager]> {
        // TODO: Dynamic loading of managers
        const accDb = new AccountsDatabaseManager(db);
        const saltsDb = new SaltsDatabaseManager(db);
        const postsDb = new PostsDatabaseManager(db);
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
                })
            ]);
            return [accDb, saltsDb, postsDb];
        } catch (error) {
            throw new Error("Error caught during initialisation: " + error);
        }
    }
}
