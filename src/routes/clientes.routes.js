const express = require('express');
const {
  listarClientes,
  obtenerCliente,
  crearCliente,
  modificarCliente,
  eliminarCliente
} = require('../controllers/clientes.controller');

const router = express.Router();

router.get('/', listarClientes);
router.get('/:id', obtenerCliente);
router.post('/', crearCliente);
router.put('/:id', modificarCliente);
router.delete('/:id', eliminarCliente);

module.exports = router;
