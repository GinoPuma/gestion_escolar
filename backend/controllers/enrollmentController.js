const Enrollment = require("../models/Enrollment");
const Student = require("../models/Student"); 
const Section = require("../models/Section"); 

exports.getAllEnrollments = async (req, res) => {
  try {
    const filters = {
      studentId: req.query.studentId,
      anioAcademico: req.query.anioAcademico,
    };
    const enrollments = await Enrollment.getAll(filters);
    res.json(enrollments);
  } catch (error) {
    console.error("Error en enrollmentController.getAllEnrollments:", error);
    res
      .status(500)
      .json({ message: "Error al listar matrículas.", error: error.message });
  }
};

exports.getEnrollmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const enrollment = await Enrollment.getById(id);
    if (!enrollment) {
      return res.status(404).json({ message: "Matrícula no encontrada." });
    }
    res.json(enrollment);
  } catch (error) {
    console.error("Error en enrollmentController.getEnrollmentById:", error);
    res
      .status(500)
      .json({
        message: "Error al obtener matrícula por ID.",
        error: error.message,
      });
  }
};

exports.createEnrollment = async (req, res) => {
  try {
    const {
      estudiante_id,
      seccion_id,
      anio_academico,
      fecha_matricula,
      estado,
    } = req.body;

    if (!estudiante_id)
      return res
        .status(400)
        .json({ message: "El ID del estudiante es obligatorio." });
    if (!seccion_id)
      return res
        .status(400)
        .json({ message: "El ID de la sección es obligatorio." });
    if (!anio_academico)
      return res
        .status(400)
        .json({ message: "El año académico es obligatorio." });
    if (!estado)
      return res
        .status(400)
        .json({ message: "El estado de la matrícula es obligatorio." });

    const studentExists = await Student.getById(estudiante_id);
    if (!studentExists) {
      return res
        .status(400)
        .json({ message: "El estudiante especificado no existe." });
    }

    const sectionExists = await Section.getById(seccion_id);
    if (!sectionExists) {
      return res
        .status(400)
        .json({ message: "La sección especificada no existe." });
    }

    const enrollmentData = {
      estudiante_id,
      seccion_id,
      anio_academico,
      fecha_matricula:
        fecha_matricula || new Date().toISOString().split("T")[0],
      estado,
    };

    const newEnrollment = await Enrollment.create(enrollmentData);
    res.status(201).json(newEnrollment);
  } catch (error) {
    console.error("Error en enrollmentController.createEnrollment:", error);
    if (error.message.includes("Faltan campos obligatorios")) {
      return res.status(400).json({ message: error.message });
    }
    if (error.message.includes("no es válida")) {
      return res.status(400).json({ message: error.message });
    }
    if (error.message.includes("Ya existe una matrícula")) {
      return res.status(409).json({ message: error.message }); 
    }
    res
      .status(500)
      .json({ message: "Error al crear matrícula.", error: error.message });
  }
};

exports.updateEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    const enrollmentData = req.body;

    if (Object.keys(enrollmentData).length === 0) {
      return res
        .status(400)
        .json({ message: "No se proporcionaron datos para actualizar." });
    }

    if (enrollmentData.seccion_id !== undefined) {
      const sectionExists = await Section.getById(enrollmentData.seccion_id);
      if (!sectionExists) {
        return res
          .status(400)
          .json({ message: "La sección especificada no existe." });
      }
    }

    const updatedEnrollment = await Enrollment.update(id, enrollmentData);
    res.json(updatedEnrollment);
  } catch (error) {
    console.error("Error en enrollmentController.updateEnrollment:", error);
    if (error.message.includes("Se requiere el ID")) {
      return res.status(400).json({ message: error.message });
    }
    if (error.message.includes("No hay campos para actualizar")) {
      return res.status(400).json({ message: error.message });
    }
    if (error.message.includes("no es válida")) {
      return res.status(400).json({ message: error.message });
    }
    res
      .status(500)
      .json({
        message: "Error al actualizar matrícula.",
        error: error.message,
      });
  }
};

exports.deleteEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Enrollment.delete(id);
    res.json(result);
  } catch (error) {
    console.error("Error en enrollmentController.deleteEnrollment:", error);
    if (error.message.includes("no encontrada o no se pudo eliminar")) {
      return res.status(404).json({ message: error.message });
    }
    res
      .status(500)
      .json({ message: "Error al eliminar matrícula.", error: error.message });
  }
};
