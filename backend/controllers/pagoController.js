const Pago = require("../models/Pago");
const Matricula = require("../models/Enrollment");
const TipoPago = require("../models/TipoPago");
const MetodoPago = require("../models/MetodoPago");

exports.getAllPagos = async (req, res) => {
  try {
    const filters = {
      matriculaId: req.query.matriculaId,
      tipoPagoId: req.query.tipoPagoId,
      metodoPagoId: req.query.metodoPagoId,
      estado: req.query.estado,
    };
    const pagos = await Pago.getAll(filters);
    res.json(pagos);
  } catch (error) {
    console.error("Error en pagoController.getAllPagos:", error);
    res
      .status(500)
      .json({ message: "Error al listar pagos.", error: error.message });
  }
};

exports.getPagoById = async (req, res) => {
  try {
    const { id } = req.params;
    const pago = await Pago.getById(id);
    if (!pago) {
      return res.status(404).json({ message: "Pago no encontrado." });
    }
    res.json(pago);
  } catch (error) {
    console.error("Error en pagoController.getPagoById:", error);
    res
      .status(500)
      .json({ message: "Error al obtener pago por ID.", error: error.message });
  }
};

exports.createPago = async (req, res) => {
  try {
    const {
      matricula_id,
      tipo_pago_id,
      monto,
      fecha_pago,
      metodo_pago_id,
      referencia_pago,
      estado,
    } = req.body;

    if (!matricula_id)
      return res
        .status(400)
        .json({ message: "El ID de la matrícula es obligatorio." });
    if (!tipo_pago_id)
      return res
        .status(400)
        .json({ message: "El ID del tipo de pago es obligatorio." });
    if (monto === undefined || monto === null)
      return res.status(400).json({ message: "El monto es obligatorio." });
    if (!fecha_pago)
      return res
        .status(400)
        .json({ message: "La fecha de pago es obligatoria." });
    if (!estado)
      return res
        .status(400)
        .json({ message: "El estado del pago es obligatorio." });

    const matriculaExists = await Matricula.getById(matricula_id);
    if (!matriculaExists) {
      return res
        .status(400)
        .json({ message: "La matrícula especificada no existe." });
    }

    const today = new Date();
    const currentYear = today.getFullYear();

    const pagoYear = new Date(fecha_pago).getFullYear();

    if (
      matriculaExists.estado !== "Activo" ||
      matriculaExists.anio_academico !== pagoYear
    ) {
      return res.status(400).json({
        message: `No se puede registrar este pago. La matrícula ID ${matricula_id} no está activa para el año ${pagoYear} o no corresponde a esta matrícula.`,
      });
    }

    const tipoPagoExists = await TipoPago.getById(tipo_pago_id);
    if (!tipoPagoExists) {
      return res
        .status(400)
        .json({ message: "El tipo de pago especificado no existe." });
    }

    if (
      metodo_pago_id !== null &&
      metodo_pago_id !== undefined &&
      metodo_pago_id !== ""
    ) {
      const metodoPagoExists = await MetodoPago.getById(metodo_pago_id);
      if (!metodoPagoExists) {
        return res
          .status(400)
          .json({ message: "El método de pago especificado no existe." });
      }
    } else {
      pagoData.metodo_pago_id = null;
    }

    const pagoData = {
      matricula_id,
      tipo_pago_id,
      monto: parseFloat(monto),
      fecha_pago,
      metodo_pago_id:
        metodo_pago_id === "" ||
        metodo_pago_id === null ||
        metodo_pago_id === undefined
          ? null
          : parseInt(metodo_pago_id),
      referencia_pago,
      estado,
    };

    const newPago = await Pago.create(pagoData);
    res.status(201).json(newPago);
  } catch (error) {
    console.error("Error en pagoController.createPago:", error);
    if (error.message.includes("no existe")) {
      return res.status(400).json({ message: error.message });
    }
    res
      .status(500)
      .json({ message: "Error al crear pago.", error: error.message });
  }
};

exports.updatePago = async (req, res) => {
  try {
    const { id } = req.params;
    const pagoData = req.body;

    if (Object.keys(pagoData).length === 0) {
      return res
        .status(400)
        .json({ message: "No se proporcionaron datos para actualizar." });
    }

    if (pagoData.matricula_id !== undefined) {
      const matriculaExists = await Matricula.getById(pagoData.matricula_id);
      if (!matriculaExists) {
        return res
          .status(400)
          .json({ message: "La matrícula especificada no existe." });
      }

      const today = new Date();
      const currentYear = today.getFullYear();
      const pagoYear = new Date(pagoData.fecha_pago).getFullYear();
      if (
        matriculaExists.estado !== "Activo" ||
        matriculaExists.anio_academico !== pagoYear
      ) {
        return res.status(400).json({
          message: `No se puede actualizar este pago. La matrícula ID ${pagoData.matricula_id} no está activa para el año ${pagoYear} o no corresponde a esta matrícula.`,
        });
      }
    }

    if (pagoData.tipo_pago_id !== undefined) {
      const tipoPagoExists = await TipoPago.getById(pagoData.tipo_pago_id);
      if (!tipoPagoExists) {
        return res
          .status(400)
          .json({ message: "El tipo de pago especificado no existe." });
      }
    }
    if (pagoData.metodo_pago_id !== undefined) {
      if (
        pagoData.metodo_pago_id !== null &&
        pagoData.metodo_pago_id !== "" &&
        pagoData.metodo_pago_id !== undefined
      ) {
        const metodoPagoExists = await MetodoPago.getById(
          pagoData.metodo_pago_id
        );
        if (!metodoPagoExists) {
          return res
            .status(400)
            .json({ message: "El método de pago especificado no existe." });
        }
      } else {
        pagoData.metodo_pago_id = null;
      }
    }

    if (
      pagoData.metodo_pago_id !== null &&
      pagoData.metodo_pago_id !== undefined
    ) {
      pagoData.metodo_pago_id = parseInt(pagoData.metodo_pago_id);
    }

    const updatedPago = await Pago.update(id, pagoData);
    res.json(updatedPago);
  } catch (error) {
    console.error("Error en pagoController.updatePago:", error);
    if (error.message.includes("no existe")) {
      return res.status(400).json({ message: error.message });
    }
    res
      .status(500)
      .json({ message: "Error al actualizar pago.", error: error.message });
  }
};

exports.deletePago = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Pago.delete(id);
    res.json(result);
  } catch (error) {
    console.error("Error en pagoController.deletePago:", error);
    if (error.message.includes("no encontrado")) {
      return res.status(404).json({ message: error.message });
    }
    res
      .status(500)
      .json({ message: "Error al eliminar pago.", error: error.message });
  }
};

exports.getEstadoCuenta = async (req, res) => {
  try {
    const { matriculaId } = req.params;

    if (!matriculaId) {
      return res
        .status(400)
        .json({ message: "El ID de matrícula es obligatorio." });
    }

    const filtros = { matriculaId };
    const pagos = await Pago.getAll(filtros);

    res.json(pagos);
  } catch (error) {
    console.error("Error en pagoController.getEstadoCuenta:", error);
    res.status(500).json({
      message: "Error al obtener el estado de cuenta.",
      error: error.message,
    });
  }
};
