const Student = require("../models/Student");

exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.getAll();
    res.json(students);
  } catch (error) {
    console.error("Error en studentController.getAllStudents:", error);
    res
      .status(500)
      .json({ message: "Error al obtener la lista de estudiantes." });
  }
};

exports.getStudentById = async (req, res) => {
  const { id } = req.params;
  try {
    const student = await Student.getById(id);
    if (!student) {
      return res.status(404).json({ message: "Estudiante no encontrado." });
    }
    res.json(student);
  } catch (error) {
    console.error("Error en studentController.getStudentById:", error);
    res
      .status(500)
      .json({ message: "Error al obtener los detalles del estudiante." });
  }
};

exports.createStudent = async (req, res) => {

  try {
    const studentData = req.body;
    if (
      !studentData.primer_nombre ||
      !studentData.primer_apellido ||
      !studentData.fecha_nacimiento ||
      !studentData.genero ||
      !studentData.numero_identificacion
    ) {
      return res
        .status(400)
        .json({
          message:
            "Los campos obligatorios (nombre, apellido, fecha nacimiento, género, identificación) son requeridos.",
        });
    }

    const newStudent = await Student.create(studentData);
    res.status(201).json(newStudent);
  } catch (error) {
    console.error("Error en studentController.createStudent:", error);
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ message: "El número de identificación ya existe." });
    }
    res
      .status(500)
      .json({ message: "Error al crear el estudiante.", error: error.message });
  }
};

exports.updateStudent = async (req, res) => {
  const { id } = req.params;

  try {
    const studentData = req.body;
    if (
      !studentData.primer_nombre ||
      !studentData.primer_apellido ||
      !studentData.fecha_nacimiento ||
      !studentData.genero ||
      !studentData.numero_identificacion
    ) {
      return res
        .status(400)
        .json({
          message:
            "Los campos obligatorios (nombre, apellido, fecha nacimiento, género, identificación) son requeridos.",
        });
    }

    const updatedStudent = await Student.update(id, studentData);
    if (!updatedStudent) {
      return res.status(404).json({ message: "Estudiante no encontrado." });
    }
    res.json(updatedStudent);
  } catch (error) {
    console.error("Error en studentController.updateStudent:", error);
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ message: "El número de identificación ya existe." });
    }
    res
      .status(500)
      .json({
        message: "Error al actualizar el estudiante.",
        error: error.message,
      });
  }
};

exports.deleteStudent = async (req, res) => {
  const { id } = req.params;
  try {
    const success = await Student.delete(id);
    if (!success) {
      return res.status(404).json({ message: "Estudiante no encontrado." });
    }
    res.json({ message: "Estudiante eliminado exitosamente." });
  } catch (error) {
    console.error("Error en studentController.deleteStudent:", error);
    res
      .status(500)
      .json({
        message: "Error al eliminar el estudiante.",
        error: error.message,
      });
  }
};
