const Turno = require('../models/Turno');
const Profesional = require('../models/Profesional');
const Cliente = require('../models/Cliente');
const Disponibilidad = require('../models/Disponibilidad');

const estadosPermitidos = ['reservado', 'cancelado', 'atendido'];

function idsValidos(body) {
  return body
    && Number.isInteger(body.profesionalId)
    && body.profesionalId > 0
    && Number.isInteger(body.clienteId)
    && body.clienteId > 0
    && Number.isInteger(body.disponibilidadId)
    && body.disponibilidadId > 0;
}

function filtrosValidos(query) {
  const idsValidosEnConsulta = ['profesionalId', 'clienteId'].every((campo) => (
    query[campo] === undefined
      || (/^\d+$/.test(query[campo])
        && Number.isInteger(Number(query[campo]))
        && Number(query[campo]) > 0)
  ));

  const fechaValida = query.fecha === undefined
    || (/^\d{4}-\d{2}-\d{2}$/.test(query.fecha) && query.fecha.trim() !== '');
  const estadoValido = query.estado === undefined
    || estadosPermitidos.includes(query.estado);

  return idsValidosEnConsulta && fechaValida && estadoValido;
}

async function listarTurnos(req, res) {
  if (!filtrosValidos(req.query)) {
    return res.status(400).json({ mensaje: 'Filtros incorrectos' });
  }

  const filtros = {};
  if (req.query.profesionalId !== undefined) {
    filtros.profesionalId = Number(req.query.profesionalId);
  }
  if (req.query.clienteId !== undefined) {
    filtros.clienteId = Number(req.query.clienteId);
  }
  if (req.query.fecha !== undefined) {
    filtros.fecha = req.query.fecha;
  }
  if (req.query.estado !== undefined) {
    filtros.estado = req.query.estado;
  }

  const turnos = await Turno.find(filtros)
    .select('-_id id profesionalId clienteId disponibilidadId fecha hora estado')
    .lean();

  res.status(200).json(turnos);
}

async function obtenerTurno(req, res) {
  const turno = await Turno.findOne({ id: Number(req.params.id) })
    .select('-_id id profesionalId clienteId disponibilidadId fecha hora estado')
    .lean();

  if (!turno) {
    return res.status(404).json({ mensaje: 'Turno no encontrado' });
  }

  res.status(200).json(turno);
}

async function crearTurno(req, res) {
  if (!idsValidos(req.body)) {
    return res.status(400).json({
      mensaje: 'profesionalId, clienteId y disponibilidadId son obligatorios y deben ser numericos'
    });
  }

  const profesional = await Profesional.exists({ id: req.body.profesionalId });

  if (!profesional) {
    return res.status(404).json({ mensaje: 'Profesional no encontrado' });
  }

  const cliente = await Cliente.exists({ id: req.body.clienteId });

  if (!cliente) {
    return res.status(404).json({ mensaje: 'Cliente no encontrado' });
  }

  const disponibilidad = await Disponibilidad.findOne({
    id: req.body.disponibilidadId
  });

  if (!disponibilidad) {
    return res.status(404).json({ mensaje: 'Disponibilidad no encontrada' });
  }

  if (disponibilidad.profesionalId !== req.body.profesionalId) {
    return res.status(409).json({
      mensaje: 'La disponibilidad no pertenece al profesional indicado'
    });
  }

  if (disponibilidad.disponible !== true) {
    return res.status(409).json({ mensaje: 'La disponibilidad no esta disponible' });
  }

  const horarioReservado = await Turno.exists({
    fecha: disponibilidad.fecha,
    hora: disponibilidad.hora,
    estado: 'reservado',
    $or: [
      { profesionalId: req.body.profesionalId },
      { clienteId: req.body.clienteId }
    ]
  });

  if (horarioReservado) {
    return res.status(409).json({ mensaje: 'El horario ya esta reservado' });
  }

  const disponibilidadReservada = await Disponibilidad.findOneAndUpdate(
    { id: req.body.disponibilidadId, disponible: true },
    { $set: { disponible: false } },
    { returnDocument: 'after' }
  );

  if (!disponibilidadReservada) {
    const sigueExistiendo = await Disponibilidad.exists({
      id: req.body.disponibilidadId
    });
    if (!sigueExistiendo) {
      return res.status(404).json({ mensaje: 'Disponibilidad no encontrada' });
    }
    return res.status(409).json({ mensaje: 'La disponibilidad no esta disponible' });
  }

  const ultimoTurno = await Turno.findOne()
    .sort({ id: -1 })
    .select('id -_id')
    .lean();

  try {
    const turno = await Turno.create({
      id: ultimoTurno ? ultimoTurno.id + 1 : 1,
      profesionalId: req.body.profesionalId,
      clienteId: req.body.clienteId,
      disponibilidadId: disponibilidadReservada.id,
      fecha: disponibilidadReservada.fecha,
      hora: disponibilidadReservada.hora,
      estado: 'reservado'
    });
    res.status(201).json(turno);
  } catch (error) {
    await Disponibilidad.updateOne(
      { id: disponibilidadReservada.id },
      { $set: { disponible: true } }
    );

    if (error.code === 11000) {
      const horarioEnConflicto = await Turno.exists({
        fecha: disponibilidadReservada.fecha,
        hora: disponibilidadReservada.hora,
        estado: 'reservado',
        $or: [
          { profesionalId: req.body.profesionalId },
          { clienteId: req.body.clienteId }
        ]
      });
      if (horarioEnConflicto) {
        return res.status(409).json({ mensaje: 'El horario ya esta reservado' });
      }
    }
    throw error;
  }
}

async function modificarEstadoTurno(req, res) {
  if (!req.body || req.body.estado !== 'atendido') {
    return res.status(400).json({
      mensaje: 'El estado debe ser atendido'
    });
  }

  const turno = await Turno.findOne({ id: Number(req.params.id) });

  if (!turno) {
    return res.status(404).json({ mensaje: 'Turno no encontrado' });
  }

  if (turno.estado === 'cancelado' || turno.estado === 'atendido') {
    return res.status(409).json({ mensaje: 'El turno no puede ser atendido' });
  }

  const turnoActualizado = await Turno.findOneAndUpdate(
    { id: turno.id, estado: 'reservado' },
    { $set: { estado: 'atendido' } },
    { returnDocument: 'after' }
  );

  if (!turnoActualizado) {
    return res.status(409).json({ mensaje: 'El turno no puede ser atendido' });
  }

  res.status(200).json(turnoActualizado);
}

async function cancelarTurno(req, res) {
  const turno = await Turno.findOne({ id: Number(req.params.id) });

  if (!turno) {
    return res.status(404).json({ mensaje: 'Turno no encontrado' });
  }

  if (turno.estado === 'cancelado') {
    return res.status(409).json({ mensaje: 'El turno ya esta cancelado' });
  }

  const disponibilidad = await Disponibilidad.findOne({
    id: turno.disponibilidadId
  });

  if (!disponibilidad) {
    return res.status(404).json({ mensaje: 'Disponibilidad no encontrada' });
  }

  const turnoCancelado = await Turno.findOneAndUpdate(
    { id: turno.id, estado: { $ne: 'cancelado' } },
    { $set: { estado: 'cancelado' } },
    { returnDocument: 'after' }
  );

  if (!turnoCancelado) {
    return res.status(409).json({ mensaje: 'El turno ya esta cancelado' });
  }

  await Disponibilidad.updateOne(
    { id: disponibilidad.id },
    { $set: { disponible: true } }
  );

  res.status(200).json(turnoCancelado);
}

module.exports = {
  listarTurnos,
  obtenerTurno,
  crearTurno,
  modificarEstadoTurno,
  cancelarTurno
};
