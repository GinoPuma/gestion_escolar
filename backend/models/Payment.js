const pool = require("../config/db");

const Payment = {
  getAll: async (filters = {}) => {
    try {
      let query = `
        SELECT 
          p.*,
          e.id AS enrollment_id,
          s.primer_nombre AS student_first_name,
          s.primer_apellido AS student_last_name,
          pt.nombre AS payment_type_name
        FROM payments p
        JOIN enrollments e ON p.enrollment_id = e.id
        JOIN students s ON e.student_id = s.id
        JOIN payment_types pt ON p.payment_type_id = pt.id
      `;
      const queryParams = [];

      if (filters.enrollmentId) {
        query += " WHERE p.enrollment_id = ?";
        queryParams.push(filters.enrollmentId);
      }

      query += " ORDER BY p.payment_date DESC";

      const [rows] = await pool.execute(query, queryParams);
      return rows;
    } catch (error) {
      console.error("Error en Payment.getAll:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const [rows] = await pool.execute(
        `SELECT 
          p.*,
          e.id AS enrollment_id,
          s.primer_nombre AS student_first_name,
          s.primer_apellido AS student_last_name,
          pt.nombre AS payment_type_name
        FROM payments p
        JOIN enrollments e ON p.enrollment_id = e.id
        JOIN students s ON e.student_id = s.id
        JOIN payment_types pt ON p.payment_type_id = pt.id
        WHERE p.id = ?`,
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error("Error en Payment.getById:", error);
      throw error;
    }
  },

  create: async (paymentData) => {
    const {
      enrollment_id,
      amount,
      payment_date,
      payment_method,
      status,
      payment_type_id,
    } = paymentData;
    if (
      !enrollment_id ||
      !amount ||
      !payment_date ||
      !payment_method ||
      !status ||
      !payment_type_id
    ) {
      throw new Error("Faltan campos obligatorios para crear el pago.");
    }
    try {
      const [result] = await pool.execute(
        "INSERT INTO payments (enrollment_id, amount, payment_date, payment_method, status, payment_type_id) VALUES (?, ?, ?, ?, ?, ?)",
        [
          enrollment_id,
          amount,
          payment_date,
          payment_method,
          status,
          payment_type_id,
        ]
      );
      return { id: result.insertId, ...paymentData };
    } catch (error) {
      console.error("Error en Payment.create:", error);
      throw error;
    }
  },

  update: async (id, paymentData) => {
    const { amount, payment_date, payment_method, status, payment_type_id } =
      paymentData;
    if (!id) throw new Error("Payment ID is required.");

    const fieldsToUpdate = [];
    const queryParams = [];

    if (amount !== undefined) {
      fieldsToUpdate.push("amount = ?");
      queryParams.push(amount);
    }
    if (payment_date !== undefined) {
      fieldsToUpdate.push("payment_date = ?");
      queryParams.push(payment_date);
    }
    if (payment_method !== undefined) {
      fieldsToUpdate.push("payment_method = ?");
      queryParams.push(payment_method);
    }
    if (status !== undefined) {
      fieldsToUpdate.push("status = ?");
      queryParams.push(status);
    }
    if (payment_type_id !== undefined) {
      fieldsToUpdate.push("payment_type_id = ?");
      queryParams.push(payment_type_id);
    }

    if (fieldsToUpdate.length === 0) {
      throw new Error("No hay campos para actualizar.");
    }

    try {
      const query = `UPDATE payments SET ${fieldsToUpdate.join(
        ", "
      )} WHERE id = ?`;
      queryParams.push(id);
      await pool.execute(query, queryParams);
      return { id, ...paymentData };
    } catch (error) {
      console.error("Error en Payment.update:", error);
      throw error;
    }
  },

  delete: async (id) => {
    if (!id) throw new Error("Payment ID is required.");
    try {
      const [result] = await pool.execute("DELETE FROM payments WHERE id = ?", [
        id,
      ]);
      if (result.affectedRows === 0) {
        throw new Error("Pago no encontrado o no se pudo eliminar.");
      }
      return { message: "Pago eliminado exitosamente." };
    } catch (error) {
      console.error("Error en Payment.delete:", error);
      throw error;
    }
  },
};

module.exports = Payment;
