import React, { useState, useEffect } from "react";
import api from "../api/api";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const PagoFormPage = () => {
  const [pagoData, setPagoData] = useState({
    matricula_id: "",
    tipo_pago_id: "",
    monto: "",
    fecha_pago: "",
    metodo_pago_id: "",
    referencia_pago: "",
    estado: "Pendiente",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const [matriculas, setMatriculas] = useState([]);
  const [tiposPago, setTiposPago] = useState([]);
  const [metodosPago, setMetodosPago] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError("");

      try {
        // Cargar datos base
        const [matriculasRes, tiposPagoRes, metodosPagoRes] = await Promise.all(
          [
            api.get("/enrollments"),
            api.get("/tipos_pago"),
            api.get("/metodos_pago"),
          ]
        );

        setMatriculas(matriculasRes.data || []);
        setTiposPago(tiposPagoRes.data || []);
        setMetodosPago(metodosPagoRes.data || []);

        // Si es edición
        if (id) {
          setIsEditing(true);
          const response = await api.get(`/pagos/${id}`);

          const formattedData = {
            ...response.data,
            fecha_pago: response.data.fecha_pago
              ? response.data.fecha_pago.split("T")[0]
              : "",
            monto:
              response.data.monto !== null && response.data.monto !== undefined
                ? response.data.monto.toString()
                : "",
            metodo_pago_id:
              response.data.metodo_pago_id !== null &&
              response.data.metodo_pago_id !== undefined
                ? response.data.metodo_pago_id.toString()
                : "",
          };
          setPagoData(formattedData);
        }
      } catch (err) {
        console.error("Error fetching initial data for pago form:", err);
        let errorMessage = id
          ? "Error al cargar datos del pago."
          : "Error al cargar datos para crear pago.";

        if (err.response) {
          errorMessage =
            err.response.data?.message || `Error ${err.response.status}`;
        }

        setError(errorMessage);
        if (id && err.response?.status === 404) navigate("/pagos");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const processedValue = value === "" ? null : value;

    if (name === "tipo_pago_id") {
      const selectedTipo = tiposPago.find((tp) => tp.id == value);

      if (selectedTipo && selectedTipo.precio_fijo) {
        setPagoData({
          ...pagoData,
          tipo_pago_id: processedValue,
          monto: selectedTipo.precio_fijo.toString(),
        });
        return;
      }
    }

    setPagoData({
      ...pagoData,
      [name]: processedValue,
    });

    setError("");
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (
      !pagoData.matricula_id ||
      !pagoData.tipo_pago_id ||
      pagoData.monto === "" ||
      !pagoData.fecha_pago ||
      !pagoData.estado
    ) {
      setError(
        "Los campos obligatorios (Matrícula, Tipo de Pago, Monto, Fecha, Estado) no pueden estar vacíos."
      );
      setLoading(false);
      return;
    }

    const montoNumerico = parseFloat(pagoData.monto);
    if (isNaN(montoNumerico) || montoNumerico <= 0) {
      setError("El monto debe ser un número positivo.");
      setLoading(false);
      return;
    }

    const dataToSend = {
      ...pagoData,
      monto: montoNumerico,
      metodo_pago_id: pagoData.metodo_pago_id
        ? parseInt(pagoData.metodo_pago_id)
        : null,
    };

    try {
      let response;
      if (isEditing) {
        response = await api.put(`/pagos/${id}`, dataToSend);
        alert(`Pago ID ${response.data.id} actualizado exitosamente.`);
      } else {
        response = await api.post("/pagos", dataToSend);
        alert(`Pago creado exitosamente.`);
      }
      navigate("/pagos");
    } catch (err) {
      console.error("Error submitting pago form:", err);
      let errorMessage = isEditing
        ? "Error al actualizar el pago."
        : "Error al crear el pago.";

      if (err.response) {
        errorMessage =
          err.response.data?.message ||
          err.response.data?.errors?.[0]?.msg ||
          `Error ${err.response.status}`;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getMatriculaLabel = (matriculaId) => {
    const matricula = matriculas.find((m) => m.id == matriculaId);
    return matricula
      ? `${matricula.estudiante_primer_nombre || ""} ${
          matricula.estudiante_primer_apellido || ""
        } (ID: ${matricula.id}) - Año: ${matricula.anio_academico}`
      : "Seleccionar Matrícula";
  };

  const getTipoPagoLabel = (tipoPagoId) => {
    const tipo = tiposPago.find((tp) => tp.id == tipoPagoId);
    return tipo ? tipo.nombre : "Seleccionar Tipo de Pago";
  };

  const getMetodoPagoLabel = (metodoId) => {
    if (metodoId === null || metodoId === "" || metodoId === undefined)
      return "No especificado";
    const metodo = metodosPago.find((mp) => mp.id == metodoId);
    return metodo ? metodo.nombre : "Método Desconocido";
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          {isEditing ? "Editar Pago" : "Agregar Nuevo Pago"}
        </h2>
        <Link
          to="/pagos"
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
        {/* Matrícula */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Matrícula (*)
          </label>
          <select
            name="matricula_id"
            value={pagoData.matricula_id || ""}
            onChange={handleChange}
            required
            disabled={isEditing}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                       focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
          >
            <option value="">
              {isEditing
                ? getMatriculaLabel(pagoData.matricula_id)
                : "Seleccionar Matrícula"}
            </option>
            {!isEditing &&
              matriculas.map((matricula) => (
                <option key={matricula.id} value={matricula.id}>
                  {getMatriculaLabel(matricula.id)}
                </option>
              ))}
          </select>
        </div>

        {/* Tipo de Pago */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tipo de Pago (*)
          </label>
          <select
            name="tipo_pago_id"
            value={pagoData.tipo_pago_id || ""}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                       focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">{getTipoPagoLabel(pagoData.tipo_pago_id)}</option>
            {tiposPago.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Monto */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Monto (*)
          </label>
          <input
            type="number"
            name="monto"
            value={pagoData.monto || ""}
            onChange={handleChange}
            required
            step="0.01"
            placeholder="Ej: 100.50"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                       focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        {/* Fecha de Pago */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Fecha de Pago (*)
          </label>
          <input
            type="date"
            name="fecha_pago"
            value={pagoData.fecha_pago || ""}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                       focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        {/* Método de Pago */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Método de Pago
          </label>
          <select
            name="metodo_pago_id"
            value={pagoData.metodo_pago_id || ""}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                       focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">
              {getMetodoPagoLabel(pagoData.metodo_pago_id)}
            </option>
            <option value="">-- No especificado --</option>
            {metodosPago.map((metodo) => (
              <option key={metodo.id} value={metodo.id}>
                {metodo.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Referencia */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Referencia de Pago
          </label>
          <input
            type="text"
            name="referencia_pago"
            value={pagoData.referencia_pago || ""}
            onChange={handleChange}
            placeholder="Ej: Nro. de transacción"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                       focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        {/* Estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Estado (*)
          </label>
          <select
            name="estado"
            value={pagoData.estado}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                       focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="Pendiente">Pendiente</option>
            <option value="Completado">Completado</option>
            <option value="Anulado">Anulado</option>
          </select>
        </div>

        {/* Botón de Submit */}
        <div className="col-span-1 md:col-span-2 text-right">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm 
                       text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                       disabled:opacity-50"
          >
            {loading
              ? "Guardando..."
              : isEditing
              ? "Actualizar Pago"
              : "Crear Pago"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PagoFormPage;
