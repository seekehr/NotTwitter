import express from 'express';
const router = express.Router();
import { isAuthenticated } from "../middleware/auth.js";
/* GET home page. */
router.get('/', function (req, res, next) {
    if (isAuthenticated(req, res, next)) {
        res.redirect("feed");
    }
    else {
        res.redirect("register");
    }
});
export default router;
