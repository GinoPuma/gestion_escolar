const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const studentController = require("../controllers/studentController");

const router = express.Router();

router
  .route("/")
  .get(
    protect,
    authorize("Administrador", "Secretaria"),
    studentController.getAllStudents
  )
  .post(
    protect,
    authorize("Administrador", "Secretaria"),
    studentController.createStudent
  );

router
  .route("/:id")
  .get(
    protect,
    authorize("Administrador", "Secretaria"),
    studentController.getStudentById
  )
  .put(
    protect,
    authorize("Administrador", "Secretaria"),
    studentController.updateStudent
  )
  .delete(protect, authorize("Administrador"), studentController.deleteStudent);

module.exports = router;
