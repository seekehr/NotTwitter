// @ts-ignore
// @ts-ignore
import {
    ColumnType,
    Generated,
    Insertable,
    JSONColumnType,
    Selectable,
    Updateable,
} from "kysely"

export interface Database {
    accounts: AccountsTable
    salts: SaltsTable
}

interface BaseAccountInterface {
    username: string,
    password: string,
    displayName: string
}

interface AccountsTable extends BaseAccountInterface {
    id: Generated<bigint>
    pfp: string
    followers: ColumnType<JSON, string, JSON>,
    timeCreated: ColumnType<Date, number, never>
}

export type Account = Selectable<AccountsTable>
export type NewAccount = Insertable<BaseAccountInterface>

// ======= ACCOUNTS =======

interface SaltsTable {
    username: string
    salt: string
}

export type Salt = Selectable<SaltsTable>

// ======== SALTS =========
