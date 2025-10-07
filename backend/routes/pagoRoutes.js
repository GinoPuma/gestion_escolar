const express = require("express");
const router = express.Router();
const pagoController = require("../controllers/pagoController");
const { protect, authorize } = require('../middleware/authMiddleware');

router.get(
  "/",
  protect,
  authorize("Secretaria", "Administrador"),
  pagoController.getAllPagos
);

router.post(
  "/",
  protect,
  authorize("Secretaria", "Administrador"),
  pagoController.createPago
);

router.get(
  "/:id",
  protect,
  authorize("Secretaria", "Administrador"),
  pagoController.getPagoById
);

router.put(
  "/:id",
  protect,
  authorize("Secretaria", "Administrador"),
  pagoController.updatePago
);

router.delete(
  "/:id",
  protect,
  authorize("Administrador"),
  pagoController.deletePago
);

module.exports = router;