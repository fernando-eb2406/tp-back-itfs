const mongoose = require('mongoose');

const turnoSchema = new mongoose.Schema({
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
  clienteId: {
    type: Number,
    required: true,
    min: 1
  },
  disponibilidadId: {
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
  estado: {
    type: String,
    required: true,
    enum: ['reservado', 'cancelado', 'atendido']
  }
}, {
  id: false,
  versionKey: false,
  collection: 'turnos',
  toJSON: {
    transform: (document, returned) => {
      delete returned._id;
      return returned;
    }
  }
});

turnoSchema.index(
  { profesionalId: 1, fecha: 1, hora: 1 },
  { unique: true, partialFilterExpression: { estado: 'reservado' } }
);

turnoSchema.index(
  { clienteId: 1, fecha: 1, hora: 1 },
  { unique: true, partialFilterExpression: { estado: 'reservado' } }
);

module.exports = mongoose.model('Turno', turnoSchema);
