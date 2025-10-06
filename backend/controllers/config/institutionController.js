const Institution = require("../../models/Institution");

exports.getInstitution = async (req, res) => {
  try {
    const institution = await Institution.get();
    res.json(
      institution || {
        message: "Información de la institución no configurada.",
      }
    );
  } catch (error) {
    console.error("Error en institutionController.getInstitution:", error);
    res
      .status(500)
      .json({ message: "Error al obtener información de la institución." });
  }
};

exports.saveInstitution = async (req, res) => {
  try {
    const institutionData = req.body;
    if (!institutionData.nombre) {
      return res
        .status(400)
        .json({ message: "El nombre de la institución es obligatorio." });
    }

    let result;
    if (institutionData.id) {
      result = await Institution.update(institutionData);
    } else {
      result = await Institution.create(institutionData);
    }
    res.status(institutionData.id ? 200 : 201).json(result);
  } catch (error) {
    console.error("Error en institutionController.saveInstitution:", error);
    res
      .status(500)
      .json({
        message: "Error al guardar información de la institución.",
        error: error.message,
      });
  }
};