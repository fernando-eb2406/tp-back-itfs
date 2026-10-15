const mongoose = require('mongoose');

const profesionalSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
    min: 1
  },
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  apellido: {
    type: String,
    required: true,
    trim: true
  }
}, {
  id: false,
  versionKey: false,
  collection: 'profesionales',
  toJSON: {
    transform: (document, returned) => {
      delete returned._id;
      return returned;
    }
  }
});

module.exports = mongoose.model('Profesional', profesionalSchema);
