import express from 'express';
const router = express.Router();
import { inspect } from 'util';
import {NewPost} from "../../db/Database.js";
import {postsDb} from "../../app.js";

router.post('/', function(req, res, next) {
    const {author_id, content} = req.body as NewPost;
    if (!author_id || !content) {
        res.status(400).json({error: "Request body does not contain author_id or content."});
        return;
    }

    if (content.length > 500) {
        res.status(400).json({
            error: "Post content exceeds the maximum allowed length of 500 characters.",
        });
        return;
    }

    postsDb.createPost({author_id, content}).then(post => {
        res.status(201).json({
            message: "Post created successfully",
            post: post,
        });
    }).catch(err => {
        res.status(500).json({
            error: err.message,
        });
    })
});

export default router;