import React, { useState, useEffect, useMemo } from "react";
import api from "../api/api";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import ReactSelect from "react-select";

const PagosListPage = () => {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  // Filtros
  const [filterMatriculaId, setFilterMatriculaId] = useState("");
  const [filterTipoPagoId, setFilterTipoPagoId] = useState("");
  const [filterMetodoPagoId, setFilterMetodoPagoId] = useState("");
  const [filterEstado, setFilterEstado] = useState("");

  // Datos para filtros
  const [allMatriculas, setAllMatriculas] = useState([]);
  const [allTiposPago, setAllTiposPago] = useState([]);
  const [allMetodosPago, setAllMetodosPago] = useState([]);

  const estadosPago = ["Pendiente", "Completado", "Anulado"];

  // Fetch pagos según filtros
  const fetchPagos = async () => {
    setLoading(true);
    setError("");
    try {
      let url = "/pagos";
      const params = [];
      if (filterMatriculaId) params.push(`matriculaId=${filterMatriculaId}`);
      if (filterTipoPagoId) params.push(`tipoPagoId=${filterTipoPagoId}`);
      if (filterMetodoPagoId) params.push(`metodoPagoId=${filterMetodoPagoId}`);
      if (filterEstado) params.push(`estado=${filterEstado}`);
      if (params.length > 0) url += `?${params.join("&")}`;

      const response = await api.get(url);
      setPagos(response.data);
    } catch (err) {
      console.error("Error fetching pagos:", err);
      let errorMessage = "No se pudieron cargar los pagos.";
      if (err.response) {
        errorMessage =
          err.response.data?.message || `Error ${err.response.status}`;
        if (err.response.status === 403)
          errorMessage = "No tienes permisos para ver esta sección.";
      }
      setError(errorMessage);
      setPagos([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch datos para filtros
  const fetchFilterData = async () => {
    try {
      const [matriculasRes, tiposPagoRes, metodosPagoRes] = await Promise.all([
        api.get("/enrollments"),
        api.get("/tipos_pago"),
        api.get("/metodos_pago"),
      ]);

      const studentsWithMatricula = matriculasRes.data.map((m) => ({
        id: m.estudiante_id,
        label: `${m.estudiante_primer_nombre} ${m.estudiante_primer_apellido} (${m.id})`,
        matriculaId: m.id,
      }));

      setAllMatriculas(studentsWithMatricula);
      setAllTiposPago(tiposPagoRes.data);
      setAllMetodosPago(metodosPagoRes.data);
    } catch (err) {
      console.error("Error fetching filter data:", err);
      setError("Error al cargar datos para filtros de pago.");
      setAllMatriculas([]);
      setAllTiposPago([]);
      setAllMetodosPago([]);
    }
  };

  useEffect(() => {
    fetchFilterData();
  }, []);

  useEffect(() => {
    fetchPagos();
  }, [filterMatriculaId, filterTipoPagoId, filterMetodoPagoId, filterEstado]);

  // Eliminar pago
  const handleDeletePago = async (pagoId, studentFullName, tipoPagoNombre) => {
    if (
      !window.confirm(
        `¿Estás seguro de que deseas eliminar el pago de ${studentFullName} - ${tipoPagoNombre}? Esta acción no se puede deshacer.`
      )
    )
      return;

    setError("");
    try {
      await api.delete(`/pagos/${pagoId}`);
      setPagos(pagos.filter((p) => p.id !== pagoId));
      alert(`Pago eliminado exitosamente.`);
    } catch (err) {
      console.error("Error deleting pago:", err);
      let errorMessage = "Error al eliminar el pago.";
      if (err.response) {
        errorMessage =
          err.response.data?.message || `Error ${err.response.status}`;
      }
      setError(errorMessage);
    }
  };

  // Acciones tabla
  const renderActions = (pago) => {
    const studentFullName = `${pago.estudiante_primer_nombre || ""} ${
      pago.estudiante_primer_apellido || ""
    }`.trim();
    const tipoPagoNombre = pago.tipo_pago_nombre || "Desconocido";
    return (
      <div className="flex space-x-2">
        <Link
          to={`/pagos/edit/${pago.id}`}
          className="text-yellow-600 hover:text-yellow-800 font-medium"
        >
          Editar
        </Link>
        {user?.rol === "Administrador" && (
          <button
            onClick={() =>
              handleDeletePago(pago.id, studentFullName, tipoPagoNombre)
            }
            className="text-red-600 hover:text-red-800 font-medium"
          >
            Eliminar
          </button>
        )}
      </div>
    );
  };

  const columns = useMemo(
    () => [
      { Header: "ID Pago", accessor: "id" },
      {
        Header: "Estudiante",
        accessor: (row) =>
          `${row.estudiante_primer_nombre || ""} ${
            row.estudiante_primer_apellido || ""
          }`.trim(),
      },
      { Header: "Matrícula ID", accessor: "matricula_id" },
      { Header: "Tipo de Pago", accessor: "tipo_pago_nombre" },
      {
        Header: "Monto",
        accessor: "monto",
        Cell: ({ value }) => {
          const numericValue = parseFloat(value);
          return !isNaN(numericValue) ? `$${numericValue.toFixed(2)}` : "-";
        },
      },
      {
        Header: "Fecha Pago",
        accessor: (row) =>
          row.fecha_pago ? new Date(row.fecha_pago).toLocaleDateString() : "",
      },
      { Header: "Método Pago", accessor: "metodo_pago_nombre" },
      { Header: "Referencia", accessor: "referencia_pago" },
      { Header: "Estado", accessor: "estado" },
      { Header: "Acciones", accessor: renderActions },
    ],
    [user, pagos]
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Listado de Pagos</h2>
        <Link
          to="/pagos/new"
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
          Nuevo Pago
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

      {/* Filtros */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg shadow-inner">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
          {/* Estudiante */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estudiante
            </label>
            <ReactSelect
              options={allMatriculas}
              value={
                filterMatriculaId
                  ? allMatriculas.find((s) => s.matriculaId === filterMatriculaId)
                  : null
              }
              onChange={(selected) =>
                setFilterMatriculaId(selected?.matriculaId || "")
              }
              isClearable
              placeholder="Selecciona un estudiante..."
              isSearchable
            />
          </div>

          {/* Tipo de Pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo Pago
            </label>
            <ReactSelect
              options={allTiposPago.map((t) => ({ value: t.id, label: t.nombre }))}
              value={
                filterTipoPagoId
                  ? {
                      value: filterTipoPagoId,
                      label: allTiposPago.find((t) => t.id === filterTipoPagoId)?.nombre,
                    }
                  : null
              }
              onChange={(selected) => setFilterTipoPagoId(selected?.value || "")}
              isClearable
              placeholder="Selecciona un tipo..."
              isSearchable
            />
          </div>

          {/* Método de Pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Método Pago
            </label>
            <ReactSelect
              options={allMetodosPago.map((m) => ({ value: m.id, label: m.nombre }))}
              value={
                filterMetodoPagoId
                  ? {
                      value: filterMetodoPagoId,
                      label: allMetodosPago.find((m) => m.id === filterMetodoPagoId)?.nombre,
                    }
                  : null
              }
              onChange={(selected) => setFilterMetodoPagoId(selected?.value || "")}
              isClearable
              placeholder="Selecciona un método..."
              isSearchable
            />
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Todos los estados</option>
              {estadosPago.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
          </div>

          {/* Limpiar filtros */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterMatriculaId("");
                setFilterTipoPagoId("");
                setFilterMetodoPagoId("");
                setFilterEstado("");
              }}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-md w-full"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de Pagos */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <p className="text-gray-500 text-lg">Cargando pagos...</p>
        </div>
      )}

      {!loading && !error && pagos.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hay pagos que coincidan con los filtros seleccionados.
        </div>
      )}

      {!loading && !error && pagos.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 rounded-lg shadow-sm">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((col, index) => (
                  <th
                    key={index}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {col.Header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pagos.map((pago) => (
                <tr
                  key={pago.id}
                  className="hover:bg-gray-50 transition duration-150 ease-in-out"
                >
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className={`px-6 py-4 whitespace-nowrap text-sm ${
                        col.accessor === renderActions ? "text-right" : "text-gray-900"
                      }`}
                    >
                      {col.Cell
                        ? col.Cell({ value: pago[col.accessor], row: pago })
                        : typeof col.accessor === "function"
                        ? col.accessor(pago)
                        : pago[col.accessor] ?? "-"}
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

export default PagosListPage;
