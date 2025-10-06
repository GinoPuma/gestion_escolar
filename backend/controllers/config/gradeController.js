const Grade = require("../../models/Grade");

exports.getAllGrades = async (req, res) => {
  try {
    const grades = await Grade.getAll();
    res.json(grades);
  } catch (error) {
    console.error("Error en gradeController.getAllGrades:", error);
    res.status(500).json({ message: "Error al listar grados." });
  }
};

exports.getGradesByLevel = async (req, res) => {
  try {
    const { levelId } = req.params;
    if (!levelId) {
      return res.status(400).json({ message: "El ID del nivel es requerido." });
    }
    const grades = await Grade.getByLevelId(levelId);
    res.json(grades);
  } catch (error) {
    console.error("Error en gradeController.getGradesByLevel:", error);
    res.status(500).json({ message: "Error al listar grados por nivel." });
  }
};

exports.createGrade = async (req, res) => {
  try {
    const gradeData = req.body; 
    if (!gradeData.name || !gradeData.level_id) {
      return res
        .status(400)
        .json({ message: "Nombre del grado y ID de nivel son obligatorios." });
    }
    const newGrade = await Grade.create(gradeData);
    res.status(201).json(newGrade);
  } catch (error) {
    console.error("Error en gradeController.createGrade:", error);
    res
      .status(500)
      .json({ message: "Error al crear grado.", error: error.message });
  }
};

exports.updateGrade = async (req, res) => {
  try {
    const { id } = req.params;
    const gradeData = req.body; 
    if (!gradeData.name || !gradeData.level_id) {
      return res
        .status(400)
        .json({ message: "Nombre del grado y ID de nivel son obligatorios." });
    }
    const updatedGrade = await Grade.update(id, gradeData);
    res.json(updatedGrade);
  } catch (error) {
    console.error("Error en gradeController.updateGrade:", error);
    res
      .status(500)
      .json({ message: "Error al actualizar grado.", error: error.message });
  }
};

exports.deleteGrade = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Grade.delete(id);
    res.json(result);
  } catch (error) {
    console.error("Error en gradeController.deleteGrade:", error);
    res
      .status(500)
      .json({ message: "Error al eliminar grado.", error: error.message });
  }
};
