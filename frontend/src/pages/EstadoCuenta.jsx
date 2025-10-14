import React, { useState, useEffect } from "react";
import api from "../api/api";

const EstadoCuenta = ({ matriculaId }) => {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (matriculaId) fetchEstadoCuenta();
  }, [matriculaId]);

  const fetchEstadoCuenta = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get(`/pagos/estado_cuenta/${matriculaId}`);
      setPagos(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error al cargar estado de cuenta.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Cargando estado de cuenta...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Estado de Cuenta</h2>
      {pagos.length === 0 ? (
        <p>No hay pagos registrados para este estudiante.</p>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo de Pago</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Pago</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pagos.map((p) => (
              <tr key={p.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.tipo_pago_nombre}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700">S/ {parseFloat(p.monto).toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700">
                  {p.fecha_pago ? new Date(p.fecha_pago).toLocaleDateString("es-PE") : "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <span className={`${p.estado === "Pendiente" ? "text-red-600" : "text-green-600"} font-semibold`}>
                    {p.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default EstadoCuenta;
