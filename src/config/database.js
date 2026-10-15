const mongoose = require('mongoose');

async function connectDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error('La variable de entorno MONGODB_URI es obligatoria');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Conexión a MongoDB establecida');
}

module.exports = connectDatabase;
