import express from 'express';
const router = express.Router();
import { inspect } from 'util';

/* GET home page. */
router.get('/', function(req, res, next) {

    res.send('Hello World');
});

export default router;