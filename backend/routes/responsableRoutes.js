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

module.exports = router;
