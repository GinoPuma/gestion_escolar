const pool = require("../config/db");

const Responsable = {
  getAll: async () => {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM responsables ORDER BY primer_apellido, primer_nombre"
      );
      return rows;
    } catch (error) {
      console.error("Error en Responsable.getAll:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM responsables WHERE id = ?",
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error("Error en Responsable.getById:", error);
      throw error;
    }
  },

  // Verificar si un responsable con esa identificación o email ya existe
  exists: async (numero_identificacion, email = null) => {
    try {
      let query = "SELECT id FROM responsables WHERE numero_identificacion = ?";
      const params = [numero_identificacion];
      if (email) {
        query += " OR email = ?";
        params.push(email);
      }
      const [rows] = await pool.execute(query, params);
      return rows.length > 0;
    } catch (error) {
      console.error("Error en Responsable.exists:", error);
      throw error;
    }
  },

  create: async (responsableData) => {
    const {
      primer_nombre,
      segundo_nombre,
      primer_apellido,
      segundo_apellido,
      numero_identificacion,
      direccion,
      telefono,
      email,
      parentesco,
    } = responsableData;

    try {
      const [result] = await pool.execute(
        `INSERT INTO responsables (primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, numero_identificacion, direccion, telefono, email, parentesco) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          primer_nombre,
          segundo_nombre,
          primer_apellido,
          segundo_apellido,
          numero_identificacion,
          direccion,
          telefono,
          email,
          parentesco,
        ]
      );
      return { id: result.insertId, ...responsableData };
    } catch (error) {
      console.error("Error en Responsable.create:", error);
      // Manejar errores específicos como duplicados
      if (error.code === "ER_DUP_ENTRY") {
        if (error.message.includes("numero_identificacion")) {
          throw new Error(
            "Ya existe un responsable con este número de identificación."
          );
        }
        if (error.message.includes("email") && email) {
          throw new Error(
            "Ya existe un responsable con este correo electrónico."
          );
        }
      }
      throw error;
    }
  },

  update: async (id, responsableData) => {
    const {
      primer_nombre,
      segundo_nombre,
      primer_apellido,
      segundo_apellido,
      numero_identificacion,
      direccion,
      telefono,
      email,
      parentesco,
    } = responsableData;

    try {
      await pool.execute(
        `UPDATE responsables 
        SET primer_nombre = ?, segundo_nombre = ?, primer_apellido = ?, segundo_apellido = ?, 
            numero_identificacion = ?, direccion = ?, telefono = ?, email = ?, parentesco = ? 
        WHERE id = ?`,
        [
          primer_nombre,
          segundo_nombre,
          primer_apellido,
          segundo_apellido,
          numero_identificacion,
          direccion,
          telefono,
          email,
          parentesco,
          id,
        ]
      );
      return { id, ...responsableData };
    } catch (error) {
      console.error("Error en Responsable.update:", error);
      if (error.code === "ER_DUP_ENTRY") {
        // Manejar errores de duplicados específicamente
        if (error.message.includes("numero_identificacion")) {
          throw new Error(
            "Ya existe un responsable con este número de identificación."
          );
        }
        if (error.message.includes("email") && email) {
          throw new Error(
            "Ya existe un responsable con este correo electrónico."
          );
        }
      }
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const [result] = await pool.execute(
        "DELETE FROM responsables WHERE id = ?",
        [id]
      );
      if (result.affectedRows === 0) {
        throw new Error("Responsable no encontrado o no se pudo eliminar.");
      }
      return { message: "Responsable eliminado exitosamente." };
    } catch (error) {
      console.error("Error en Responsable.delete:", error);
      // Manejar error de clave foránea si un responsable está asociado a estudiantes
      if (error.code === "ER_ROW_IS_REFERENCED_2") {
        throw new Error(
          "No se puede eliminar este responsable porque está asociado a estudiantes."
        );
      }
      throw error;
    }
  },

  addStudent: async (responsableId, estudianteId) => {
    try {
      await pool.execute(
        "INSERT INTO estudiante_responsable (responsable_id, estudiante_id) VALUES (?, ?)",
        [responsableId, estudianteId]
      );
      return true;
    } catch (error) {
      console.error("Error en Responsable.addStudent:", error);
      throw error; 
    }
  },

  removeStudent: async (responsableId, estudianteId) => {
    try {
      const [result] = await pool.execute(
        "DELETE FROM estudiante_responsable WHERE responsable_id = ? AND estudiante_id = ?",
        [responsableId, estudianteId]
      );
      if (result.affectedRows === 0) {
        throw new Error("La asociación estudiante-responsable no se encontró.");
      }
      return true;
    } catch (error) {
      console.error("Error en Responsable.removeStudent:", error);
      throw error;
    }
  },

  // Método para obtener estudiantes asociados a un responsable (ya lo tenías, pero lo coloco aquí para consistencia)
  getStudentsById: async (id) => {
    try {
      const query = `
        SELECT e.*
        FROM estudiantes e
        JOIN estudiante_responsable er ON e.id = er.estudiante_id
        WHERE er.responsable_id = ?
        ORDER BY e.primer_apellido, e.primer_nombre;
      `;
      const [rows] = await pool.execute(query, [id]);
      return rows;
    } catch (error) {
      console.error("Error en Responsable.getStudentsById:", error);
      throw error;
    }
  },

  // Método para obtener responsables asociados a un estudiante
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
      console.error("Error en Responsable.getResponsablesById:", error);
      throw error;
    }
  },
};

module.exports = Responsable;
