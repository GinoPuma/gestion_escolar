const MetodoPago = require("../models/MetodoPago");

exports.getAllMetodosPago = async (req, res) => {
  try {
    const metodosPago = await MetodoPago.getAll();
    res.json(metodosPago);
  } catch (error) {
    console.error("Error en metodoPagoController.getAllMetodosPago:", error);
    res
      .status(500)
      .json({
        message: "Error al listar métodos de pago.",
        error: error.message,
      });
  }
};

exports.getMetodoPagoById = async (req, res) => {
  try {
    const { id } = req.params;
    const metodoPago = await MetodoPago.getById(id);
    if (!metodoPago) {
      return res.status(404).json({ message: "Método de pago no encontrado." });
    }
    res.json(metodoPago);
  } catch (error) {
    console.error("Error en metodoPagoController.getMetodoPagoById:", error);
    res
      .status(500)
      .json({
        message: "Error al obtener método de pago por ID.",
        error: error.message,
      });
  }
};

exports.createMetodoPago = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    if (!nombre) {
      return res
        .status(400)
        .json({ message: "El nombre del método de pago es obligatorio." });
    }

    const newMetodoPago = await MetodoPago.create({ nombre, descripcion });
    res.status(201).json(newMetodoPago);
  } catch (error) {
    console.error("Error en metodoPagoController.createMetodoPago:", error);
    if (error.message.includes("obligatorio")) {
      return res.status(400).json({ message: error.message });
    }
    if (error.message.includes("Ya existe")) {
      return res.status(409).json({ message: error.message });
    }
    res
      .status(500)
      .json({
        message: "Error al crear método de pago.",
        error: error.message,
      });
  }
};

exports.updateMetodoPago = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    if (!nombre) {
      return res
        .status(400)
        .json({ message: "El nombre del método de pago es obligatorio." });
    }

    const updatedMetodoPago = await MetodoPago.update(id, {
      nombre,
      descripcion,
    });
    res.json(updatedMetodoPago);
  } catch (error) {
    console.error("Error en metodoPagoController.updateMetodoPago:", error);
    if (error.message.includes("Se requiere el ID")) {
      return res.status(400).json({ message: error.message });
    }
    if (error.message.includes("obligatorio")) {
      return res.status(400).json({ message: error.message });
    }
    if (error.message.includes("Ya existe")) {
      return res.status(409).json({ message: error.message });
    }
    res
      .status(500)
      .json({
        message: "Error al actualizar método de pago.",
        error: error.message,
      });
  }
};

exports.deleteMetodoPago = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await MetodoPago.delete(id);
    res.json(result);
  } catch (error) {
    console.error("Error en metodoPagoController.deleteMetodoPago:", error);
    if (error.message.includes("no encontrado")) {
      return res.status(404).json({ message: error.message });
    }
    res
      .status(500)
      .json({
        message: "Error al eliminar método de pago.",
        error: error.message,
      });
  }
};
