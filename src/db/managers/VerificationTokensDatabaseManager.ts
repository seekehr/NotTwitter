import {Kysely, sql} from 'kysely'
import IDatabaseManager from "./IDatabaseManager.js";
import {Database, NewPost, Post} from "../Database.js";
import security from "../SecurityGuard.js";

export default class VerificationTokensDatabaseManager implements IDatabaseManager {
    db: Kysely<Database>

    constructor(db: Kysely<Database>) {
        this.db = db;
    }

    /**
     * Only function to handle the exception itself.
     */
    async init(): Promise<boolean> {
        const TABLE_QUERY = sql`
            CREATE TABLE IF NOT EXISTS verification_tokens (
                                                username VARCHAR(30) PRIMARY KEY,
                                                token CHAR(172) NOT NULL
            );`;

        try {
            await TABLE_QUERY.execute(this.db);
            return true;
        } catch (error) {
            console.error("Error encountered during creating `accounts` table (invalid connection details?): " + error);
            return false;
        }
    }

    async createToken(username: string): Promise<string> {
        try {
            const token = await security.getHash(Math.random().toString(), "1");
            await this.db
                .insertInto("verification_tokens")
                .values({
                    username,
                    token
                })
                .executeTakeFirst();
            return token;
        } catch (error) {
            throw error instanceof Error ? error : new Error("\n(Invalid error type, creating error...): \n " + String(error));
        }
    }

    async checkToken(username: string, token: string): Promise<boolean> {
        const result = await this.db
            .selectFrom("verification_tokens")
            .selectAll()
            .where("username", '=', username)
            .where("token", '=', token)
            .executeTakeFirst();
        return result !== undefined;
    }
}