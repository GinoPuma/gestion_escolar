const Section = require("../../models/Section");

exports.getAllSections = async (req, res) => {
  try {
    const sections = await Section.getAll();
    res.json(sections);
  } catch (error) {
    console.error("Error en sectionController.getAllSections:", error);
    res.status(500).json({ message: "Error al listar secciones." });
  }
};

exports.getSectionsByGrade = async (req, res) => {
  try {
    const { gradeId } = req.params;
    if (!gradeId) {
      return res.status(400).json({ message: "El ID del grado es requerido." });
    }
    const sections = await Section.getByGradeId(gradeId);
    res.json(sections);
  } catch (error) {
    console.error("Error en sectionController.getSectionsByGrade:", error);
    res.status(500).json({ message: "Error al listar secciones por grado." });
  }
};

exports.createSection = async (req, res) => {
  try {
    const sectionData = req.body; 
    if (!sectionData.name || !sectionData.grade_id) {
      return res
        .status(400)
        .json({
          message: "Nombre de la sección y ID de grado son obligatorios.",
        });
    }
    const newSection = await Section.create(sectionData);
    res.status(201).json(newSection);
  } catch (error) {
    console.error("Error en sectionController.createSection:", error);
    res
      .status(500)
      .json({ message: "Error al crear sección.", error: error.message });
  }
};

exports.updateSection = async (req, res) => {
  try {
    const { id } = req.params;
    const sectionData = req.body; 
    if (!sectionData.name || !sectionData.grade_id) {
      return res
        .status(400)
        .json({
          message: "Nombre de la sección y ID de grado son obligatorios.",
        });
    }
    const updatedSection = await Section.update(id, sectionData);
    res.json(updatedSection);
  } catch (error) {
    console.error("Error en sectionController.updateSection:", error);
    res
      .status(500)
      .json({ message: "Error al actualizar sección.", error: error.message });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Section.delete(id);
    res.json(result);
  } catch (error) {
    console.error("Error en sectionController.deleteSection:", error);
    res
      .status(500)
      .json({ message: "Error al eliminar sección.", error: error.message });
  }
};
