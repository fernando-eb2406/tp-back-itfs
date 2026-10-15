const Profesional = require('../models/Profesional');

function datosValidos(body) {
  return body
    && typeof body.nombre === 'string'
    && body.nombre.trim() !== ''
    && typeof body.apellido === 'string'
    && body.apellido.trim() !== '';
}

async function listarProfesionales(req, res) {
  const profesionales = await Profesional.find()
    .select('-_id id nombre apellido')
    .lean();
  res.status(200).json(profesionales);
}

async function obtenerProfesional(req, res) {
  const profesional = await Profesional.findOne({ id: Number(req.params.id) })
    .select('-_id id nombre apellido')
    .lean();

  if (!profesional) {
    return res.status(404).json({ mensaje: 'Profesional no encontrado' });
  }

  res.status(200).json(profesional);
}

async function crearProfesional(req, res) {
  if (!datosValidos(req.body)) {
    return res.status(400).json({
      mensaje: 'nombre y apellido son obligatorios y deben ser strings no vacios'
    });
  }

  const ultimoProfesional = await Profesional.findOne()
    .sort({ id: -1 })
    .select('id -_id')
    .lean();
  const profesional = await Profesional.create({
    id: ultimoProfesional ? ultimoProfesional.id + 1 : 1,
    nombre: req.body.nombre.trim(),
    apellido: req.body.apellido.trim()
  });

  res.status(201).json(profesional);
}

async function modificarProfesional(req, res) {
  if (!datosValidos(req.body)) {
    return res.status(400).json({
      mensaje: 'nombre y apellido son obligatorios y deben ser strings no vacios'
    });
  }

  const profesional = await Profesional.findOne({ id: Number(req.params.id) });
  if (!profesional) {
    return res.status(404).json({ mensaje: 'Profesional no encontrado' });
  }

  profesional.nombre = req.body.nombre.trim();
  profesional.apellido = req.body.apellido.trim();
  await profesional.save();

  res.status(200).json(profesional);
}

async function eliminarProfesional(req, res) {
  const profesional = await Profesional.findOneAndDelete({
    id: Number(req.params.id)
  });
  if (!profesional) {
    return res.status(404).json({ mensaje: 'Profesional no encontrado' });
  }

  res.status(204).send();
}

module.exports = {
  listarProfesionales,
  obtenerProfesional,
  crearProfesional,
  modificarProfesional,
  eliminarProfesional
};
