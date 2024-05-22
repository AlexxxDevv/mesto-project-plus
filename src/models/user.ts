import mongoose from 'mongoose';
import { isEmail } from 'validator';

type TUser = {
  email: string,
  password: string,
  name: string;
  about: string;
  avatar: string;
}

function emailValidator(email: string) {
  return isEmail(email);
}

const userSchema = new mongoose.Schema<TUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [emailValidator, 'нужно ввести адрес электронной почты'],
  },
  password: {
    type: String,
    required: true,
    select: false, // чтобы API не возвращал хеш пароля
  },
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Жак-Ив Кусто',
  },
  about: {
    type: String,
    minlength: 2,
    maxlength: 200,
    default: 'Исследователь',
  },
  avatar: {
    type: String,
    validate: {
      validator(v: string) {
        return /[a-z0-9\-._~:\\/?#@!$&'()*+,;=]\.[a-z]{2,}/.test(v);
      },
      message: 'передайте правильный URL',
    },
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
  },
});

export default mongoose.model<TUser>('user', userSchema);
