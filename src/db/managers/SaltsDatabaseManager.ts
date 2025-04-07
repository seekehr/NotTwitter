import {Account, Database, Salt} from "../Database.js";
import {Kysely, sql} from "kysely";
import IDatabaseManager from "./IDatabaseManager.js";
import crypto from "crypto";

export default class SaltsDatabaseManager implements IDatabaseManager {
    db: Kysely<Database>;

    constructor(db: Kysely<Database>) {
        this.db = db;
    }

    async init(): Promise<boolean> {
        const TABLE_QUERY = sql`
            CREATE TABLE IF NOT EXISTS salts
            (
                username VARCHAR(30) NOT NULL PRIMARY KEY,
                salt CHAR(172)   NOT NULL
            );`;

        try {
            await TABLE_QUERY.execute(this.db);
            return true;
        } catch (error) {
            console.error("Error encountered during creating `salts` table (invalid connection details?): " + error);
            return false;
        }
    }

    async createSalt(username: string, useSalt: string|undefined): Promise<Salt> {
        try {
            const salt = useSalt ?? Buffer.from(crypto.randomBytes(64)).toString('base64');
            await this.db
                .replaceInto("salts")
                .values({
                    username,
                    salt
                })
                .executeTakeFirst();
            return {username, salt};
        } catch (error) {
            throw error instanceof Error ? error : new Error("\n(Invalid error type, creating error...): \n " + String(error));
        }
    }

    async getSalt(username: string): Promise<Salt | Error> {
        return await this.db
            .selectFrom("salts")
            .selectAll()
            .where("username", '=', username)
            .executeTakeFirst() ?? new Error("No salt found for {" + username + "}.")
    }

    async deleteSalt(username: string): Promise<boolean> {
        const result = await this.db
            .deleteFrom("salts")
            .where("username", '=', username)
            .executeTakeFirst()
        return result.numDeletedRows > 0;
    }
}

