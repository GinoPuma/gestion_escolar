import React, { useState, useEffect } from "react";
import api from "../api/api";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  useEffect(() => {
    if (id) {
      setIsEditing(true);
      const fetchResponsable = async () => {
        setLoading(true);
        setError("");
        try {
          const response = await api.get(`/responsables/${id}`);
          setResponsableData(response.data);
        } catch (err) {
          console.error("Error fetching responsable for edit:", err);
          let errorMessage = `Error al cargar datos del responsable con ID ${id}.`;
          if (err.response) {
            errorMessage =
              err.response.data?.message || `Error ${err.response.status}`;
          }
          setError(errorMessage);
          navigate("/responsables");
        } finally {
          setLoading(false);
        }
      };
      fetchResponsable();
    }
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setResponsableData({
      ...responsableData,
      [name]: value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validación de campos obligatorios
    if (
      !responsableData.primer_nombre ||
      !responsableData.primer_apellido ||
      !responsableData.numero_identificacion ||
      !responsableData.telefono
    ) {
      setError(
        "Los campos obligatorios (Nombre, Apellido, Identificación, Teléfono) son requeridos."
      );
      setLoading(false);
      return;
    }

    // Validación de email
    if (responsableData.email && !/\S+@\S+\.\S+/.test(responsableData.email)) {
      setError("El formato del email no es válido.");
      setLoading(false);
      return;
    }

    try {
      if (isEditing) {
        await api.put(`/responsables/${id}`, responsableData);
        alert(
          `${responsableData.primer_nombre} ${responsableData.primer_apellido} actualizado exitosamente.`
        );
      } else {
        await api.post("/responsables", responsableData);
        alert(
          `${responsableData.primer_nombre} ${responsableData.primer_apellido} creado exitosamente.`
        );
      }
      navigate("/responsables");
    } catch (err) {
      console.error("Error submitting responsable form:", err);
      let errorMessage = isEditing
        ? "Error al actualizar el responsable."
        : "Error al crear el responsable.";
      if (err.response) {
        errorMessage =
          err.response.data?.message || `Error ${err.response.status}`;
        if (err.response.status === 409) {
          errorMessage =
            err.response.data?.message || "Identificación o email ya en uso.";
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <strong className="font-bold">¡Error!</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Primer y Segundo Nombre */}
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

        {/* Primer y Segundo Apellido */}
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

        {/* Identificación, Teléfono, Email, Parentesco */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Identificación (*)
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

        {/* Dirección */}
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

        {/* Botón Submit */}
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
