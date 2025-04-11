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
                                                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                                    username VARCHAR(30) NOT NULL,
                                                    password CHAR(172) NOT NULL,
                                                    displayName VARCHAR(60) NOT NULL,
                                                    pfp VARCHAR (1024) NOT NULL,
                                                    followers JSON NOT NULL,
                                                    posts JSON NOT NULL,
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

    async createAccount(newAccount: NewAccount): Promise<bigint> {
        try {
            const posts = `{"posts": []}`;
            const followers = `{"followers": []}`;
            const timeCreated = Date.now();
            const account = {
                username: newAccount.username,
                password: newAccount.password,
                displayName: newAccount.displayName,
                pfp: "./public/images/avatar.png",
                posts, followers, timeCreated
            };
            const result = await this.db
                .insertInto("accounts")
                .values(account)
                .executeTakeFirst();
            if (typeof(result.insertId) !== "bigint" || result.insertId < 0) {
                throw new Error("Invalid INSERT ID! Account may still be inserted.");
            }
            return result.insertId;
        } catch (error) {
            throw error instanceof Error ? error : new Error("\n(Invalid error type, creating error...): \n " + String(error));
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

    async getAccountFromUsername(username: string): Promise<object|undefined> {
        return await this.db
            .selectFrom("accounts")
            .selectAll()
            .where("username", '=', username)
            .executeTakeFirst();
    }

    async getAccountFromID(id: bigint): Promise<Account|undefined> {
        return await this.db
            .selectFrom("accounts")
            .selectAll()
            .where("id", '=', id)
            .executeTakeFirst();
    }

    async deleteAccount(id: bigint): Promise<boolean> {
        const result = await this.db
            .deleteFrom("accounts")
            .where("id", '=', id)
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