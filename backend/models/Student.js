const pool = require("../config/db");

const Student = {
  getAll: async () => {
    try {
      const query = `
        SELECT 
          e.*,
          m.id as matricula_id,
          m.anio_academico,
          m.estado as estado_matricula,
          s.nombre as nombre_seccion,
          g.nombre as nombre_grado,
          ne.nombre as nombre_nivel
        FROM estudiantes e
        LEFT JOIN matriculas m ON e.id = m.estudiante_id AND m.estado = 'Activo'
        LEFT JOIN secciones s ON m.seccion_id = s.id
        LEFT JOIN grados g ON s.grado_id = g.id
        LEFT JOIN niveles_educativos ne ON g.nivel_id = ne.id
        ORDER BY e.primer_apellido, e.primer_nombre;
      `;
      const [rows] = await pool.execute(query);
      return rows;
    } catch (error) {
      console.error("Error en Student.getAll:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const query = `
        SELECT 
          e.*,
          m.id as matricula_id,
          m.anio_academico,
          m.estado as estado_matricula,
          s.nombre as nombre_seccion,
          g.nombre as nombre_grado,
          ne.nombre as nombre_nivel
        FROM estudiantes e
        LEFT JOIN matriculas m ON e.id = m.estudiante_id AND m.estado = 'Activo'
        LEFT JOIN secciones s ON m.seccion_id = s.id
        LEFT JOIN grados g ON s.grado_id = g.id
        LEFT JOIN niveles_educativos ne ON g.nivel_id = ne.id
        WHERE e.id = ?;
      `;
      const [rows] = await pool.execute(query, [id]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error("Error en Student.getById:", error);
      throw error;
    }
  },

  create: async (studentData) => {
    const {
      primer_nombre,
      segundo_nombre,
      primer_apellido,
      segundo_apellido,
      fecha_nacimiento,
      genero,
      numero_identificacion,
      direccion,
      telefono,
      email,
    } = studentData;

    try {
      const [result] = await pool.execute(
        `INSERT INTO estudiantes 
          (primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, fecha_nacimiento, genero, numero_identificacion, direccion, telefono, email) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          primer_nombre,
          segundo_nombre,
          primer_apellido,
          segundo_apellido,
          fecha_nacimiento,
          genero,
          numero_identificacion,
          direccion,
          telefono,
          email,
        ]
      );

      return { id: result.insertId, ...studentData };
    } catch (error) {
      console.error("Error en Student.create:", error);
      throw error;
    }
  },

  update: async (id, studentData) => {
    const {
      primer_nombre,
      segundo_nombre,
      primer_apellido,
      segundo_apellido,
      fecha_nacimiento,
      genero,
      numero_identificacion,
      direccion,
      telefono,
      email,
    } = studentData;

    try {
      await pool.execute(
        `UPDATE estudiantes 
        SET primer_nombre = ?, segundo_nombre = ?, primer_apellido = ?, segundo_apellido = ?, 
            fecha_nacimiento = ?, genero = ?, numero_identificacion = ?, direccion = ?, 
            telefono = ?, email = ? 
        WHERE id = ?`,
        [
          primer_nombre,
          segundo_nombre,
          primer_apellido,
          segundo_apellido,
          fecha_nacimiento,
          genero,
          numero_identificacion,
          direccion,
          telefono,
          email,
          id,
        ]
      );
      return { id, ...studentData };
    } catch (error) {
      console.error("Error en Student.update:", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const [result] = await pool.execute(
        "DELETE FROM estudiantes WHERE id = ?",
        [id]
      );
      if (result.affectedRows === 0) {
        return false; 
      }
      return true; 
    } catch (error) {
      console.error("Error en Student.delete:", error);
      throw error;
    }
  },

  getResponsablesById: async (id) => {
    try {
      const query = `
        SELECT r.*
        FROM responsables r
        JOIN estudiante_responsable er ON r.id = er.responsable_id
        WHERE er.estudiante_id = ?
        ORDER BY r.primer_apellido, r.primer_nombre;
      `;
      const [rows] = await pool.execute(query, [id]);
      return rows;
    } catch (error) {
      console.error("Error en Estudiante.getResponsablesById:", error);
      throw error;
    }
  },

  // Método para asociar un responsable a un estudiante
  addResponsable: async (estudianteId, responsableId) => {
    try {
      await pool.execute(
        "INSERT INTO estudiante_responsable (estudiante_id, responsable_id) VALUES (?, ?)",
        [estudianteId, responsableId]
      );
      return true;
    } catch (error) {
      console.error("Error en Estudiante.addResponsable:", error);
      throw error;
    }
  },

  // Método para desasociar un responsable de un estudiante
  removeResponsable: async (estudianteId, responsableId) => {
    try {
      const [result] = await pool.execute(
        "DELETE FROM estudiante_responsable WHERE estudiante_id = ? AND responsable_id = ?",
        [estudianteId, responsableId]
      );
      if (result.affectedRows === 0) {
        throw new Error("La asociación estudiante-responsable no se encontró.");
      }
      return true;
    } catch (error) {
      console.error("Error en Estudiante.removeResponsable:", error);
      throw error;
    }
  },
};

module.exports = Student;
