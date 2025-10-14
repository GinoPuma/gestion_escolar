const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const configRoutes = require("./routes/configRoutes");
const studentRoutes = require("./routes/studentRoutes");
const statsRoutes = require("./routes/statsRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const pagoRoutes = require("./routes/pagoRoutes");
const tipoPagoRoutes = require("./routes/tipoPagoRoutes");
const metodoPagoRoutes = require("./routes/metodoPagoRoutes");
const responsableRoutes = require("./routes/responsableRoutes");

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/config", configRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/pagos", pagoRoutes);
app.use("/api/tipos_pago", tipoPagoRoutes);
app.use("/api/metodos_pago", metodoPagoRoutes);
app.use("/api/responsables", responsableRoutes);

app.use(express.static(path.join(__dirname, "../frontend/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

module.exports = app;
