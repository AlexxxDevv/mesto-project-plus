import { Request, Response } from 'express';
import { constants } from 'http2';
import { Error as MongooseError } from 'mongoose';
import User from '../models/user';

export const createUser = async (req: Request, res: Response) => {
  const { name, about, avatar } = req.body;

  try {
    const user = await User.create({ name, about, avatar });
    return res.status(constants.HTTP_STATUS_CREATED).send(user);
  } catch (error) {
    if (error instanceof MongooseError.ValidationError) {
      return res.status(constants.HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы не валидные данные для создания пользователя' });
    }
    return res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка' });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({}).orFail(() => {
      const error = new Error('Пользователь не найден');
      error.name = 'NotFoundError';
      return error;
    });
    return res.send(users);
  } catch (error) {
    if (error instanceof Error && error.name === 'NotFoundError') {
      return res.status(constants.HTTP_STATUS_NOT_FOUND).send({ message: 'Произошла ошибка' });
    }
    return res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).orFail(() => {
      const error = new Error('Пользователь не найден');
      error.name = 'NotFoundError';
      return error;
    });
    return res.send(user);
  } catch (error) {
    if (error instanceof Error && error.name === 'NotFoundError') {
      return res.status(constants.HTTP_STATUS_NOT_FOUND).send({ message: 'Произошла ошибка' });
    }
    if (error instanceof MongooseError.CastError) {
      return res.status(constants.HTTP_STATUS_BAD_REQUEST).send({ message: 'Передан невалидный id пользователя' });
    }
    return res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  const { name, about } = req.body;
  try {
    const user = await User.findByIdAndUpdate(res.locals.user._id, { name, about });
    return res.send(user);
  } catch (error) {
    if (error instanceof MongooseError.CastError) {
      return res.status(constants.HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы невалидные данные' });
    }
    return res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка' });
  }
};

export const updateAvatar = async (req: Request, res: Response) => {
  const { avatar } = req.body;
  try {
    const user = await User.findByIdAndUpdate(res.locals.user._id, { avatar });
    return res.send(user);
  } catch (error) {
    if (error instanceof MongooseError.CastError) {
      return res.status(constants.HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы невалидные данные' });
    }
    return res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка' });
  }
};
