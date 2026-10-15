const Disponibilidad = require('../models/Disponibilidad');
const Profesional = require('../models/Profesional');

function datosValidos(body, esCreacion) {
  if (!body) {
    return false;
  }

  const disponibleValido = esCreacion && body.disponible === undefined
    ? true
    : typeof body.disponible === 'boolean';

  return Number.isInteger(body.profesionalId)
    && body.profesionalId > 0
    && typeof body.fecha === 'string'
    && /^\d{4}-\d{2}-\d{2}$/.test(body.fecha)
    && body.fecha.trim() !== ''
    && typeof body.hora === 'string'
    && /^\d{2}:\d{2}$/.test(body.hora)
    && body.hora.trim() !== ''
    && disponibleValido;
}

function filtrosValidos(query) {
  if (query.profesionalId !== undefined
    && (!/^\d+$/.test(query.profesionalId)
      || !Number.isInteger(Number(query.profesionalId))
      || Number(query.profesionalId) <= 0)) {
    return false;
  }

  if (query.disponible !== undefined
    && query.disponible !== 'true'
    && query.disponible !== 'false') {
    return false;
  }

  return query.fecha === undefined
    || (/^\d{4}-\d{2}-\d{2}$/.test(query.fecha) && query.fecha.trim() !== '');
}

async function listarDisponibilidades(req, res) {
  if (!filtrosValidos(req.query)) {
    return res.status(400).json({ mensaje: 'Filtros incorrectos' });
  }

  const filtros = {};
  if (req.query.profesionalId !== undefined) {
    filtros.profesionalId = Number(req.query.profesionalId);
  }
  if (req.query.fecha !== undefined) {
    filtros.fecha = req.query.fecha;
  }
  if (req.query.disponible !== undefined) {
    filtros.disponible = req.query.disponible === 'true';
  }

  const disponibilidades = await Disponibilidad.find(filtros)
    .select('-_id id profesionalId fecha hora disponible')
    .lean();

  res.status(200).json(disponibilidades);
}

async function obtenerDisponibilidad(req, res) {
  const disponibilidad = await Disponibilidad.findOne({
    id: Number(req.params.id)
  })
    .select('-_id id profesionalId fecha hora disponible')
    .lean();

  if (!disponibilidad) {
    return res.status(404).json({ mensaje: 'Disponibilidad no encontrada' });
  }

  res.status(200).json(disponibilidad);
}

async function crearDisponibilidad(req, res) {
  if (!datosValidos(req.body, true)) {
    return res.status(400).json({
      mensaje: 'profesionalId, fecha y hora son obligatorios y deben tener un formato valido'
    });
  }

  const profesional = await Profesional.exists({ id: req.body.profesionalId });

  if (!profesional) {
    return res.status(404).json({ mensaje: 'Profesional no encontrado' });
  }

  const datosDisponibilidad = {
    profesionalId: req.body.profesionalId,
    fecha: req.body.fecha.trim(),
    hora: req.body.hora.trim()
  };
  const repetida = await Disponibilidad.exists(datosDisponibilidad);
  if (repetida) {
    return res.status(409).json({ mensaje: 'La disponibilidad ya existe' });
  }

  const ultimaDisponibilidad = await Disponibilidad.findOne()
    .sort({ id: -1 })
    .select('id -_id')
    .lean();

  try {
    const disponibilidad = await Disponibilidad.create({
      id: ultimaDisponibilidad ? ultimaDisponibilidad.id + 1 : 1,
      ...datosDisponibilidad,
      disponible: req.body.disponible === undefined ? true : req.body.disponible
    });
    res.status(201).json(disponibilidad);
  } catch (error) {
    if (error.code === 11000 && await Disponibilidad.exists(datosDisponibilidad)) {
      return res.status(409).json({ mensaje: 'La disponibilidad ya existe' });
    }
    throw error;
  }
}

async function modificarDisponibilidad(req, res) {
  if (!datosValidos(req.body, false)) {
    return res.status(400).json({
      mensaje: 'profesionalId, fecha, hora y disponible son obligatorios y deben tener un formato valido'
    });
  }

  const disponibilidad = await Disponibilidad.findOne({
    id: Number(req.params.id)
  });
  if (!disponibilidad) {
    return res.status(404).json({ mensaje: 'Disponibilidad no encontrada' });
  }

  const profesional = await Profesional.exists({ id: req.body.profesionalId });

  if (!profesional) {
    return res.status(404).json({ mensaje: 'Profesional no encontrado' });
  }

  const datosDisponibilidad = {
    profesionalId: req.body.profesionalId,
    fecha: req.body.fecha.trim(),
    hora: req.body.hora.trim()
  };
  const repetida = await Disponibilidad.exists({
    ...datosDisponibilidad,
    id: { $ne: disponibilidad.id }
  });

  if (repetida) {
    return res.status(409).json({ mensaje: 'La disponibilidad ya existe' });
  }

  disponibilidad.profesionalId = datosDisponibilidad.profesionalId;
  disponibilidad.fecha = datosDisponibilidad.fecha;
  disponibilidad.hora = datosDisponibilidad.hora;
  disponibilidad.disponible = req.body.disponible;

  try {
    await disponibilidad.save();
    res.status(200).json(disponibilidad);
  } catch (error) {
    if (error.code === 11000 && await Disponibilidad.exists({
      ...datosDisponibilidad,
      id: { $ne: disponibilidad.id }
    })) {
      return res.status(409).json({ mensaje: 'La disponibilidad ya existe' });
    }
    throw error;
  }
}

async function eliminarDisponibilidad(req, res) {
  const disponibilidad = await Disponibilidad.findOneAndDelete({
    id: Number(req.params.id)
  });
  if (!disponibilidad) {
    return res.status(404).json({ mensaje: 'Disponibilidad no encontrada' });
  }

  res.status(204).send();
}

module.exports = {
  listarDisponibilidades,
  obtenerDisponibilidad,
  crearDisponibilidad,
  modificarDisponibilidad,
  eliminarDisponibilidad
};
