import express from 'express';
const router = express.Router();
import { inspect } from 'util';
import {NewPost} from "../../db/Database.js";
import {accDb, jwtSecret, postsDb} from "../../app.js";
import jwt from "jsonwebtoken";

// todo: Hashtag support (hashtags: string[])
router.post('/', async function(req, res, next) {
    if ("token" in req.headers && "content" in req.body && "attachments" in req.body) {
        let [token, content, attachments] = [req.headers["token"], req.body["content"], req.body["attachments"]];
        if (typeof(token) === 'string' && typeof(content) === 'string') {
            const decode = jwt.verify(token, jwtSecret);
            if (typeof(decode) !== 'string') {
                res.status(400).json({error: "Invalid JWT token."});
                return;
            }

            if (content.length > 300) {
                res.status(400).json({
                    error: "Post content exceeds the maximum allowed length of 300 characters.",
                });
                return;
            }

            const author_id = await accDb.getIdFromUsername(decode);
            if (author_id === undefined) {
                res.status(400).json({error: "Invalid token. ID not found."});
                return;
            }

            postsDb.createPost({author_id, content, attachments}).then(post => {
                res.status(201).json({
                    message: "Post created successfully",
                    post: post,
                });
            }).catch(err => {
                res.status(500).json({
                    error: err.message,
                });
            })
        } else {
            res.status(400).json({error: "Invalid token or content string."});
        }

    } else {
        res.status(400).json({error: "Request body does not contain author_id or content, or attachments."});
        return;
    }
});

export default router;