const pool = require("../config/db");

exports.getDashboardStats = async (req, res) => {
  try {
    let totalEstudiantes = 0;
    let matriculasActivas = 0;
    let pagosDia = 0;

    const [estudiantesResult] = await pool.execute(
      "SELECT COUNT(*) as count FROM estudiantes"
    );
    totalEstudiantes = estudiantesResult[0].count;

    const [matriculasResult] = await pool.execute(
      "SELECT COUNT(*) as count FROM matriculas WHERE estado = 'Activo'"
    );
    matriculasActivas = matriculasResult[0].count;

    const today = new Date().toISOString().split("T")[0];
    const [pagosResult] = await pool.execute(
      "SELECT COUNT(*) as count FROM pagos WHERE estado = 'Completado' AND DATE(fecha_pago) = ?",
      [today]
    );
    pagosDia = pagosResult[0].count;

    res.json({
      totalEstudiantes,
      matriculasActivas,
      pagosDia,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res
      .status(500)
      .json({ message: "Error al obtener estadísticas del panel." });
  }
};
