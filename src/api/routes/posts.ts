import express from 'express';
const router = express.Router();
import { inspect } from 'util';
import {postsDb} from "../../app.js";

/* GET home page. */
router.get('/', function(req, res, next) {
    if ("author" in req.headers) {
        const author = req.headers["author"];
        if (typeof (author) === 'string') {
            const authorId = BigInt(author);
            if (authorId >= 0) {
                postsDb.getPostsFromAuthor(authorId).then((posts) => {
                    if (posts) {
                        res.status(200).json({posts: inspect(posts)});
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

    res.status(400).json({error: "You need to specify the author ID."});
});

export default router;