const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { protect, authorize } = require('../middleware/authMiddleware');

router.get(
  "/",
  protect,
  authorize(["Secretaria", "Administrador"]),
  paymentController.getAllPayments
);
router.post(
  "/",
  protect,
  authorize(["Secretaria", "Administrador"]),
  paymentController.createPayment
);
router.get(
  "/:id",
  protect,
  authorize(["Secretaria", "Administrador"]),
  paymentController.getPaymentById
);
router.put(
  "/:id",
  protect,
  authorize(["Secretaria", "Administrador"]),
  paymentController.updatePayment
);
router.delete(
  "/:id",
  protect,
  authorize(["Administrador"]),
  paymentController.deletePayment
);

module.exports = router;
