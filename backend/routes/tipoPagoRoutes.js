const express = require("express");
const router = express.Router();
const tipoPagoController = require("../controllers/tipoPagoController");
const { protect, authorize } = require('../middleware/authMiddleware');

router.get(
  "/",
  protect,
  authorize("Administrador", "Secretaria"), 
  tipoPagoController.getAllTiposPago
);

router.post(
  "/",
  protect,
  authorize("Administrador"), 
  tipoPagoController.createTipoPago
);

router.get(
  "/:id",
  protect,
  authorize("Administrador", "Secretaria"),
  tipoPagoController.getTipoPagoById
);

router.put(
  "/:id",
  protect,
  authorize("Administrador"),
  tipoPagoController.updateTipoPago
);

router.delete(
  "/:id",
  protect,
  authorize("Administrador"),
  tipoPagoController.deleteTipoPago
);

module.exports = router;