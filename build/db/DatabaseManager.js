import { createPool } from 'mysql2'; // do not use 'mysql2/promises'!
import { Kysely, MysqlDialect, sql } from 'kysely';
class DatabaseManager {
    db;
    constructor(database, host, user, password, port) {
        const dialect = new MysqlDialect({
            pool: createPool({
                database,
                host,
                user,
                password,
                port,
                connectionLimit: 10,
            }),
        });
        this.db = new Kysely({
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
        });
    }
    /**
     * Only function to handle the exception itself.
     */
    async init() {
        const TABLE_QUERY = sql `
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
        }
        catch (error) {
            console.error("Error encountered during creating `accounts` table (invalid connection details?): " + error);
            return false;
        }
    }
    async createAccount(account) {
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
        }
        catch (error) {
            return error instanceof Error ? error : new Error("\n(Invalid error type, creating error...): \n " + String(error));
        }
    }
    async checkUsername(username) {
        return (await this.db
            .selectFrom("accounts")
            .selectAll()
            .where("username", '=', username)
            .executeTakeFirst()) !== undefined;
    }
    async getAccount(username, password) {
        return await this.db
            .selectFrom("accounts")
            .selectAll()
            .where("username", '=', username).where("password", '=', password)
            .executeTakeFirst();
    }
    async deleteAccount(account) {
        const result = await this.db
            .deleteFrom("accounts")
            .where("id", '=', account.id)
            .executeTakeFirst();
        return result.numDeletedRows > 0;
    }
    async updateAccount(account, updates) {
        return await this.db
            .updateTable("accounts")
            .set(updates)
            .where("id", '=', account.id)
            .executeTakeFirst();
    }
}
export default DatabaseManager;
