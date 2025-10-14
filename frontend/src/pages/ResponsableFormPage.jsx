import React, { useState, useEffect } from "react";
import api from "../api/api";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import ReactSelect from "react-select";

const ResponsableFormPage = () => {
  const [responsableData, setResponsableData] = useState({
    primer_nombre: "",
    segundo_nombre: "",
    primer_apellido: "",
    segundo_apellido: "",
    numero_identificacion: "",
    direccion: "",
    telefono: "",
    email: "",
    parentesco: "",
  });
  const [responsableStudents, setResponsableStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        if (id) {
          setIsEditing(true);
          const [respRes, studentsRes] = await Promise.all([
            api.get(`/responsables/${id}`),
            api.get(`/responsables/${id}/students`),
          ]);
          setResponsableData(respRes.data);
          setResponsableStudents(studentsRes.data);
        }

        const allStudentsRes = await api.get("/students");
        setAllStudents(allStudentsRes.data);
      } catch (err) {
        console.error("Error fetching data for responsable form:", err);
        let errorMessage = id
          ? `Error al cargar datos del responsable ${id}.`
          : "Error al cargar datos para crear responsable.";
        if (err.response) {
          errorMessage =
            err.response.data?.message || `Error ${err.response.status}`;
        }
        setError(errorMessage);
        if (id && err.response?.status === 404) navigate("/responsables");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setResponsableData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isEditing) {
        await api.put(`/responsables/${id}`, responsableData);
        alert("Responsable actualizado correctamente.");
      } else {
        const response = await api.post("/responsables", responsableData);
        alert("Responsable creado correctamente.");
        navigate(`/responsables/${response.data.id}`); // redirige a la edición para poder asociar
        return;
      }

      navigate("/responsables");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error al guardar responsable.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssociateStudent = async (studentOption) => {
    if (!id) {
      setError("Primero guarda la información del responsable.");
      return;
    }
    try {
      await api.post(`/responsables/${id}/students/${studentOption.value}`);
      setResponsableStudents([...responsableStudents, studentOption.original]);
      alert(`Estudiante asociado correctamente.`);
    } catch (err) {
      console.error("Error associating student:", err);
      setError(err.response?.data?.message || "Error al asociar estudiante.");
    }
  };

  const handleUnassociateStudent = async (estudianteId, estudianteNombre) => {
    if (
      !window.confirm(
        `¿Deseas desasociar a ${estudianteNombre} de este responsable?`
      )
    )
      return;
    try {
      await api.delete(`/responsables/${id}/students/${estudianteId}`);
      setResponsableStudents(
        responsableStudents.filter((s) => s.id.toString() !== estudianteId)
      );
      alert(`Estudiante ${estudianteNombre} desasociado correctamente.`);
    } catch (err) {
      console.error("Error unassociating student:", err);
      setError(
        err.response?.data?.message || "Error al desasociar estudiante."
      );
    }
  };

  const getStudentFullName = (student) => {
    return `${student?.primer_nombre || ""} ${
      student?.primer_apellido || ""
    }`.trim();
  };

  const availableStudents = allStudents
    .filter((student) => !responsableStudents.some((s) => s.id === student.id))
    .map((student) => ({
      value: student.id,
      label: getStudentFullName(student) + ` (ID: ${student.id})`,
      original: student,
    }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto my-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          {isEditing ? "Editar Responsable" : "Agregar Nuevo Responsable"}
        </h2>
        <Link
          to="/responsables"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Volver al Listado
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">¡Error!</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Campos del responsable */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Primer Nombre (*)
          </label>
          <input
            type="text"
            name="primer_nombre"
            value={responsableData.primer_nombre}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Segundo Nombre
          </label>
          <input
            type="text"
            name="segundo_nombre"
            value={responsableData.segundo_nombre || ""}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Primer Apellido (*)
          </label>
          <input
            type="text"
            name="primer_apellido"
            value={responsableData.primer_apellido}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Segundo Apellido
          </label>
          <input
            type="text"
            name="segundo_apellido"
            value={responsableData.segundo_apellido || ""}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            DNI (*)
          </label>
          <input
            type="text"
            name="numero_identificacion"
            value={responsableData.numero_identificacion}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Teléfono (*)
          </label>
          <input
            type="text"
            name="telefono"
            value={responsableData.telefono}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={responsableData.email || ""}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Parentesco
          </label>
          <input
            type="text"
            name="parentesco"
            value={responsableData.parentesco || ""}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Dirección
          </label>
          <textarea
            name="direccion"
            value={responsableData.direccion || ""}
            onChange={handleChange}
            rows="3"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          ></textarea>
        </div>

        {/* Sección de estudiantes asociados */}
        {isEditing && responsableData.id && (
          <div className="col-span-1 md:col-span-2 border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              Estudiantes Asociados
            </h3>
            {responsableStudents.length === 0 ? (
              <p className="text-gray-500 mb-3">
                Este responsable no tiene estudiantes asociados.
              </p>
            ) : (
              <ul className="list-disc list-inside space-y-2">
                {responsableStudents.map((student) => (
                  <li
                    key={student.id}
                    className="flex justify-between items-center p-2 bg-gray-50 rounded"
                  >
                    <span>
                      {getStudentFullName(student)} (ID: {student.id})
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleUnassociateStudent(
                          student.id,
                          getStudentFullName(student)
                        )
                      }
                      className="text-red-500 hover:text-red-700 font-medium text-sm"
                    >
                      Desasociar
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4">
              <label
                htmlFor="addStudentSelect"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Asociar nuevo estudiante:
              </label>
              <ReactSelect
                options={availableStudents}
                onChange={handleAssociateStudent}
                isSearchable
                placeholder="Buscar estudiante..."
              />
            </div>
          </div>
        )}

        <div className="col-span-1 md:col-span-2 text-right">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white 
                       bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                       disabled:opacity-50"
          >
            {loading
              ? "Guardando..."
              : isEditing
              ? "Actualizar Responsable"
              : "Agregar Responsable"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResponsableFormPage;
