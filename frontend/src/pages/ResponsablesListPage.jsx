import React, { useState, useEffect, useMemo } from "react";
import api from "../api/api";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import ReactSelect from "react-select";

const ResponsablesListPage = () => {
  const [allResponsables, setAllResponsables] = useState([]);
  const [responsables, setResponsables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  const [responsableStudentsMap, setResponsableStudentsMap] = useState({});
  const [searchText, setSearchText] = useState("");
  const [filterParentesco, setFilterParentesco] = useState("");
  const [parentescos, setParentescos] = useState([]);

  const fetchResponsables = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/responsables");
      setAllResponsables(response.data);
      setResponsables(response.data);

      // Mapear estudiantes
      const studentPromises = response.data.map(async (resp) => {
        try {
          const studentsRes = await api.get(
            `/responsables/${resp.id}/students`
          );
          return { responsableId: resp.id, students: studentsRes.data };
        } catch {
          return { responsableId: resp.id, students: [] };
        }
      });

      const results = await Promise.all(studentPromises);
      const studentMap = {};
      results.forEach(({ responsableId, students }) => {
        studentMap[responsableId] = students;
      });
      setResponsableStudentsMap(studentMap);

      // Obtener lista de parentescos únicos
      const uniqueParentescos = [
        ...new Set(response.data.map((r) => r.parentesco).filter(Boolean)),
      ];
      setParentescos(uniqueParentescos.map((p) => ({ value: p, label: p })));
    } catch (err) {
      console.error("Error fetching responsables:", err);
      setError("No se pudieron cargar los responsables.");
      setAllResponsables([]);
      setResponsables([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResponsables();
  }, []);

  // Filtrado local
  useEffect(() => {
    let filtered = [...allResponsables];

    if (searchText) {
      const text = searchText.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          `${r.primer_nombre || ""} ${r.segundo_nombre || ""} ${
            r.primer_apellido || ""
          } ${r.segundo_apellido || ""}`
            .toLowerCase()
            .includes(text) ||
          (r.numero_identificacion || "").includes(text) ||
          (r.email || "").toLowerCase().includes(text)
      );
    }

    if (filterParentesco) {
      filtered = filtered.filter((r) => r.parentesco === filterParentesco);
    }

    setResponsables(filtered);
  }, [searchText, filterParentesco, allResponsables]);

  const handleDeleteResponsable = async (id, nombreCompleto) => {
    if (
      !window.confirm(
        `¿Estás seguro de que deseas eliminar a ${nombreCompleto}? Esto podría afectar a los estudiantes asociados.`
      )
    )
      return;

    setError("");
    try {
      await api.delete(`/responsables/${id}`);
      setAllResponsables(allResponsables.filter((r) => r.id !== id));
      alert(`${nombreCompleto} eliminado exitosamente.`);
    } catch (err) {
      console.error("Error deleting responsable:", err);
      setError("Error al eliminar al responsable.");
    }
  };

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

  const renderStudents = (responsableId) => {
    const associatedStudents = responsableStudentsMap[responsableId] || [];
    if (associatedStudents.length === 0)
      return <span className="text-gray-500">-</span>;
    return (
      <ul className="list-disc list-inside text-sm text-gray-700">
        {associatedStudents.slice(0, 3).map((student) => (
          <li key={student.id}>
            {student.primer_nombre} {student.primer_apellido}
          </li>
        ))}
        {associatedStudents.length > 3 && (
          <li>... y {associatedStudents.length - 3} más</li>
        )}
      </ul>
    );
  };

  const columns = useMemo(
    () => [
      {
        Header: "Nombre Completo",
        accessor: (row) =>
          `${row.primer_nombre || ""} ${row.segundo_nombre || ""} ${
            row.primer_apellido || ""
          } ${row.segundo_apellido || ""}`.trim(),
      },
      { Header: "DNI", accessor: "numero_identificacion" },
      { Header: "Teléfono", accessor: "telefono" },
      { Header: "Email", accessor: "email" },
      { Header: "Parentesco", accessor: "parentesco" },
      {
        Header: "Estudiantes Asociados",
        accessor: (row) => renderStudents(row.id),
      },
      { Header: "Acciones", accessor: renderActions },
    ],
    [responsables, responsableStudentsMap]
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Listado de Padres de Familia
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

      {/* Filtros */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg shadow-inner">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar por nombre, DNI o email
            </label>
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Escribe texto..."
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filtrar por parentesco
            </label>
            <ReactSelect
              options={parentescos}
              value={
                parentescos.find((p) => p.value === filterParentesco) || null
              }
              onChange={(selected) =>
                setFilterParentesco(selected ? selected.value : "")
              }
              isClearable
              placeholder="Selecciona parentesco..."
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchText("");
                setFilterParentesco("");
              }}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-md w-full"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
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
