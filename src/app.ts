import express from 'express';
import mongoose from 'mongoose';
import { errors, Joi, celebrate } from 'celebrate';
import helmet from 'helmet';
import router from './routes/index';
import { login, createUser } from './controllers/users';
import auth from './middlewares/auth';
import errorHandler from './middlewares/error-handler';
import logger from './middlewares/logger';
import NotFoundError from './error/not-found-error';

const { PORT = 3000 } = process.env;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(helmet());

mongoose.connect('mongodb://localhost:27017/mestodb');

app.use(logger.requestLogger);

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6),
  }),
}), login);
app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6),
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(200),
    avatar: Joi.string(),
  }),
}), createUser);

app.use(auth);

app.use('/', router);

app.use('*', (req, res, next) => {
  next(new NotFoundError('Маршрут не найден'));
});

app.use(logger.errorLogger);

app.use(errors());

app.use(errorHandler);

const connect = async () => {
  try {
    await app.listen(PORT);
  } catch (err) {
    console.log(err);
  }
};
connect();
