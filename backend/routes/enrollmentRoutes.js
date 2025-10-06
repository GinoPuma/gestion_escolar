const express = require("express");
const router = express.Router();
const enrollmentController = require("../controllers/enrollmentController");
const { protect, authorize } = require('../middleware/authMiddleware');

router.get(
  "/",
  protect,
  authorize(["Secretaria", "Administrador"]),
  enrollmentController.getAllEnrollments
);
router.post(
  "/",
  protect,
  authorize(["Secretaria", "Administrador"]),
  enrollmentController.createEnrollment
);
router.get(
  "/:id",
  protect,
  authorize(["Secretaria", "Administrador"]),
  enrollmentController.getEnrollmentById
);
router.put(
  "/:id",
  protect,
  authorize(["Secretaria", "Administrador"]),
  enrollmentController.updateEnrollment
);
router.delete(
  "/:id",
  protect,
  authorize(["Administrador"]),
  enrollmentController.deleteEnrollment
);

module.exports = router;
