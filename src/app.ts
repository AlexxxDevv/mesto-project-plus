import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AuthContext } from './types/types';
import userRouter from './routes/users';
import cardRouter from './routes/cards';
import updateProfileRouter from './routes/update-profile';
import likesRouter from './routes/likes';
// Слушаем 3000 порт
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

app.use('/users', userRouter);
app.use('/cards', cardRouter);
app.use('/users/me', updateProfileRouter);
app.use('/cards/:cardId/likes', likesRouter);

const connect = async () => {
  try {
    await app.listen(PORT);
  } catch (err) {
    console.log(err);
  }
};
connect();
