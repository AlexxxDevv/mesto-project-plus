import { NextFunction, Request, Response } from 'express';
import { constants } from 'http2';
import { Error as MongooseError } from 'mongoose';
import Card from '../models/card';
import BadRequestError from '../error/bad-request-error';
import NotFoundError from '../error/not-found-error';

export const createCard = async (req: Request, res: Response, next: NextFunction) => {
  const { name, link } = req.body;
  const owner = res.locals.user._id;
  try {
    const card = await Card.create({ name, link, owner });
    return res.status(constants.HTTP_STATUS_CREATED).send(card);
  } catch (error) {
    if (error instanceof MongooseError.ValidationError) {
      return next(new BadRequestError('Переданы не валидные данные для создания карточки'));
    }
    return next(error);
  }
};

export const getCards = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cards = await Card.find({});
    return res.send(cards);
  } catch (error) {
    return next(error);
  }
};

export const deleteCardById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const card = await Card.findById(req.params.cardId).orFail(() => {
      const error = new Error('Карточка не найдена');
      error.name = 'NotFoundError';
      return error;
    });
    if (card.owner.toString() !== res.locals.user._id) {
      const error = new Error('Нельзя удалить чужую карточку');
      error.name = 'NotFoundError';
      return error;
    }
    await card.deleteOne();

    return res.send(card);
  } catch (error) {
    if (error instanceof MongooseError.CastError) {
      return next(new BadRequestError('Переданы не валидные данные для удаления карточки'));
    }
    if (error instanceof Error && error.name === 'NotFoundError') {
      return next(new NotFoundError('Карточка не найдена'));
    }
    return next(error);
  }
};

const changeCardData = async (req: Request, res: Response, next: NextFunction, option: any) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      option, // добавить _id в массив, если его там нет
      { new: true },
    ).orFail(() => {
      const error = new Error('Карточка не найдена');
      error.name = 'NotFoundError';
      return error;
    });
    return res.send(card);
  } catch (error) {
    if (error instanceof MongooseError.CastError) {
      return next(new BadRequestError('Переданы не валидные данные для удаления карточки'));
    }
    if (error instanceof Error && error.name === 'NotFoundError') {
      return next(new NotFoundError('Карточка не найдена'));
    }
    return next(error);
  }
};

export const likeCard = async (req: Request, res: Response, next: NextFunction) => {
  const option = { $addToSet: { likes: res.locals.user._id } };
  changeCardData(req, res, next, option);
};

export const dislikeCard = async (req: Request, res: Response, next: NextFunction) => {
  const option = { $pull: { likes: res.locals.user._id } };
  changeCardData(req, res, next, option);
};
