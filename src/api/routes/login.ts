import express from 'express';
export const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.send('Hello World');
});

// TODO: Get signup user / password as URL params and create account
export default router;