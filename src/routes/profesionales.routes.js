const express = require('express');
const {
  listarProfesionales,
  obtenerProfesional,
  crearProfesional,
  modificarProfesional,
  eliminarProfesional
} = require('../controllers/profesionales.controller');

const router = express.Router();

router.get('/', listarProfesionales);
router.get('/:id', obtenerProfesional);
router.post('/', crearProfesional);
router.put('/:id', modificarProfesional);
router.delete('/:id', eliminarProfesional);

module.exports = router;
