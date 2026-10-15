const express = require('express');
const {
  listarTurnos,
  obtenerTurno,
  crearTurno,
  modificarEstadoTurno,
  cancelarTurno
} = require('../controllers/turnos.controller');

const router = express.Router();

router.get('/', listarTurnos);
router.get('/:id', obtenerTurno);
router.post('/', crearTurno);
router.put('/:id', modificarEstadoTurno);
router.patch('/:id/cancelar', cancelarTurno);

module.exports = router;
