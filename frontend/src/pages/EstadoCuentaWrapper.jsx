import React, { useState, useEffect } from "react";
import EstadoCuenta from "./EstadoCuenta";
import api from "../api/api";
import ReactSelect from "react-select";

const EstadoCuentaWrapper = () => {
  const [matriculaId, setMatriculaId] = useState("");
  const [estudiantes, setEstudiantes] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filteredEstudiantes, setFilteredEstudiantes] = useState([]);

  useEffect(() => {
    const fetchEstudiantes = async () => {
      try {
        const res = await api.get("/students");
        setEstudiantes(res.data);
      } catch (err) {
        console.error("Error al obtener estudiantes:", err);
        setEstudiantes([]);
      }
    };
    fetchEstudiantes();
  }, []);

  // Filtrado similar a EstudiantesListPage
  useEffect(() => {
    let filtered = [...estudiantes];

    if (searchText) {
      const text = searchText.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          `${s.primer_nombre} ${s.segundo_nombre || ""} ${s.primer_apellido} ${
            s.segundo_apellido || ""
          }`
            .toLowerCase()
            .includes(text) || (s.numero_identificacion || "").includes(text)
      );
    }

    setFilteredEstudiantes(filtered);
  }, [searchText, estudiantes]);

  return (
    <div>
      <div className="mb-4 flex flex-col md:flex-row gap-4 items-start">
        <input
          type="text"
          placeholder="Buscar por nombre o DNI"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm w-full md:w-1/2"
        />

        <ReactSelect
          placeholder="Selecciona un estudiante"
          options={filteredEstudiantes
            .filter((e) => e.matricula_id != null)
            .map((e) => ({
              value: e.matricula_id,
              label: `${e.primer_nombre} ${e.segundo_nombre || ""} ${
                e.primer_apellido
              } ${e.segundo_apellido || ""}`.trim(),
            }))}
          value={
            matriculaId
              ? {
                  value: matriculaId,
                  label: filteredEstudiantes.find(
                    (e) => e.matricula_id === matriculaId
                  )
                    ? `${
                        filteredEstudiantes.find(
                          (e) => e.matricula_id === matriculaId
                        ).primer_nombre
                      } ${
                        filteredEstudiantes.find(
                          (e) => e.matricula_id === matriculaId
                        ).primer_apellido
                      }`
                    : "",
                }
              : null
          }
          onChange={(selected) => setMatriculaId(selected?.value || "")}
          isClearable
          className="w-full md:w-1/2"
        />
      </div>

      {matriculaId && <EstadoCuenta matriculaId={matriculaId} />}
    </div>
  );
};

export default EstadoCuentaWrapper;
