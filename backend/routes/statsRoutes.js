const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware"); 
const statsController = require("../controllers/statsController");

const router = express.Router();

router.get(
  "/stats",
  protect,
  authorize("Administrador", "Secretaria"),
  statsController.getDashboardStats
);

module.exports = router;
