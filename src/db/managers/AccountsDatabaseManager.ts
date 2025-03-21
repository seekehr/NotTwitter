import {createPool} from 'mysql2' // do not use 'mysql2/promises'!
import {Kysely, MysqlDialect, sql} from 'kysely'
import IDatabaseManager from "./IDatabaseManager.js";
import {Account, Database, NewAccount} from "../Database.js";

export default class AccountsDatabaseManager implements IDatabaseManager {
    db: Kysely<Database>

    constructor(db: Kysely<Database>) {
        this.db = db;
    }

    /**
     * Only function to handle the exception itself.
     */
    async init(): Promise<boolean> {
        const TABLE_QUERY = sql`
            CREATE TABLE IF NOT EXISTS accounts (
                                                    id INT AUTO_INCREMENT PRIMARY KEY,
                                                    username VARCHAR(30) NOT NULL,
                                                    password CHAR(172) NOT NULL,
                                                    displayName VARCHAR(60) NOT NULL,
                                                    pfp VARCHAR (1024) NOT NULL,
                                                    followers JSON NOT NULL,
                                                    timeCreated BIGINT NOT NULL
            );`;

        try {
            await TABLE_QUERY.execute(this.db);
            return true;
        } catch (error) {
            console.error("Error encountered during creating `accounts` table (invalid connection details?): " + error);
            return false;
        }
    }

    async createAccount(account: NewAccount): Promise<bigint | Error> {
        try {
            const followers = `{"followers": []}`;
            const timeCreated = Date.now();
            const result = await this.db
                .insertInto("accounts")
                .values({
                    username: account.username,
                    password: account.password,
                    displayName: account.displayName,
                    pfp: "./public/images/avatar.png",
                    followers, timeCreated
                })
                .executeTakeFirst();
            return result.insertId ?? new Error("Invalid INSERT ID! Account may still be inserted.");
        } catch (error) {
            return error instanceof Error ? error : new Error("\n(Invalid error type, creating error...): \n " + String(error));
        }
    }

    async checkUsername(username: string): Promise<boolean> {
        return (await this.db
            .selectFrom("accounts")
            .selectAll()
            .where("username", '=', username)
            .executeTakeFirst()) !== undefined;
    }

    async getAccount(username: string, password: string): Promise<Account|undefined> {
        return await this.db
            .selectFrom("accounts")
            .selectAll()
            .where("username", '=', username).where("password", '=', password)
            .executeTakeFirst();
    }

    async deleteAccount(account: Account): Promise<boolean> {
        const result = await this.db
            .deleteFrom("accounts")
            .where("id", '=', account.id)
            .executeTakeFirst()
        return result.numDeletedRows > 0;
    }

    async updateAccount(account: Account, updates: object) {
        return await this.db
            .updateTable("accounts")
            .set(updates)
            .where("id", '=', account.id)
            .executeTakeFirst();
    }
}