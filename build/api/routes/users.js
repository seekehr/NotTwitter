import express from 'express';
export const router = express.Router();
/* GET users listing. */
router.get('/', function (req, res, next) {
    console.log("HIIIII");
    res.status(200).send("\n\nHI");
});
export default router;
