const pool = require("../config/db");

const Section = {
  getAll: async () => {
    try {
      // Incluimos nombres de grado y nivel para mejor información
      const [rows] = await pool.execute(`
                SELECT s.*, g.nombre as grado_nombre, nl.nombre as nivel_nombre
                FROM secciones s
                JOIN grados g ON s.grado_id = g.id
                JOIN niveles_educativos nl ON g.nivel_id = nl.id
                ORDER BY nl.nombre ASC, g.nombre ASC, s.nombre ASC
            `);
      return rows;
    } catch (error) {
      console.error("Error en Section.getAll:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const [rows] = await pool.execute(
        `
                SELECT s.*, g.nombre as grado_nombre, nl.nombre as nivel_nombre
                FROM secciones s
                JOIN grados g ON s.grado_id = g.id
                JOIN niveles_educativos nl ON g.nivel_id = nl.id
                WHERE s.id = ?
            `,
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error("Error en Section.getById:", error);
      throw error;
    }
  },

  getByGradeId: async (gradeId) => {
    try {
      const [rows] = await pool.execute(
        `
                SELECT s.*, g.nombre as grado_nombre, nl.nombre as nivel_nombre
                FROM secciones s
                JOIN grados g ON s.grado_id = g.id
                JOIN niveles_educativos nl ON g.nivel_id = nl.id
                WHERE s.grado_id = ?
                ORDER BY s.nombre ASC
            `,
        [gradeId]
      );
      return rows;
    } catch (error) {
      console.error("Error en Section.getByGradeId:", error);
      throw error;
    }
  },

  create: async (sectionData) => {
    const { name, grade_id } = sectionData;
    if (!name || !grade_id)
      throw new Error("Section name and Grade ID are required.");
    try {
      const [result] = await pool.execute(
        "INSERT INTO secciones (nombre, grado_id) VALUES (?, ?)",
        [name, grade_id]
      );
      const [gradeRows] = await pool.execute(
        `
                SELECT g.nombre as grado_nombre, nl.nombre as nivel_nombre
                FROM grados g
                JOIN niveles_educativos nl ON g.nivel_id = nl.id
                WHERE g.id = ?
            `,
        [grade_id]
      );
      return {
        id: result.insertId,
        nombre: name,
        grado_id: grade_id,
        grado_nombre:
          gradeRows.length > 0 ? gradeRows[0].grado_nombre : "Desconocido",
        nivel_nombre:
          gradeRows.length > 0 ? gradeRows[0].nivel_nombre : "Desconocido",
      };
    } catch (error) {
      console.error("Error en Section.create:", error);
      if (error.code === "ER_DUP_ENTRY") {
        throw new Error(`La sección "${name}" ya existe para este grado.`);
      }
      throw error;
    }
  },

  update: async (id, sectionData) => {
    const { name, grade_id } = sectionData;
    if (!id || !name || !grade_id)
      throw new Error("Section ID, name, and Grade ID are required.");
    try {
      await pool.execute(
        "UPDATE secciones SET nombre = ?, grado_id = ? WHERE id = ?",
        [name, grade_id, id]
      );
      const [gradeRows] = await pool.execute(
        `
                SELECT g.nombre as grado_nombre, nl.nombre as nivel_nombre
                FROM grados g
                JOIN niveles_educativos nl ON g.nivel_id = nl.id
                WHERE g.id = ?
            `,
        [grade_id]
      );
      return {
        id,
        nombre: name,
        grado_id: grade_id,
        grado_nombre:
          gradeRows.length > 0 ? gradeRows[0].grado_nombre : "Desconocido",
        nivel_nombre:
          gradeRows.length > 0 ? gradeRows[0].nivel_nombre : "Desconocido",
      };
    } catch (error) {
      console.error("Error en Section.update:", error);
      if (error.code === "ER_DUP_ENTRY") {
        throw new Error(`La sección "${name}" ya existe para este grado.`);
      }
      throw error;
    }
  },

  delete: async (id) => {
    if (!id) throw new Error("Section ID is required.");
    try {
      const [result] = await pool.execute(
        "DELETE FROM secciones WHERE id = ?",
        [id]
      );
      if (result.affectedRows === 0) {
        throw new Error("Sección no encontrada o no se pudo eliminar.");
      }
      return { message: "Sección eliminada exitosamente." };
    } catch (error) {
      console.error("Error en Section.delete:", error);
      throw error;
    }
  },
};

module.exports = Section;
