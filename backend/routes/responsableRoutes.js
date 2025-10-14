const express = require("express");
const router = express.Router();
const responsableController = require("../controllers/responsableController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get(
  "/",
  protect,
  authorize("Administrador", "Secretaria"), 
  responsableController.getAllResponsables
);

router.post(
  "/",
  protect,
  authorize("Administrador", "Secretaria"), 
  responsableController.createResponsable
);

router.get(
  "/:id",
  protect,
  authorize("Administrador", "Secretaria"),
  responsableController.getResponsableById
);

router.put(
  "/:id",
  protect,
  authorize("Administrador", "Secretaria"), 
  responsableController.updateResponsable
);

router.delete(
  "/:id",
  protect,
  authorize("Administrador"), 
  responsableController.deleteResponsable
);

router.get(
  "/:id/students",
  protect,
  authorize("Administrador", "Secretaria"), 
  responsableController.getResponsableStudents
);

router.get("/:id/students", protect, authorize("Administrador", "Secretaria"), responsableController.getResponsableStudents);

// Ruta para obtener los responsables asociados a un estudiante
router.get("/students/:id/responsables", protect, authorize("Administrador", "Secretaria"), responsableController.getStudentResponsables);

// Rutas para asociar/desasociar estudiantes a responsables (POST/DELETE)
// Asumimos que el ID del responsable y estudiante vienen en la URL como parámetros
router.post("/:responsableId/students/:estudianteId", protect, authorize("Administrador", "Secretaria"), responsableController.addStudentToResponsable);
router.delete("/:responsableId/students/:estudianteId", protect, authorize("Administrador", "Secretaria"), responsableController.removeStudentFromResponsable);

module.exports = router;
