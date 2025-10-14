const pool = require("../config/db");

const TipoPago = {
  getAll: async () => {
    try {
      const [rows] = await pool.execute("SELECT * FROM tipos_pago ORDER BY nombre ASC");
      return rows;
    } catch (error) {
      console.error("Error en TipoPago.getAll:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const [rows] = await pool.execute("SELECT * FROM tipos_pago WHERE id = ?", [id]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error("Error en TipoPago.getById:", error);
      throw error;
    }
  },

  create: async (tipoPagoData) => {
    const { nombre, descripcion, precio_fijo, fecha_limite } = tipoPagoData;

    if (!nombre) {
      throw new Error("El nombre del tipo de pago es obligatorio.");
    }

    try {
    const [result] = await pool.execute(
      "INSERT INTO tipos_pago (nombre, descripcion, precio_fijo, fecha_limite) VALUES (?, ?, ?, ?)",
      [nombre, descripcion || null, precio_fijo ?? null, fecha_limite ?? null]
    );

    const [rows] = await pool.execute("SELECT * FROM tipos_pago WHERE id = ?", [result.insertId]);
    return rows[0];
  } catch (error) {
    console.error("Error en TipoPago.create:", error);
    if (error.code === "ER_DUP_ENTRY") {
      throw new Error("Ya existe un tipo de pago con ese nombre.");
    }
    throw error;
  }
  },

  update: async (id, tipoPagoData) => {
    const { nombre, descripcion, precio_fijo, fecha_limite } = tipoPagoData;

    if (!id) throw new Error("Se requiere el ID del tipo de pago para actualizar.");
    if (!nombre) throw new Error("El nombre del tipo de pago es obligatorio.");

    try {
      await pool.execute(
        "UPDATE tipos_pago SET nombre = ?, descripcion = ?, precio_fijo = ?, fecha_limite = ? WHERE id = ?",
        [nombre, descripcion || null, precio_fijo !== undefined ? precio_fijo : null, fecha_limite || null, id]
      );
      return { id, ...tipoPagoData };
    } catch (error) {
      console.error("Error en TipoPago.update:", error);
      if (error.code === "ER_DUP_ENTRY") {
        throw new Error("Ya existe otro tipo de pago con ese nombre.");
      }
      throw error;
    }
  },

  delete: async (id) => {
    if (!id) throw new Error("Se requiere el ID del tipo de pago para eliminar.");
    try {
      const [result] = await pool.execute("DELETE FROM tipos_pago WHERE id = ?", [id]);
      if (result.affectedRows === 0) {
        throw new Error("Tipo de pago no encontrado o no se pudo eliminar.");
      }
      return { message: "Tipo de pago eliminado exitosamente." };
    } catch (error) {
      console.error("Error en TipoPago.delete:", error);
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        throw new Error("No se puede eliminar este tipo de pago porque está asociado a pagos existentes.");
      }
      throw error;
    }
  },
};

module.exports = TipoPago;