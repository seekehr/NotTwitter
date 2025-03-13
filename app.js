import express from 'express';

import indexRouter from './routes/index';
import usersRouter from './routes/users';

const app = express();
app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;