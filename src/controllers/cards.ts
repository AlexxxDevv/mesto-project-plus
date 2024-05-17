import { Request, Response } from 'express';
import { constants } from 'http2';
import { Error as MongooseError } from 'mongoose';
import Card from '../models/card';

export const createCard = async (req: Request, res: Response) => {
  const { name, link } = req.body;
  const owner = res.locals.user._id;
  try {
    const card = await Card.create({ name, link, owner });
    return res.status(constants.HTTP_STATUS_CREATED).send(card);
  } catch (error) {
    if (error instanceof MongooseError.ValidationError) {
      return res.status(constants.HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы не валидные данные для создания карточки' });
    }
    return res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка' });
  }
};

export const getCards = async (req: Request, res: Response) => {
  try {
    const cards = await Card.find({});
    return res.send(cards);
  } catch (error) {
    return res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка' });
  }
};

export const deleteCardById = async (req: Request, res: Response) => {
  try {
    const card = await Card.findByIdAndRemove(req.params.id).orFail(() => {
      const error = new Error('Карточка не найдена');
      error.name = 'NotFoundError';
      return error;
    });
    return res.send(card);
  } catch (error) {
    if (error instanceof MongooseError.CastError) {
      return res.status(constants.HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы не валидные данные для удаления' });
    }
    if (error instanceof Error && error.name === 'NotFoundError') {
      return res.status(constants.HTTP_STATUS_NOT_FOUND).send({ message: 'Произошла ошибка' });
    }
    return res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка' });
  }
};

const changeCardData = async (req: Request, res: Response, option: any) => {
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
      return res.status(constants.HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы не валидные данные для лайка' });
    }
    if (error instanceof Error && error.name === 'NotFoundError') {
      return res.status(constants.HTTP_STATUS_NOT_FOUND).send({ message: 'Произошла ошибка' });
    }
    return res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка' });
  }
};

export const likeCard = async (req: Request, res: Response) => {
  const option = { $addToSet: { likes: res.locals.user._id } };
  changeCardData(req, res, option);
};

export const dislikeCard = async (req: Request, res: Response) => {
  const option = { $pull: { likes: res.locals.user._id } };
  changeCardData(req, res, option);
};
