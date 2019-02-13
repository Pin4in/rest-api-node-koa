const mongoose = require('../libs/mongoose');
const pick = require('lodash/pick');

const publicFields = ['email', 'displayName'];
const userSchemaOptions = {
  timestamps: true
};
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: 'E-mail пользователя не должен быть пустым.',
    validate: [
      {
        validator(value) {
          return /^[-.\w]+@([\w-]+\.)+[\w-]{2,12}$/.test(value);
        },
        message: 'Некорректный email.'
      }
    ],
    unique: 'Такой email уже существует'
  },
  displayName: {
    type: String,
    required: 'У пользователя должно быть имя',
    unique: 'Такое имя уже существует'
  }
}, userSchemaOptions);

userSchema.methods.serialize = function serializeUser() {
  return pick(this, [...publicFields, '_id']);
};

userSchema.statics.publicFields = publicFields;

module.exports = mongoose.model('User', userSchema);
