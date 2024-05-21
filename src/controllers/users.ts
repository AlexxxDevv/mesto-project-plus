import { NextFunction, Request, Response } from 'express';
import { constants } from 'http2';
import { Error as MongooseError } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user';
import ConflictError from '../error/conflict-error';
import BadRequestError from '../error/bad-request-error';
import NotFoundError from '../error/not-found-error';

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const {
    email, password, name, about, avatar,
  } = req.body;

  try {
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email, password: hash, name, about, avatar,
    });
    return res.status(constants.HTTP_STATUS_CREATED).send(user);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('E11000')) {
      return next(new ConflictError('Пользователь с такой почтой уже существует'));
    }
    if (error instanceof MongooseError.ValidationError) {
      return next(new BadRequestError('Переданы не валидные данные для создания пользователя'));
    }
    return next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+password'); // в случае аутентификации хеш пароля нужен. Чтобы это реализовать, после вызова метода модели, нужно добавить вызов метода select, передав ему строку +password
    if (!user) {
      const error = new Error('Неправильные почта или пароль');
      error.name = 'NotAuthorized';
      throw error;
    }
    const matched = await bcrypt.compare(password, user.password);
    if (!matched) {
      const error = new Error('Неправильные почта или пароль');
      error.name = 'NotAuthorized';
      throw error;
    }
    const token = jwt.sign({ _id: user._id }, 'some-secret-key');
    return res.status(constants.HTTP_STATUS_ACCEPTED).cookie('jwt', token, {
      maxAge: 3600000, // ms
      httpOnly: true,
    }).send(req.headers.cookie);
  } catch (error: any) {
    if (error instanceof Error && error.name === 'NotAuthorized') {
      return next(new ConflictError('Неправильные почта или пароль'));
    }
    return next(error);
  }
};

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find({});
    return res.send(users);
  } catch (error) {
    return next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id).orFail(() => {
      const error = new Error('Пользователь не найден');
      error.name = 'NotFoundError';
      return error;
    });
    return res.send(user);
  } catch (error) {
    if (error instanceof Error && error.name === 'NotFoundError') {
      return next(new NotFoundError('Такой пользователь не найден'));
    }
    if (error instanceof MongooseError.CastError) {
      return next(new BadRequestError('Передан невалидный id пользователя'));
    }
    return next(error);
  }
};

const updateUserData = async (req: Request, res: Response, next: NextFunction, data: any) => {
  try {
    const user = await User.findByIdAndUpdate(res.locals.user._id, data, {
      new: true,
      runValidators: true,
    });
    return res.send(user);
  } catch (error) {
    if (error instanceof MongooseError.ValidationError) {
      return next(new BadRequestError('Переданы не валидные данные для обновления данных'));
    }
    return next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  const { name, about } = req.body;
  updateUserData(req, res, next, { name, about });
};

export const updateAvatar = (req: Request, res: Response, next: NextFunction) => {
  const { avatar } = req.body;
  updateUserData(req, res, next, { avatar });
};
