const Enrollment = require("../models/Enrollment");
const Student = require("../models/Student");
const Level = require("../models/Level");
const Grade = require("../models/Grade");
const Section = require("../models/Section");

exports.getAllEnrollments = async (req, res) => {
  try {
    const filters = {
      studentId: req.query.studentId,
      year: req.query.year,
    };
    const enrollments = await Enrollment.getAll(filters);
    res.json(enrollments);
  } catch (error) {
    console.error("Error en enrollmentController.getAllEnrollments:", error);
    res.status(500).json({ message: "Error al listar matrículas." });
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
    res.status(500).json({ message: "Error al obtener matrícula por ID." });
  }
};

exports.createEnrollment = async (req, res) => {
  try {
    const {
      student_id,
      level_id,
      grade_id,
      section_id,
      year,
      estado_matricula,
    } = req.body;

    if (!student_id)
      return res
        .status(400)
        .json({ message: "El ID del estudiante es obligatorio." });
    if (!level_id)
      return res
        .status(400)
        .json({ message: "El ID del nivel es obligatorio." });
    if (!grade_id)
      return res
        .status(400)
        .json({ message: "El ID del grado es obligatorio." });
    if (!section_id)
      return res
        .status(400)
        .json({ message: "El ID de la sección es obligatorio." });
    if (!year)
      return res.status(400).json({ message: "El año es obligatorio." });
    if (!estado_matricula)
      return res
        .status(400)
        .json({ message: "El estado de la matrícula es obligatorio." });

    const studentExists = await Student.getById(student_id);
    if (!studentExists)
      return res
        .status(400)
        .json({ message: "El estudiante especificado no existe." });
    const levelExists = await Level.getById(level_id);
    if (!levelExists)
      return res
        .status(400)
        .json({ message: "El nivel educativo especificado no existe." });
    const gradeExists = await Grade.getById(grade_id);
    if (!gradeExists)
      return res
        .status(400)
        .json({ message: "El grado especificado no existe." });
    const sectionExists = await Section.getById(section_id);
    if (!sectionExists)
      return res
        .status(400)
        .json({ message: "La sección especificada no existe." });

    const newEnrollment = await Enrollment.create({
      student_id,
      level_id,
      grade_id,
      section_id,
      year,
      estado_matricula,
    });
    res.status(201).json(newEnrollment);
  } catch (error) {
    console.error("Error en enrollmentController.createEnrollment:", error);
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

    const updatedEnrollment = await Enrollment.update(id, enrollmentData);
    res.json(updatedEnrollment);
  } catch (error) {
    console.error("Error en enrollmentController.updateEnrollment:", error);
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
    res
      .status(500)
      .json({ message: "Error al eliminar matrícula.", error: error.message });
  }
};
