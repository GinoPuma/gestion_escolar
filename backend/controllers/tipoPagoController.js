const TipoPago = require("../models/TipoPago");

exports.getAllTiposPago = async (req, res) => {
  try {
    const tiposPago = await TipoPago.getAll();
    res.json(tiposPago);
  } catch (error) {
    console.error("Error en tipoPagoController.getAllTiposPago:", error);
    res.status(500).json({ message: "Error al listar tipos de pago.", error: error.message });
  }
};

exports.getTipoPagoById = async (req, res) => {
  try {
    const { id } = req.params;
    const tipoPago = await TipoPago.getById(id);
    if (!tipoPago) {
      return res.status(404).json({ message: "Tipo de pago no encontrado." });
    }
    res.json(tipoPago);
  } catch (error) {
    console.error("Error en tipoPagoController.getTipoPagoById:", error);
    res.status(500).json({ message: "Error al obtener tipo de pago por ID.", error: error.message });
  }
};

exports.createTipoPago = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    if (!nombre) {
      return res.status(400).json({ message: "El nombre del tipo de pago es obligatorio." });
    }

    const newTipoPago = await TipoPago.create({ nombre, descripcion });
    res.status(201).json(newTipoPago);
  } catch (error) {
    console.error("Error en tipoPagoController.createTipoPago:", error);
    if (error.message.includes("obligatorio")) {
      return res.status(400).json({ message: error.message });
    }
     if (error.message.includes("Ya existe")) {
      return res.status(409).json({ message: error.message });
    }
    res.status(500).json({ message: "Error al crear tipo de pago.", error: error.message });
  }
};

exports.updateTipoPago = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    if (!nombre) {
      return res.status(400).json({ message: "El nombre del tipo de pago es obligatorio." });
    }

    const updatedTipoPago = await TipoPago.update(id, { nombre, descripcion });
    res.json(updatedTipoPago);
  } catch (error) {
    console.error("Error en tipoPagoController.updateTipoPago:", error);
    if (error.message.includes("Se requiere el ID")) {
      return res.status(400).json({ message: error.message });
    }
    if (error.message.includes("obligatorio")) {
      return res.status(400).json({ message: error.message });
    }
     if (error.message.includes("Ya existe")) {
      return res.status(409).json({ message: error.message });
    }
    res.status(500).json({ message: "Error al actualizar tipo de pago.", error: error.message });
  }
};

exports.deleteTipoPago = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await TipoPago.delete(id);
    res.json(result);
  } catch (error) {
    console.error("Error en tipoPagoController.deleteTipoPago:", error);
    if (error.message.includes("no encontrado")) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Error al eliminar tipo de pago.", error: error.message });
  }
};