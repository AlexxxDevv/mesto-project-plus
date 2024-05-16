import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { constants } from 'http2';
import { AuthContext } from './types/types';
import router from './routes/index';

const { PORT = 3000 } = process.env;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/mestodb');

app.use((req: Request, res: Response<unknown, AuthContext>, next: NextFunction) => {
  res.locals.user = {
    _id: '66433ac760a6104bd685d19d', // Это временное решение. Мы захардкодили идентификатор пользователя, поэтому кто бы ни создал карточку, в базе у неё будет один и тот же автор.
  };

  next();
});

app.use('/', router);
app.get('*', (req: Request, res: Response) => {
  res.status(constants.HTTP_STATUS_NOT_FOUND).send('Страница не найдена');
});

const connect = async () => {
  try {
    await app.listen(PORT);
  } catch (err) {
    console.log(err);
  }
};
connect();
