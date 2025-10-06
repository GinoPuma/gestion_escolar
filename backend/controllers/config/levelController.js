const Level = require("../../models/Level");

exports.getAllLevels = async (req, res) => {
  try {
    const levels = await Level.getAll();
    res.json(levels);
  } catch (error) {
    console.error("Error en levelController.getAllLevels:", error);
    res.status(500).json({ message: "Error al listar niveles educativos." });
  }
};

exports.createLevel = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res
        .status(400)
        .json({ message: "El nombre del nivel educativo es obligatorio." });
    }
    const newLevel = await Level.create(name.trim());
    res.status(201).json(newLevel);
  } catch (error) {
    console.error("Error en levelController.createLevel:", error);
    res
      .status(500)
      .json({
        message: "Error al crear nivel educativo.",
        error: error.message,
      });
  }
};

exports.updateLevel = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res
        .status(400)
        .json({ message: "El nombre del nivel educativo es obligatorio." });
    }
    const updatedLevel = await Level.update(id, name.trim());
    res.json(updatedLevel);
  } catch (error) {
    console.error("Error en levelController.updateLevel:", error);
    res
      .status(500)
      .json({
        message: "Error al actualizar nivel educativo.",
        error: error.message,
      });
  }
};

exports.deleteLevel = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Level.delete(id);
    res.json(result);
  } catch (error) {
    console.error("Error en levelController.deleteLevel:", error);
    res
      .status(500)
      .json({
        message: "Error al eliminar nivel educativo.",
        error: error.message,
      });
  }
};
