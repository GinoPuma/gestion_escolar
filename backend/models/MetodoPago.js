const pool = require("../config/db");

const MetodoPago = {
  getAll: async () => {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM metodos_pago ORDER BY nombre ASC"
      );
      return rows;
    } catch (error) {
      console.error("Error en MetodoPago.getAll:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM metodos_pago WHERE id = ?",
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error("Error en MetodoPago.getById:", error);
      throw error;
    }
  },

  create: async (metodoPagoData) => {
    const { nombre, descripcion } = metodoPagoData;

    if (!nombre) {
      throw new Error("El nombre del método de pago es obligatorio.");
    }

    try {
      const [result] = await pool.execute(
        "INSERT INTO metodos_pago (nombre, descripcion) VALUES (?, ?)",
        [nombre, descripcion || null] // Permitir descripcion nula
      );
      return { id: result.insertId, nombre, descripcion };
    } catch (error) {
      console.error("Error en MetodoPago.create:", error);
      if (error.code === "ER_DUP_ENTRY") {
        throw new Error("Ya existe un método de pago con ese nombre.");
      }
      throw error;
    }
  },

  update: async (id, metodoPagoData) => {
    const { nombre, descripcion } = metodoPagoData;

    if (!id)
      throw new Error("Se requiere el ID del método de pago para actualizar.");
    if (!nombre)
      throw new Error("El nombre del método de pago es obligatorio.");

    try {
      await pool.execute(
        "UPDATE metodos_pago SET nombre = ?, descripcion = ? WHERE id = ?",
        [nombre, descripcion || null, id]
      );
      return { id, ...metodoPagoData };
    } catch (error) {
      console.error("Error en MetodoPago.update:", error);
      if (error.code === "ER_DUP_ENTRY") {
        throw new Error("Ya existe otro método de pago con ese nombre.");
      }
      throw error;
    }
  },

  delete: async (id) => {
    if (!id)
      throw new Error("Se requiere el ID del método de pago para eliminar.");
    try {
      const [result] = await pool.execute(
        "DELETE FROM metodos_pago WHERE id = ?",
        [id]
      );
      if (result.affectedRows === 0) {
        throw new Error("Método de pago no encontrado o no se pudo eliminar.");
      }
      return { message: "Método de pago eliminado exitosamente." };
    } catch (error) {
      console.error("Error en MetodoPago.delete:", error);
      if (error.code === "ER_ROW_IS_REFERENCED_2") {
        throw new Error(
          "No se puede eliminar este método de pago porque está asociado a pagos existentes."
        );
      }
      throw error;
    }
  },
};

module.exports = MetodoPago;
