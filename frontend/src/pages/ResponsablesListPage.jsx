import React, { useState, useEffect, useMemo } from "react";
import api from "../api/api";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ResponsablesListPage = () => {
  const [responsables, setResponsables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  // Obtener responsables desde la API
  const fetchResponsables = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/responsables");
      setResponsables(response.data);
    } catch (err) {
      console.error("Error fetching responsables:", err);
      let errorMessage = "No se pudieron cargar los responsables.";
      if (err.response) {
        errorMessage =
          err.response.data?.message || `Error ${err.response.status}`;
        if (err.response.status === 403) {
          errorMessage = "No tienes permisos para ver esta sección.";
        }
      }
      setError(errorMessage);
      setResponsables([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResponsables();
  }, []);

  // Eliminar responsable
  const handleDeleteResponsable = async (id, nombreCompleto) => {
    if (
      !window.confirm(
        `¿Estás seguro de que deseas eliminar a ${nombreCompleto}? Esto podría afectar a los estudiantes asociados.`
      )
    ) {
      return;
    }

    setError("");
    try {
      await api.delete(`/responsables/${id}`);
      setResponsables(responsables.filter((resp) => resp.id !== id));
      alert(`${nombreCompleto} eliminado exitosamente.`);
    } catch (err) {
      console.error("Error deleting responsable:", err);
      let errorMessage = "Error al eliminar al responsable.";
      if (err.response) {
        errorMessage =
          err.response.data?.message || `Error ${err.response.status}`;
      }
      setError(errorMessage);
    }
  };

  // Acciones de cada fila
  const renderActions = (responsable) => {
    const nombreCompleto = `${responsable.primer_nombre || ""} ${
      responsable.primer_apellido || ""
    }`.trim();
    return (
      <div className="flex space-x-2 justify-center">
        <Link
          to={`/responsables/edit/${responsable.id}`}
          className="text-yellow-600 hover:text-yellow-800 font-medium"
        >
          Editar
        </Link>
        <button
          onClick={() =>
            handleDeleteResponsable(responsable.id, nombreCompleto)
          }
          className="text-red-600 hover:text-red-800 font-medium"
        >
          Eliminar
        </button>
      </div>
    );
  };

  // Columnas de la tabla
  const columns = useMemo(
    () => [
      {
        Header: "Nombre Completo",
        accessor: (row) =>
          `${row.primer_nombre || ""} ${row.segundo_nombre || ""} ${
            row.primer_apellido || ""
          } ${row.segundo_apellido || ""}`.trim(),
      },
      { Header: "Identificación", accessor: "numero_identificacion" },
      { Header: "Teléfono", accessor: "telefono" },
      { Header: "Email", accessor: "email" },
      { Header: "Parentesco", accessor: "parentesco" },
      { Header: "Acciones", accessor: renderActions },
    ],
    [responsables]
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Listado de Responsables
        </h2>
        <Link
          to="/responsables/new"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Nuevo Responsable
        </Link>
      </div>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <strong className="font-bold">¡Error!</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center py-8">
          <p className="text-gray-500 text-lg">Cargando responsables...</p>
        </div>
      )}

      {!loading && !error && responsables.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hay responsables registrados aún. ¡Agrega el primero!
        </div>
      )}

      {!loading && !error && responsables.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 rounded-lg shadow-sm">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.Header}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {col.Header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {responsables.map((responsable) => (
                <tr key={responsable.id}>
                  {columns.map((col) => (
                    <td
                      key={col.Header}
                      className={`px-6 py-4 whitespace-nowrap text-sm ${
                        col.Header === "Acciones"
                          ? "text-center"
                          : "text-gray-900"
                      }`}
                    >
                      {typeof col.accessor === "function"
                        ? col.accessor(responsable)
                        : responsable[col.accessor] ?? "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ResponsablesListPage;
