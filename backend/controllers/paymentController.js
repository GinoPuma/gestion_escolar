const Payment = require("../models/Payment");
const Enrollment = require("../models/Enrollment");

exports.getAllPayments = async (req, res) => {
  try {
    const filters = {
      enrollmentId: req.query.enrollmentId,
      studentId: req.query.studentId,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      status: req.query.status,
    };
    const payments = await Payment.getAll(filters);
    res.json(payments);
  } catch (error) {
    console.error("Error en paymentController.getAllPayments:", error);
    res.status(500).json({ message: "Error al listar pagos." });
  }
};

exports.getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.getById(id);
    if (!payment) {
      return res.status(404).json({ message: "Pago no encontrado." });
    }
    res.json(payment);
  } catch (error) {
    console.error("Error en paymentController.getPaymentById:", error);
    res.status(500).json({ message: "Error al obtener pago por ID." });
  }
};

exports.createPayment = async (req, res) => {
  try {
    const {
      enrollment_id,
      amount,
      payment_date,
      payment_method,
      status,
      payment_type_id,
    } = req.body;

    if (!enrollment_id)
      return res
        .status(400)
        .json({ message: "El ID de la matrícula es obligatorio." });
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0)
      return res
        .status(400)
        .json({
          message: "El monto es obligatorio y debe ser un número positivo.",
        });
    if (!payment_date)
      return res
        .status(400)
        .json({ message: "La fecha de pago es obligatoria." });
    if (!payment_method)
      return res
        .status(400)
        .json({ message: "El método de pago es obligatorio." });
    if (!status)
      return res
        .status(400)
        .json({ message: "El estado del pago es obligatorio." });
    if (!payment_type_id)
      return res
        .status(400)
        .json({ message: "El ID del tipo de pago es obligatorio." });

    const enrollmentExists = await Enrollment.getById(enrollment_id);
    if (!enrollmentExists) {
      return res
        .status(400)
        .json({ message: "La matrícula especificada no existe." });
    }

    const newPayment = await Payment.create({
      enrollment_id,
      amount,
      payment_date,
      payment_method,
      status,
      payment_type_id,
    });
    res.status(201).json(newPayment);
  } catch (error) {
    console.error("Error en paymentController.createPayment:", error);
    res
      .status(500)
      .json({ message: "Error al crear pago.", error: error.message });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const paymentData = req.body;

    if (Object.keys(paymentData).length === 0) {
      return res
        .status(400)
        .json({ message: "No se proporcionaron datos para actualizar." });
    }

    if (paymentData.enrollment_id) {
      const enrollmentExists = await Enrollment.getById(
        paymentData.enrollment_id
      );
      if (!enrollmentExists) {
        return res
          .status(400)
          .json({
            message: "La matrícula especificada para actualizar no existe.",
          });
      }
    }

    const updatedPayment = await Payment.update(id, paymentData);
    res.json(updatedPayment);
  } catch (error) {
    console.error("Error en paymentController.updatePayment:", error);
    res
      .status(500)
      .json({ message: "Error al actualizar pago.", error: error.message });
  }
};

exports.deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Payment.delete(id);
    res.json(result);
  } catch (error) {
    console.error("Error en paymentController.deletePayment:", error);
    res
      .status(500)
      .json({ message: "Error al eliminar pago.", error: error.message });
  }
};
