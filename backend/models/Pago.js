const pool = require("../config/db");

const Pago = {
  getAll: async (filters = {}) => {
    try {
      let query = `
        SELECT 
          p.*,
          m.id as matricula_id,
          e.primer_nombre AS estudiante_primer_nombre,
          e.primer_apellido AS estudiante_primer_apellido,
          tp.nombre AS tipo_pago_nombre,
          mp.nombre AS metodo_pago_nombre -- Añadir el nombre del método de pago
        FROM pagos p
        JOIN matriculas m ON p.matricula_id = m.id
        JOIN estudiantes e ON m.estudiante_id = e.id
        JOIN tipos_pago tp ON p.tipo_pago_id = tp.id
        LEFT JOIN metodos_pago mp ON p.metodo_pago_id = mp.id -- LEFT JOIN porque puede ser NULL
      `;
      const queryParams = [];

      if (filters.matriculaId) {
        query += " WHERE p.matricula_id = ?";
        queryParams.push(filters.matriculaId);
      }
      if (filters.tipoPagoId) {
        if (filters.matriculaId) query += " AND";
        else query += " WHERE";
        query += " p.tipo_pago_id = ?";
        queryParams.push(filters.tipoPagoId);
      }
      if (filters.metodoPagoId) {
        if (filters.matriculaId || filters.tipoPagoId) query += " AND";
        else query += " WHERE";
        query += " p.metodo_pago_id = ?";
        queryParams.push(filters.metodoPagoId);
      }
      if (filters.estado) {
        if (filters.matriculaId || filters.tipoPagoId || filters.metodoPagoId)
          query += " AND";
        else query += " WHERE";
        query += " p.estado = ?";
        queryParams.push(filters.estado);
      }

      query += " ORDER BY p.fecha_pago DESC, p.fecha_creacion DESC";

      const [rows] = await pool.execute(query, queryParams);
      return rows;
    } catch (error) {
      console.error("Error en Pago.getAll:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const query = `
        SELECT 
          p.*,
          m.id as matricula_id,
          e.primer_nombre AS estudiante_primer_nombre,
          e.primer_apellido AS estudiante_primer_apellido,
          tp.nombre AS tipo_pago_nombre,
          mp.nombre AS metodo_pago_nombre -- Añadir el nombre del método de pago
        FROM pagos p
        JOIN matriculas m ON p.matricula_id = m.id
        JOIN estudiantes e ON m.estudiante_id = e.id
        JOIN tipos_pago tp ON p.tipo_pago_id = tp.id
        LEFT JOIN metodos_pago mp ON p.metodo_pago_id = mp.id -- LEFT JOIN
        WHERE p.id = ?
      `;
      const [rows] = await pool.execute(query, [id]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error("Error en Pago.getById:", error);
      throw error;
    }
  },

  create: async (pagoData) => {
    const {
      matricula_id,
      tipo_pago_id,
      monto,
      fecha_pago,
      metodo_pago_id,
      referencia_pago,
      estado,
    } = pagoData;

    const { metodo_pago, ...restPagoData } = pagoData; 

    if (!matricula_id || !tipo_pago_id || !monto || !fecha_pago || !estado) {
      throw new Error("Faltan campos obligatorios para crear el pago.");
    }
    if (typeof monto !== "number" || monto <= 0) {
      throw new Error("El monto debe ser un número positivo.");
    }
    const formattedFechaPago = new Date(fecha_pago);
    if (isNaN(formattedFechaPago.getTime())) {
      throw new Error("La fecha de pago proporcionada no es válida.");
    }

    try {
      const result = await pool.execute(
        `INSERT INTO pagos (matricula_id, tipo_pago_id, monto, fecha_pago, metodo_pago_id, referencia_pago, estado, fecha_creacion) 
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          matricula_id,
          tipo_pago_id,
          monto,
          formattedFechaPago,
          metodo_pago_id || null,
          referencia_pago || null,
          estado,
        ]
      );

      return {
        id: result.insertId,
        ...restPagoData,
        fecha_pago: formattedFechaPago,
        fecha_creacion: new Date(),
        metodo_pago_id: metodo_pago_id || null,
        referencia_pago: referencia_pago || null,
        estado: estado,
      };
    } catch (error) {
      console.error("Error en Pago.create:", error);
      if (
        error.code === "ER_NO_REFERENCED_ROW_2" ||
        error.code === "ER_BAD_FIELD_ERROR"
      ) {
        if (error.message.includes("matricula_id"))
          throw new Error("La matrícula especificada no existe.");
        if (error.message.includes("tipo_pago_id"))
          throw new Error("El tipo de pago especificado no existe.");
        if (error.message.includes("metodo_pago_id"))
          throw new Error("El método de pago especificado no existe.");
      }
      throw error;
    }
  },

  update: async (id, pagoData) => {
    const {
      matricula_id,
      tipo_pago_id,
      monto,
      fecha_pago,
      metodo_pago_id,
      referencia_pago,
      estado,
    } = pagoData;

    if (!id) throw new Error("Se requiere el ID del pago para actualizar.");

    const fieldsToUpdate = [];
    const queryParams = [];

    if (matricula_id !== undefined) {
      fieldsToUpdate.push("matricula_id = ?");
      queryParams.push(matricula_id);
    }
    if (tipo_pago_id !== undefined) {
      fieldsToUpdate.push("tipo_pago_id = ?");
      queryParams.push(tipo_pago_id);
    }
    if (monto !== undefined) {
      if (typeof monto !== "number" || monto <= 0)
        throw new Error("El monto debe ser un número positivo.");
      fieldsToUpdate.push("monto = ?");
      queryParams.push(monto);
    }
    if (fecha_pago !== undefined) {
      const formattedFechaPago = new Date(fecha_pago);
      if (isNaN(formattedFechaPago.getTime()))
        throw new Error("La fecha de pago proporcionada no es válida.");
      fieldsToUpdate.push("fecha_pago = ?");
      queryParams.push(formattedFechaPago);
    }
    if (metodo_pago_id !== undefined) {
      fieldsToUpdate.push("metodo_pago_id = ?");
      queryParams.push(metodo_pago_id);
    }
    if (referencia_pago !== undefined) {
      fieldsToUpdate.push("referencia_pago = ?");
      queryParams.push(referencia_pago);
    }
    if (estado !== undefined) {
      fieldsToUpdate.push("estado = ?");
      queryParams.push(estado);
    }

    if (fieldsToUpdate.length === 0) {
      throw new Error("No se proporcionaron campos para actualizar.");
    }

    try {
      const query = `UPDATE pagos SET ${fieldsToUpdate.join(
        ", "
      )} WHERE id = ?`;
      queryParams.push(id);
      await pool.execute(query, queryParams);

      const updatedPagoData = { ...pagoData, id };
      if (pagoData.metodo_pago_id === null)
        updatedPagoData.metodo_pago_id = null; 

      return updatedPagoData;
    } catch (error) {
      console.error("Error en Pago.update:", error);
      if (
        error.code === "ER_NO_REFERENCED_ROW_2" ||
        error.code === "ER_BAD_FIELD_ERROR"
      ) {
        if (error.message.includes("matricula_id"))
          throw new Error("La matrícula especificada no existe.");
        if (error.message.includes("tipo_pago_id"))
          throw new Error("El tipo de pago especificado no existe.");
        if (error.message.includes("metodo_pago_id"))
          throw new Error("El método de pago especificado no existe.");
      }
      throw error;
    }
  },

  delete: async (id) => {
    if (!id) throw new Error("Se requiere el ID del pago para eliminar.");
    try {
      const [result] = await pool.execute("DELETE FROM pagos WHERE id = ?", [
        id,
      ]);
      if (result.affectedRows === 0) {
        throw new Error("Pago no encontrado o no se pudo eliminar.");
      }
      return { message: "Pago eliminado exitosamente." };
    } catch (error) {
      console.error("Error en Pago.delete:", error);
      throw error;
    }
  },
};

module.exports = Pago;
