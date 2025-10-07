const express = require("express");
const router = express.Router();
const metodoPagoController = require("../controllers/metodoPagoController");
const { protect, authorize } = require('../middleware/authMiddleware');

router.get(
  "/",
  protect,
  authorize("Administrador", "Secretaria"), 
  metodoPagoController.getAllMetodosPago
);

router.post(
  "/",
  protect,
  authorize("Administrador"), 
  metodoPagoController.createMetodoPago
);

router.get(
  "/:id",
  protect,
  authorize("Administrador", "Secretaria"),
  metodoPagoController.getMetodoPagoById
);

router.put(
  "/:id",
  protect,
  authorize("Administrador"),
  metodoPagoController.updateMetodoPago
);

router.delete(
  "/:id",
  protect,
  authorize("Administrador"),
  metodoPagoController.deleteMetodoPago
);

module.exports = router;