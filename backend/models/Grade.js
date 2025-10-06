const pool = require("../config/db");

const Grade = {
  getAll: async () => {
    try {
      const [rows] = await pool.execute(`
                SELECT g.*, nl.nombre as nivel_nombre
                FROM grados g
                JOIN niveles_educativos nl ON g.nivel_id = nl.id
                ORDER BY nl.nombre ASC, g.nombre ASC
            `);
      return rows;
    } catch (error) {
      console.error("Error en Grade.getAll:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const [rows] = await pool.execute(
        `
                SELECT g.*, nl.nombre as nivel_nombre
                FROM grados g
                JOIN niveles_educativos nl ON g.nivel_id = nl.id
                WHERE g.id = ?
            `,
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error("Error en Grade.getById:", error);
      throw error;
    }
  },

  getByLevelId: async (levelId) => {
    try {
      const [rows] = await pool.execute(
        `
                SELECT g.*, nl.nombre as nivel_nombre
                FROM grados g
                JOIN niveles_educativos nl ON g.nivel_id = nl.id
                WHERE g.nivel_id = ?
                ORDER BY g.nombre ASC
            `,
        [levelId]
      );
      return rows;
    } catch (error) {
      console.error("Error en Grade.getByLevelId:", error);
      throw error;
    }
  },

  create: async (gradeData) => {
    const { name, level_id } = gradeData;
    if (!name || !level_id)
      throw new Error("Grade name and Level ID are required.");
    try {
      const [result] = await pool.execute(
        "INSERT INTO grados (nombre, nivel_id) VALUES (?, ?)",
        [name, level_id]
      );
      const [levelRows] = await pool.execute(
        "SELECT nombre FROM niveles_educativos WHERE id = ?",
        [level_id]
      );
      return {
        id: result.insertId,
        nombre: name,
        nivel_id: level_id,
        nivel_nombre:
          levelRows.length > 0 ? levelRows[0].nombre : "Desconocido",
      };
    } catch (error) {
      console.error("Error en Grade.create:", error);
      if (error.code === "ER_DUP_ENTRY") {
        throw new Error(`El grado "${name}" ya existe para este nivel.`);
      }
      throw error;
    }
  },

  update: async (id, gradeData) => {
    const { name, level_id } = gradeData;
    if (!id || !name || !level_id)
      throw new Error("Grade ID, name, and Level ID are required.");
    try {
      await pool.execute(
        "UPDATE grados SET nombre = ?, nivel_id = ? WHERE id = ?",
        [name, level_id, id]
      );
      const [levelRows] = await pool.execute(
        "SELECT nombre FROM niveles_educativos WHERE id = ?",
        [level_id]
      );
      return {
        id,
        nombre: name,
        nivel_id: level_id,
        nivel_nombre:
          levelRows.length > 0 ? levelRows[0].nombre : "Desconocido",
      };
    } catch (error) {
      console.error("Error en Grade.update:", error);
      if (error.code === "ER_DUP_ENTRY") {
        throw new Error(`El grado "${name}" ya existe para este nivel.`);
      }
      throw error;
    }
  },

  delete: async (id) => {
    if (!id) throw new Error("Grade ID is required.");
    try {
      const [result] = await pool.execute("DELETE FROM grados WHERE id = ?", [
        id,
      ]);
      if (result.affectedRows === 0) {
        throw new Error("Grado no encontrado o no se pudo eliminar.");
      }
      return { message: "Grado eliminado exitosamente." };
    } catch (error) {
      console.error("Error en Grade.delete:", error);
      throw error;
    }
  },
};

module.exports = Grade;
