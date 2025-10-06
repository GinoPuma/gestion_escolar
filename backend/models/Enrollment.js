const pool = require("../config/db");
const Enrollment = {
  getAll: async (filters = {}) => {
    try {
      let query = `
        SELECT 
          e.*, 
          s.primer_nombre AS student_first_name, 
          s.primer_apellido AS student_last_name, 
          niv.nombre AS level_name, 
          gr.nombre AS grade_name, 
          sec.nombre AS section_name
        FROM enrollments e
        JOIN students s ON e.student_id = s.id
        JOIN grades gr ON e.grade_id = gr.id
        JOIN niveles_educativos niv ON gr.level_id = niv.id
        JOIN sections sec ON e.section_id = sec.id
      `;
      const queryParams = [];

      if (filters.studentId) {
        query += " WHERE e.student_id = ?";
        queryParams.push(filters.studentId);
      }

      query += " ORDER BY e.enrollment_date DESC";

      const [rows] = await pool.execute(query, queryParams);
      return rows;
    } catch (error) {
      console.error("Error en Enrollment.getAll:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const [rows] = await pool.execute(
        `SELECT 
          e.*, 
          s.primer_nombre AS student_first_name, 
          s.primer_apellido AS student_last_name, 
          niv.nombre AS level_name, 
          gr.nombre AS grade_name, 
          sec.nombre AS section_name
        FROM enrollments e
        JOIN students s ON e.student_id = s.id
        JOIN grades gr ON e.grade_id = gr.id
        JOIN niveles_educativos niv ON gr.level_id = niv.id
        JOIN sections sec ON e.section_id = sec.id
        WHERE e.id = ?`,
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error("Error en Enrollment.getById:", error);
      throw error;
    }
  },

  create: async (enrollmentData) => {
    const {
      student_id,
      level_id,
      grade_id,
      section_id,
      year,
      estado_matricula,
    } = enrollmentData;
    if (!student_id || !grade_id || !section_id || !year || !estado_matricula) {
      throw new Error("Faltan campos obligatorios para crear la matrícula.");
    }
    try {
      const result = await pool.execute(
        "INSERT INTO enrollments (student_id, level_id, grade_id, section_id, year, estado_matricula, enrollment_date) VALUES (?, ?, ?, ?, ?, ?, NOW())",
        [student_id, level_id, grade_id, section_id, year, estado_matricula]
      );
      return {
        id: result.insertId,
        ...enrollmentData,
        enrollment_date: new Date(),
      };
    } catch (error) {
      console.error("Error en Enrollment.create:", error);
      if (error.code === "ER_DUP_ENTRY") {
        throw new Error(
          `Ya existe una matrícula para este estudiante en este año/grado.`
        );
      }
      throw error;
    }
  },

  update: async (id, enrollmentData) => {
    const { level_id, grade_id, section_id, year, estado_matricula } =
      enrollmentData;
    if (!id) throw new Error("Enrollment ID is required.");

    const fieldsToUpdate = [];
    const queryParams = [];

    if (level_id !== undefined) {
      fieldsToUpdate.push("level_id = ?");
      queryParams.push(level_id);
    }
    if (grade_id !== undefined) {
      fieldsToUpdate.push("grade_id = ?");
      queryParams.push(grade_id);
    }
    if (section_id !== undefined) {
      fieldsToUpdate.push("section_id = ?");
      queryParams.push(section_id);
    }
    if (year !== undefined) {
      fieldsToUpdate.push("year = ?");
      queryParams.push(year);
    }
    if (estado_matricula !== undefined) {
      fieldsToUpdate.push("estado_matricula = ?");
      queryParams.push(estado_matricula);
    }

    if (fieldsToUpdate.length === 0) {
      throw new Error("No hay campos para actualizar.");
    }

    try {
      const query = `UPDATE enrollments SET ${fieldsToUpdate.join(
        ", "
      )} WHERE id = ?`;
      queryParams.push(id);
      await pool.execute(query, queryParams);
      return { id, ...enrollmentData };
    } catch (error) {
      console.error("Error en Enrollment.update:", error);
      throw error;
    }
  },

  delete: async (id) => {
    if (!id) throw new Error("Enrollment ID is required.");
    try {
      const [result] = await pool.execute(
        "DELETE FROM enrollments WHERE id = ?",
        [id]
      );
      if (result.affectedRows === 0) {
        throw new Error("Matrícula no encontrada o no se pudo eliminar.");
      }
      return { message: "Matrícula eliminada exitosamente." };
    } catch (error) {
      console.error("Error en Enrollment.delete:", error);
      throw error;
    }
  },
};

module.exports = Enrollment;
