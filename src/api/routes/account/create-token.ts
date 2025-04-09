import express from 'express';
const router = express.Router();
import { inspect } from 'util';
import {tokensDb} from "../../../app.js";
import nodemailer from "nodemailer";

const auth = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env["GMAIL_USER"],
        pass: process.env["GMAIL_PASSWORD"]
    }
});



/* GET home page. */
router.get('/', function(req, res, next) {
    // todo: this can be abused to send gmails randomly. intdoduce login system + rate-limiting
    if ("gmail" in Object.keys(req.query) && typeof(req.query["gmail"]) === "string") {
        tokensDb.createToken(req.query["gmail"]).then((token) => {
            res.status(200).json({
                message: "Token created successfully",
                token: token,
            });
        }).catch((e) => {
            console.error("Error creating token: " + inspect(e));
            res.status(500).json({
                error: "Error creating token.",
            });
        });


    } else {
        res.status(401).json({
            error: "No gmail provided in URL."
        })
    }
});

export default router;