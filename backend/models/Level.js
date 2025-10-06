const pool = require("../config/db");

const Level = {
  getAll: async () => {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM niveles_educativos ORDER BY nombre ASC"
      );
      return rows;
    } catch (error) {
      console.error("Error en Level.getAll:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM niveles_educativos WHERE id = ?",
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error("Error en Level.getById:", error);
      throw error;
    }
  },

  create: async (name) => {
    if (!name) throw new Error("Level name is required.");
    try {
      const [result] = await pool.execute(
        "INSERT INTO niveles_educativos (nombre) VALUES (?)",
        [name]
      );
      return { id: result.insertId, nombre: name };
    } catch (error) {
      console.error("Error en Level.create:", error);
      if (error.code === "ER_DUP_ENTRY") {
        throw new Error(`El nivel educativo "${name}" ya existe.`);
      }
      throw error;
    }
  },

  update: async (id, name) => {
    if (!id || !name) throw new Error("Level ID and name are required.");
    try {
      await pool.execute(
        "UPDATE niveles_educativos SET nombre = ? WHERE id = ?",
        [name, id]
      );
      return { id, nombre: name };
    } catch (error) {
      console.error("Error en Level.update:", error);
      if (error.code === "ER_DUP_ENTRY") {
        throw new Error(`El nivel educativo "${name}" ya existe.`);
      }
      throw error;
    }
  },

  delete: async (id) => {
    if (!id) throw new Error("Level ID is required.");
    try {
      const [result] = await pool.execute(
        "DELETE FROM niveles_educativos WHERE id = ?",
        [id]
      );
      if (result.affectedRows === 0) {
        throw new Error("Nivel educativo no encontrado o no se pudo eliminar.");
      }
      return { message: "Nivel educativo eliminado exitosamente." };
    } catch (error) {
      console.error("Error en Level.delete:", error);
      throw error;
    }
  },
};

module.exports = Level;
