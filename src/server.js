require('dotenv').config();

const app = require('./app');
const connectDatabase = require('./config/database');

const PORT = process.env.PORT || 3000;

async function iniciarServidor() {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`Servidor TurnoFlex escuchando en el puerto ${PORT}`);
  });
}

iniciarServidor().catch((error) => {
  console.error('No se pudo iniciar TurnoFlex:', error);
  process.exit(1);
});
