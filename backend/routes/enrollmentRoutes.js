const express = require("express");
const router = express.Router();
const enrollmentController = require("../controllers/enrollmentController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get(
  "/",
  protect,
  authorize("Administrador", "Secretaria"),
  enrollmentController.getAllEnrollments
);

router.post(
  "/",
  protect,
  authorize("Administrador", "Secretaria"),
  enrollmentController.createEnrollment
);

router.get(
  "/:id",
  protect,
  authorize("Administrador", "Secretaria"),
  enrollmentController.getEnrollmentById
);

router.put(
  "/:id",
  protect,
  authorize("Administrador", "Secretaria"),
  enrollmentController.updateEnrollment
);

router.delete(
  "/:id",
  protect,
  authorize("Administrador"), // Solo administradores pueden eliminar
  enrollmentController.deleteEnrollment
);

module.exports = router;
