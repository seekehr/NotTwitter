import { expect, test } from 'vitest'
import DatabaseCreator from "../src/db/DatabaseCreator.js";
import {Kysely} from "kysely";
import {Database, Salt} from "../src/db/Database.js";
import SecurityGuard from "../src/db/SecurityGuard.js";
import AccountsDatabaseManager from "../src/db/managers/AccountsDatabaseManager";
import SaltsDatabaseManager from "../src/db/managers/SaltsDatabaseManager";
import {Account} from "../src/db/Database.js";

const dbc = new DatabaseCreator();
const db = dbc.createDb();

test('test db initialisation', () => {
    expect(db).toBeInstanceOf(Kysely<Database>);
});

test('test db manager', async () => {
   await expect(dbc.initDatabase(db)).resolves.toHaveLength(2);
});

const USERNAME = "seeker";
const PASSWORD = "BaNaNa@4";

const [accDb, saltsDb] = await dbc.initDatabase(db);
async function testUserLogin(checkSalt: Salt | Error | undefined, checkHash: string | undefined): Promise<boolean> {
    try {
        const saltExists = await saltsDb.getSalt("seeker");
        if (!(saltExists instanceof Error)) {
            console.log("Salt already exists - user already exists.");
            console.log("Salt: " + saltExists.salt);
            const newHash = await SecurityGuard.getHash(PASSWORD, saltExists.salt);
            console.log("Hash found: " + newHash);
            const user = await accDb.getAccount(USERNAME, newHash);
            console.log("User: " + JSON.stringify(user));

            if (checkSalt && !(checkSalt instanceof Error) && checkHash) {
                if (checkSalt.salt === saltExists.salt && checkHash === newHash) {
                    console.log("Same salt and hash.");
                    return true;
                }
            } else {
                if (typeof(user) === 'object') {
                    console.log("Success.");
                    return true;
                }
            }
        } else {
            console.log("Salt does not exist.");
            const newSalt = await saltsDb.createSalt("seeker");
            if(newSalt instanceof Error) {
                throw new Error(newSalt.message);
            }
            console.log("Salt created:      " + newSalt.salt);
            const hash = await SecurityGuard.getHash(PASSWORD, newSalt.salt);
            console.log("Hash created: " + hash);
            console.log("Account created:   " + await accDb.createAccount({
                username: USERNAME,
                password: hash,
                displayName: "Seeker"
            }));

            if (await saltsDb.getSalt("seeker")) {
                console.log("Salt exists now!");
            } else {
                console.log("Salt still does not exist.");
                throw new Error("Salt does not exist.")
            }
            console.log("Rerunning test to verify proper initialisation...");
            return await testUserLogin(newSalt, hash);
        }
    } catch (error) {
        console.log("Error during login: " + error);
        return false;
    }
    console.log("...How we got here?");
    return false;
}

test('test user login', async () => {
    await expect(testUserLogin(undefined, undefined)).resolves.toBeTruthy();
});