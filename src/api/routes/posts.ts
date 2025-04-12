import express from 'express';
const router = express.Router();
import { inspect } from 'util';
import {accDb, postsDb} from "../../app.js";

// TODO: Trending author support
router.get('/', async function(req, res, next) {
    if ("author" in req.headers) {
        const author = req.headers["author"];
        if (typeof (author) === 'string') {
            const account = await accDb.getAccountFromUsername(author);
            if (typeof(account) === 'object' && "id" in account && typeof(account.id) === 'number') {
                postsDb.getPostsFromAuthor(BigInt(account.id)).then((posts) => {
                    if (posts) {
                        res.status(200).json({posts: posts});
                    } else {
                        res.status(404).json({error: "No posts found for this author."});
                        return;
                    }
                }).catch(err => {
                    res.status(500).json({
                        error: err.message,
                    });
                });
                return;
            }
        }
    }

    res.status(400).json({error: "You need to specify the valid author properly."});
});

export default router;