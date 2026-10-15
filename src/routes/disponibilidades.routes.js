const express = require('express');
const {
  listarDisponibilidades,
  obtenerDisponibilidad,
  crearDisponibilidad,
  modificarDisponibilidad,
  eliminarDisponibilidad
} = require('../controllers/disponibilidades.controller');

const router = express.Router();

router.get('/', listarDisponibilidades);
router.get('/:id', obtenerDisponibilidad);
router.post('/', crearDisponibilidad);
router.put('/:id', modificarDisponibilidad);
router.delete('/:id', eliminarDisponibilidad);

module.exports = router;
