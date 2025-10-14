const pool = require("../config/db");

const Enrollment = {
  getAll: async (filters = {}) => {
    try {
      let query = `
        SELECT 
          m.*,
          e.primer_nombre AS estudiante_primer_nombre,
          e.primer_apellido AS estudiante_primer_apellido,
          ne.nombre AS nombre_nivel,
          g.nombre AS nombre_grado,
          s.nombre AS nombre_seccion
        FROM matriculas m
        JOIN estudiantes e ON m.estudiante_id = e.id
        JOIN secciones s ON m.seccion_id = s.id
        JOIN grados g ON s.grado_id = g.id
        JOIN niveles_educativos ne ON g.nivel_id = ne.id
      `;
      const queryParams = [];

      if (filters.studentId) {
        query += " WHERE m.estudiante_id = ?";
        queryParams.push(filters.studentId);
      }
      if (filters.anioAcademico) {
        if (filters.studentId) {
          query += " AND m.anio_academico = ?";
        } else {
          query += " WHERE m.anio_academico = ?";
        }
        queryParams.push(filters.anioAcademico);
      }

      query += " ORDER BY m.fecha_matricula DESC";

      const [rows] = await pool.execute(query, queryParams);
      return rows;
    } catch (error) {
      console.error("Error en Enrollment.getAll:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const query = `
        SELECT 
          m.*,
          e.primer_nombre AS estudiante_primer_nombre,
          e.primer_apellido AS estudiante_primer_apellido,
          ne.nombre AS nombre_nivel,
          g.nombre AS nombre_grado,
          s.nombre AS nombre_seccion
        FROM matriculas m
        JOIN estudiantes e ON m.estudiante_id = e.id
        JOIN secciones s ON m.seccion_id = s.id
        JOIN grados g ON s.grado_id = g.id
        JOIN niveles_educativos ne ON g.nivel_id = ne.id
        WHERE m.id = ?
      `;
      const [rows] = await pool.execute(query, [id]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error("Error en Enrollment.getById:", error);
      throw error;
    }
  },

  create: async (enrollmentData) => {
    const {
      estudiante_id,
      seccion_id,
      anio_academico,
      fecha_matricula,
      estado,
    } = enrollmentData;

    if (!estudiante_id || !seccion_id || !anio_academico || !estado) {
      throw new Error(
        "Faltan campos obligatorios: estudiante_id, seccion_id, anio_academico, estado."
      );
    }

    // 🗓️ Validar que la fecha de matrícula no sea de años pasados
    const currentYear = new Date().getFullYear();
    const formattedFechaMatricula = fecha_matricula
      ? new Date(fecha_matricula)
      : new Date();

    if (isNaN(formattedFechaMatricula.getTime())) {
      throw new Error("La fecha de matrícula proporcionada no es válida.");
    }

    const enrollmentYear = formattedFechaMatricula.getFullYear();
    if (enrollmentYear < currentYear) {
      throw new Error(
        "No se permite registrar matrículas con fechas de años anteriores."
      );
    }

    // 🧾 Validar que el estudiante no tenga más de una matrícula en el mismo año académico
    const [existingEnrollment] = await pool.execute(
      `SELECT id FROM matriculas WHERE estudiante_id = ? AND anio_academico = ?`,
      [estudiante_id, anio_academico]
    );

    if (existingEnrollment.length > 0) {
      throw new Error(
        `El estudiante ya tiene una matrícula registrada en el año académico ${anio_academico}.`
      );
    }

    try {
      const [result] = await pool.execute(
        `INSERT INTO matriculas (estudiante_id, seccion_id, anio_academico, fecha_matricula, estado) 
       VALUES (?, ?, ?, ?, ?)`,
        [
          estudiante_id,
          seccion_id,
          anio_academico,
          formattedFechaMatricula,
          estado,
        ]
      );

      return {
        id: result.insertId,
        estudiante_id,
        seccion_id,
        anio_academico,
        fecha_matricula: formattedFechaMatricula,
        estado,
      };
    } catch (error) {
      console.error("Error en Enrollment.create:", error);
      if (error.code === "ER_DUP_ENTRY") {
        throw new Error(
          `Ya existe una matrícula para este estudiante en el año académico ${anio_academico}.`
        );
      }
      throw error;
    }
  },

  update: async (id, enrollmentData) => {
    const { seccion_id, anio_academico, fecha_matricula, estado } =
      enrollmentData;

    if (!id)
      throw new Error("Se requiere el ID de la matrícula para actualizar.");

    const fieldsToUpdate = [];
    const queryParams = [];

    if (seccion_id !== undefined) {
      fieldsToUpdate.push("seccion_id = ?");
      queryParams.push(seccion_id);
    }
    if (anio_academico !== undefined) {
      fieldsToUpdate.push("anio_academico = ?");
      queryParams.push(anio_academico);
    }
    if (fecha_matricula !== undefined) {
      const formattedFechaMatricula = new Date(fecha_matricula);
      if (isNaN(formattedFechaMatricula.getTime())) {
        throw new Error("La fecha de matrícula proporcionada no es válida.");
      }
      fieldsToUpdate.push("fecha_matricula = ?");
      queryParams.push(formattedFechaMatricula);
    }
    if (estado !== undefined) {
      fieldsToUpdate.push("estado = ?");
      queryParams.push(estado);
    }

    if (fieldsToUpdate.length === 0) {
      throw new Error("No se proporcionaron campos para actualizar.");
    }

    try {
      const query = `UPDATE matriculas SET ${fieldsToUpdate.join(
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
    if (!id)
      throw new Error("Se requiere el ID de la matrícula para eliminar.");
    try {
      const [result] = await pool.execute(
        "DELETE FROM matriculas WHERE id = ?",
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
