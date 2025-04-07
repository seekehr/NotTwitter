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
    salts: SaltsTable,
    posts: PostsTable
}

interface BaseAccountInterface {
    username: string,
    password: string,
    displayName: string
}

interface AccountsTable extends BaseAccountInterface {
    id: Generated<bigint>
    pfp: string,
    posts: ColumnType<JSON, string, JSON>,
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

/*  id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                                    author_id BIGINT NOT NULL,
                                                    content VARCHAR(500) NOT NULL,
                                                    views INT NOT NULL,
                                                    shares INT NOT NULL,
                                                    likes INT NOT NULL,
                                                    usersLiked JSON NOT NULL,
                                                    timeCreated INT NOT NULL*/
interface BasePost {
    author_id: bigint
    content: string
}

interface PostsTable extends BasePost {
    id: Generated<bigint>
    views: number
    shares: number
    likes: number
    usersLiked: ColumnType<JSON, string, JSON>
    timeCreated: ColumnType<Date, number, never>
}

export type NewPost = Insertable<BasePost>
export type Post = Selectable<PostsTable>
