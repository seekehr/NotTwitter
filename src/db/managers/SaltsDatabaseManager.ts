import {Database, Salt} from "../Database.js";
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
                username VARCHAR(30) NOT NULL,
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

    async createSalt(username: string): Promise<Salt | Error> {
        try {
            const salt = Buffer.from(crypto.randomBytes(64)).toString('base64');
            const result = await this.db
                .insertInto("salts")
                .values({
                    username,
                    salt
                })
                .executeTakeFirst();
            if (result.insertId) {
                return new Error("Invalid INSERT ID! Account may still be inserted.");
            }
            return {username, salt};
        } catch (error) {
            return error instanceof Error ? error : new Error("\n(Invalid error type, creating error...): \n " + String(error));
        }
    }

    async getSalt(username: string): Promise<Salt | Error> {
        return await this.db
            .selectFrom("salts")
            .selectAll()
            .where("username", '=', username)
            .executeTakeFirst() ?? new Error("No salt found for {" + username + "}.")
    }
}

