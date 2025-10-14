const Responsable = require("../models/Responsable");

exports.getAllResponsables = async (req, res) => {
  try {
    const responsables = await Responsable.getAll();
    res.json(responsables);
  } catch (error) {
    console.error("Error en responsableController.getAllResponsables:", error);
    res
      .status(500)
      .json({ message: "Error al listar responsables.", error: error.message });
  }
};

exports.getResponsableById = async (req, res) => {
  try {
    const { id } = req.params;
    const responsable = await Responsable.getById(id);
    if (!responsable) {
      return res.status(404).json({ message: "Responsable no encontrado." });
    }
    res.json(responsable);
  } catch (error) {
    console.error("Error en responsableController.getResponsableById:", error);
    res
      .status(500)
      .json({
        message: "Error al obtener responsable por ID.",
        error: error.message,
      });
  }
};

exports.createResponsable = async (req, res) => {
  try {
    const responsableData = req.body;

    // Validación básica de campos obligatorios
    if (
      !responsableData.primer_nombre ||
      !responsableData.primer_apellido ||
      !responsableData.numero_identificacion ||
      !responsableData.telefono
    ) {
      return res.status(400).json({
        message:
          "Campos obligatorios (Nombre, Apellido, Identificación, Teléfono) son requeridos.",
      });
    }
    if (responsableData.email && !/\S+@\S+\.\S+/.test(responsableData.email)) {
      return res
        .status(400)
        .json({ message: "El formato del email es inválido." });
    }

    // Verificar duplicados antes de crear
    const exists = await Responsable.exists(
      responsableData.numero_identificacion,
      responsableData.email
    );
    if (exists) {
      return res
        .status(409)
        .json({
          message: "Ya existe un responsable con esta identificación o email.",
        });
    }

    const newResponsable = await Responsable.create(responsableData);
    res.status(201).json(newResponsable);
  } catch (error) {
    console.error("Error en responsableController.createResponsable:", error);
    // Devolver mensaje de error específico si viene del modelo (ej. duplicado)
    if (error.message.includes("Ya existe")) {
      return res.status(409).json({ message: error.message });
    }
    res
      .status(500)
      .json({ message: "Error al crear responsable.", error: error.message });
  }
};

exports.updateResponsable = async (req, res) => {
  try {
    const { id } = req.params;
    const responsableData = req.body;

    if (Object.keys(responsableData).length === 0) {
      return res
        .status(400)
        .json({ message: "No se proporcionaron datos para actualizar." });
    }

    // Validación básica de campos obligatorios (podrían no estar en el body si no se editan)
    if (
      responsableData.primer_nombre === undefined ||
      !responsableData.primer_nombre
    )
      return res
        .status(400)
        .json({ message: "El primer nombre es obligatorio." });
    if (
      responsableData.primer_apellido === undefined ||
      !responsableData.primer_apellido
    )
      return res
        .status(400)
        .json({ message: "El primer apellido es obligatorio." });
    if (
      responsableData.numero_identificacion === undefined ||
      !responsableData.numero_identificacion
    )
      return res
        .status(400)
        .json({ message: "El número de identificación es obligatorio." });
    if (responsableData.telefono === undefined || !responsableData.telefono)
      return res.status(400).json({ message: "El teléfono es obligatorio." });

    if (responsableData.email && !/\S+@\S+\.\S+/.test(responsableData.email)) {
      return res
        .status(400)
        .json({ message: "El formato del email es inválido." });
    }

    // Verificar si el número de identificación o email se está cambiando a uno que ya existe en OTRA persona
    const currentResponsable = await Responsable.getById(id);
    if (!currentResponsable) {
      return res.status(404).json({ message: "Responsable no encontrado." });
    }

    if (
      currentResponsable.numero_identificacion !==
        responsableData.numero_identificacion ||
      currentResponsable.email !== responsableData.email
    ) {
      // Si se cambió alguno de estos campos, verificar si el nuevo valor ya existe en otro responsable
      const exists = await Responsable.exists(
        responsableData.numero_identificacion,
        responsableData.email
      );
      if (exists) {
        return res
          .status(409)
          .json({
            message:
              "Ya existe un responsable con esta identificación o email.",
          });
      }
    }

    const updatedResponsable = await Responsable.update(id, responsableData);
    res.json(updatedResponsable);
  } catch (error) {
    console.error("Error en responsableController.updateResponsable:", error);
    if (error.message.includes("No se proporcionaron datos")) {
      return res.status(400).json({ message: error.message });
    }
    if (error.message.includes("obligatorio")) {
      return res.status(400).json({ message: error.message });
    }
    if (error.code === "ER_DUP_ENTRY") {
      // Capturar duplicados de nuevo por si acaso
      return res.status(409).json({ message: error.message });
    }
    res
      .status(500)
      .json({
        message: "Error al actualizar responsable.",
        error: error.message,
      });
  }
};

exports.deleteResponsable = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Responsable.delete(id);
    res.json(result);
  } catch (error) {
    console.error("Error en responsableController.deleteResponsable:", error);
    if (error.message.includes("no encontrado")) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes("asociado a estudiantes")) {
      return res.status(409).json({ message: error.message }); // Conflict si hay FK
    }
    res
      .status(500)
      .json({
        message: "Error al eliminar responsable.",
        error: error.message,
      });
  }
};

// Controlador para obtener los estudiantes asociados a un responsable
exports.getResponsableStudents = async (req, res) => {
  try {
    const { id } = req.params;
    // Primero verificar que el responsable existe
    const responsable = await Responsable.getById(id);
    if (!responsable) {
      return res.status(404).json({ message: "Responsable no encontrado." });
    }

    const students = await Responsable.getStudentsById(id);
    res.json(students);
  } catch (error) {
    console.error(
      "Error en responsableController.getResponsableStudents:",
      error
    );
    res
      .status(500)
      .json({
        message: "Error al obtener estudiantes del responsable.",
        error: error.message,
      });
  }
};
