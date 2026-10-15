const Cliente = require('../models/Cliente');

function datosValidos(body) {
  return body
    && typeof body.nombre === 'string'
    && body.nombre.trim() !== ''
    && typeof body.apellido === 'string'
    && body.apellido.trim() !== '';
}

async function listarClientes(req, res) {
  const clientes = await Cliente.find()
    .select('-_id id nombre apellido')
    .lean();
  res.status(200).json(clientes);
}

async function obtenerCliente(req, res) {
  const cliente = await Cliente.findOne({ id: Number(req.params.id) })
    .select('-_id id nombre apellido')
    .lean();

  if (!cliente) {
    return res.status(404).json({ mensaje: 'Cliente no encontrado' });
  }

  res.status(200).json(cliente);
}

async function crearCliente(req, res) {
  if (!datosValidos(req.body)) {
    return res.status(400).json({
      mensaje: 'nombre y apellido son obligatorios y deben ser strings no vacios'
    });
  }

  const ultimoCliente = await Cliente.findOne()
    .sort({ id: -1 })
    .select('id -_id')
    .lean();
  const cliente = await Cliente.create({
    id: ultimoCliente ? ultimoCliente.id + 1 : 1,
    nombre: req.body.nombre.trim(),
    apellido: req.body.apellido.trim()
  });

  res.status(201).json(cliente);
}

async function modificarCliente(req, res) {
  if (!datosValidos(req.body)) {
    return res.status(400).json({
      mensaje: 'nombre y apellido son obligatorios y deben ser strings no vacios'
    });
  }

  const cliente = await Cliente.findOne({ id: Number(req.params.id) });
  if (!cliente) {
    return res.status(404).json({ mensaje: 'Cliente no encontrado' });
  }

  cliente.nombre = req.body.nombre.trim();
  cliente.apellido = req.body.apellido.trim();
  await cliente.save();

  res.status(200).json(cliente);
}

async function eliminarCliente(req, res) {
  const cliente = await Cliente.findOneAndDelete({
    id: Number(req.params.id)
  });
  if (!cliente) {
    return res.status(404).json({ mensaje: 'Cliente no encontrado' });
  }

  res.status(204).send();
}

module.exports = {
  listarClientes,
  obtenerCliente,
  crearCliente,
  modificarCliente,
  eliminarCliente
};
