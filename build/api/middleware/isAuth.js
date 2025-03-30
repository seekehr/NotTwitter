export default function isAuthenticated(req, res, next) {
    if ("username" in req.headers && "salt" in req.headers && "token" in req.headers) {
        next();
    }
    return res.sendStatus(401);
}
