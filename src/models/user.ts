import mongoose from 'mongoose';

type TUser = {
  name: string;
  about: string;
  avatar: string;
}

const userSchema = new mongoose.Schema<TUser>({
  name: { // у пользователя есть имя — опишем требования к имени в схеме:
    type: String, // имя — это строка
    required: true, // имя — обязательное поле
    minlength: 2,
    maxlength: 30,
  },
  about: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 200,
  },
  avatar: {
    type: String,
    required: true,
  },
});

export default mongoose.model<TUser>('user', userSchema);
