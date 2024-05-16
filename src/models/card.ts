import mongoose from 'mongoose';

type TCard = {
  name: string;
  link: string;
  owner: mongoose.Types.ObjectId;
  likes: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const cardSchema = new mongoose.Schema<TCard>({
  name: { // у карточки есть имя — опишем требования к имени в схеме:
    type: String, // имя карточки — это строка
    required: true, // имя карточки — обязательное поле
    minlength: 2,
    maxlength: 30,
  },
  link: {
    type: String,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  likes: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    }],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true, // эта команда на создание полей createdAt и updatedAt
});

export default mongoose.model<TCard>('card', cardSchema);
