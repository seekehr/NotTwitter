import {Kysely, sql} from 'kysely'
import IDatabaseManager from "./IDatabaseManager.js";
import {Database, NewPost, Post} from "../Database.js";
import {inspect} from "util";

export default class PostsDatabaseManager implements IDatabaseManager {
    db: Kysely<Database>

    constructor(db: Kysely<Database>) {
        this.db = db;
    }

    /**
     * Only function to handle the exception itself.
     */
    async init(): Promise<boolean> {
        const TABLE_QUERY = sql`
            CREATE TABLE IF NOT EXISTS posts (
                                                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                                    author_id BIGINT NOT NULL,
                                                    content VARCHAR(300) NOT NULL,
                                                    views INT NOT NULL,
                                                    shares INT NOT NULL,
                                                    likes INT NOT NULL,
                                                    comments JSON NOT NULL,
                                                    usersLiked JSON NOT NULL,
                                                    timeCreated BIGINT NOT NULL,
                                                    attachments JSON
            );`;

        try {
            await TABLE_QUERY.execute(this.db);
            return true;
        } catch (error) {
            console.error("Error encountered during creating `posts` table (invalid connection details?): " + error);
            return false;
        }
    }

    async createPost(newPost: NewPost): Promise<bigint> {
        try {
            const usersLiked = JSON.stringify({usersLiked: []});
            const comments = JSON.stringify({comments: []});
            const timeCreated = Date.now();
            const attachments = newPost.attachments === null ? null : JSON.stringify({attachments: newPost.attachments});
            const post = {
                author_id: newPost.author_id,
                content: newPost.content,
                attachments: attachments,
                views: 0, shares: 0, likes: 0, comments, usersLiked, timeCreated
            };
            const result = await this.db
                .insertInto("posts")
                .values(post)
                .executeTakeFirst();

            if (typeof(result.insertId) !== "bigint" || result.insertId < 0) {
                throw new Error("Invalid INSERT ID! Post may still be inserted.");
            }
            return result.insertId;
        } catch (error) {
            throw error instanceof Error ? error : new Error("\n(Invalid error type, creating error...): \n " + String(error));
        }
    }

    async getPostsFromAuthor(authorId: bigint): Promise<Post[] | undefined> {
        return await this.db
            .selectFrom("posts")
            .selectAll()
            .where("author_id", '=', authorId)
            .execute();
    }

    async deletePost(postId: bigint): Promise<boolean> {
        const result = await this.db
            .deleteFrom("posts")
            .where("id", '=', postId)
            .executeTakeFirst()
        return result.numDeletedRows > 0;
    }
}