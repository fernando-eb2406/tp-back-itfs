const express = require('express');
const profesionalesRoutes = require('./routes/profesionales.routes');
const clientesRoutes = require('./routes/clientes.routes');
const disponibilidadesRoutes = require('./routes/disponibilidades.routes');
const turnosRoutes = require('./routes/turnos.routes');
const loggerMiddleware = require('./middlewares/logger.middleware');
const path = require('path');

const app = express();

app.use(express.json());
app.use(loggerMiddleware);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use('/profesionales', profesionalesRoutes);
app.use('/clientes', clientesRoutes);
app.use('/disponibilidades', disponibilidadesRoutes);
app.use('/turnos', turnosRoutes);

app.get('/', (req, res) => {
  res.json({ mensaje: 'La API TurnoFlex funciona correctamente' });
});

app.get('/vista', (req, res) => {
  res.render('index');
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
});

module.exports = app;
