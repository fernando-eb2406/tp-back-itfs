const mongoose = require('mongoose');

const disponibilidadSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
    min: 1
  },
  profesionalId: {
    type: Number,
    required: true,
    min: 1
  },
  fecha: {
    type: String,
    required: true,
    match: /^\d{4}-\d{2}-\d{2}$/
  },
  hora: {
    type: String,
    required: true,
    match: /^\d{2}:\d{2}$/
  },
  disponible: {
    type: Boolean,
    required: true,
    default: true
  }
}, {
  id: false,
  versionKey: false,
  collection: 'disponibilidades',
  toJSON: {
    transform: (document, returned) => {
      delete returned._id;
      return returned;
    }
  }
});

disponibilidadSchema.index(
  { profesionalId: 1, fecha: 1, hora: 1 },
  { unique: true }
);

module.exports = mongoose.model('Disponibilidad', disponibilidadSchema);
